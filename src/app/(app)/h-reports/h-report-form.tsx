"use client";

import { useActionState } from "react";
import { createHReport } from "@/app/actions/hReports";

const CATEGORY_LABEL: Record<string, string> = {
  LIGHTING: "Alumbrado y señalización 48R08",
  SPRAY_SUPPRESSION: "Dispositivos antiproyección UE 109/2011",
  MASSES: "Masas y dimensiones UE 1230/2012",
  REAR_PLATE: "Placas de matrícula traseras UE 1003/2010",
  REAR_PROTECTION: "Protección trasera 58R03",
  EMC: "Compatibilidad electromagnética 10R06",
};

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs text-ink-dim";

export function HReportForm() {
  const [state, action, pending] = useActionState(createHReport, undefined);

  return (
    <form action={action} className="border border-border rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Área</label>
          <select name="category" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Elige un área
            </option>
            {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Número</label>
          <input name="number" required className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Laboratorio/emisor</label>
          <input name="issuer" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>PDF del informe</label>
          <input name="file" type="file" accept="application/pdf" className={`${inputClass} py-1.5`} />
        </div>
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Notas</label>
        <input name="notes" className={inputClass} />
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Añadiendo..." : "Añadir informe H"}
        </button>
        {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
      </div>
    </form>
  );
}
