import { prisma } from "@/lib/db";
import { getTableLabel, getFieldLabel } from "@/lib/auditLabels";
import { CreateVersionForm, RestoreVersionButton } from "./version-controls";

type ChangeEntry = { old: unknown; new: unknown };

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "(vacío)";
  if (typeof v === "boolean") return v ? "Sí" : "No";
  return String(v);
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: "creado",
  UPDATE: "modificado",
  DELETE: "eliminado",
};

function ChangeList({ tableName, changes }: { tableName: string; changes: Record<string, ChangeEntry> }) {
  const entries = Object.entries(changes);
  const VISIBLE = 5;
  const visible = entries.slice(0, VISIBLE);
  const rest = entries.slice(VISIBLE);

  const row = ([field, { old, new: next }]: [string, ChangeEntry]) => (
    <li key={field} className="text-xs">
      <span className="text-ink-dim">{getFieldLabel(tableName, field)}:</span>{" "}
      <span className="text-ink-faint line-through">{formatValue(old)}</span>{" "}
      <span className="text-ink-faint">→</span> <span className="text-ink">{formatValue(next)}</span>
    </li>
  );

  return (
    <ul className="space-y-0.5">
      {visible.map(row)}
      {rest.length > 0 && (
        <details>
          <summary className="text-xs text-ink-faint cursor-pointer select-none">+{rest.length} más</summary>
          <ul className="space-y-0.5 mt-0.5">{rest.map(row)}</ul>
        </details>
      )}
    </ul>
  );
}

export async function HistorySection({ dossierId }: { dossierId: string }) {
  const [versions, logs] = await Promise.all([
    prisma.dossierVersion.findMany({ where: { dossierId }, orderBy: { createdAt: "desc" } }),
    prisma.auditLog.findMany({ where: { dossierId }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-display text-sm uppercase tracking-wide text-ink-faint">Versiones guardadas</h2>
        <p className="text-xs text-ink-faint">
          Congela el estado actual de COC, Carrozado, Masas, dispositivos, Cliente y Concesionario para poder
          volver a él más adelante.
        </p>
        <CreateVersionForm dossierId={dossierId} />

        {versions.length === 0 ? (
          <p className="text-sm text-ink-faint">Todavía no hay versiones guardadas.</p>
        ) : (
          <ul className="space-y-2">
            {versions.map((v) => (
              <li
                key={v.id}
                className="border border-border rounded-xl p-3 flex items-center justify-between gap-3 bg-panel/40"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{v.label ?? "Versión sin nombre"}</p>
                  <p className="text-xs text-ink-faint">
                    {v.createdAt.toLocaleString("es-ES")} · {v.createdBy}
                  </p>
                </div>
                <RestoreVersionButton dossierId={dossierId} versionId={v.id} label={v.label ?? "esta versión"} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-sm uppercase tracking-wide text-ink-faint">Registro de cambios</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-ink-faint">Todavía no hay cambios registrados.</p>
        ) : (
          <ul className="space-y-2">
            {logs.map((log) => (
              <li key={log.id} className="border border-border rounded-xl p-3 bg-panel/40">
                <p className="text-xs text-ink-faint">
                  {log.createdAt.toLocaleString("es-ES")} · <span className="text-ink-dim">{log.actorEmail}</span> ·{" "}
                  {getTableLabel(log.tableName)} {ACTION_LABELS[log.action] ?? log.action.toLowerCase()}
                </p>
                <div className="mt-1.5">
                  <ChangeList tableName={log.tableName} changes={log.changes as Record<string, ChangeEntry>} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
