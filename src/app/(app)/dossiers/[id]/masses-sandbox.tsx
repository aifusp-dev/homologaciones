"use client";

import { useState, type RefObject } from "react";
import { MassesDiagram, type DiagramData } from "./masses-diagram";
import { MassesVerificationPanel } from "./masses-verification-panel";
import {
  totalLength,
  rearOverhang,
  rearOverhang3Axle,
  DIESEL_DENSITY_KG_PER_LITER,
  type MassesInputs,
} from "@/lib/calculations/masses";
import type { VehicleConfig } from "@/lib/vehicleConfig";

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

// Cada configuración de vehículo usa un subconjunto distinto de MassesInputs
// (ver cabecera de calculations/masses.ts) — "Cargas"/"Geometría" son campos
// reales de MassesDimensions (con applyTo, se pueden volcar al formulario de
// abajo); "COC" son campos de la pestaña COC, solo vista previa aquí (mismo
// criterio que ya tenía BASE con sus "Límites").
const FIELDS_BY_CONFIG: Record<
  VehicleConfig,
  { cargas: FieldConfig[]; geometria: FieldConfig[]; coc: FieldConfig[] }
> = {
  base: {
    cargas: [
      { key: "tareAxle1", label: "Tara eje 1", applyTo: "tareAxle1" },
      { key: "tareAxle2", label: "Tara eje 2", applyTo: "tareAxle2" },
      { key: "seatsMass", label: "Masa plazas", applyTo: "seatsMass" },
      { key: "fuelCapacity", label: "Combustible (Kg)", applyTo: "fuelCapacity", convertToLiters: true },
    ],
    geometria: [
      { key: "frontOverhang", label: "Voladizo delantero", applyTo: "frontOverhang" },
      { key: "firstAxleToBodyDistance", label: "Distancia 1er eje a caja", applyTo: "firstAxleToBodyDistance" },
    ],
    coc: [
      { key: "axleDistance1to2", label: "Distancia entre ejes" },
      { key: "staticCouplingPointMass", label: "Masa estática gancho" },
      { key: "maxLadenMassRegistration", label: "MMA total" },
      { key: "maxLadenMassRegistrationAxle1", label: "MMA eje 1" },
      { key: "maxLadenMassRegistrationAxle2", label: "MMA eje 2" },
      { key: "maxTechnicallyPermissibleMassRequested", label: "MMTA total" },
      { key: "maxTechnicallyPermissibleMassAxle1", label: "MMTA eje 1" },
      { key: "maxTechnicallyPermissibleMassAxle2", label: "MMTA eje 2" },
    ],
  },
  triaxle: {
    cargas: [
      { key: "tareAxle1", label: "Tara eje 1", applyTo: "tareAxle1" },
      { key: "tareAxle2", label: "Tara ejes 2+3", applyTo: "tareAxle2" },
      { key: "seatsMass", label: "Masa plazas", applyTo: "seatsMass" },
      { key: "fuelCapacity", label: "Combustible (Kg)", applyTo: "fuelCapacity", convertToLiters: true },
      { key: "craneMass", label: "Masa grúa", applyTo: "craneMass" },
    ],
    geometria: [
      { key: "frontOverhang", label: "Voladizo delantero", applyTo: "frontOverhang" },
      { key: "firstAxleToBodyDistance", label: "Distancia 1er eje a caja", applyTo: "firstAxleToBodyDistance" },
    ],
    coc: [
      { key: "axleDistance1to2", label: "Distancia ejes 1-2" },
      { key: "axleDistance2to3", label: "Distancia ejes 2-3" },
      { key: "staticCouplingPointMass", label: "Masa estática gancho" },
      { key: "maxLadenMassRegistration", label: "MMA total" },
      { key: "maxLadenMassRegistrationAxle1", label: "MMA eje 1" },
      { key: "maxLadenMassRegistrationAxle2", label: "MMA eje 2" },
      { key: "maxLadenMassRegistrationAxle3", label: "MMA eje 3" },
      { key: "maxTechnicallyPermissibleMassRequested", label: "MMTA total" },
      { key: "maxTechnicallyPermissibleMassAxle1", label: "MMTA eje 1" },
      { key: "maxTechnicallyPermissibleMassAxle2", label: "MMTA eje 2" },
      { key: "maxTechnicallyPermissibleMassAxle3", label: "MMTA eje 3" },
    ],
  },
  semi2: {
    cargas: [
      { key: "semiTrailerTare", label: "Tara semirremolque", applyTo: "semiTrailerTare" },
      { key: "seatsMass", label: "Masa plazas", applyTo: "seatsMass" },
      { key: "fuelCapacity", label: "Combustible (Kg)", applyTo: "fuelCapacity", convertToLiters: true },
    ],
    geometria: [
      { key: "semiTrailerTotalLength", label: "Largo total", applyTo: "semiTrailerTotalLength" },
      { key: "semiTrailerBodyLength", label: "Largo carrozado", applyTo: "semiTrailerBodyLength" },
    ],
    coc: [
      { key: "staticCouplingPointMass", label: "Masa estática kingpin" },
      { key: "maxLadenMassRegistration", label: "MMA total" },
      { key: "maxLadenMassRegistrationAxle1", label: "MMA eje 1" },
      { key: "maxLadenMassRegistrationAxle2", label: "MMA eje 2" },
      { key: "maxTechnicallyPermissibleMassRequested", label: "MMTA total" },
      { key: "maxTechnicallyPermissibleMassAxle1", label: "MMTA eje 1" },
      { key: "maxTechnicallyPermissibleMassAxle2", label: "MMTA eje 2" },
    ],
  },
  semi3: {
    cargas: [{ key: "semiTrailer3AxleBodyWeight", label: "Peso carrozado", applyTo: "semiTrailer3AxleBodyWeight" }],
    geometria: [
      { key: "semiTrailer3AxleLt", label: "Largo total", applyTo: "semiTrailer3AxleLt" },
      { key: "semiTrailer3AxleLc", label: "Largo carrozado", applyTo: "semiTrailer3AxleLc" },
    ],
    coc: [
      { key: "momIncompleteVehicle", label: "Tara inicial (MOM veh. incompleto)" },
      { key: "momIncompleteAxle1", label: "Tara inicial eje 1" },
      { key: "momIncompleteAxle2", label: "Tara inicial eje 2" },
      { key: "staticCouplingPointMass", label: "Masa estática kingpin" },
      { key: "maxLadenMassRegistration", label: "MMA total" },
      { key: "maxLadenMassRegistrationAxle1", label: "MMA eje 1" },
      { key: "maxLadenMassRegistrationAxle2", label: "MMA eje 2" },
      { key: "maxLadenMassRegistrationAxle3", label: "MMA eje 3" },
      { key: "maxTechnicallyPermissibleMassRequested", label: "MMTA total" },
      { key: "maxTechnicallyPermissibleMassAxle1", label: "MMTA eje 1" },
      { key: "maxTechnicallyPermissibleMassAxle2", label: "MMTA eje 2" },
      { key: "maxTechnicallyPermissibleMassAxle3", label: "MMTA eje 3" },
    ],
  },
};

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

