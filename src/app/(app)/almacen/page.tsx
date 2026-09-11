import { requireCompanyUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ArticleCard, NewArticleForm } from "./article-card";

const CATEGORY_LABEL: Record<string, string> = {
  LIGHTING: "Alumbrado y señalización 48R08",
  SPRAY_SUPPRESSION: "Dispositivos antiproyección UE 109/2011",
  MASSES: "Masas y dimensiones UE 1230/2012",
  REAR_PLATE: "Placas de matrícula traseras UE 1003/2010",
  REAR_PROTECTION: "Protección trasera 58R03",
  EMC: "Compatibilidad electromagnética 10R06",
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABEL);

export default async function AlmacenPage() {
  const user = await requireCompanyUser();
  const reports = await prisma.hReport.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
    include: {
      articles: {
        orderBy: { createdAt: "asc" },
        include: {
          purchases: { orderBy: { purchaseDate: "desc" } },
          installations: { orderBy: { installDate: "desc" }, include: { dossier: { select: { id: true, number: true } } } },
        },
      },
    },
  });

  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABEL[category],
    items: reports.filter((r) => r.category === category),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Almacén</h1>
        <p className="text-sm text-ink-faint">
          Artículos que autoriza cada Informe H, con sus compras (albarán + fecha) e instalaciones en
          expedientes — trazabilidad de qué se compró y dónde se instaló.
        </p>
      </div>

      <div className="space-y-6">
        {byCategory.map(({ category, label, items }) => (
          <div key={category} className="space-y-3">
            <h2 className="text-sm font-semibold text-ink-dim">{label}</h2>
            {items.length === 0 && <p className="text-xs text-ink-faint">Ningún Informe H en esta área todavía.</p>}
            <div className="space-y-3">
              {items.map((r) => (
                <div key={r.id} className="border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono">{r.number}</span>
                    {r.issuer && <span className="text-ink-faint">· {r.issuer}</span>}
                  </div>
                  <div className="space-y-2">
                    {r.articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                    {r.articles.length === 0 && (
                      <p className="text-xs text-ink-faint">Sin artículos catalogados todavía.</p>
                    )}
                  </div>
                  <NewArticleForm hReportId={r.id} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
