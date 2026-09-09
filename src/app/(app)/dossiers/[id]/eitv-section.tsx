"use client";

import { useActionState } from "react";
import { updateEitvNationalData, generateEitvXml, type EitvMissingField } from "@/app/actions/eitv";
import { EITV_FIELDS, EITV_REMITENTE_FIELDS } from "@/lib/eitvFields";
import { jumpToField } from "@/lib/fieldJump";
import type { EitvNationalData } from "@/generated/prisma/client";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs font-medium text-ink-dim uppercase tracking-wide";

export type EitvComputed = {
  bastidor: string | null;
  clasificacion: string | null;
  potencfiscal: number | null;
  mma: number | null;
  mmaeje1: number | null;
  mmaeje2: number | null;
  mmaeje3: number | null;
  numhomovehicomp: string | null;
  carrocero: string | null;
  homologacionE9: boolean | null;
};

function downloadText(fileName: string, content: string) {
  const blob = new Blob([content], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function ComputedRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-panel/60 border border-border rounded-lg px-3 py-2">
      <p className="text-[11px] text-ink-faint uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-ink font-mono">{value}</p>
    </div>
  );
}

function MissingList({ items }: { items: EitvMissingField[] }) {
  return (
    <div className="border border-border rounded-xl p-3 bg-panel/40 space-y-1.5">
      <p className="text-sm font-medium text-ink">Faltan datos para generar el XML:</p>
      <ul className="space-y-1">
        {items.map((m) => (
          <li key={m.label} className="text-xs">
            {m.field && m.tab ? (
              <button
                type="button"
                onClick={() => jumpToField(m.field!, m.tab)}
                className="font-medium text-ink-dim underline decoration-dotted underline-offset-2 hover:text-accent"
              >
                {m.label}
              </button>
            ) : (
              <span className="text-ink-dim">{m.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EitvSection({
  dossierId,
  eitv,
  computed,
}: {
  dossierId: string;
  eitv: EitvNationalData | null;
  computed: EitvComputed;
}) {
  const [state, action, pending] = useActionState(updateEitvNationalData, undefined);
  const [genState, genAction, genPending] = useActionState(generateEitvXml, undefined);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="font-display text-sm uppercase tracking-wide text-ink-faint">
          Datos calculados (de COC / Carrozado / Empresa)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <ComputedRow label="Bastidor" value={computed.bastidor ?? "—"} />
          <ComputedRow label="Clasificación" value={computed.clasificacion ?? "—"} />
          <ComputedRow label="Potencia fiscal" value={computed.potencfiscal != null ? `${computed.potencfiscal} CV` : "—"} />
          <ComputedRow label="MMA total" value={computed.mma != null ? `${computed.mma} kg` : "—"} />
          <ComputedRow label="MMA eje 1" value={computed.mmaeje1 != null ? `${computed.mmaeje1} kg` : "—"} />
          <ComputedRow label="MMA eje 2" value={computed.mmaeje2 != null ? `${computed.mmaeje2} kg` : "—"} />
          <ComputedRow label="MMA eje 3" value={computed.mmaeje3 != null ? `${computed.mmaeje3} kg` : "—"} />
          <ComputedRow label="Nº homolog. vehículo completado" value={computed.numhomovehicomp ?? "—"} />
          <ComputedRow label="NIF carrocero" value={computed.carrocero ?? "—"} />
          <ComputedRow
            label="Homologación e9"
            value={computed.homologacionE9 == null ? "Sin determinar" : computed.homologacionE9 ? "Sí" : "No"}
          />
        </div>
        <p className="text-xs text-ink-faint">
          Se recalculan siempre a partir de los datos ya guardados — no se editan aquí. "Homologación e9" se
          deduce de si la contraseña de homologación (pestaña COC) empieza por "e9".
        </p>
      </section>

      <form action={action} className="space-y-4">
        <input type="hidden" name="dossierId" value={dossierId} />

        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase tracking-wide text-ink-faint">Remitente (quien firmará)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {EITV_REMITENTE_FIELDS.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <label className={labelClass}>{f.label}</label>
                <input name={f.name} defaultValue={eitv?.[f.name as keyof EitvNationalData] ?? ""} className={inputClass} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase tracking-wide text-ink-faint">Datos Nacionales (eITV)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {EITV_FIELDS.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <label className={labelClass}>{f.label}</label>
                <input
                  name={f.name}
                  type={f.type === "date" ? "date" : "text"}
                  defaultValue={eitv?.[f.name as keyof EitvNationalData] ?? ""}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Guardar datos eITV"}
          </button>
          {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
        </div>
      </form>

      <section className="space-y-3 border-t border-border pt-4">
        <div>
          <h2 className="font-display text-sm uppercase tracking-wide text-ink-faint">Generar XML</h2>
          <p className="text-xs text-ink-faint">
            Genera los ficheros DatosNacionales + Solicitud_Registro_Entrada listos para revisar y firmar
            externamente (p. ej. con Autofirma). <b className="text-ink-dim">No se firma ni se envía nada a la
            DGT desde aquí.</b>
          </p>
        </div>

        <form action={genAction}>
          <input type="hidden" name="dossierId" value={dossierId} />
          <button
            type="submit"
            disabled={genPending}
            className="border border-border-strong rounded-lg px-4 py-2 text-sm hover:border-accent transition-colors disabled:opacity-50"
          >
            {genPending ? "Generando..." : "Generar XML"}
          </button>
        </form>

        {genState?.missing && genState.missing.length > 0 && <MissingList items={genState.missing} />}

        {genState?.datosNacionalesXml && (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-ink-dim">{genState.message}</p>
            <button
              type="button"
              onClick={() => downloadText(genState.datosNacionalesFileName, genState.datosNacionalesXml!)}
              className="text-xs border border-border-strong rounded-lg px-3 py-1.5 hover:border-accent transition-colors"
            >
              Descargar {genState.datosNacionalesFileName}
            </button>
            <button
              type="button"
              onClick={() => downloadText(genState.solicitudFileName, genState.solicitudXml!)}
              className="text-xs border border-border-strong rounded-lg px-3 py-1.5 hover:border-accent transition-colors"
            >
              Descargar {genState.solicitudFileName} (sin firmar)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
