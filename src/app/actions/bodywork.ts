"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { auditedUpsert } from "@/lib/audit";
import { BODYWORK_FIELDS } from "@/lib/bodyworkFields";
import type { FormState } from "@/lib/definitions";

function parseByType(raw: FormDataEntryValue | null, type: string): unknown {
  if (typeof raw !== "string") return null;
  if (type === "bool") return raw === "on" || raw === "true";
  if (raw.trim() === "") return null;
  const trimmed = raw.trim();
  if (type === "int") {
    const n = Number(trimmed.replace(",", "."));
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  if (type === "float") {
    const n = Number(trimmed.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return trimmed;
}

/**
 * Un único formulario cubre las 65 columnas manuales de Bodywork — igual
 * que updateCoc, el objeto se arma en bucle a partir de BODYWORK_FIELDS.
 */
export async function updateBodywork(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string") return { message: "Expediente no válido." };

  const dossier = await prisma.dossier.findFirst({
    where: { id: dossierId, companyId: user.companyId },
  });
  if (!dossier) return { message: "Expediente no encontrado." };

  const data: Record<string, unknown> = {};
  for (const field of BODYWORK_FIELDS) {
    data[field.name] = parseByType(formData.get(field.name), field.type);
  }

  await auditedUpsert({
    delegate: prisma.bodywork,
    dossierId,
    tableName: "bodywork",
    actorEmail: user.email,
    data,
  });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Carrozado guardado." };
}
