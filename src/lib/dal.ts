import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { isSuperAdminEmail } from "@/lib/superAdmin";

/**
 * Identidad completa de la sesión actual: puede ser super_admin, puede ser
 * miembro de una empresa (companyUser), o las dos cosas a la vez — no son
 * excluyentes (ver comentario en schema.prisma sobre User).
 */
export const getIdentity = cache(async () => {
  const session = await getSession();
  if (!session?.email) return null;

  const [isSuperAdmin, companyUser] = await Promise.all([
    Promise.resolve(isSuperAdminEmail(session.email)),
    prisma.user.findUnique({
      where: { email: session.email },
      select: { id: true, email: true, name: true, role: true, companyId: true },
    }),
  ]);

  if (!isSuperAdmin && !companyUser) return null;
  return { email: session.email, isSuperAdmin, companyUser };
});

export const requireIdentity = cache(async () => {
  const identity = await getIdentity();
  if (!identity) redirect("/login");
  return identity;
});

export const requireSuperAdmin = cache(async () => {
  const identity = await requireIdentity();
  if (!identity.isSuperAdmin) redirect(defaultDestination(identity));
  return identity;
});

/**
 * Usuario de empresa (COMPANY_ADMIN u OPERATOR), garantizado con
 * companyUser no-nulo, listo para usar en cualquier consulta scoped a la
 * empresa.
 */
export const requireCompanyUser = cache(async () => {
  const identity = await requireIdentity();
  if (!identity.companyUser) redirect(defaultDestination(identity));
  return identity.companyUser;
});

export function defaultDestination(identity: { isSuperAdmin: boolean; companyUser: unknown }) {
  if (identity.isSuperAdmin) return "/super-admin";
  if (identity.companyUser) return "/dashboard";
  return "/login";
}
