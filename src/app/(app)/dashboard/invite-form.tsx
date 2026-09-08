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
          className="flex-1 bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <select
          name="role"
          defaultValue="OPERATOR"
          className="bg-panel border border-border rounded-lg px-2 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="OPERATOR">Operario</option>
          <option value="COMPANY_ADMIN">Gestor</option>
        </select>
      </div>
      {state?.errors?.email && <p className="text-xs text-danger">{state.errors.email[0]}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Invitando..." : "Invitar"}
      </button>
      {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
    </form>
  );
}
