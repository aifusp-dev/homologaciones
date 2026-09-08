"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyGoogleIdToken } from "@/lib/google";
import { createSession, deleteSession } from "@/lib/session";
import { isSuperAdminEmail } from "@/lib/superAdmin";
import { defaultDestination } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";

/**
 * Único punto de entrada de autenticación: recibe el credential (JWT) que
 * entrega Google Identity Services en el navegador. No hay alta
 * self-service — solo entra quien ya es miembro de una empresa, quien está
 * en SUPER_ADMIN_EMAILS, o quien tiene una invitación pendiente por email.
 * Ambas cosas (super_admin y miembro de empresa) pueden ser ciertas a la
 * vez para el mismo email.
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
  const isSuperAdmin = isSuperAdminEmail(email);

  let companyUser = await prisma.user.findUnique({ where: { email } });

  if (companyUser) {
    if (companyUser.googleId !== identity.googleId) {
      await prisma.user.update({
        where: { id: companyUser.id },
        data: { googleId: identity.googleId },
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
    }
  }

  if (!isSuperAdmin && !companyUser) {
    return {
      message:
        "Tu email no tiene invitación pendiente. Pide al administrador de tu taller que te invite.",
    };
  }

  await createSession(email);
  redirect(defaultDestination({ isSuperAdmin, companyUser }));
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
