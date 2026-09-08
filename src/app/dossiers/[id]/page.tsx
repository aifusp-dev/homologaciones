import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { fiscalHorsepower } from "@/lib/calculations/coc";
import { CustomerForm } from "./customer-form";
import { DealerForm } from "./dealer-form";
import { CocForm } from "./coc-form";

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCompanyUser();

  const dossier = await prisma.dossier.findFirst({
    where: { id, companyId: user.companyId },
    include: { customer: true, dealer: true, coc: true },
  });
  if (!dossier) notFound();

  const power = fiscalHorsepower(dossier.coc?.displacement, dossier.coc?.cylinderCount);

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 py-10 space-y-8">
      <header className="space-y-1">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold tracking-tight font-mono">{dossier.number}</h1>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Cliente</h2>
        <CustomerForm dossierId={dossier.id} customer={dossier.customer} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Concesionario</h2>
        <DealerForm dossierId={dossier.id} dealer={dossier.dealer} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
          Certificado de conformidad (COC)
        </h2>
        <CocForm dossierId={dossier.id} coc={dossier.coc} fiscalHorsepower={power} />
      </section>
    </div>
  );
}
