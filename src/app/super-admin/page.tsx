import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import { CreateCompanyForm } from "./create-company-form";

export default async function SuperAdminPage() {
  const user = await requireRole("SUPER_ADMIN");
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { id: true }, where: { role: "COMPANY_ADMIN" } },
      invitations: { where: { consumedAt: null }, select: { email: true } },
    },
  });

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-10 space-y-10">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Super admin</p>
          <h1 className="text-2xl font-bold tracking-tight">Empresas</h1>
          <p className="text-sm text-neutral-400 mt-1">{user.name}</p>
        </div>
        <form action={logout}>
          <button className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
            Cerrar sesión
          </button>
        </form>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
          Nueva empresa
        </h2>
        <CreateCompanyForm />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
          Todas las empresas
        </h2>
        <ul className="space-y-2">
          {companies.map((c) => (
            <li
              key={c.id}
              className="flex justify-between items-baseline border border-neutral-800 rounded-lg px-4 py-3 text-sm"
            >
              <span className="font-medium">{c.name}</span>
              <span className="text-neutral-500">
                {c.users.length > 0
                  ? `${c.users.length} gestor(es)`
                  : c.invitations[0]
                    ? `invitación pendiente · ${c.invitations[0].email}`
                    : "sin dueño"}
              </span>
            </li>
          ))}
          {companies.length === 0 && (
            <p className="text-sm text-neutral-500">Todavía no hay ninguna empresa dada de alta.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