function liveDiagramData(
  vehicleConfig: VehicleConfig,
  inputs: MassesInputs,
  diagramStatic: Pick<DiagramData, "cargoLength" | "width" | "height" | "hasCrane">
): DiagramData {
  if (vehicleConfig === "semi2") {
    return {
      totalLength: inputs.semiTrailerTotalLength,
      cargoLength: inputs.semiTrailerBodyLength,
      frontOverhang: null,
      rearOverhang: null,
      wheelbase: null,
      wheelbase2: null,
      firstAxleToBodyDistance: null,
      height: diagramStatic.height,
      width: diagramStatic.width,
      hasCrane: false,
    };
  }
  if (vehicleConfig === "semi3") {
    return {
      totalLength: inputs.semiTrailer3AxleLt,
      cargoLength: inputs.semiTrailer3AxleLc,
      frontOverhang: null,
      rearOverhang: null,
      wheelbase: null,
      wheelbase2: null,
      firstAxleToBodyDistance: null,
      height: diagramStatic.height,
      width: diagramStatic.width,
      hasCrane: false,
    };
  }
  if (vehicleConfig === "triaxle") {
    const rear = rearOverhang3Axle(inputs);
    const total =
      inputs.frontOverhang != null && rear != null && inputs.axleDistance1to2 != null && inputs.axleDistance2to3 != null
        ? inputs.frontOverhang + rear + inputs.axleDistance1to2 + inputs.axleDistance2to3
        : null;
    return {
      totalLength: total,
      frontOverhang: inputs.frontOverhang,
      rearOverhang: rear,
      wheelbase: inputs.axleDistance1to2,
      wheelbase2: inputs.axleDistance2to3,
      firstAxleToBodyDistance: inputs.firstAxleToBodyDistance,
      cargoLength: diagramStatic.cargoLength,
      width: diagramStatic.width,
      height: diagramStatic.height,
      hasCrane: (inputs.craneMass ?? 0) > 0,
    };
  }
  return {
    totalLength: totalLength(inputs),
    frontOverhang: inputs.frontOverhang,
    rearOverhang: rearOverhang(inputs),
    wheelbase: inputs.axleDistance1to2,
    wheelbase2: null,
    firstAxleToBodyDistance: inputs.firstAxleToBodyDistance,
    cargoLength: diagramStatic.cargoLength,
    width: diagramStatic.width,
    height: diagramStatic.height,
    hasCrane: diagramStatic.hasCrane,
  };
}

