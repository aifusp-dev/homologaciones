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
        <p className="font-display text-xs uppercase tracking-wide text-ink-faint">{company.name}</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Panel</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-dim">
              Expedientes
            </h2>
            <form action={createDossier}>
              <button className="bg-accent text-accent-ink font-semibold rounded-lg px-3.5 py-1.5 text-sm hover:opacity-90 transition-opacity">
                Nuevo expediente
              </button>
            </form>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {company.dossiers.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/dossiers/${d.id}`}
                  className="flex justify-between items-baseline border border-border rounded-xl px-4 py-3 text-sm hover:border-accent transition-colors"
                >
                  <span className="font-mono font-medium">{d.number}</span>
                  <span className="text-ink-faint">{d.customer?.name ?? "Sin cliente"}</span>
                </Link>
              </li>
            ))}
            {company.dossiers.length === 0 && (
              <p className="text-sm text-ink-faint">Todavía no hay ningún expediente.</p>
            )}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-dim">Equipo</h2>
          <ul className="space-y-1.5 text-sm">
            {company.users.map((u) => (
              <li key={u.id} className="flex justify-between text-ink-dim">
                <span>
                  {u.name} <span className="text-ink-faint">({u.email})</span>
                </span>
                <span className="text-ink-faint">{ROLE_LABEL[u.role] ?? u.role}</span>
              </li>
            ))}
            {company.invitations.map((inv) => (
              <li key={inv.id} className="flex justify-between text-ink-faint italic">
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
