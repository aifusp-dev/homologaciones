import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { fiscalHorsepower } from "@/lib/calculations/coc";
import { calculateBodywork } from "@/lib/calculations/bodywork";
import {
  calculateBaseMasses,
  calculateTriaxleMasses,
  calculateSemiO4Masses,
  calculateSemiO4ThreeAxleMasses,
} from "@/lib/calculations/masses";
import { CustomerForm } from "./customer-form";
import { DealerForm } from "./dealer-form";
import { CocForm } from "./coc-form";
import { BodyworkForm } from "./bodywork-form";
import { MassesForm } from "./masses-form";
import { DocumentsSection } from "./documents-section";
import { DevicesSection } from "./devices-section";

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCompanyUser();

  const dossier = await prisma.dossier.findFirst({
    where: { id, companyId: user.companyId },
    include: {
      customer: true,
      dealer: true,
      coc: true,
      bodywork: true,
      massesDimensions: true,
      documents: { orderBy: { createdAt: "desc" } },
      couplingDevice: true,
      spraySuppression: true,
      electromagneticCompatibility: true,
      lateralProtection: true,
      rearProtection: true,
      lateralMarking: true,
      lightingSide: true,
      lightingPosition: true,
      lightingReflector: true,
      lightingBrake: true,
      lightingTurnSignal: true,
      lightingRearOutlineMarker: true,
      lightingFrontOutlineMarker: true,
      lightingPlate: true,
      lightingReverse: true,
      lightingFog: true,
      lightingMaterialChecklist: true,
      regulatoryActNumbers: true,
    },
  });
  if (!dossier) notFound();

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
    fuelCapacity: m?.fuelCapacity ?? null,
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

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Carrozado</h2>
        <BodyworkForm dossierId={dossier.id} bodywork={dossier.bodywork} computed={bodyworkComputed} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
          Masas y dimensiones <span className="text-neutral-600 normal-case">— vehículo 2 ejes</span>
        </h2>
        <MassesForm dossierId={dossier.id} masses={dossier.massesDimensions} computed={massesComputed} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
          Dispositivos y señalización
        </h2>
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
            regulatoryActNumbers: dossier.regulatoryActNumbers,
          }}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Documentos</h2>
        <DocumentsSection dossierId={dossier.id} documents={dossier.documents} />
      </section>
    </div>
  );
}
