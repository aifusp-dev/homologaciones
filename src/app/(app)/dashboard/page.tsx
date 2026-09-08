import Link from "next/link";
import { requireCompanyUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { createDossier } from "@/app/actions/dossiers";
import { InviteForm } from "./invite-form";

const ROLE_LABEL: Record<string, string> = {
  COMPANY_ADMIN: "Gestor",
  OPERATOR: "Operario",
};

export default async function DashboardPage() {
  const user = await requireCompanyUser();
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: user.companyId },
    include: {
      users: { select: { id: true, name: true, email: true, role: true } },
      invitations: { where: { consumedAt: null }, select: { id: true, email: true, role: true } },
      dossiers: {
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { name: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500">{company.name}</p>
        <h1 className="text-2xl font-bold tracking-tight">Panel</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
              Expedientes
            </h2>
            <form action={createDossier}>
              <button className="bg-white text-black font-semibold rounded-lg px-3.5 py-1.5 text-sm hover:opacity-90 transition-opacity">
                Nuevo expediente
              </button>
            </form>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {company.dossiers.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/dossiers/${d.id}`}
                  className="flex justify-between items-baseline border border-neutral-800 rounded-lg px-4 py-3 text-sm hover:border-neutral-600 transition-colors"
                >
                  <span className="font-mono font-medium">{d.number}</span>
                  <span className="text-neutral-500">{d.customer?.name ?? "Sin cliente"}</span>
                </Link>
              </li>
            ))}
            {company.dossiers.length === 0 && (
              <p className="text-sm text-neutral-500">Todavía no hay ningún expediente.</p>
            )}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Equipo</h2>
          <ul className="space-y-1.5 text-sm">
            {company.users.map((u) => (
              <li key={u.id} className="flex justify-between text-neutral-300">
                <span>
                  {u.name} <span className="text-neutral-500">({u.email})</span>
                </span>
                <span className="text-neutral-500">{ROLE_LABEL[u.role] ?? u.role}</span>
              </li>
            ))}
            {company.invitations.map((inv) => (
              <li key={inv.id} className="flex justify-between text-neutral-500 italic">
                <span>{inv.email}</span>
                <span>Invitado · {ROLE_LABEL[inv.role] ?? inv.role}</span>
              </li>
            ))}
          </ul>

          {user.role === "COMPANY_ADMIN" && (
            <div className="pt-2">
              <InviteForm />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
