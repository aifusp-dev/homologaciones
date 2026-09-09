import "server-only";
import { prisma } from "@/lib/db";
import type { AuditAction, Prisma } from "@/generated/prisma/client";

// Delegates mínimos que necesitamos de cualquiera de las 26 tablas de
// dominio — igual de "any a propósito" que el mapa `delegates` de
// src/app/actions/devices.ts: los 26 modelos no comparten una firma de
// upsert unificable (cada uno exige su propio tipo de `create`/`update`),
// la seguridad real viene de que tableName solo puede ser una de las
// claves de DOSSIER_DOMAIN_TABLES, no de que TypeScript infiera las
// columnas de cada tabla.
type FindUniqueDelegate = {
  findUnique: (args: any) => Promise<Record<string, unknown> | null>;
};
type UpsertDelegate = FindUniqueDelegate & {
  upsert: (args: any) => Promise<Record<string, unknown>>;
};
type DeleteDelegate = FindUniqueDelegate & {
  delete: (args: any) => Promise<unknown>;
};

function toJsonValue(v: unknown): unknown {
  return v instanceof Date ? v.toISOString() : v;
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return a === b;
}

/**
 * Envuelve el upsert `{ where: { dossierId }, update, create }` que ya
 * usan todas las Server Actions de guardado (coc.ts, bodywork.ts,
 * masses.ts, devices.ts, dossiers.ts, regulatoryActNumbers.ts) para dejar
 * un AuditLog con el diff campo a campo — solo de los campos presentes en
 * `data`, comparados contra el valor que tenían antes de esta llamada.
 */
export async function auditedUpsert(opts: {
  delegate: UpsertDelegate;
  dossierId: string;
  tableName: string;
  actorEmail: string;
  data: Record<string, unknown>;
}): Promise<Record<string, unknown>> {
  const before = await opts.delegate.findUnique({ where: { dossierId: opts.dossierId } });
  const after = await opts.delegate.upsert({
    where: { dossierId: opts.dossierId },
    update: opts.data,
    create: { dossierId: opts.dossierId, ...opts.data },
  });

  const changes: Record<string, { old: unknown; new: unknown }> = {};
  for (const key of Object.keys(opts.data)) {
    const oldValue = before ? (before[key] ?? null) : null;
    const newValue = after[key] ?? null;
    if (!valuesEqual(oldValue, newValue)) {
      changes[key] = { old: toJsonValue(oldValue), new: toJsonValue(newValue) };
    }
  }

  if (Object.keys(changes).length > 0) {
    await prisma.auditLog.create({
      data: {
        dossierId: opts.dossierId,
        actorEmail: opts.actorEmail,
        tableName: opts.tableName,
        action: (before ? "UPDATE" : "CREATE") satisfies AuditAction,
        changes: changes as Prisma.InputJsonValue,
      },
    });
  }

  return after;
}

/**
 * Usado solo por restoreDossierVersion: cuando la versión a restaurar no
 * tenía fila en una tabla que sí tiene datos ahora mismo, hay que borrarla
 * para reflejar fielmente ese estado antiguo — se deja constancia en el
 * AuditLog de qué había antes de borrarlo.
 */
export async function auditedDelete(opts: {
  delegate: DeleteDelegate;
  dossierId: string;
  tableName: string;
  actorEmail: string;
}): Promise<void> {
  const before = await opts.delegate.findUnique({ where: { dossierId: opts.dossierId } });
  if (!before) return;

  await opts.delegate.delete({ where: { dossierId: opts.dossierId } });

  const changes: Record<string, { old: unknown; new: unknown }> = {};
  for (const [key, value] of Object.entries(before)) {
    if (key === "id" || key === "dossierId") continue;
    if (value === null) continue;
    changes[key] = { old: toJsonValue(value), new: null };
  }

  if (Object.keys(changes).length > 0) {
    await prisma.auditLog.create({
      data: {
        dossierId: opts.dossierId,
        actorEmail: opts.actorEmail,
        tableName: opts.tableName,
        action: "DELETE" satisfies AuditAction,
        changes: changes as Prisma.InputJsonValue,
      },
    });
  }
}
