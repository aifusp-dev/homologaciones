import { requireSuperAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { CreateCompanyForm } from "./create-company-form";

export default async function SuperAdminPage() {
  const identity = await requireSuperAdmin();
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { id: true }, where: { role: "COMPANY_ADMIN" } },
      invitations: { where: { consumedAt: null }, select: { email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500">Super admin</p>
        <h1 className="text-2xl font-bold tracking-tight">Empresas</h1>
        <p className="text-sm text-neutral-400 mt-1">{identity.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Nueva empresa
          </h2>
          <CreateCompanyForm />
        </section>

        <section className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Todas las empresas
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
    </div>
  );
}
