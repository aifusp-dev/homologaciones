"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { saveUploadedFile } from "@/lib/storage";
import type { FormState } from "@/lib/definitions";
import type { HReportCategory } from "@/generated/prisma/enums";

const CATEGORIES: HReportCategory[] = [
  "LIGHTING",
  "SPRAY_SUPPRESSION",
  "MASSES",
  "REAR_PLATE",
  "REAR_PROTECTION",
  "EMC",
];

export async function createHReport(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();

  const category = formData.get("category") as HReportCategory | null;
  const number = formData.get("number");
  const issuer = formData.get("issuer");
  const notes = formData.get("notes");
  const file = formData.get("file");

  if (!category || !CATEGORIES.includes(category) || typeof number !== "string" || number.trim() === "") {
    return { message: "Datos no válidos." };
  }

  const hReport = await prisma.hReport.create({
    data: {
      companyId: user.companyId,
      category,
      number: number.trim(),
      issuer: typeof issuer === "string" && issuer.trim() !== "" ? issuer.trim() : null,
      notes: typeof notes === "string" && notes.trim() !== "" ? notes.trim() : null,
    },
  });

  if (file instanceof File && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = await saveUploadedFile(user.companyId, "h-reports", `${hReport.id}-${file.name}`, buffer);
    await prisma.hReport.update({ where: { id: hReport.id }, data: { filePath } });
  }

  revalidatePath("/h-reports");
  refresh();
  return { message: "Informe H añadido." };
}

export async function deleteHReport(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const id = formData.get("id");
  if (typeof id !== "string") return { message: "Informe H no válido." };

  const report = await prisma.hReport.findFirst({ where: { id, companyId: user.companyId } });
  if (!report) return { message: "Informe H no encontrado." };

  try {
    await prisma.hReport.delete({ where: { id } });
  } catch {
    return { message: "No se puede eliminar: está asignado a uno o más expedientes." };
  }

  revalidatePath("/h-reports");
  refresh();
  return { message: "Informe H eliminado." };
}
