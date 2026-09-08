"use client";

import { useState, type RefObject } from "react";
import { MassesDiagram, type DiagramData } from "./masses-diagram";
import { MassesVerificationPanel } from "./masses-verification-panel";
import { totalLength, rearOverhang, DIESEL_DENSITY_KG_PER_LITER, type MassesInputs } from "@/lib/calculations/masses";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-accent";
const labelClass = "text-xs text-ink-dim";

type FieldKey = keyof MassesInputs;

type FieldConfig = {
  key: FieldKey;
  label: string;
  applyTo?: string; // nombre del campo real en "Datos de entrada" (MassesDimensions), si aplica
  convertToLiters?: boolean; // fuelCapacity: el sandbox trabaja en Kg, el formulario real en litros
};

const CARGAS_FIELDS: FieldConfig[] = [
  { key: "tareAxle1", label: "Tara eje 1", applyTo: "tareAxle1" },
  { key: "tareAxle2", label: "Tara eje 2", applyTo: "tareAxle2" },
  { key: "seatsMass", label: "Masa plazas", applyTo: "seatsMass" },
  { key: "fuelCapacity", label: "Combustible (Kg)", applyTo: "fuelCapacity", convertToLiters: true },
];

const GEOMETRIA_FIELDS: FieldConfig[] = [
  { key: "frontOverhang", label: "Voladizo delantero", applyTo: "frontOverhang" },
  { key: "firstAxleToBodyDistance", label: "Distancia 1er eje a caja", applyTo: "firstAxleToBodyDistance" },
];

// Estos 6 son de la pestaña COC, no de "Masas y dimensiones" — se pueden
// tocar aquí para previsualizar, pero "Aplicar al formulario" no los toca
// (no tienen applyTo): guardarlos de verdad exige ir a la pestaña COC.
const LIMITES_FIELDS: FieldConfig[] = [
  { key: "axleDistance1to2", label: "Distancia entre ejes" },
  { key: "staticCouplingPointMass", label: "Masa estática gancho" },
  { key: "maxLadenMassRegistration", label: "MMA total" },
  { key: "maxLadenMassRegistrationAxle1", label: "MMA eje 1" },
  { key: "maxLadenMassRegistrationAxle2", label: "MMA eje 2" },
  { key: "maxTechnicallyPermissibleMassRequested", label: "MMTA total" },
  { key: "maxTechnicallyPermissibleMassAxle1", label: "MMTA eje 1" },
  { key: "maxTechnicallyPermissibleMassAxle2", label: "MMTA eje 2" },
];

function NumberField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: number | null;
  onChange: (key: FieldKey, value: number | null) => void;
}) {
  return (
    <div className="space-y-1">
      <label className={labelClass}>{field.label}</label>
      <input
        inputMode="decimal"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value.trim().replace(",", ".");
          onChange(field.key, raw === "" ? null : Number.isFinite(Number(raw)) ? Number(raw) : value);
        }}
        className={inputClass}
      />
    </div>
  );
}

export function MassesSandbox({
  initial,
  diagramStatic,
  formRef,
}: {
  initial: MassesInputs;
  diagramStatic: Pick<DiagramData, "cargoLength" | "width" | "height" | "hasCrane">;
  formRef: RefObject<HTMLFormElement | null>;
}) {
  const [inputs, setInputs] = useState<MassesInputs>(initial);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  const set = (key: FieldKey, value: number | null) => setInputs((prev) => ({ ...prev, [key]: value }));

  const liveDiagramData: DiagramData = {
    totalLength: totalLength(inputs),
    frontOverhang: inputs.frontOverhang,
    rearOverhang: rearOverhang(inputs),
    wheelbase: inputs.axleDistance1to2,
    wheelbase2: null,
    firstAxleToBodyDistance: inputs.firstAxleToBodyDistance,
    ...diagramStatic,
  };

  function applyToForm() {
    let count = 0;
    for (const field of [...CARGAS_FIELDS, ...GEOMETRIA_FIELDS]) {
      if (!field.applyTo) continue;
      const input = formRef.current?.elements.namedItem(field.applyTo);
      if (input instanceof HTMLInputElement) {
        const raw = inputs[field.key];
        const value = raw == null ? "" : field.convertToLiters ? raw / DIESEL_DENSITY_KG_PER_LITER : raw;
        input.value = value === "" ? "" : String(value);
        count++;
      }
    }
    setApplyMessage(`${count} campos aplicados al formulario de abajo — revisa y pulsa "Guardar masas y dimensiones".`);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      <div className="space-y-4 border border-border rounded-xl p-4 bg-panel/40 h-fit">
        <div>
          <p className="text-sm font-medium text-ink">Ajuste rápido</p>
          <p className="text-xs text-ink-faint">
            Cambia valores y mira el dibujo y la verificación al momento. No se guarda nada hasta que lo apliques
            y pulses Guardar.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] text-ink-faint uppercase tracking-wide">Cargas</p>
          {CARGAS_FIELDS.map((f) => (
            <NumberField key={f.key} field={f} value={inputs[f.key] as number | null} onChange={set} />
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-[11px] text-ink-faint uppercase tracking-wide">Geometría</p>
          {GEOMETRIA_FIELDS.map((f) => (
            <NumberField key={f.key} field={f} value={inputs[f.key] as number | null} onChange={set} />
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-[11px] text-ink-faint uppercase tracking-wide">Límites (de la pestaña COC)</p>
          {LIMITES_FIELDS.map((f) => (
            <NumberField key={f.key} field={f} value={inputs[f.key] as number | null} onChange={set} />
          ))}
          <p className="text-[11px] text-ink-faint italic">
            Solo vista previa — para guardarlos de verdad, cámbialos en la pestaña COC.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={applyToForm}
            className="border border-border-strong rounded-lg px-3 py-1.5 text-sm hover:border-accent transition-colors"
          >
            Aplicar al formulario
          </button>
          <button
            type="button"
            onClick={() => {
              setInputs(initial);
              setApplyMessage(null);
            }}
            className="text-xs text-ink-faint hover:text-ink-dim text-left"
          >
            Reiniciar a lo guardado
          </button>
          {applyMessage && <p className="text-xs text-ink-dim">{applyMessage}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <MassesDiagram variant="base" data={liveDiagramData} />
        <MassesVerificationPanel inputs={inputs} />
      </div>
    </div>
  );
}
