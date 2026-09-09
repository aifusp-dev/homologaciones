"use server";

import { revalidatePath, refresh } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { auditedUpsert } from "@/lib/audit";
import type { FormState } from "@/lib/definitions";

/**
 * Numeración "HI"+correlativo propio de la empresa. El incremento es un
 * UPDATE...RETURNING atómico (Postgres bloquea la fila durante el update),
 * así que dos personas creando un expediente a la vez nunca chocan — a
 * diferencia del "HI" & texto+1 del FileMaker original (ver Mejoras #5 del
 * documento de diseño).
 */
export async function createDossier() {
  const user = await requireCompanyUser();

  const dossier = await prisma.$transaction(async (tx) => {
    const company = await tx.company.update({
      where: { id: user.companyId },
      data: { nextDossierNumber: { increment: 1 } },
      select: { nextDossierNumber: true },
    });
    return tx.dossier.create({
      data: { companyId: user.companyId, number: `HI${company.nextDossierNumber}` },
    });
  });

  redirect(`/dossiers/${dossier.id}`);
}

export async function archiveDossier(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string") return { message: "Expediente no válido." };

  const dossier = await prisma.dossier.findFirst({ where: { id: dossierId, companyId: user.companyId } });
  if (!dossier) return { message: "Expediente no encontrado." };

  await prisma.dossier.update({ where: { id: dossierId }, data: { archivedAt: new Date() } });

  revalidatePath("/dashboard");
  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Expediente archivado." };
}

export async function unarchiveDossier(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string") return { message: "Expediente no válido." };

  const dossier = await prisma.dossier.findFirst({ where: { id: dossierId, companyId: user.companyId } });
  if (!dossier) return { message: "Expediente no encontrado." };

  await prisma.dossier.update({ where: { id: dossierId }, data: { archivedAt: null } });

  revalidatePath("/dashboard");
  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Expediente reactivado." };
}

export async function updateCustomer(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string") return { message: "Expediente no válido." };

  const dossier = await prisma.dossier.findFirst({
    where: { id: dossierId, companyId: user.companyId },
  });
  if (!dossier) return { message: "Expediente no encontrado." };

  const data = {
    name: str(formData.get("name")),
    phone: str(formData.get("phone")),
    email: str(formData.get("email")),
    contactName: str(formData.get("contactName")),
    contactPhone: str(formData.get("contactPhone")),
    notes: str(formData.get("notes")),
  };

  await auditedUpsert({
    delegate: prisma.customer,
    dossierId,
    tableName: "customer",
    actorEmail: user.email,
    data,
  });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Cliente guardado." };
}

export async function updateDealer(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string") return { message: "Expediente no válido." };

  const dossier = await prisma.dossier.findFirst({
    where: { id: dossierId, companyId: user.companyId },
  });
  if (!dossier) return { message: "Expediente no encontrado." };

  const data = {
    name: str(formData.get("name")),
    phone: str(formData.get("phone")),
    email: str(formData.get("email")),
    contactName: str(formData.get("contactName")),
    contactPhone: str(formData.get("contactPhone")),
    contactEmail: str(formData.get("contactEmail")),
    notes: str(formData.get("notes")),
  };

  await auditedUpsert({
    delegate: prisma.dealer,
    dossierId,
    tableName: "dealer",
    actorEmail: user.email,
    data,
  });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Concesionario guardado." };
}

function str(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

