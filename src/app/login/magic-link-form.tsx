"use client";

import { useActionState } from "react";
import { requestMagicLink } from "@/app/actions/auth";

export function MagicLinkForm() {
  const [state, action, pending] = useActionState(requestMagicLink, undefined);

  return (
    <form action={action} className="space-y-3">
      <input
        name="email"
        type="email"
        required
        placeholder="tu@email.com"
        className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-center"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-panel border border-border-strong rounded-lg px-4 py-2 text-sm font-medium hover:border-accent transition-colors disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Enviar enlace de acceso"}
      </button>
      {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
    </form>
  );
}
