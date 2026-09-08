"use client";

import { useActionState } from "react";
import { createSavedCustomer } from "@/app/actions/savedCustomers";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs text-ink-dim";

export function SavedCustomerForm() {
  const [state, action, pending] = useActionState(createSavedCustomer, undefined);

  return (
    <form action={action} className="border border-border rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className={labelClass}>Nombre</label>
          <input name="name" required className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Teléfono</label>
          <input name="phone" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Email</label>
          <input name="email" type="email" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Contacto</label>
          <input name="contactName" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Teléfono del contacto</label>
          <input name="contactPhone" className={inputClass} />
        </div>
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Observaciones</label>
        <input name="notes" className={inputClass} />
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Añadiendo..." : "Añadir cliente"}
        </button>
        {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
      </div>
    </form>
  );
}
