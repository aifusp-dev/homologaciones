"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateRegulatoryActNumbers } from "@/app/actions/regulatoryActNumbers";

type CatalogEntry = { id: string; number: string; issuer: string | null };

const FIELD_CONFIG = [
  { name: "lightingHReportId", category: "LIGHTING", label: "Alumbrado y señalización 48R08" },
  { name: "spraySuppressionHReportId", category: "SPRAY_SUPPRESSION", label: "Dispositivos antiproyección UE 109/2011" },
  { name: "massesHReportId", category: "MASSES", label: "Masas y dimensiones UE 1230/2012" },
  { name: "rearPlateHReportId", category: "REAR_PLATE", label: "Placas de matrícula traseras UE 1003/2010" },
  { name: "rearProtectionHReportId", category: "REAR_PROTECTION", label: "Protección trasera 58R03" },
  { name: "emcHReportId", category: "EMC", label: "Compatibilidad electromagnética 10R06" },
] as const;

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs text-ink-dim";

export function RegulatoryActNumbersForm({
  dossierId,
  current,
  catalog,
}: {
  dossierId: string;
  current: Record<string, string | null> | null;
  catalog: Record<string, CatalogEntry[]>;
}) {
  const [state, action, pending] = useActionState(updateRegulatoryActNumbers, undefined);

  return (
    <details className="border border-border rounded-xl overflow-hidden">
      <summary className="cursor-pointer select-none px-4 py-3 bg-panel text-sm font-medium flex items-center justify-between">
        Actos reglamentarios / Informes H
        <span className="text-ink-faint text-xs">{FIELD_CONFIG.length} áreas</span>
      </summary>
      <form action={action} className="p-4 space-y-3">
        <input type="hidden" name="dossierId" value={dossierId} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELD_CONFIG.map((field) => {
            const options = catalog[field.category] ?? [];
            return (
              <div key={field.name} className="space-y-1">
                <label className={labelClass}>{field.label}</label>
                <select name={field.name} defaultValue={current?.[field.name] ?? ""} className={inputClass}>
                  <option value="">Sin asignar</option>
                  {options.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.number}
                      {r.issuer ? ` — ${r.issuer}` : ""}
                    </option>
                  ))}
                </select>
                {options.length === 0 && (
                  <Link href="/h-reports" className="text-xs text-accent hover:underline">
                    + Añadir informe H
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Guardar"}
          </button>
          {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
        </div>
      </form>
    </details>
  );
}
