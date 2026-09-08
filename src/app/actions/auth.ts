"use server";

import { randomBytes, createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyGoogleIdToken } from "@/lib/google";
import { sendMagicLinkEmail } from "@/lib/email";
import { createSession, deleteSession } from "@/lib/session";
import { isSuperAdminEmail } from "@/lib/superAdmin";
import { defaultDestination } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";
import type { User } from "@/generated/prisma/client";

const TOKEN_TTL_MS = 15 * 60 * 1000;

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

const GENERIC_MAGIC_LINK_MESSAGE =
  "Si ese email tiene acceso, te hemos mandado un enlace — revisa tu bandeja de entrada.";

/**
 * Pide un magic link. La respuesta es SIEMPRE el mismo mensaje genérico,
 * autorizado o no — para no filtrar por este formulario qué direcciones
 * existen en el sistema. Solo si está autorizado (usuario existente,
 * super admin, o invitación pendiente) se genera y manda el token de
 * verdad.
 */
export async function requestMagicLink(_state: FormState, formData: FormData): Promise<FormState> {
  const rawEmail = formData.get("email");
  if (typeof rawEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return { message: "Introduce un email válido." };
  }
  const email = rawEmail.trim().toLowerCase();

  const isSuperAdmin = isSuperAdminEmail(email);
  const companyUser = await prisma.user.findUnique({ where: { email } });
  const invitation = companyUser
    ? null
    : await prisma.invitation.findFirst({ where: { email, consumedAt: null } });
  const authorized = isSuperAdmin || companyUser !== null || invitation !== null;

  if (authorized) {
    // Invalida (consume) cualquier token pendiente anterior del mismo
    // email para que no queden varios enlaces válidos a la vez.
    await prisma.loginToken.updateMany({
      where: { email, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.loginToken.create({
      data: { email, tokenHash, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    });

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const url = `${appUrl}/login/verify?token=${token}`;
    try {
      await sendMagicLinkEmail(email, url);
    } catch (err) {
      console.error("Error enviando magic link:", err);
      return { message: "No se pudo enviar el email. Inténtalo de nuevo en un momento." };
    }
  }

  return { message: GENERIC_MAGIC_LINK_MESSAGE };
}

/**
 * Verifica un token de magic link — llamado desde el Route Handler
 * src/app/login/verify/route.ts. Redirige siempre (éxito o error), nunca
 * devuelve.
 */
export async function verifyMagicLink(token: string): Promise<never> {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const loginToken = await prisma.loginToken.findUnique({ where: { tokenHash } });

  if (!loginToken || loginToken.consumedAt || loginToken.expiresAt < new Date()) {
    redirect("/login?error=invalid_token");
  }

  await prisma.loginToken.update({
    where: { id: loginToken.id },
    data: { consumedAt: new Date() },
  });

  const email = loginToken.email;
  const name = email.split("@")[0];
  const { isSuperAdmin, companyUser } = await resolveLoginIdentity({ email, name });

  if (!isSuperAdmin && !companyUser) {
    redirect("/login?error=invalid_token");
  }

  await createSession(email);
  redirect(defaultDestination({ isSuperAdmin, companyUser }));
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
