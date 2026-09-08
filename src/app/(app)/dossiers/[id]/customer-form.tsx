"use client";

import { useActionState } from "react";
import { updateCustomer } from "@/app/actions/dossiers";
import type { Customer } from "@/generated/prisma/client";

const inputClass =
  "w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-500";
const labelClass = "text-xs font-medium text-neutral-400 uppercase tracking-wide";

export function CustomerForm({ dossierId, customer }: { dossierId: string; customer: Customer | null }) {
  const [state, action, pending] = useActionState(updateCustomer, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="dossierId" value={dossierId} />
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
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-white text-black font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar cliente"}
        </button>
        {state?.message && <p className="text-sm text-neutral-400">{state.message}</p>}
      </div>
    </form>
  );
}
