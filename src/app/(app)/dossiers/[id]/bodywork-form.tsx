"use client";

import { useActionState } from "react";
import { updateBodywork } from "@/app/actions/bodywork";
import { BODYWORK_FIELDS, BODYWORK_SECTIONS, type BodyworkSection } from "@/lib/bodyworkFields";

const inputClass =
  "w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-500";
const labelClass = "text-xs text-neutral-400";

type BodyworkValues = Record<string, string | number | boolean | null | undefined>;

const RESULT_LABELS: Record<string, string> = {
  totalRoofWeight: "Peso total techo",
  totalSideWeight: "Peso total laterales",
  totalFloorWeight: "Peso total piso",
  totalBaseWeight: "Peso total base",
  totalDoorFiberWeight: "Peso total fibra puertas",
  totalOtherAccessoriesWeight: "Peso total otros accesorios",
};

export function BodyworkForm({
  dossierId,
  bodywork,
  computed,
}: {
  dossierId: string;
  bodywork: BodyworkValues | null;
  computed: Record<string, number | null>;
}) {
  const [state, action, pending] = useActionState(updateBodywork, undefined);
  const sections = Object.keys(BODYWORK_SECTIONS) as BodyworkSection[];

  const resultEntries = Object.entries(RESULT_LABELS).filter(([key]) => computed[key] != null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="dossierId" value={dossierId} />

      {resultEntries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {resultEntries.map(([key, label]) => (
            <div key={key} className="bg-neutral-900/60 border border-neutral-800 rounded-lg px-3 py-2">
              <p className="text-[11px] text-neutral-500 uppercase tracking-wide">{label}</p>
              <p className="text-sm font-medium text-neutral-200">{computed[key]} kg</p>
            </div>
          ))}
        </div>
      )}

      {sections.map((section) => {
        const fields = BODYWORK_FIELDS.filter((f) => f.section === section);
        if (fields.length === 0) return null;
        return (
          <details key={section} className="border border-neutral-800 rounded-lg overflow-hidden">
            <summary className="cursor-pointer select-none px-4 py-3 bg-neutral-900 text-sm font-medium flex items-center justify-between">
              {BODYWORK_SECTIONS[section]}
              <span className="text-neutral-500 text-xs">{fields.length} campos</span>
            </summary>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {fields.map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className={labelClass}>{field.label}</label>
                  {field.type === "bool" ? (
                    <select
                      name={field.name}
                      defaultValue={bodywork?.[field.name] ? "true" : "false"}
                      className={inputClass}
                    >
                      <option value="false">No</option>
                      <option value="true">Sí</option>
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      defaultValue={
                        bodywork?.[field.name] === null || bodywork?.[field.name] === undefined
                          ? ""
                          : String(bodywork[field.name])
                      }
                      inputMode={field.type === "int" || field.type === "float" ? "decimal" : undefined}
                      className={inputClass}
                    />
                  )}
                </div>
              ))}
            </div>
          </details>
        );
      })}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-white text-black font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar carrozado"}
        </button>
        {state?.message && <p className="text-sm text-neutral-400">{state.message}</p>}
      </div>
    </form>
  );
}
