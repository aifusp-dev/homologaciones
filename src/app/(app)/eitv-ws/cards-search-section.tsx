"use client";

import { useActionState } from "react";
import { searchEitvCards } from "@/app/actions/eitvWs";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs font-medium text-ink-dim uppercase tracking-wide";

export function CardsSearchSection({ hasConfig }: { hasConfig: boolean }) {
  const [state, action, pending] = useActionState(searchEitvCards, undefined);

  if (!hasConfig) {
    return (
      <p className="text-sm text-ink-dim bg-panel/60 border border-border rounded-lg px-3 py-2">
        Rellena primero la pestaña "Configuración" (identidad RFFR + credenciales) para poder
        consultar tarjetas.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4">
        <select name="entorno" defaultValue="pruebas" className={`${inputClass} max-w-xs`}>
          <option value="pruebas">Pruebas</option>
          <option value="produccion">Producción</option>
        </select>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className={labelClass}>Marca</label>
            <input name="marca" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Contraseña</label>
            <input name="contrasena" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Nº serie industria</label>
            <input name="numSerieIndustria" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Nº de bastidor (VIN)</label>
            <input name="numVIN" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Fecha inicio</label>
            <input name="fechaInicio" type="date" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Fecha fin</label>
            <input name="fechaFin" type="date" className={inputClass} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? "Consultando..." : "Consultar"}
          </button>
          {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
        </div>
      </form>

      {state?.cards && state.cards.length > 0 && (
        <div className="border border-border rounded-xl divide-y divide-border">
          {state.cards.map((c) => (
            <div key={c.serieIndustria} className="px-4 py-2 text-sm font-mono">
              {c.serieIndustria}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
