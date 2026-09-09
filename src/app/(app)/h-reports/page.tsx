import Link from "next/link";
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
    include: {
      lightingActNumbers: { select: { dossier: { select: { id: true, number: true } } } },
      spraySuppressionActNumbers: { select: { dossier: { select: { id: true, number: true } } } },
      massesActNumbers: { select: { dossier: { select: { id: true, number: true } } } },
      rearPlateActNumbers: { select: { dossier: { select: { id: true, number: true } } } },
      rearProtectionActNumbers: { select: { dossier: { select: { id: true, number: true } } } },
      emcActNumbers: { select: { dossier: { select: { id: true, number: true } } } },
    },
  });

  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABEL[category],
    items: reports.filter((r) => r.category === category),
  }));

  function usedInDossiers(r: (typeof reports)[number]) {
    const groups = [
      r.lightingActNumbers,
      r.spraySuppressionActNumbers,
      r.massesActNumbers,
      r.rearPlateActNumbers,
      r.rearProtectionActNumbers,
      r.emcActNumbers,
    ];
    const dossiers = groups.flatMap((g) => g.map((a: { dossier: { id: string; number: string } }) => a.dossier));
    const seen = new Map(dossiers.map((d) => [d.id, d]));
    return [...seen.values()].sort((a, b) => a.number.localeCompare(b.number));
  }

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
              {items.map((r) => {
                const dossiers = usedInDossiers(r);
                return (
                  <li key={r.id} className="border-t border-border pt-2 space-y-1">
                    <div className="flex justify-between items-center">
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
                    </div>
                    <p className="text-xs text-ink-faint">
                      {dossiers.length === 0 ? (
                        "Sin usar todavía"
                      ) : (
                        <>
                          Usado en:{" "}
                          {dossiers.map((d, i) => (
                            <span key={d.id}>
                              {i > 0 && ", "}
                              <Link href={`/dossiers/${d.id}`} className="font-mono underline hover:text-ink">
                                {d.number}
                              </Link>
                            </span>
                          ))}
                        </>
                      )}
                    </p>
                  </li>
                );
              })}
              {items.length === 0 && <p className="text-xs text-ink-faint">Ninguno todavía.</p>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
