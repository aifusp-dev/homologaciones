"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyGoogleIdToken } from "@/lib/google";
import { createSession, deleteSession } from "@/lib/session";
import { homeForRole } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";

const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Único punto de entrada de autenticación: recibe el credential (JWT) que
 * entrega Google Identity Services en el navegador. No hay alta
 * self-service — solo entra quien ya tiene cuenta, quien está en
 * SUPER_ADMIN_EMAILS, o quien tiene una invitación pendiente por email.
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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.googleId !== identity.googleId) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { googleId: identity.googleId },
      });
    }
    await createSession(existing.id);
    redirect(homeForRole(existing.role));
  }

  if (superAdminEmails.includes(email)) {
    const user = await prisma.user.create({
      data: {
        googleId: identity.googleId,
        email,
        name: identity.name,
        role: "SUPER_ADMIN",
      },
    });
    await createSession(user.id);
    redirect(homeForRole(user.role));
  }

  const invitation = await prisma.invitation.findFirst({
    where: { email, consumedAt: null },
  });
  if (invitation) {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          googleId: identity.googleId,
          email,
          name: identity.name,
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
    await createSession(user.id);
    redirect(homeForRole(user.role));
  }

  return {
    message:
      "Tu email no tiene invitación pendiente. Pide al administrador de tu taller que te invite.",
  };
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
