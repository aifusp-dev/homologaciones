"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { renderHtmlToPdfBuffer, saveGeneratedPdf } from "@/lib/pdf/render";
import { renderPreliminaryReport } from "@/lib/pdf/templates/preliminaryReport";
import { renderManufacturingOrder } from "@/lib/pdf/templates/manufacturingOrder";
import { renderBodyworkCertificate } from "@/lib/pdf/templates/bodyworkCertificate";
import { calculateBaseMasses } from "@/lib/calculations/masses";
import type { FormState } from "@/lib/definitions";
import type { DocumentType } from "@/generated/prisma/enums";

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  PRELIMINARY_REPORT: "Informe previo",
  MANUFACTURING_ORDER: "Orden de fabricación",
  BODYWORK_CERTIFICATE: "Certificado de carrozado",
  BODYWORK_CERTIFICATE_PART2: "Certificado de carrozado (parte 2)",
  REDUCED_DATASHEET: "Ficha reducida",
  COP_REGISTER: "Registro COP",
};

async function loadDossierData(dossierId: string, companyId: string) {
  const dossier = await prisma.dossier.findFirst({
    where: { id: dossierId, companyId },
    include: {
      coc: true,
      bodywork: true,
      massesDimensions: true,
      company: true,
      regulatoryActNumbers: true,
      lightingMaterialChecklist: true,
    },
  });
  if (!dossier) return null;

  const masses = calculateBaseMasses({
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
    firstAxleToBodyDistance: dossier.massesDimensions?.firstAxleToBodyDistance ?? null,
    frontOverhang: dossier.massesDimensions?.frontOverhang ?? null,
    maxVehicleWidth: dossier.massesDimensions?.maxVehicleWidth ?? null,
    reeferUnitCentreOfGravity: dossier.massesDimensions?.reeferUnitCentreOfGravity ?? null,
    reeferUnitMass: dossier.massesDimensions?.reeferUnitMass ?? null,
    liftPlatformCentreOfGravity: dossier.massesDimensions?.liftPlatformCentreOfGravity ?? null,
    liftPlatformMass: dossier.massesDimensions?.liftPlatformMass ?? null,
    hookCentreOfGravity: dossier.massesDimensions?.hookCentreOfGravity ?? null,
    seatsCentreOfGravity: dossier.massesDimensions?.seatsCentreOfGravity ?? null,
    seatsMass: dossier.massesDimensions?.seatsMass ?? null,
    seats2Mass: dossier.massesDimensions?.seats2Mass ?? null,
    seats2CentreOfGravity: dossier.massesDimensions?.seats2CentreOfGravity ?? null,
    fuelCentreOfGravity: dossier.massesDimensions?.fuelCentreOfGravity ?? null,
    fuelCapacity: dossier.massesDimensions?.fuelCapacity ?? null,
    tareAxle1: dossier.massesDimensions?.tareAxle1 ?? null,
    tareAxle2: dossier.massesDimensions?.tareAxle2 ?? null,
    tareAxle3: dossier.massesDimensions?.tareAxle3 ?? null,
    centreAxleTrailerMass: dossier.massesDimensions?.centreAxleTrailerMass ?? null,
    semiTrailerTotalLength: dossier.massesDimensions?.semiTrailerTotalLength ?? null,
    semiTrailerBodyLength: dossier.massesDimensions?.semiTrailerBodyLength ?? null,
    semiTrailerTare: dossier.massesDimensions?.semiTrailerTare ?? null,
    theoreticalBodyTare: dossier.massesDimensions?.theoreticalBodyTare ?? null,
    chassisWeighbridgeTareAxle1: dossier.massesDimensions?.chassisWeighbridgeTareAxle1 ?? null,
    chassisWeighbridgeTareAxle2: dossier.massesDimensions?.chassisWeighbridgeTareAxle2 ?? null,
    craneCentreOfGravity: dossier.massesDimensions?.craneCentreOfGravity ?? null,
    craneMass: dossier.massesDimensions?.craneMass ?? null,
    craneBoxCentreOfGravity: dossier.massesDimensions?.craneBoxCentreOfGravity ?? null,
    boxMass: dossier.massesDimensions?.boxMass ?? null,
    semiTrailer3AxleVd: dossier.massesDimensions?.semiTrailer3AxleVd ?? null,
    semiTrailer3AxleVdAccessory: dossier.massesDimensions?.semiTrailer3AxleVdAccessory ?? null,
    semiTrailer3AxleVp: dossier.massesDimensions?.semiTrailer3AxleVp ?? null,
    semiTrailer3AxleLt: dossier.massesDimensions?.semiTrailer3AxleLt ?? null,
    semiTrailer3AxleLc: dossier.massesDimensions?.semiTrailer3AxleLc ?? null,
    semiTrailer3AxleBodyWeight: dossier.massesDimensions?.semiTrailer3AxleBodyWeight ?? null,
  });

  return { dossier, masses };
}

