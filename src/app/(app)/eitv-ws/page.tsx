import { requireCompanyUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { CreditCard, Settings, ListChecks, Search } from "lucide-react";
import { EitvWsTabs } from "./eitv-ws-tabs";
import { ConfigSection } from "./config-section";
import { RangesSection } from "./ranges-section";
import { CardsSearchSection } from "./cards-search-section";

export default async function EitvWsPage() {
  const user = await requireCompanyUser();

  const [config, rangeRequests] = await Promise.all([
    prisma.eitvWsConfig.findUnique({ where: { companyId: user.companyId } }),
    prisma.eitvWsRangeRequest.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: "desc" },
      include: { authorizations: true },
    }),
  ]);

  const tabs = [
    {
      id: "config",
      label: "Configuración",
      icon: <Settings size={16} strokeWidth={1.9} />,
      content: <ConfigSection config={config} isAdmin={user.role === "COMPANY_ADMIN"} />,
    },
    {
      id: "rangos",
      label: "Rangos",
      icon: <ListChecks size={16} strokeWidth={1.9} />,
      content: <RangesSection rangeRequests={rangeRequests} hasConfig={!!config} />,
    },
    {
      id: "consulta",
      label: "Consulta de tarjetas",
      icon: <Search size={16} strokeWidth={1.9} />,
      content: <CardsSearchSection hasConfig={!!config} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard size={22} strokeWidth={1.9} className="text-accent" />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">eITV</h1>
          <p className="text-sm text-ink-faint">
            Tarjetas ITV electrónicas — rangos y consultas contra el WS del Ministerio de
            Industria (WSEITV). El envío de lotes de tarjetas firmadas todavía no está disponible.
          </p>
        </div>
      </div>

      <EitvWsTabs tabs={tabs} />
    </div>
  );
}