export function MassesSandbox({
  vehicleConfig,
  initial,
  diagramStatic,
  formRef,
}: {
  vehicleConfig: VehicleConfig;
  initial: MassesInputs;
  diagramStatic: Pick<DiagramData, "cargoLength" | "width" | "height" | "hasCrane">;
  formRef: RefObject<HTMLFormElement | null>;
}) {
  const [inputs, setInputs] = useState<MassesInputs>(initial);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  const set = (key: FieldKey, value: number | null) => setInputs((prev) => ({ ...prev, [key]: value }));

  const fields = FIELDS_BY_CONFIG[vehicleConfig];
  const diagramData = liveDiagramData(vehicleConfig, inputs, diagramStatic);

  function applyToForm() {
    let count = 0;
    for (const field of [...fields.cargas, ...fields.geometria]) {
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
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
      <div className="space-y-4 min-w-0">
        <MassesDiagram variant={vehicleConfig} data={diagramData} />
        <MassesVerificationPanel inputs={inputs} vehicleConfig={vehicleConfig} />
      </div>

      <div className="space-y-4 border border-border rounded-xl p-4 bg-panel/40 h-fit xl:sticky xl:top-4">
        <div>
          <p className="text-sm font-medium text-ink">Ajuste rápido</p>
          <p className="text-xs text-ink-faint">
            Cambia valores y mira el dibujo y la verificación al momento. No se guarda nada hasta que lo apliques
            y pulses Guardar.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] text-ink-faint uppercase tracking-wide">Cargas</p>
          {fields.cargas.map((f) => (
            <NumberField key={f.key} field={f} value={inputs[f.key] as number | null} onChange={set} />
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-[11px] text-ink-faint uppercase tracking-wide">Geometría</p>
          {fields.geometria.map((f) => (
            <NumberField key={f.key} field={f} value={inputs[f.key] as number | null} onChange={set} />
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-[11px] text-ink-faint uppercase tracking-wide">COC (solo vista previa)</p>
          {fields.coc.map((f) => (
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
    </div>
  );
}
