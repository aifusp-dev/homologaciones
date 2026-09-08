"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { COC_FIELDS } from "@/lib/cocFields";
import type { FormState } from "@/lib/definitions";

function parseByType(raw: FormDataEntryValue | null, type: string): unknown {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const trimmed = raw.trim();
  if (type === "int") {
    const n = Number(trimmed.replace(",", "."));
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  if (type === "float") {
    const n = Number(trimmed.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  if (type === "date") {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return trimmed;
}

/**
 * Un único formulario cubre las ~130 columnas de Coc — el objeto de datos
 * se arma en bucle a partir de COC_FIELDS en vez de a mano campo a campo,
 * para que no se desincronice del esquema.
 */
export async function updateCoc(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string") return { message: "Expediente no válido." };

  const dossier = await prisma.dossier.findFirst({
    where: { id: dossierId, companyId: user.companyId },
  });
  if (!dossier) return { message: "Expediente no encontrado." };

  const data: Record<string, unknown> = {};
  for (const field of COC_FIELDS) {
    data[field.name] = parseByType(formData.get(field.name), field.type);
  }

  await prisma.coc.upsert({
    where: { dossierId },
    update: data,
    create: { dossierId, ...data },
  });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "COC guardado." };
}
