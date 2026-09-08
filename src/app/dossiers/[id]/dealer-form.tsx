"use client";

import { useActionState } from "react";
import { updateDealer } from "@/app/actions/dossiers";
import type { Dealer } from "@/generated/prisma/client";

const inputClass =
  "w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-500";
const labelClass = "text-xs font-medium text-neutral-400 uppercase tracking-wide";

export function DealerForm({ dossierId, dealer }: { dossierId: string; dealer: Dealer | null }) {
  const [state, action, pending] = useActionState(updateDealer, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="dossierId" value={dossierId} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nombre</label>
          <input name="name" defaultValue={dealer?.name ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Teléfono</label>
          <input name="phone" defaultValue={dealer?.phone ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Email</label>
          <input name="email" type="email" defaultValue={dealer?.email ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Contacto</label>
          <input name="contactName" defaultValue={dealer?.contactName ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Teléfono del contacto</label>
          <input name="contactPhone" defaultValue={dealer?.contactPhone ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Email del contacto</label>
          <input name="contactEmail" type="email" defaultValue={dealer?.contactEmail ?? ""} className={inputClass} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Observaciones</label>
        <textarea name="notes" defaultValue={dealer?.notes ?? ""} rows={2} className={inputClass} />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-white text-black font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar concesionario"}
        </button>
        {state?.message && <p className="text-sm text-neutral-400">{state.message}</p>}
      </div>
    </form>
  );
}
