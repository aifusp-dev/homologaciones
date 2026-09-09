"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { archiveDossier, unarchiveDossier } from "@/app/actions/dossiers";

const CATEGORY_LABEL: Record<string, string> = {
  LIGHTING: "Alumbrado",
  SPRAY_SUPPRESSION: "Antiproyección",
  MASSES: "Masas",
  REAR_PLATE: "Placas traseras",
  REAR_PROTECTION: "Protección trasera",
  EMC: "Compatibilidad EM",
};

export type DossierListItem = {
  id: string;
  number: string;
  customerName: string | null;
  archivedAt: string | null;
  hReportIds: string[];
};

export type HReportOption = { id: string; number: string; category: string };

function ArchiveButton({ dossierId, archived }: { dossierId: string; archived: boolean }) {
  const action = archived ? unarchiveDossier : archiveDossier;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} onClick={(e) => e.stopPropagation()}>
      <input type="hidden" name="dossierId" value={dossierId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-ink-faint hover:text-ink underline disabled:opacity-50"
      >
        {pending ? "..." : archived ? "Reactivar" : "Archivar"}
      </button>
      {state?.message && <span className="sr-only">{state.message}</span>}
    </form>
  );
}

export function DossierList({
  dossiers,
  hReportOptions,
}: {
  dossiers: DossierListItem[];
  hReportOptions: HReportOption[];
}) {
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [hReportFilter, setHReportFilter] = useState<string>("");

  const active = dossiers.filter((d) => !d.archivedAt);
  const archived = dossiers.filter((d) => d.archivedAt);

  const visible = useMemo(() => {
    const base = tab === "active" ? active : archived;
    if (!hReportFilter) return base;
    return base.filter((d) => d.hReportIds.includes(hReportFilter));
  }, [tab, active, archived, hReportFilter]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 border-b border-border">
          {(["active", "archived"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm border-b-2 -mb-px transition-colors ${
                tab === t ? "border-accent text-ink font-medium" : "border-transparent text-ink-faint hover:text-ink-dim"
              }`}
            >
              {t === "active" ? `Activos (${active.length})` : `Archivados (${archived.length})`}
            </button>
          ))}
        </div>

        {hReportOptions.length > 0 && (
          <select
            value={hReportFilter}
            onChange={(e) => setHReportFilter(e.target.value)}
            className="bg-panel border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-accent"
          >
            <option value="">Filtrar por Informe H…</option>
            {hReportOptions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.number} · {CATEGORY_LABEL[r.category] ?? r.category}
              </option>
            ))}
          </select>
        )}
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {visible.map((d) => (
          <li key={d.id}>
            <div className="flex justify-between items-center gap-2 border border-border rounded-xl px-4 py-3 text-sm hover:border-accent transition-colors">
              <Link href={`/dossiers/${d.id}`} className="flex-1 flex justify-between items-baseline min-w-0">
                <span className="font-mono font-medium">{d.number}</span>
                <span className="text-ink-faint truncate ml-2">{d.customerName ?? "Sin cliente"}</span>
              </Link>
              <ArchiveButton dossierId={d.id} archived={Boolean(d.archivedAt)} />
            </div>
          </li>
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-ink-faint">
            {tab === "active" ? "Todavía no hay ningún expediente activo." : "No hay expedientes archivados."}
          </p>
        )}
      </ul>
    </div>
  );
}
