import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { Role } from "@/generated/prisma/enums";

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return { userId: session.userId };
});

/**
 * Cualquier usuario logueado, sea cual sea su rol o empresa. Redirige a
 * /login si la sesión no existe o el usuario fue borrado.
 */
export const requireUser = cache(async () => {
  const { userId } = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, companyId: true },
  });
  if (!user) redirect("/login");
  return user;
});

/**
 * Como requireUser, pero además exige un rol concreto. Un usuario logueado
 * con el rol equivocado se manda a su propio home en vez de a /login.
 */
export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) {
    redirect(homeForRole(user.role));
  }
  return user;
}

/**
 * Usuario de empresa (COMPANY_ADMIN u OPERATOR) con companyId garantizado
 * no-nulo, listo para usar en cualquier consulta scoped a la empresa.
 */
export const requireCompanyUser = cache(async () => {
  const user = await requireUser();
  if (!user.companyId) {
    redirect(homeForRole(user.role));
  }
  return { ...user, companyId: user.companyId };
});

export function homeForRole(role: Role) {
  return role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard";
}
