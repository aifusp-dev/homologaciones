"use client";

import { useActionState } from "react";
import { updateMasses } from "@/app/actions/masses";
import { MASSES_FIELDS } from "@/lib/massesFields";
import { MassesDiagram, type DiagramData } from "./masses-diagram";
import type { VehicleConfig } from "@/lib/vehicleConfig";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs text-ink-dim";

type MassesValues = Record<string, string | number | null | undefined>;

// Mismo criterio que CocForm: ocultar (no quitar) los campos "...Axle3"
// cuando el vehículo tiene menos de 3 ejes, según el nº de ejes ya guardado
// en el COC. Se pasa como prop porque Masas y dimensiones no tiene su
// propio campo de nº de ejes — es el mismo vehículo que en COC.
function axleIndexOf(fieldName: string): number | null {
  const m = fieldName.match(/Axle([1-3])$/);
  return m ? Number(m[1]) : null;
}

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
  // TRIAXLE
  total3AxleMmtaNoHook: "MMTA sin gancho (3 ejes)",
  total3AxleMmaWithHook: "MMA con gancho (3 ejes)",
  mom3Axle: "MOM (3 ejes)",
  // SEMI_O4
  totalMmtaKingpinO4: "Total MMTA kingpin (semirremolque)",
  totalMmaAxleGroupO4: "Total MMA grupo ejes (semirremolque)",
  // SEMI_O4_3AXLE
  totalMma3AxleSemi: "MMA total (semirremolque 3 ejes)",
  totalMmta3AxleSemi: "MMTA total (semirremolque 3 ejes)",
};

export function MassesForm({
  dossierId,
  masses,
  computed,
  axleCount,
  vehicleConfig,
  diagramData,
}: {
  dossierId: string;
  masses: MassesValues | null;
  computed: Record<string, number | null>;
  axleCount: number | null;
  vehicleConfig: VehicleConfig;
  diagramData: DiagramData;
}) {
  const [state, action, pending] = useActionState(updateMasses, undefined);
  const resultEntries = Object.entries(RESULT_LABELS).filter(([key]) => computed[key] != null);
  const hiddenCount = MASSES_FIELDS.filter((f) => {
    const axleIndex = axleIndexOf(f.name);
    return axleIndex !== null && axleCount !== null && axleIndex > axleCount;
  }).length;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="dossierId" value={dossierId} />

      <MassesDiagram variant={vehicleConfig} data={diagramData} />

      {resultEntries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {resultEntries.map(([key, label]) => (
            <div key={key} className="bg-panel/60 border border-border rounded-lg px-3 py-2">
              <p className="text-[11px] text-ink-faint uppercase tracking-wide">{label}</p>
              <p className="text-sm font-medium text-ink">{computed[key]} kg/mm</p>
            </div>
          ))}
        </div>
      )}

      <details className="border border-border rounded-xl overflow-hidden" open={resultEntries.length === 0}>
        <summary className="cursor-pointer select-none px-4 py-3 bg-panel text-sm font-medium flex items-center justify-between">
          Datos de entrada (centros de gravedad, masas, taras)
          <span className="text-ink-faint text-xs">
            {MASSES_FIELDS.length - hiddenCount} campos
            {hiddenCount > 0 && ` · ${hiddenCount} ocultos (eje no aplicable)`}
          </span>
        </summary>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {MASSES_FIELDS.map((field) => {
            const axleIndex = axleIndexOf(field.name);
            const hiddenByAxleCount = axleIndex !== null && axleCount !== null && axleIndex > axleCount;
            return (
              <div key={field.name} className={`space-y-1 ${hiddenByAxleCount ? "hidden" : ""}`}>
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
            );
          })}
        </div>
      </details>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar masas y dimensiones"}
        </button>
        {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
      </div>
    </form>
  );
}
