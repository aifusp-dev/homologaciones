"use server";

import { randomInt, createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyGoogleIdToken } from "@/lib/google";
import { sendLoginCodeEmail } from "@/lib/email";
import { createSession, deleteSession } from "@/lib/session";
import { isSuperAdminEmail } from "@/lib/superAdmin";
import { defaultDestination } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";
import type { User } from "@/generated/prisma/client";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/** Estado compartido por el login en dos pasos (pedir código / verificarlo). */
export type LoginCodeState =
  | { step: "request"; message?: string }
  | { step: "code"; email: string; message?: string }
  | undefined;

function generateCode(): string {
  // 6 dígitos, con ceros a la izquierda si hace falta — randomInt es
  // criptográficamente seguro (a diferencia de Math.random).
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/**
 * Resuelve (y da de alta si hace falta) la identidad de un email ya
 * verificado — por Google o por magic link, a este punto da igual cuál.
 * Compartido por los dos métodos de login para no duplicar la
 * transacción de consumir invitación. `googleId` solo lo trae el flujo de
 * Google; por magic link se deja sin establecer.
 */
async function resolveLoginIdentity({
  email,
  name,
  googleId,
}: {
  email: string;
  name: string;
  googleId?: string;
}): Promise<{ isSuperAdmin: boolean; companyUser: User | null }> {
  const isSuperAdmin = isSuperAdminEmail(email);
  let companyUser = await prisma.user.findUnique({ where: { email } });

  if (companyUser) {
    if (googleId && companyUser.googleId !== googleId) {
      companyUser = await prisma.user.update({
        where: { id: companyUser.id },
        data: { googleId },
      });
    }
  } else {
    const invitation = await prisma.invitation.findFirst({
      where: { email, consumedAt: null },
    });
    if (invitation) {
      companyUser = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            googleId: googleId ?? null,
            email,
            name,
            role: invitation.role,
            companyId: invitation.companyId,
          },
        });
        await tx.invitation.update({
          where: { id: invitation.id },
          data: { consumedAt: new Date() },
        });
        return created;
      });
    }
  }

  return { isSuperAdmin, companyUser };
}

/**
 * Único punto de entrada de autenticación vía Google: recibe el
 * credential (JWT) que entrega Google Identity Services en el navegador.
 * No hay alta self-service — solo entra quien ya es miembro de una
 * empresa, quien está en SUPER_ADMIN_EMAILS, o quien tiene una invitación
 * pendiente por email.
 */
export async function googleLogin(_state: FormState, formData: FormData): Promise<FormState> {
  const idToken = formData.get("credential");
  if (typeof idToken !== "string" || !idToken) {
    return { message: "No se recibió la respuesta de Google." };
  }

  let identity;
  try {
    identity = await verifyGoogleIdToken(idToken);
  } catch {
    return { message: "No se pudo verificar el inicio de sesión de Google." };
  }

  const email = identity.email.toLowerCase();
  const { isSuperAdmin, companyUser } = await resolveLoginIdentity({
    email,
    name: identity.name,
    googleId: identity.googleId,
  });

  if (!isSuperAdmin && !companyUser) {
    return {
      message:
        "Tu email no tiene invitación pendiente. Pide al administrador de tu taller que te invite.",
    };
  }

  await createSession(email);
  redirect(defaultDestination({ isSuperAdmin, companyUser }));
}

const GENERIC_CODE_SENT_MESSAGE =
  "Si ese email tiene acceso, te hemos mandado un código — revisa tu bandeja de entrada.";
const GENERIC_CODE_INVALID_MESSAGE = "Código incorrecto o caducado. Pide uno nuevo.";

