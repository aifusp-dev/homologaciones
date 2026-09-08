"use client";

import { useActionState, useRef } from "react";
import { updateCustomer } from "@/app/actions/dossiers";
import { createSavedCustomer } from "@/app/actions/savedCustomers";
import type { Customer } from "@/generated/prisma/client";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs font-medium text-ink-dim uppercase tracking-wide";

type SavedCustomer = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  contactName: string | null;
  contactPhone: string | null;
  notes: string | null;
};

const FIELD_NAMES = ["name", "phone", "email", "contactName", "contactPhone", "notes"] as const;

export function CustomerForm({
  dossierId,
  customer,
  savedCustomers,
}: {
  dossierId: string;
  customer: Customer | null;
  savedCustomers: SavedCustomer[];
}) {
  const [state, action, pending] = useActionState(updateCustomer, undefined);
  const [saveState, saveAction, savePending] = useActionState(createSavedCustomer, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  function loadSaved(id: string) {
    const saved = savedCustomers.find((c) => c.id === id);
    if (!saved) return;
    for (const field of FIELD_NAMES) {
      const input = formRef.current?.elements.namedItem(field);
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        input.value = saved[field] ?? "";
      }
    }
  }

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="dossierId" value={dossierId} />

      {savedCustomers.length > 0 && (
        <div className="space-y-1.5 max-w-sm">
          <label className={labelClass}>Cargar cliente guardado</label>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) loadSaved(e.target.value);
              e.target.value = "";
            }}
            className={inputClass}
          >
            <option value="">Elegir del catálogo…</option>
            {savedCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.contactName ? ` — ${c.contactName}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nombre</label>
          <input name="name" defaultValue={customer?.name ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Teléfono</label>
          <input name="phone" defaultValue={customer?.phone ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Email</label>
          <input name="email" type="email" defaultValue={customer?.email ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Contacto</label>
          <input name="contactName" defaultValue={customer?.contactName ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Teléfono del contacto</label>
          <input name="contactPhone" defaultValue={customer?.contactPhone ?? ""} className={inputClass} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Observaciones</label>
        <textarea name="notes" defaultValue={customer?.notes ?? ""} rows={2} className={inputClass} />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar cliente"}
        </button>
        <button
          type="submit"
          formAction={saveAction}
          disabled={savePending}
          className="border border-border-strong rounded-lg px-4 py-2 text-sm hover:border-accent transition-colors disabled:opacity-50"
        >
          {savePending ? "Guardando..." : "Guardar como cliente habitual"}
        </button>
        {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
        {saveState?.message && <p className="text-sm text-ink-dim">{saveState.message}</p>}
      </div>
    </form>
  );
}
