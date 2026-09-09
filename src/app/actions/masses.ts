"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { auditedUpsert } from "@/lib/audit";
import { MASSES_FIELDS } from "@/lib/massesFields";
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

/**
 * Un único formulario cubre las 48 columnas manuales de MassesDimensions
 * (centros de gravedad, masas y taras de entrada) — el resto (234
 * fórmulas) se calcula, no se guarda.
 */
export async function updateMasses(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string") return { message: "Expediente no válido." };

  const dossier = await prisma.dossier.findFirst({
    where: { id: dossierId, companyId: user.companyId },
  });
  if (!dossier) return { message: "Expediente no encontrado." };

  const data: Record<string, unknown> = {};
  for (const field of MASSES_FIELDS) {
    data[field.name] = parseByType(formData.get(field.name), field.type);
  }

  await auditedUpsert({
    delegate: prisma.massesDimensions,
    dossierId,
    tableName: "massesDimensions",
    actorEmail: user.email,
    data,
  });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Masas y dimensiones guardado." };
}
