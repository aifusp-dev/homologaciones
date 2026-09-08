"use client";

import { useActionState } from "react";
import { updateMasses } from "@/app/actions/masses";
import { MASSES_FIELDS } from "@/lib/massesFields";

const inputClass =
  "w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-500";
const labelClass = "text-xs text-neutral-400";

type MassesValues = Record<string, string | number | null | undefined>;

const RESULT_LABELS: Record<string, string> = {
  rearOverhang: "Voladizo trasero",
  totalLength: "Largo total",
  initialTareNoAccessories: "Tara inicial sin accesorios",
  mom: "MOM",
  loadMassMma: "Masa carga MMA",
  loadMmaDistributionAxle1: "Reparto carga MMA eje 1",
  loadMmaDistributionAxle2: "Reparto carga MMA eje 2",
  loadMassMmta: "Masa carga MMTA",
  loadMmtaDistributionAxle1: "Reparto carga MMTA eje 1",
  loadMmtaDistributionAxle2: "Reparto carga MMTA eje 2",
  totalMassNoHook: "Total masa sin gancho",
  totalMmtaNoHook: "Total MMTA sin gancho",
};

export function MassesForm({
  dossierId,
  masses,
  computed,
}: {
  dossierId: string;
  masses: MassesValues | null;
  computed: Record<string, number | null>;
}) {
  const [state, action, pending] = useActionState(updateMasses, undefined);
  const resultEntries = Object.entries(RESULT_LABELS).filter(([key]) => computed[key] != null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="dossierId" value={dossierId} />

      {resultEntries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {resultEntries.map(([key, label]) => (
            <div key={key} className="bg-neutral-900/60 border border-neutral-800 rounded-lg px-3 py-2">
              <p className="text-[11px] text-neutral-500 uppercase tracking-wide">{label}</p>
              <p className="text-sm font-medium text-neutral-200">{computed[key]} kg/mm</p>
            </div>
          ))}
        </div>
      )}

      <details className="border border-neutral-800 rounded-lg overflow-hidden" open={resultEntries.length === 0}>
        <summary className="cursor-pointer select-none px-4 py-3 bg-neutral-900 text-sm font-medium flex items-center justify-between">
          Datos de entrada (centros de gravedad, masas, taras)
          <span className="text-neutral-500 text-xs">{MASSES_FIELDS.length} campos</span>
        </summary>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {MASSES_FIELDS.map((field) => (
            <div key={field.name} className="space-y-1">
              <label className={labelClass}>{field.label}</label>
              <input
                name={field.name}
                defaultValue={
                  masses?.[field.name] === null || masses?.[field.name] === undefined
                    ? ""
                    : String(masses[field.name])
                }
                inputMode={field.type === "float" ? "decimal" : undefined}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </details>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-white text-black font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar masas y dimensiones"}
        </button>
        {state?.message && <p className="text-sm text-neutral-400">{state.message}</p>}
      </div>
    </form>
  );
}
