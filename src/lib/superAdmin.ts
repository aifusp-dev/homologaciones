import "server-only";

const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * super_admin no es un User en base de datos, es una capacidad global
 * concedida solo por aparecer en esta lista — así el mismo email puede
 * también ser miembro/dueño de una empresa sin conflicto (ver User en
 * schema.prisma).
 */
export function isSuperAdminEmail(email: string) {
  return superAdminEmails.includes(email.toLowerCase());
}
