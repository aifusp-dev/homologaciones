"use client";

import { useActionState } from "react";
import { updateDevice } from "@/app/actions/devices";
import { DEVICE_TABLES, type DeviceTableKey } from "@/lib/deviceFields";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs text-ink-dim";

type DeviceValues = Record<string, string | number | null | undefined>;

export function DeviceForm({
  dossierId,
  tableKey,
  data,
}: {
  dossierId: string;
  tableKey: DeviceTableKey;
  data: DeviceValues | null;
}) {
  const [state, action, pending] = useActionState(updateDevice, undefined);
  const config = DEVICE_TABLES[tableKey];

  return (
    <details className="border border-border rounded-xl overflow-hidden">
      <summary className="cursor-pointer select-none px-4 py-3 bg-panel text-sm font-medium flex items-center justify-between">
        {config.label}
        <span className="text-ink-faint text-xs">{config.fields.length} campos</span>
      </summary>
      <form action={action} className="p-4 space-y-3">
        <input type="hidden" name="dossierId" value={dossierId} />
        <input type="hidden" name="tableKey" value={tableKey} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {config.fields.map((field) => (
            <div key={field.name} className="space-y-1">
              <label className={labelClass}>{field.label}</label>
              <input
                name={field.name}
                defaultValue={
                  data?.[field.name] === null || data?.[field.name] === undefined ? "" : String(data[field.name])
                }
                inputMode={field.type === "float" ? "decimal" : undefined}
                className={inputClass}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? "Guardando..." : `Guardar`}
          </button>
          {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
        </div>
      </form>
    </details>
  );
}
