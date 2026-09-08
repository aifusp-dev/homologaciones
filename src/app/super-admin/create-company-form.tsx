"use client";

import { useActionState } from "react";
import { createCompany } from "@/app/actions/companies";

export function CreateCompanyForm() {
  const [state, action, pending] = useActionState(createCompany, undefined);

  return (
    <form action={action} className="space-y-3 max-w-sm">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Nombre de la empresa
        </label>
        <input
          name="companyName"
          required
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
        {state?.errors?.companyName && (
          <p className="text-xs text-red-400">{state.errors.companyName[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Email del dueño
        </label>
        <input
          name="ownerEmail"
          type="email"
          required
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
        {state?.errors?.ownerEmail && (
          <p className="text-xs text-red-400">{state.errors.ownerEmail[0]}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-white text-black font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Creando..." : "Crear empresa"}
      </button>
      {state?.message && <p className="text-sm text-neutral-400">{state.message}</p>}
    </form>
  );
}
