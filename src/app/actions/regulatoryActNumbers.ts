"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { auditedUpsert } from "@/lib/audit";
import type { FormState } from "@/lib/definitions";

const FIELDS = [
  "lightingHReportId",
  "spraySuppressionHReportId",
  "massesHReportId",
  "rearPlateHReportId",
  "rearProtectionHReportId",
  "emcHReportId",
] as const;

export async function updateRegulatoryActNumbers(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string") return { message: "Expediente no válido." };

  const dossier = await prisma.dossier.findFirst({
    where: { id: dossierId, companyId: user.companyId },
  });
  if (!dossier) return { message: "Expediente no encontrado." };

  const data: Record<string, string | null> = {};
  for (const field of FIELDS) {
    const raw = formData.get(field);
    data[field] = typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null;
  }

  // Los IDs vienen de <select> poblados con el catálogo de la propia
  // empresa, pero se re-validan aquí igual: nunca confiar en que el
  // formulario no fue manipulado para apuntar a un Informe H de otro taller.
  const ids = Object.values(data).filter((v): v is string => v !== null);
  if (ids.length > 0) {
    const count = await prisma.hReport.count({ where: { id: { in: ids }, companyId: user.companyId } });
    if (count !== ids.length) return { message: "Informe H no válido." };
  }

  await auditedUpsert({
    delegate: prisma.regulatoryActNumbers,
    dossierId,
    tableName: "regulatoryActNumbers",
    actorEmail: user.email,
    data,
  });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Actos reglamentarios / Informes H guardado." };
}
