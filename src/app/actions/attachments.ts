"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { saveUploadedFile } from "@/lib/storage";
import type { FormState } from "@/lib/definitions";

export async function createFolder(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  const name = formData.get("name");
  if (typeof dossierId !== "string" || typeof name !== "string" || name.trim() === "") {
    return { message: "Datos no válidos." };
  }

  const dossier = await prisma.dossier.findFirst({ where: { id: dossierId, companyId: user.companyId } });
  if (!dossier) return { message: "Expediente no encontrado." };

  await prisma.attachmentFolder.create({ data: { dossierId, name: name.trim() } });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Carpeta creada." };
}

export async function deleteFolder(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const folderId = formData.get("folderId");
  const dossierId = formData.get("dossierId");
  if (typeof folderId !== "string" || typeof dossierId !== "string") return { message: "Carpeta no válida." };

  const folder = await prisma.attachmentFolder.findFirst({
    where: { id: folderId, dossier: { companyId: user.companyId } },
  });
  if (!folder) return { message: "Carpeta no encontrada." };

  await prisma.attachmentFolder.delete({ where: { id: folderId } });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Carpeta eliminada." };
}

export async function uploadAttachment(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const folderId = formData.get("folderId");
  const dossierId = formData.get("dossierId");
  const file = formData.get("file");
  if (typeof folderId !== "string" || typeof dossierId !== "string") return { message: "Carpeta no válida." };
  if (!(file instanceof File) || file.size === 0) return { message: "Selecciona un archivo." };

  const folder = await prisma.attachmentFolder.findFirst({
    where: { id: folderId, dossier: { companyId: user.companyId } },
  });
  if (!folder) return { message: "Carpeta no encontrada." };

  const attachment = await prisma.attachment.create({
    data: { folderId, fileName: file.name, filePath: "", fileSize: file.size, mimeType: file.type || "application/octet-stream" },
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = await saveUploadedFile(
    user.companyId,
    `attachments/${dossierId}/${folderId}`,
    `${attachment.id}-${file.name}`,
    buffer
  );
  await prisma.attachment.update({ where: { id: attachment.id }, data: { filePath } });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Archivo subido." };
}

export async function deleteAttachment(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const attachmentId = formData.get("attachmentId");
  const dossierId = formData.get("dossierId");
  if (typeof attachmentId !== "string" || typeof dossierId !== "string") return { message: "Archivo no válido." };

  const attachment = await prisma.attachment.findFirst({
    where: { id: attachmentId, folder: { dossier: { companyId: user.companyId } } },
  });
  if (!attachment) return { message: "Archivo no encontrado." };

  await prisma.attachment.delete({ where: { id: attachmentId } });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Archivo eliminado." };
}
