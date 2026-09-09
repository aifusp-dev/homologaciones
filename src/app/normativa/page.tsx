import Link from "next/link";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Normativa DGT — WorkshopManagement",
  description: "Instrucciones VEH de la DGT sobre homologación de vehículos, vigiladas automáticamente.",
};

// Sin cookies/headers de por medio, Next no detecta que depende de datos
// que cambian con cada sondeo del cron — sin esto quedaría prerenderizada
// en build y nunca reflejaría instrucciones nuevas.
export const dynamic = "force-dynamic";

// Página pública, sin login — a diferencia de todo lo demás en la app.
// Lista las Instrucciones VEH de la DGT detectadas por el sondeo
// periódico (src/app/api/cron/dgt-watch), fuera del grupo (app) a
// propósito para no pasar por requireCompanyUser().
export default async function NormativaPage() {
  const updates = await prisma.regulatoryUpdate.findMany({
    orderBy: [{ publishedAt: "desc" }, { detectedAt: "desc" }],
    take: 100,
  });

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <Link href="/login" className="text-sm text-ink-faint hover:text-ink transition-colors">
            ← WorkshopManagement
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight">Normativa DGT — Vehículos</h1>
          <p className="text-sm text-ink-dim">
            Instrucciones VEH de la Dirección General de Tráfico sobre homologación de vehículos, vigiladas
            automáticamente por WorkshopManagement. Página pública, no requiere cuenta.
          </p>
        </header>

        {updates.length === 0 ? (
          <p className="text-sm text-ink-faint">Todavía no se ha detectado ninguna instrucción.</p>
        ) : (
          <ul className="space-y-4">
            {updates.map((u) => (
              <li key={u.id} className="border border-border rounded-xl p-4 bg-panel/40 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-medium text-ink">{u.title}</p>
                  {u.status && (
                    <span className="text-[11px] text-ink-faint uppercase tracking-wide border border-border rounded-full px-2 py-0.5 shrink-0">
                      {u.status}
                    </span>
                  )}
                </div>
                {u.publishedAt && (
                  <p className="text-xs text-ink-faint">
                    {u.publishedAt.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
                {u.summary && <p className="text-sm text-ink-dim">{u.summary}</p>}
                {Array.isArray(u.documents) && u.documents.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(u.documents as { label: string; url: string }[]).map((doc, i) => (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs border border-border-strong rounded-lg px-2.5 py-1 hover:border-accent transition-colors"
                      >
                        <FileText size={13} strokeWidth={1.9} />
                        {doc.label}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
