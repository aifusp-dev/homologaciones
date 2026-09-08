import { requireCompanyUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { HReportForm } from "./h-report-form";
import { DeleteHReportButton } from "./delete-h-report-button";

const CATEGORY_LABEL: Record<string, string> = {
  LIGHTING: "Alumbrado y señalización 48R08",
  SPRAY_SUPPRESSION: "Dispositivos antiproyección UE 109/2011",
  MASSES: "Masas y dimensiones UE 1230/2012",
  REAR_PLATE: "Placas de matrícula traseras UE 1003/2010",
  REAR_PROTECTION: "Protección trasera 58R03",
  EMC: "Compatibilidad electromagnética 10R06",
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABEL);

export default async function HReportsPage() {
  const user = await requireCompanyUser();
  const reports = await prisma.hReport.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
  });

  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABEL[category],
    items: reports.filter((r) => r.category === category),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Informes H</h1>
        <p className="text-sm text-ink-faint">
          Catálogo de Informes H (Nota H, RD 2028/1986) del taller. Se seleccionan luego desde la pestaña
          &quot;Dispositivos y señalización&quot; de cada expediente, en vez de teclear el número a mano.
        </p>
      </div>

      <HReportForm />

      <div className="space-y-5">
        {byCategory.map(({ category, label, items }) => (
          <div key={category} className="space-y-2">
            <h2 className="text-sm font-semibold text-ink-dim">{label}</h2>
            <ul className="space-y-1.5 text-sm">
              {items.map((r) => (
                <li key={r.id} className="flex justify-between items-center border-t border-border pt-2">
                  <span>
                    <span className="font-mono">{r.number}</span>
                    {r.issuer && <span className="text-ink-faint"> · {r.issuer}</span>}
                    {r.filePath && (
                      <a
                        href={`/api/h-reports/${r.id}`}
                        target="_blank"
                        className="ml-2 underline text-ink-dim hover:text-ink"
                      >
                        PDF
                      </a>
                    )}
                  </span>
                  <DeleteHReportButton id={r.id} />
                </li>
              ))}
              {items.length === 0 && <p className="text-xs text-ink-faint">Ninguno todavía.</p>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
