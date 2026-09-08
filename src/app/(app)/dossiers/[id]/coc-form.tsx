"use client";

import { useActionState } from "react";
import { updateCoc } from "@/app/actions/coc";
import { COC_FIELDS, COC_SECTIONS, type CocSection } from "@/lib/cocFields";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs text-ink-dim";

type CocValues = Record<string, string | number | boolean | Date | null | undefined>;

function toInputValue(value: unknown, type: string): string {
  if (value === null || value === undefined) return "";
  if (type === "date" && value instanceof Date) return value.toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export function CocForm({
  dossierId,
  coc,
  fiscalHorsepower,
}: {
  dossierId: string;
  coc: CocValues | null;
  fiscalHorsepower: number | null;
}) {
  const [state, action, pending] = useActionState(updateCoc, undefined);

  const sections = Object.keys(COC_SECTIONS) as CocSection[];

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="dossierId" value={dossierId} />

      {sections.map((section) => {
        const fields = COC_FIELDS.filter((f) => f.section === section);
        return (
          <details key={section} className="border border-border rounded-xl overflow-hidden group">
            <summary className="cursor-pointer select-none px-4 py-3 bg-panel text-sm font-medium flex items-center justify-between">
              {COC_SECTIONS[section]}
              <span className="text-ink-faint text-xs">{fields.length} campos</span>
            </summary>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {section === "motor" && (
                <div className="col-span-full text-xs text-ink-dim bg-panel/60 rounded-lg px-3 py-2">
                  Potencia fiscal (calculada): <b className="text-ink">{fiscalHorsepower ?? "—"}</b> CV
                </div>
              )}
              {fields.map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className={labelClass}>
                    <span className="text-ink-faint mr-1">{field.clause}</span>
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    type={field.type === "date" ? "date" : field.type === "text" ? "text" : "text"}
                    inputMode={field.type === "int" || field.type === "float" ? "decimal" : undefined}
                    defaultValue={toInputValue(coc?.[field.name], field.type)}
                    className={inputClass}
                  />
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
          className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar COC"}
        </button>
        {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
      </div>
    </form>
  );
}
