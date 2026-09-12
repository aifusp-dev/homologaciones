import Link from "next/link";
import { User, Building2, ShieldCheck, Truck, Scale, Wrench, FileText, History, Send, Boxes } from "lucide-react";
import { notFound } from "next/navigation";
import { requireCompanyUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { domainInclude } from "@/lib/dossierDomainTables";
import { fiscalHorsepower } from "@/lib/calculations/coc";
import { calculateBodywork } from "@/lib/calculations/bodywork";
import {
  calculateBaseMasses,
  calculateTriaxleMasses,
  calculateSemiO4Masses,
  calculateSemiO4ThreeAxleMasses,
  fuelMassKg,
} from "@/lib/calculations/masses";
import { CustomerForm } from "./customer-form";
import { DealerForm } from "./dealer-form";
import { CocForm } from "./coc-form";
import { BodyworkForm } from "./bodywork-form";
import { MassesForm } from "./masses-form";
import { DocumentsSection } from "./documents-section";
import { AttachmentsSection } from "./attachments-section";
import { DevicesSection } from "./devices-section";
import { RegulatoryActNumbersForm } from "./regulatory-act-numbers-form";
import { WarehouseTab } from "./warehouse-tab";
import { HistorySection } from "./history-section";
import { EitvSection } from "./eitv-section";
import { DossierTabs, type DossierTab } from "./dossier-tabs";
import { DossierArchiveButton } from "./dossier-archive-button";
import { detectVehicleConfig } from "@/lib/vehicleConfig";
import type { DiagramData } from "./masses-diagram";

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCompanyUser();

  const dossier = await prisma.dossier.findFirst({
    where: { id, companyId: user.companyId },
    include: {
      ...domainInclude(),
      documents: { orderBy: { createdAt: "desc" } },
      attachmentFolders: {
        orderBy: { createdAt: "asc" },
        include: { attachments: { orderBy: { createdAt: "desc" } } },
      },
      company: { select: { taxId: true } },
    },
  });
  if (!dossier) notFound();

  const hReports = await prisma.hReport.findMany({ where: { companyId: user.companyId } });
  const savedCustomers = await prisma.savedCustomer.findMany({
    where: { companyId: user.companyId },
    orderBy: { name: "asc" },
  });
  const hReportArticles = await prisma.hReportArticle.findMany({
    where: { hReport: { companyId: user.companyId } },
    orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
    include: { hReport: { select: { number: true } } },
  });
  const installations = await prisma.articleInstallation.findMany({
    where: { dossierId: id },
    orderBy: { installDate: "desc" },
    include: { article: { select: { id: true, name: true, unit: true, hReport: { select: { number: true } } } } },
  });
  const hReportsByCategory: Record<string, { id: string; number: string; issuer: string | null }[]> = {
    LIGHTING: [],
    SPRAY_SUPPRESSION: [],
    MASSES: [],
    REAR_PLATE: [],
    REAR_PROTECTION: [],
    EMC: [],
  };
  for (const r of hReports) {
    hReportsByCategory[r.category]?.push({ id: r.id, number: r.number, issuer: r.issuer });
  }

  const power = fiscalHorsepower(dossier.coc?.displacement, dossier.coc?.cylinderCount);
  const bodyworkComputed = calculateBodywork({
    interiorLength: dossier.bodywork?.interiorLength ?? null,
    interiorWidth: dossier.bodywork?.interiorWidth ?? null,
    interiorHeight: dossier.bodywork?.interiorHeight ?? null,
    exteriorLength: dossier.bodywork?.exteriorLength ?? null,
    exteriorWidth: dossier.bodywork?.exteriorWidth ?? null,
    floorWeightPerM2: dossier.bodywork?.floorWeightPerM2 ?? null,
    roofMaterialWeightPerM2: dossier.bodywork?.roofMaterialWeightPerM2 ?? null,
    sideMaterialWeightPerM2: dossier.bodywork?.sideMaterialWeightPerM2 ?? null,
    sideStructureTubeWeightPerMeter: dossier.bodywork?.sideStructureTubeWeightPerMeter ?? null,
    skirtWeightPerM2: dossier.bodywork?.skirtWeightPerM2 ?? null,
    subchassisMaterialWeightPerMeter: dossier.bodywork?.subchassisMaterialWeightPerMeter ?? null,
    roofStructureMaterialWeightPerMeter: dossier.bodywork?.roofStructureMaterialWeightPerMeter ?? null,
    trimWeightPerMeter: dossier.bodywork?.trimWeightPerMeter ?? null,
    tieDownWeightPerMeter: dossier.bodywork?.tieDownWeightPerMeter ?? null,
    tieDownCount: dossier.bodywork?.tieDownCount ?? null,
    baseMaterialWeightPerMeter: dossier.bodywork?.baseMaterialWeightPerMeter ?? null,
    baseMaterial: dossier.bodywork?.baseMaterial ?? null,
    doorLined: dossier.bodywork?.doorLined ?? null,
    doorFiberWeightPerM2: dossier.bodywork?.doorFiberWeightPerM2 ?? null,
    windDeflectorWeight: dossier.bodywork?.windDeflectorWeight ?? null,
    liftPlatformWeight: dossier.bodywork?.liftPlatformWeight ?? null,
    otherAccessoriesWeight: dossier.bodywork?.otherAccessoriesWeight ?? null,
    toolBoxWeight: dossier.bodywork?.toolBoxWeight ?? null,
    extinguisherBoxWeight: dossier.bodywork?.extinguisherBoxWeight ?? null,
    sideStructureMaterial: dossier.bodywork?.sideStructureMaterial ?? null,
    roofStructureMaterial: dossier.bodywork?.roofStructureMaterial ?? null,
  });

  const m = dossier.massesDimensions;
  const massesInputs = {
    axleDistance0to1: dossier.coc?.axleDistance0to1 ?? null,
    axleDistance1to2: dossier.coc?.axleDistance1to2 ?? null,
    axleDistance2to3: dossier.coc?.axleDistance2to3 ?? null,
    staticCouplingPointMass: dossier.coc?.staticCouplingPointMass ?? null,
    maxTechnicallyPermissibleMass: dossier.coc?.maxTechnicallyPermissibleMass ?? null,
    maxTechnicallyPermissibleMassRequested: dossier.coc?.maxTechnicallyPermissibleMassRequested ?? null,
    maxTechnicallyPermissibleMassAxle1: dossier.coc?.maxTechnicallyPermissibleMassAxle1 ?? null,
    maxTechnicallyPermissibleMassAxle2: dossier.coc?.maxTechnicallyPermissibleMassAxle2 ?? null,
    maxTechnicallyPermissibleMassAxle3: dossier.coc?.maxTechnicallyPermissibleMassAxle3 ?? null,
    maxLadenMassRegistration: dossier.coc?.maxLadenMassRegistration ?? null,
    maxLadenMassRegistrationAxle1: dossier.coc?.maxLadenMassRegistrationAxle1 ?? null,
    maxLadenMassRegistrationAxle2: dossier.coc?.maxLadenMassRegistrationAxle2 ?? null,
    maxLadenMassRegistrationAxle3: dossier.coc?.maxLadenMassRegistrationAxle3 ?? null,
    momIncompleteAxle1: dossier.coc?.momIncompleteAxle1 ?? null,
    momIncompleteAxle2: dossier.coc?.momIncompleteAxle2 ?? null,
    momIncompleteVehicle: dossier.coc?.momIncompleteVehicle ?? null,
    semiTrailerMaxTechMassSolicited: dossier.coc?.maxTechnicallyPermissibleMassRequested ?? null,
    exteriorLength: dossier.bodywork?.exteriorLength ?? null,
    firstAxleToBodyDistance: m?.firstAxleToBodyDistance ?? null,
    frontOverhang: m?.frontOverhang ?? null,
    maxVehicleWidth: m?.maxVehicleWidth ?? null,
    reeferUnitCentreOfGravity: m?.reeferUnitCentreOfGravity ?? null,
    reeferUnitMass: m?.reeferUnitMass ?? null,
    liftPlatformCentreOfGravity: m?.liftPlatformCentreOfGravity ?? null,
    liftPlatformMass: m?.liftPlatformMass ?? null,
    hookCentreOfGravity: m?.hookCentreOfGravity ?? null,
    seatsCentreOfGravity: m?.seatsCentreOfGravity ?? null,
    seatsMass: m?.seatsMass ?? null,
    seats2Mass: m?.seats2Mass ?? null,
    seats2CentreOfGravity: m?.seats2CentreOfGravity ?? null,
    fuelCentreOfGravity: m?.fuelCentreOfGravity ?? null,
    fuelCapacity: fuelMassKg(m?.fuelCapacity ?? null),
    tareAxle1: m?.tareAxle1 ?? null,
    tareAxle2: m?.tareAxle2 ?? null,
    tareAxle3: m?.tareAxle3 ?? null,
    centreAxleTrailerMass: m?.centreAxleTrailerMass ?? null,
    semiTrailerTotalLength: m?.semiTrailerTotalLength ?? null,
    semiTrailerBodyLength: m?.semiTrailerBodyLength ?? null,
    semiTrailerTare: m?.semiTrailerTare ?? null,
    theoreticalBodyTare: m?.theoreticalBodyTare ?? null,
    chassisWeighbridgeTareAxle1: m?.chassisWeighbridgeTareAxle1 ?? null,
    chassisWeighbridgeTareAxle2: m?.chassisWeighbridgeTareAxle2 ?? null,
    craneCentreOfGravity: m?.craneCentreOfGravity ?? null,
    craneMass: m?.craneMass ?? null,
    craneBoxCentreOfGravity: m?.craneBoxCentreOfGravity ?? null,
    boxMass: m?.boxMass ?? null,
    semiTrailer3AxleVd: m?.semiTrailer3AxleVd ?? null,
    semiTrailer3AxleVdAccessory: m?.semiTrailer3AxleVdAccessory ?? null,
    semiTrailer3AxleVp: m?.semiTrailer3AxleVp ?? null,
    semiTrailer3AxleLt: m?.semiTrailer3AxleLt ?? null,
    semiTrailer3AxleLc: m?.semiTrailer3AxleLc ?? null,
    semiTrailer3AxleBodyWeight: m?.semiTrailer3AxleBodyWeight ?? null,
  };
  const massesComputed = {
    ...calculateBaseMasses(massesInputs),
    ...calculateTriaxleMasses(massesInputs),
    ...calculateSemiO4Masses(massesInputs),
    ...calculateSemiO4ThreeAxleMasses(massesInputs),
  };

  // Sin selector explícito de configuración de vehículo en el modelo (ver
  // conversación) — se infiere de datos ya reales, centralizado en
  // detectVehicleConfig() para no duplicar la heurística que ya usan las
  // plantillas de PDF.
  const vehicleConfig = detectVehicleConfig({
    axleCount: dossier.coc?.axleCount,
    staticKingpinMass: dossier.coc?.staticKingpinMass,
    kingpinToRearEdgeDistance: dossier.coc?.kingpinToRearEdgeDistance,
    vehicleCategory: dossier.coc?.vehicleCategory,
  });

  const VEHICLE_CONFIG_LABEL: Record<typeof vehicleConfig, string> = {
    base: "Vehículo 2 ejes",
    triaxle: "Vehículo 3 ejes",
    semi2: "Semirremolque 2 ejes",
    semi3: "Semirremolque 3 ejes",
  };

  const diagramData: DiagramData =
    vehicleConfig === "semi2" || vehicleConfig === "semi3"
      ? {
          totalLength: vehicleConfig === "semi3" ? (m?.semiTrailer3AxleLt ?? null) : (m?.semiTrailerTotalLength ?? null),
          cargoLength: vehicleConfig === "semi3" ? (m?.semiTrailer3AxleLc ?? null) : (m?.semiTrailerBodyLength ?? null),
          frontOverhang: null,
          rearOverhang: null,
          wheelbase: null,
          wheelbase2: null,
          firstAxleToBodyDistance: null,
          height: m?.maxHeightFromGround ?? null,
          width: dossier.bodywork?.exteriorWidth ?? null,
          hasCrane: false,
        }
      : {
          // Para TRIAXLE no hay un totalLength3Axle exportado por el
          // motor de cálculo (no hacía falta para las 234 fórmulas
          // originales) — se deriva aquí con la misma suma que usa BASE,
          // solo que con un tramo de eje más. Puro cálculo de
          // visualización, no toca calculations/masses.ts.
          totalLength:
            vehicleConfig === "triaxle"
              ? m?.frontOverhang != null &&
                massesComputed.rearOverhang3Axle != null &&
                dossier.coc?.axleDistance1to2 != null &&
                dossier.coc?.axleDistance2to3 != null
                ? m.frontOverhang + massesComputed.rearOverhang3Axle + dossier.coc.axleDistance1to2 + dossier.coc.axleDistance2to3
                : null
              : (massesComputed.totalLength ?? null),
          frontOverhang: m?.frontOverhang ?? null,
          rearOverhang: vehicleConfig === "triaxle" ? (massesComputed.rearOverhang3Axle ?? null) : (massesComputed.rearOverhang ?? null),
          wheelbase: dossier.coc?.axleDistance1to2 ?? null,
          wheelbase2: vehicleConfig === "triaxle" ? (dossier.coc?.axleDistance2to3 ?? null) : null,
          firstAxleToBodyDistance: m?.firstAxleToBodyDistance ?? null,
          cargoLength: dossier.bodywork?.interiorLength ?? dossier.bodywork?.exteriorLength ?? null,
          height: m?.maxHeightFromGround ?? null,
          width: dossier.bodywork?.exteriorWidth ?? null,
          hasCrane: (m?.craneMass ?? 0) > 0,
        };

  // Datos calculados para el generador de XML eITV (Datos Nacionales) —
  // ver src/app/actions/eitv.ts, misma lógica de mapeo aplicada ahí.
  const eitvComputed = {
    bastidor: dossier.coc?.vin ?? null,
    clasificacion: dossier.coc?.vehicleCategory ?? null,
    potencfiscal: power,
    mma: dossier.coc?.maxLadenMassRegistration ?? null,
    mmaeje1: dossier.coc?.maxLadenMassRegistrationAxle1 ?? null,
    mmaeje2: dossier.coc?.maxLadenMassRegistrationAxle2 ?? null,
    mmaeje3: dossier.coc?.maxLadenMassRegistrationAxle3 ?? null,
    numhomovehicomp: dossier.bodywork?.completedApprovalNumber ?? null,
    carrocero: dossier.company.taxId ?? null,
    homologacionE9: dossier.coc?.approvalNumber?.trim()
      ? dossier.coc.approvalNumber.trim().toLowerCase().startsWith("e9")
      : null,
  };

  const tabs: DossierTab[] = [
    {
      id: "cliente",
      label: "Cliente",
      icon: <User size={16} strokeWidth={1.9} className="shrink-0" />,
      content: <CustomerForm dossierId={dossier.id} customer={dossier.customer} savedCustomers={savedCustomers} />,
    },
    {
      id: "concesionario",
      label: "Concesionario",
      icon: <Building2 size={16} strokeWidth={1.9} className="shrink-0" />,
      content: <DealerForm dossierId={dossier.id} dealer={dossier.dealer} />,
    },
    {
      id: "coc",
      label: "COC",
      icon: <ShieldCheck size={16} strokeWidth={1.9} className="shrink-0" />,
      content: <CocForm dossierId={dossier.id} coc={dossier.coc} fiscalHorsepower={power} />,
    },
    {
      id: "carrozado",
      label: "Carrozado",
      icon: <Truck size={16} strokeWidth={1.9} className="shrink-0" />,
      content: <BodyworkForm dossierId={dossier.id} bodywork={dossier.bodywork} computed={bodyworkComputed} />,
    },
    {
      id: "masas",
      label: "Masas y dimensiones",
      icon: <Scale size={16} strokeWidth={1.9} className="shrink-0" />,
      wide: true,
      content: (
        <div className="space-y-3">
          <p className="text-xs text-ink-faint">{VEHICLE_CONFIG_LABEL[vehicleConfig]}</p>
          <MassesForm
            dossierId={dossier.id}
            masses={dossier.massesDimensions}
            computed={massesComputed}
            axleCount={dossier.coc?.axleCount ?? null}
            vehicleConfig={vehicleConfig}
            diagramData={diagramData}
            massesInputs={massesInputs}
          />
        </div>
      ),
    },
    {
      id: "dispositivos",
      label: "Dispositivos y señalización",
      icon: <Wrench size={16} strokeWidth={1.9} className="shrink-0" />,
      content: (
        <div className="space-y-3">
          <DevicesSection
            dossierId={dossier.id}
            records={{
              couplingDevice: dossier.couplingDevice,
              spraySuppression: dossier.spraySuppression,
              electromagneticCompatibility: dossier.electromagneticCompatibility,
              lateralProtection: dossier.lateralProtection,
              rearProtection: dossier.rearProtection,
              lateralMarking: dossier.lateralMarking,
              lightingSide: dossier.lightingSide,
              lightingPosition: dossier.lightingPosition,
              lightingReflector: dossier.lightingReflector,
              lightingBrake: dossier.lightingBrake,
              lightingTurnSignal: dossier.lightingTurnSignal,
              lightingRearOutlineMarker: dossier.lightingRearOutlineMarker,
              lightingFrontOutlineMarker: dossier.lightingFrontOutlineMarker,
              lightingPlate: dossier.lightingPlate,
              lightingReverse: dossier.lightingReverse,
              lightingFog: dossier.lightingFog,
              lightingMaterialChecklist: dossier.lightingMaterialChecklist,
              copCoverSheet: dossier.copCoverSheet,
              registrationPlates: dossier.registrationPlates,
              platesInscriptions: dossier.platesInscriptions,
            }}
          />
          <RegulatoryActNumbersForm
            dossierId={dossier.id}
            current={dossier.regulatoryActNumbers}
            catalog={hReportsByCategory}
          />
        </div>
      ),
    },
    {
      id: "almacen",
      label: "Almacén",
      icon: <Boxes size={16} strokeWidth={1.9} className="shrink-0" />,
      content: (
        <WarehouseTab
          dossierId={dossier.id}
          articles={hReportArticles.map((a) => ({
            id: a.id,
            name: a.name,
            reference: a.reference,
            unit: a.unit,
            isFavorite: a.isFavorite,
            hReportNumber: a.hReport.number,
          }))}
          installations={installations}
        />
      ),
    },
    {
      id: "documentos",
      label: "Documentos",
      icon: <FileText size={16} strokeWidth={1.9} className="shrink-0" />,
      content: (
        <div className="space-y-6">
          <DocumentsSection dossierId={dossier.id} documents={dossier.documents} />
          <AttachmentsSection dossierId={dossier.id} folders={dossier.attachmentFolders} />
        </div>
      ),
    },
    {
      id: "historial",
      label: "Historial",
      icon: <History size={16} strokeWidth={1.9} className="shrink-0" />,
      content: <HistorySection dossierId={dossier.id} />,
    },
    {
      id: "eitv",
      label: "eITV",
      icon: <Send size={16} strokeWidth={1.9} className="shrink-0" />,
      content: <EitvSection dossierId={dossier.id} eitv={dossier.eitvNationalData} computed={eitvComputed} />,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link href="/dashboard" className="text-sm text-ink-faint hover:text-ink transition-colors">
          ← Volver
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold tracking-tight font-mono">{dossier.number}</h1>
          <DossierArchiveButton dossierId={dossier.id} archived={Boolean(dossier.archivedAt)} />
        </div>
      </header>

      <DossierTabs tabs={tabs} />
    </div>
  );
}
