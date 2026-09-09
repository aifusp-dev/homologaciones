"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { auditedUpsert } from "@/lib/audit";
import { DEVICE_TABLES, type DeviceTableKey } from "@/lib/deviceFields";
import type { FormState } from "@/lib/definitions";

function parseByType(raw: FormDataEntryValue | null, type: string): unknown {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const trimmed = raw.trim();
  if (type === "float") {
    const n = Number(trimmed.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return trimmed;
}

// Prisma expone cada uno de los 16 modelos como una propiedad con el mismo
// nombre que su DeviceTableKey (couplingDevice, lightingSide, ...) — el
// acceso dinámico vía este mapa evita repetir 16 server actions casi
// idénticas para tablas que son todas 1:1 con Dossier y sin cálculos.
// Los 16 delegates de Prisma no comparten una firma de upsert unificable
// (cada uno tiene su propio tipo de columnas), así que aquí se accede sin
// el tipado estricto de Prisma a propósito — la seguridad viene de que
// `tableKey` solo puede ser una de las 16 claves reales (comprobado más
// abajo contra DEVICE_TABLES), no de que TypeScript infiera las columnas.
const delegates: Record<
  DeviceTableKey,
  { findUnique: (args: any) => Promise<any>; upsert: (args: any) => Promise<any> }
> = {
  couplingDevice: prisma.couplingDevice,
  spraySuppression: prisma.spraySuppression,
  electromagneticCompatibility: prisma.electromagneticCompatibility,
  lateralProtection: prisma.lateralProtection,
  rearProtection: prisma.rearProtection,
  lateralMarking: prisma.lateralMarking,
  lightingSide: prisma.lightingSide,
  lightingPosition: prisma.lightingPosition,
  lightingReflector: prisma.lightingReflector,
  lightingBrake: prisma.lightingBrake,
  lightingTurnSignal: prisma.lightingTurnSignal,
  lightingRearOutlineMarker: prisma.lightingRearOutlineMarker,
  lightingFrontOutlineMarker: prisma.lightingFrontOutlineMarker,
  lightingPlate: prisma.lightingPlate,
  lightingReverse: prisma.lightingReverse,
  lightingFog: prisma.lightingFog,
  lightingMaterialChecklist: prisma.lightingMaterialChecklist,
  copCoverSheet: prisma.copCoverSheet,
  registrationPlates: prisma.registrationPlates,
  platesInscriptions: prisma.platesInscriptions,
};

export async function updateDevice(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  const tableKey = formData.get("tableKey") as DeviceTableKey | null;
  if (typeof dossierId !== "string" || !tableKey || !(tableKey in DEVICE_TABLES)) {
    return { message: "Datos no válidos." };
  }

  const dossier = await prisma.dossier.findFirst({
    where: { id: dossierId, companyId: user.companyId },
  });
  if (!dossier) return { message: "Expediente no encontrado." };

  const config = DEVICE_TABLES[tableKey];
  const data: Record<string, unknown> = {};
  for (const field of config.fields) {
    data[field.name] = parseByType(formData.get(field.name), field.type);
  }

  await auditedUpsert({
    delegate: delegates[tableKey],
    dossierId,
    tableName: tableKey,
    actorEmail: user.email,
    data,
  });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: `${config.label} guardado.` };
}
