"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { renderHtmlToPdfBuffer, saveGeneratedPdf } from "@/lib/pdf/render";
import { renderPreliminaryReport } from "@/lib/pdf/templates/preliminaryReport";
import { renderManufacturingOrder } from "@/lib/pdf/templates/manufacturingOrder";
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
    include: { coc: true, bodywork: true, massesDimensions: true, company: true },
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
    });
    fileName = `Orden_Fabricacion_${dossier.number}.pdf`;
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
