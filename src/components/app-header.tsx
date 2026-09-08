import Link from "next/link";
import { LayoutDashboard, Building2, LogOut } from "lucide-react";
import { getIdentity } from "@/lib/dal";
import { logout } from "@/app/actions/auth";

const ROLE_LABEL: Record<string, string> = {
  COMPANY_ADMIN: "Gestor",
  OPERATOR: "Operario",
};

// Header persistente para toda la app autenticada (todo excepto /login, ver
// (app)/layout.tsx) — sustituye el <header> propio que antes repetía cada
// página (marca, enlaces cruzados dashboard↔super-admin, logout).
export async function AppHeader() {
  const identity = await getIdentity();
  if (!identity) return null;

  const brandHref = identity.companyUser ? "/dashboard" : "/super-admin";

  return (
    <header className="border-b border-border bg-bg/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 min-w-0">
          <Link href={brandHref} className="flex items-center gap-2 shrink-0">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-accent text-accent-ink font-display font-bold text-xs tracking-tight">
              WM
            </span>
            <span className="hidden sm:inline font-display font-semibold tracking-tight text-ink">
              WorkshopManagement
            </span>
          </Link>

          <nav className="flex items-center gap-5 text-sm">
            {identity.companyUser && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-ink-dim hover:text-ink transition-colors"
              >
                <LayoutDashboard size={15} strokeWidth={1.9} />
                Panel
              </Link>
            )}
            {identity.isSuperAdmin && (
              <Link
                href="/super-admin"
                className="flex items-center gap-1.5 text-ink-dim hover:text-ink transition-colors"
              >
                <Building2 size={15} strokeWidth={1.9} />
                Empresas
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm shrink-0">
          <span className="hidden md:inline text-ink-faint">
            {identity.companyUser
              ? `${identity.companyUser.name} · ${ROLE_LABEL[identity.companyUser.role] ?? identity.companyUser.role}`
              : identity.email}
          </span>
          <form action={logout}>
            <button className="flex items-center gap-1.5 text-ink-dim hover:text-ink transition-colors">
              <LogOut size={15} strokeWidth={1.9} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