/**
 * Paso 1: pide un código de acceso de 6 dígitos. La respuesta es SIEMPRE
 * el mismo mensaje genérico, autorizado o no — para no filtrar por este
 * formulario qué direcciones existen en el sistema. Solo si está
 * autorizado (usuario existente, super admin, o invitación pendiente) se
 * genera y manda un código de verdad. En cualquier caso se avanza al
 * paso 2 (introducir código) — así tampoco se filtra la autorización por
 * si el formulario pasa o no de paso.
 *
 * Un código de 6 dígitos, a diferencia de un enlace, se puede leer en un
 * dispositivo (el email, p. ej. el móvil) y teclear en otro (donde se
 * empezó el login, p. ej. el ordenador del taller) — evita el problema
 * del magic link de solo abrir en el dispositivo donde se lee el correo.
 */
export async function requestLoginCode(_state: LoginCodeState, formData: FormData): Promise<LoginCodeState> {
  const rawEmail = formData.get("email");
  if (typeof rawEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return { step: "request", message: "Introduce un email válido." };
  }
  const email = rawEmail.trim().toLowerCase();

  const isSuperAdmin = isSuperAdminEmail(email);
  const companyUser = await prisma.user.findUnique({ where: { email } });
  const invitation = companyUser
    ? null
    : await prisma.invitation.findFirst({ where: { email, consumedAt: null } });
  const authorized = isSuperAdmin || companyUser !== null || invitation !== null;

  if (authorized) {
    // Invalida (consume) cualquier código pendiente anterior del mismo
    // email para que no queden varios códigos válidos a la vez.
    await prisma.loginToken.updateMany({
      where: { email, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    const code = generateCode();
    const tokenHash = createHash("sha256").update(code).digest("hex");
    await prisma.loginToken.create({
      data: { email, tokenHash, expiresAt: new Date(Date.now() + CODE_TTL_MS) },
    });

    try {
      await sendLoginCodeEmail(email, code);
    } catch (err) {
      console.error("Error enviando código de acceso:", err);
      return { step: "request", message: "No se pudo enviar el email. Inténtalo de nuevo en un momento." };
    }
  }

  return { step: "code", email, message: GENERIC_CODE_SENT_MESSAGE };
}

/**
 * Paso 2: verifica el código de 6 dígitos tecleado por la persona.
 * `MAX_ATTEMPTS` intentos fallidos por código antes de que quede inútil
 * (hay que pedir uno nuevo) — necesario porque, a diferencia del token
 * largo del magic link, un código de 6 dígitos es adivinable a fuerza
 * bruta sin ese límite.
 */
export async function verifyLoginCode(_state: LoginCodeState, formData: FormData): Promise<LoginCodeState> {
  const rawEmail = formData.get("email");
  const rawCode = formData.get("code");
  if (typeof rawEmail !== "string" || typeof rawCode !== "string") {
    return { step: "request", message: "Introduce un email válido." };
  }
  const email = rawEmail.trim().toLowerCase();
  const code = rawCode.trim();

  const loginToken = await prisma.loginToken.findFirst({
    where: { email, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!loginToken || loginToken.expiresAt < new Date() || loginToken.attempts >= MAX_ATTEMPTS) {
    return { step: "code", email, message: GENERIC_CODE_INVALID_MESSAGE };
  }

  const codeHash = createHash("sha256").update(code).digest("hex");
  if (codeHash !== loginToken.tokenHash) {
    await prisma.loginToken.update({
      where: { id: loginToken.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = MAX_ATTEMPTS - (loginToken.attempts + 1);
    return {
      step: "code",
      email,
      message: remaining > 0 ? `Código incorrecto. Te quedan ${remaining} intentos.` : GENERIC_CODE_INVALID_MESSAGE,
    };
  }

  await prisma.loginToken.update({
    where: { id: loginToken.id },
    data: { consumedAt: new Date() },
  });

  const name = email.split("@")[0];
  const { isSuperAdmin, companyUser } = await resolveLoginIdentity({ email, name });

  if (!isSuperAdmin && !companyUser) {
    return { step: "code", email, message: GENERIC_CODE_INVALID_MESSAGE };
  }

  await createSession(email);
  redirect(defaultDestination({ isSuperAdmin, companyUser }));
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