export async function generateDocument(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  const type = formData.get("type") as DocumentType | null;
  if (typeof dossierId !== "string" || !type) return { message: "Datos no válidos." };

  const data = await loadDossierData(dossierId, user.companyId);
  if (!data) return { message: "Expediente no encontrado." };
  const { dossier, masses } = data;

  let html: string;
  let fileName: string;

  const actNumbers = dossier.regulatoryActNumbers
    ? {
        lightingActNumber: dossier.regulatoryActNumbers.lightingActNumber,
        spraySuppressionActNumber: dossier.regulatoryActNumbers.spraySuppressionActNumber,
        massesActNumber: dossier.regulatoryActNumbers.massesActNumber,
        rearPlateActNumber: dossier.regulatoryActNumbers.rearPlateActNumber,
        rearProtectionActNumber: dossier.regulatoryActNumbers.rearProtectionActNumber,
        emcActNumber: dossier.regulatoryActNumbers.emcActNumber,
      }
    : null;

  if (type === "PRELIMINARY_REPORT") {
    html = renderPreliminaryReport({
      companyName: dossier.company.name,
      logoUrl: dossier.company.logoUrl,
      dossierNumber: dossier.number,
      vin: dossier.coc?.vin ?? null,
      brand: dossier.coc?.brand ?? null,
      bodyType: dossier.bodywork?.bodyType ?? null,
      mma: dossier.coc?.maxLadenMassRegistration ?? null,
      mmta: dossier.coc?.maxTechnicallyPermissibleMassRequested ?? null,
      tare: masses.initialTareNoAccessories,
      axle1Tare: dossier.massesDimensions?.tareAxle1 ?? null,
      axle2Tare: dossier.massesDimensions?.tareAxle2 ?? null,
      mmaAxle1: dossier.coc?.maxLadenMassRegistrationAxle1 ?? null,
      mmtaAxle1: dossier.coc?.maxTechnicallyPermissibleMassAxle1 ?? null,
      mmaAxle2: dossier.coc?.maxLadenMassRegistrationAxle2 ?? null,
      mmtaAxle2: dossier.coc?.maxTechnicallyPermissibleMassAxle2 ?? null,
      staticCouplingMass: dossier.coc?.staticCouplingPointMass ?? null,
      totalLength: masses.totalLength,
      width: dossier.bodywork?.exteriorWidth ?? null,
      heightFromGround: dossier.massesDimensions?.maxHeightFromGround ?? null,
      rearOverhang: masses.rearOverhang,
      responsibleName: user.name,
      actNumbers,
    });
    fileName = `Informe_Previo_${dossier.number}.pdf`;
  } else if (type === "MANUFACTURING_ORDER") {
    html = renderManufacturingOrder({
      companyName: dossier.company.name,
      logoUrl: dossier.company.logoUrl,
      dossierNumber: dossier.number,
      vin: dossier.coc?.vin ?? null,
      bodyType: dossier.bodywork?.bodyType ?? null,
      totalLength: masses.totalLength,
      width: dossier.bodywork?.exteriorWidth ?? null,
      heightFromGround: dossier.massesDimensions?.maxHeightFromGround ?? null,
      rearOverhang: masses.rearOverhang,
      liftPlatformBrand: dossier.bodywork?.liftPlatformBrand ?? null,
      liftPlatformCapacity: dossier.bodywork?.liftPlatformCapacity ?? null,
      rearProtectionBrand: dossier.bodywork?.rearProtectionBrand ?? null,
      rearProtectionModel: dossier.bodywork?.rearProtectionModel ?? null,
      couplingDeviceBrand: dossier.bodywork?.couplingDeviceBrand ?? null,
      actNumbers,
      lightingMaterial: dossier.lightingMaterialChecklist
        ? {
            sideOutlineMarkerLamp: dossier.lightingMaterialChecklist.sideOutlineMarkerLamp,
            rearOutlineMarkerLamp: dossier.lightingMaterialChecklist.rearOutlineMarkerLamp,
            frontOutlineMarkerLamp: dossier.lightingMaterialChecklist.frontOutlineMarkerLamp,
            rearHangingOutlineMarkerLamp: dossier.lightingMaterialChecklist.rearHangingOutlineMarkerLamp,
            plateLight: dossier.lightingMaterialChecklist.plateLight,
            thirdBrakeLight: dossier.lightingMaterialChecklist.thirdBrakeLight,
            v23Red: dossier.lightingMaterialChecklist.v23Red,
            v23White: dossier.lightingMaterialChecklist.v23White,
            spraySuppressionFlap: dossier.lightingMaterialChecklist.spraySuppressionFlap,
            mudguard: dossier.lightingMaterialChecklist.mudguard,
            lateralProtectionMaterial: dossier.lightingMaterialChecklist.lateralProtectionMaterial,
          }
        : null,
    });
    fileName = `Orden_Fabricacion_${dossier.number}.pdf`;
  } else if (type === "BODYWORK_CERTIFICATE") {
    const isSemiTrailer =
      dossier.coc?.staticKingpinMass != null ||
      dossier.coc?.kingpinToRearEdgeDistance != null ||
      (dossier.coc?.vehicleCategory ?? "").toUpperCase().startsWith("O");
    html = renderBodyworkCertificate({
      companyName: dossier.company.name,
      logoUrl: dossier.company.logoUrl,
      dossierNumber: dossier.number,
      vin: dossier.coc?.vin ?? null,
      brand: dossier.coc?.brand ?? null,
      type: dossier.coc?.type ?? null,
      variant: dossier.coc?.variant ?? null,
      version: dossier.coc?.version ?? null,
      commercialName: dossier.coc?.commercialName ?? null,
      approvalNumber: dossier.coc?.approvalNumber ?? null,
      bodyType: dossier.bodywork?.bodyType ?? null,
      isSemiTrailer,
      heightFromGround: dossier.massesDimensions?.maxHeightFromGround ?? null,
      width: dossier.bodywork?.exteriorWidth ?? null,
      totalLength: masses.totalLength,
      rearOverhang: masses.rearOverhang,
      mom: masses.mom,
      mma: dossier.coc?.maxLadenMassRegistration ?? null,
      mmaCouplingPoint: dossier.coc?.staticCouplingPointMass ?? null,
      mmtaRequested: dossier.coc?.maxTechnicallyPermissibleMassRequested ?? null,
      actNumbers,
      rearProtectionBrand: dossier.bodywork?.rearProtectionBrand ?? null,
      rearProtectionModel: dossier.bodywork?.rearProtectionModel ?? null,
      responsibleName: user.name,
    });
    fileName = `Certificado_Carrozado_${dossier.number}.pdf`;
  } else {
    return { message: `${DOCUMENT_LABELS[type]} todavía no está disponible.` };
  }

  const buffer = await renderHtmlToPdfBuffer(html);
  const relativePath = await saveGeneratedPdf(user.companyId, dossierId, fileName, buffer);

  await prisma.generatedDocument.create({
    data: { dossierId, type, filePath: relativePath },
  });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: `${DOCUMENT_LABELS[type]} generado.` };
}
