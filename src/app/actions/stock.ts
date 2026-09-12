"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";

function textOrNull(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function parsePositiveInt(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function parseDate(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createArticle(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const hReportId = formData.get("hReportId");
  const name = textOrNull(formData.get("name"));
  if (typeof hReportId !== "string" || !name) return { message: "Datos no válidos." };

  const hReport = await prisma.hReport.findFirst({ where: { id: hReportId, companyId: user.companyId } });
  if (!hReport) return { message: "Informe H no encontrado." };

  await prisma.hReportArticle.create({
    data: {
      hReportId,
      name,
      reference: textOrNull(formData.get("reference")),
      unit: textOrNull(formData.get("unit")) ?? "ud",
      isFavorite: formData.get("isFavorite") === "on",
      notes: textOrNull(formData.get("notes")),
    },
  });

  revalidatePath("/almacen");
  refresh();
  return { message: "Artículo añadido." };
}

export async function toggleArticleFavorite(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const id = formData.get("id");
  if (typeof id !== "string") return { message: "Artículo no válido." };

  const article = await prisma.hReportArticle.findFirst({ where: { id, hReport: { companyId: user.companyId } } });
  if (!article) return { message: "Artículo no encontrado." };

  await prisma.hReportArticle.update({ where: { id }, data: { isFavorite: !article.isFavorite } });

  revalidatePath("/almacen");
  refresh();
  return { message: article.isFavorite ? "Quitado de favoritos." : "Marcado como favorito." };
}

export async function deleteArticle(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const id = formData.get("id");
  if (typeof id !== "string") return { message: "Artículo no válido." };

  const article = await prisma.hReportArticle.findFirst({ where: { id, hReport: { companyId: user.companyId } } });
  if (!article) return { message: "Artículo no encontrado." };

  try {
    await prisma.hReportArticle.delete({ where: { id } });
  } catch {
    return { message: "No se puede eliminar: tiene compras o instalaciones registradas." };
  }

  revalidatePath("/almacen");
  refresh();
  return { message: "Artículo eliminado." };
}

export async function createPurchase(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const articleId = formData.get("articleId");
  const quantity = parsePositiveInt(formData.get("quantity"));
  const deliveryNoteNumber = textOrNull(formData.get("deliveryNoteNumber"));
  const purchaseDate = parseDate(formData.get("purchaseDate"));
  if (typeof articleId !== "string" || !quantity || !deliveryNoteNumber || !purchaseDate) {
    return { message: "Datos no válidos." };
  }

  const article = await prisma.hReportArticle.findFirst({ where: { id: articleId, hReport: { companyId: user.companyId } } });
  if (!article) return { message: "Artículo no encontrado." };

  await prisma.stockPurchase.create({
    data: {
      articleId,
      quantity,
      deliveryNoteNumber,
      purchaseDate,
      supplier: textOrNull(formData.get("supplier")),
      notes: textOrNull(formData.get("notes")),
    },
  });

  revalidatePath("/almacen");
  refresh();
  return { message: "Compra registrada." };
}

export async function deletePurchase(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const id = formData.get("id");
  if (typeof id !== "string") return { message: "Compra no válida." };

  const purchase = await prisma.stockPurchase.findFirst({
    where: { id, article: { hReport: { companyId: user.companyId } } },
  });
  if (!purchase) return { message: "Compra no encontrada." };

  await prisma.stockPurchase.delete({ where: { id } });

  revalidatePath("/almacen");
  refresh();
  return { message: "Compra eliminada." };
}

export async function createInstallation(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const articleId = formData.get("articleId");
  const dossierId = formData.get("dossierId");
  const quantity = parsePositiveInt(formData.get("quantity")) ?? 1;
  const installDate = parseDate(formData.get("installDate"));
  if (typeof articleId !== "string" || typeof dossierId !== "string" || !installDate) {
    return { message: "Datos no válidos." };
  }

  // El <select> del cliente se pobló con el catálogo de la propia empresa,
  // pero se re-valida igual aquí — mismo criterio que
  // updateRegulatoryActNumbers: nunca confiar en el valor recibido.
  const [article, dossier] = await Promise.all([
    prisma.hReportArticle.findFirst({ where: { id: articleId, hReport: { companyId: user.companyId } } }),
    prisma.dossier.findFirst({ where: { id: dossierId, companyId: user.companyId } }),
  ]);
  if (!article) return { message: "Artículo no encontrado." };
  if (!dossier) return { message: "Expediente no encontrado." };

  await prisma.articleInstallation.create({
    data: {
      articleId,
      dossierId,
      quantity,
      installDate,
      notes: textOrNull(formData.get("notes")),
    },
  });

  revalidatePath(`/dossiers/${dossierId}`);
  revalidatePath("/almacen");
  refresh();
  return { message: "Instalación registrada." };
}

export async function deleteInstallation(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const id = formData.get("id");
  const dossierId = formData.get("dossierId");
  if (typeof id !== "string" || typeof dossierId !== "string") return { message: "Instalación no válida." };

  const installation = await prisma.articleInstallation.findFirst({
    where: { id, dossier: { companyId: user.companyId } },
  });
  if (!installation) return { message: "Instalación no encontrada." };

  await prisma.articleInstallation.delete({ where: { id } });

  revalidatePath(`/dossiers/${dossierId}`);
  revalidatePath("/almacen");
  refresh();
  return { message: "Instalación eliminada." };
}
