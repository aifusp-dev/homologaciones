"use client";

import { useActionState } from "react";
import { archiveDossier, unarchiveDossier } from "@/app/actions/dossiers";

export function DossierArchiveButton({ dossierId, archived }: { dossierId: string; archived: boolean }) {
  const action = archived ? unarchiveDossier : archiveDossier;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="dossierId" value={dossierId} />
      {archived && (
        <span className="text-xs font-medium text-ink-faint uppercase tracking-wide border border-border rounded-full px-2 py-0.5">
          Archivado
        </span>
      )}
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-ink-faint hover:text-ink underline disabled:opacity-50"
      >
        {pending ? "..." : archived ? "Reactivar expediente" : "Archivar expediente"}
      </button>
      {state?.message && <span className="text-xs text-ink-faint">{state.message}</span>}
    </form>
  );
}
