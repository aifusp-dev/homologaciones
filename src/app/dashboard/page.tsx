import Link from "next/link";
import { requireCompanyUser, getIdentity } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import { createDossier } from "@/app/actions/dossiers";
import { InviteForm } from "./invite-form";

const ROLE_LABEL: Record<string, string> = {
  COMPANY_ADMIN: "Gestor",
  OPERATOR: "Operario",
};

export default async function DashboardPage() {
  const user = await requireCompanyUser();
  const identity = await getIdentity();
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
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-10 space-y-10">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">{company.name}</p>
          <h1 className="text-2xl font-bold tracking-tight">Panel</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {user.name} · {ROLE_LABEL[user.role] ?? user.role}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {identity?.isSuperAdmin && (
            <Link href="/super-admin" className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
              Panel super-admin
            </Link>
          )}
          <form action={logout}>
            <button className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <section className="space-y-3">
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
        <ul className="space-y-1.5">
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
  );
}
