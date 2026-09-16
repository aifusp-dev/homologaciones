"use client";

import { useActionState } from "react";
import { updateEitvWsConfig } from "@/app/actions/eitvWs";
import type { EitvWsConfig } from "@/generated/prisma/client";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs font-medium text-ink-dim uppercase tracking-wide";

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  disabled,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className={labelClass}>{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        placeholder={placeholder}
        className={`${inputClass} disabled:opacity-50`}
      />
    </div>
  );
}

export function ConfigSection({ config, isAdmin }: { config: EitvWsConfig | null; isAdmin: boolean }) {
  const [state, action, pending] = useActionState(updateEitvWsConfig, undefined);

  return (
    <form action={action} className="space-y-6">
      {!isAdmin && (
        <p className="text-sm text-ink-dim bg-panel/60 border border-border rounded-lg px-3 py-2">
          Solo un administrador de la empresa puede editar esta configuración — la ves en solo
          lectura.
        </p>
      )}

      <section className="space-y-2">
        <h2 className="font-display text-sm uppercase tracking-wide text-ink-faint">
          Identidad RFFR
        </h2>
        <p className="text-xs text-ink-faint">
          Debe coincidir carácter a carácter con el expediente activo en el Registro de Firmas de
          Fabricantes y Representantes — si no coincide, el Ministerio rechaza la llamada.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field name="fabricanteTipoDoc" label="Fabricante — tipo doc." defaultValue={config?.fabricanteTipoDoc} disabled={!isAdmin} />
          <Field name="fabricanteDoc" label="Fabricante — nº doc." defaultValue={config?.fabricanteDoc} disabled={!isAdmin} />
          <Field name="fabricanteNombre" label="Fabricante — nombre" defaultValue={config?.fabricanteNombre} disabled={!isAdmin} />
          <Field name="representanteTipoDoc" label="Representante — tipo doc." defaultValue={config?.representanteTipoDoc} disabled={!isAdmin} />
          <Field name="representanteDoc" label="Representante — nº doc." defaultValue={config?.representanteDoc} disabled={!isAdmin} />
          <Field name="representanteNombre" label="Representante — nombre" defaultValue={config?.representanteNombre} disabled={!isAdmin} />
          <Field name="marca" label="Marca" defaultValue={config?.marca} disabled={!isAdmin} />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-sm uppercase tracking-wide text-ink-faint">
          Entorno activo
        </h2>
        <select
          name="entornoActivo"
          defaultValue={config?.entornoActivo ?? "pruebas"}
          disabled={!isAdmin}
          className={`${inputClass} max-w-xs disabled:opacity-50`}
        >
          <option value="pruebas">Pruebas</option>
          <option value="produccion">Producción</option>
        </select>
        <p className="text-xs text-ink-faint">
          En pruebas el Ministerio acepta/rechaza aleatoriamente cada solicitud (no valida
          contenido) — sirve para probar el circuito, no para tarjetas reales.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-sm uppercase tracking-wide text-ink-faint">
          Credenciales — Pruebas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field name="pruebasLogin" label="Usuario" defaultValue={config?.pruebasLogin} disabled={!isAdmin} />
          <Field
            name="pruebasPassword"
            label="Contraseña"
            type="password"
            disabled={!isAdmin}
            placeholder={config?.pruebasPasswordEncrypted ? "•••••••• (déjalo en blanco para no cambiarla)" : ""}
          />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-sm uppercase tracking-wide text-ink-faint">
          Credenciales — Producción
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field name="produccionLogin" label="Usuario" defaultValue={config?.produccionLogin} disabled={!isAdmin} />
          <Field
            name="produccionPassword"
            label="Contraseña"
            type="password"
            disabled={!isAdmin}
            placeholder={config?.produccionPasswordEncrypted ? "•••••••• (déjalo en blanco para no cambiarla)" : ""}
          />
        </div>
      </section>

      {isAdmin && (
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Guardar configuración"}
          </button>
          {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
        </div>
      )}
    </form>
  );
}
