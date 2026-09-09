"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { auditedUpsert, auditedDelete } from "@/lib/audit";
import { DOSSIER_DOMAIN_TABLES, domainInclude, type DossierDomainTable } from "@/lib/dossierDomainTables";
import type { FormState } from "@/lib/definitions";
import type { Prisma } from "@/generated/prisma/client";

type DomainSnapshot = Record<DossierDomainTable, Record<string, unknown> | null>;

async function buildSnapshot(dossierId: string, companyId: string): Promise<DomainSnapshot | null> {
  const dossier = await prisma.dossier.findFirst({
    where: { id: dossierId, companyId },
    include: domainInclude(),
  });
  if (!dossier) return null;

  const snapshot = {} as DomainSnapshot;
  for (const table of DOSSIER_DOMAIN_TABLES) {
    snapshot[table] = (dossier as unknown as Record<string, Record<string, unknown> | null>)[table];
  }
  return snapshot;
}

export async function createDossierVersion(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string") return { message: "Expediente no válido." };

  const rawLabel = formData.get("label");
  const label = typeof rawLabel === "string" && rawLabel.trim() !== "" ? rawLabel.trim() : null;

  const snapshot = await buildSnapshot(dossierId, user.companyId);
  if (!snapshot) return { message: "Expediente no encontrado." };

  await prisma.dossierVersion.create({
    data: { dossierId, label, snapshot: snapshot as Prisma.InputJsonValue, createdBy: user.email },
  });
  await prisma.auditLog.create({
    data: {
      dossierId,
      actorEmail: user.email,
      tableName: "dossier_version",
      action: "CREATE",
      changes: { label: { old: null, new: label ?? "(sin nombre)" } },
    },
  });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Versión creada." };
}

/**
 * Restaura las ~26 tablas de dominio de un expediente al estado de una
 * versión guardada. Antes de sobrescribir nada, crea automáticamente una
 * versión de respaldo del estado actual — así "volver a la versión 1"
 * nunca es un callejón sin salida. Cada tabla se restaura vía
 * auditedUpsert/auditedDelete, así que el registro de cambios recoge
 * también el detalle campo a campo de lo que trajo la restauración.
 */
export async function restoreDossierVersion(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  const versionId = formData.get("versionId");
  if (typeof dossierId !== "string" || typeof versionId !== "string") {
    return { message: "Datos no válidos." };
  }

  const version = await prisma.dossierVersion.findFirst({
    where: { id: versionId, dossierId, dossier: { companyId: user.companyId } },
  });
  if (!version) return { message: "Versión no encontrada." };

  const currentSnapshot = await buildSnapshot(dossierId, user.companyId);
  if (!currentSnapshot) return { message: "Expediente no encontrado." };

  const backupLabel = `Automático — antes de restaurar${version.label ? ` a "${version.label}"` : ""}`;
  await prisma.dossierVersion.create({
    data: { dossierId, label: backupLabel, snapshot: currentSnapshot as Prisma.InputJsonValue, createdBy: user.email },
  });

  const snapshot = version.snapshot as DomainSnapshot;
  for (const table of DOSSIER_DOMAIN_TABLES) {
    const delegate = (prisma as unknown as Record<string, any>)[table];
    const data = snapshot[table];
    if (data == null) {
      await auditedDelete({ delegate, dossierId, tableName: table, actorEmail: user.email });
      continue;
    }
    const { id: _id, dossierId: _dossierId, ...fields } = data;
    await auditedUpsert({ delegate, dossierId, tableName: table, actorEmail: user.email, data: fields });
  }

  await prisma.auditLog.create({
    data: {
      dossierId,
      actorEmail: user.email,
      tableName: "dossier_version",
      action: "UPDATE",
      changes: { restoredVersion: { old: null, new: version.label ?? version.id } },
    },
  });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Versión restaurada." };
}
