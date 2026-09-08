"use client";

import { useActionState } from "react";
import { inviteTeammate } from "@/app/actions/companies";

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteTeammate, undefined);

  return (
    <form action={action} className="space-y-3 max-w-sm">
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="email@compañero.com"
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
        <select
          name="role"
          defaultValue="OPERATOR"
          className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-2 text-sm outline-none focus:border-neutral-500"
        >
          <option value="OPERATOR">Operario</option>
          <option value="COMPANY_ADMIN">Gestor</option>
        </select>
      </div>
      {state?.errors?.email && <p className="text-xs text-red-400">{state.errors.email[0]}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-white text-black font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Invitando..." : "Invitar"}
      </button>
      {state?.message && <p className="text-sm text-neutral-400">{state.message}</p>}
    </form>
  );
}
