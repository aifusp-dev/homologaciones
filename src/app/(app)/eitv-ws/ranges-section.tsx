"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { requestEitvRange, refreshEitvRangeStatus } from "@/app/actions/eitvWs";
import type { EitvWsRangeAuthorization, EitvWsRangeRequest } from "@/generated/prisma/client";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs font-medium text-ink-dim uppercase tracking-wide";

const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
};
const STATUS_CLASS: Record<string, string> = {
  pendiente: "text-ink-faint",
  aceptado: "text-green-600",
  rechazado: "text-red-600",
};

type RangeRequestWithAuthorizations = EitvWsRangeRequest & { authorizations: EitvWsRangeAuthorization[] };

function NewRangeRequestForm() {
  const [state, action, pending] = useActionState(requestEitvRange, undefined);
  const [pares, setPares] = useState([{ id: 0 }]);
  const nextId = pares.length ? Math.max(...pares.map((p) => p.id)) + 1 : 0;

  return (
    <form action={action} className="space-y-4 border border-border rounded-xl p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select name="entorno" defaultValue="pruebas" className={inputClass}>
          <option value="pruebas">Pruebas</option>
          <option value="produccion">Producción</option>
        </select>
        <div className="space-y-1.5">
          <label className={labelClass}>Tipo de tarjeta</label>
          <input name="tipoTarjeta" required className={inputClass} placeholder="p.ej. B" />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº tarjetas solicitadas</label>
          <input name="nroSolicitadas" type="number" min={1} required className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Solicitante — tipo doc.</label>
          <input name="solicitanteTipoDoc" required className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Solicitante — nº doc.</label>
          <input name="solicitanteDoc" required className={inputClass} />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Pares tipo de vehículo + contraseña</label>
        {pares.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2">
            <input name="tipoVeh" required className={inputClass} placeholder="Tipo de vehículo" />
            <input name="contrasena" required className={inputClass} placeholder="Contraseña" />
            {pares.length > 1 && (
              <button
                type="button"
                onClick={() => setPares((ps) => ps.filter((_, idx) => idx !== i))}
                className="text-ink-faint hover:text-red-600 transition-colors shrink-0"
              >
                <Trash2 size={16} strokeWidth={1.9} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPares((ps) => [...ps, { id: nextId }])}
          className="flex items-center gap-1.5 text-xs text-ink-dim hover:text-accent transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          Añadir par
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Enviando..." : "Solicitar rango"}
        </button>
        {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
      </div>
    </form>
  );
}

function RefreshStatusButton({ rangeRequestId }: { rangeRequestId: string }) {
  const [state, action, pending] = useActionState(refreshEitvRangeStatus, undefined);
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="rangeRequestId" value={rangeRequestId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs border border-border-strong rounded-lg px-3 py-1.5 hover:border-accent transition-colors disabled:opacity-50"
      >
        {pending ? "Actualizando..." : "Actualizar estado"}
      </button>
      {state?.message && <span className="text-xs text-ink-faint">{state.message}</span>}
    </form>
  );
}

function RangeRequestRow({ rangeRequest }: { rangeRequest: RangeRequestWithAuthorizations }) {
  return (
    <div className="border border-border rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm">
          <span className="font-mono">{rangeRequest.ministryIdSolicitud ?? "sin idsolicitud"}</span>
          <span className="text-ink-faint">
            {" "}
            · {rangeRequest.tipoTarjeta} · {rangeRequest.nroSolicitadas} tarjetas · {rangeRequest.entorno}
          </span>
        </div>
        {rangeRequest.ministryIdSolicitud && <RefreshStatusButton rangeRequestId={rangeRequest.id} />}
      </div>
      <div className="space-y-1">
        {rangeRequest.authorizations.map((a) => (
          <div key={a.id} className="flex items-center gap-2 text-xs">
            <span className={`font-medium ${STATUS_CLASS[a.status] ?? ""}`}>{STATUS_LABEL[a.status] ?? a.status}</span>
            <span className="text-ink-dim">{a.tipoVehiculo}</span>
            <span className="text-ink-faint">/ {a.contrasena}</span>
            {a.motivoRechazo && <span className="text-red-600">— {a.motivoRechazo}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RangesSection({
  rangeRequests,
  hasConfig,
}: {
  rangeRequests: RangeRequestWithAuthorizations[];
  hasConfig: boolean;
}) {
  if (!hasConfig) {
    return (
      <p className="text-sm text-ink-dim bg-panel/60 border border-border rounded-lg px-3 py-2">
        Rellena primero la pestaña "Configuración" (identidad RFFR + credenciales) para poder
        solicitar rangos.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <NewRangeRequestForm />
      <div className="space-y-3">
        {rangeRequests.length === 0 && (
          <p className="text-xs text-ink-faint">Ninguna solicitud de rango todavía.</p>
        )}
        {rangeRequests.map((r) => (
          <RangeRequestRow key={r.id} rangeRequest={r} />
        ))}
      </div>
    </div>
  );
}
