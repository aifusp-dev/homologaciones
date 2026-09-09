"use client";

import { useActionState } from "react";
import { createDossierVersion, restoreDossierVersion } from "@/app/actions/dossierVersions";

export function CreateVersionForm({ dossierId }: { dossierId: string }) {
  const [state, action, pending] = useActionState(createDossierVersion, undefined);

  return (
    <form action={action} className="flex items-end gap-2 flex-wrap">
      <input type="hidden" name="dossierId" value={dossierId} />
      <div className="space-y-1">
        <label className="text-xs text-ink-dim">Nombre de la versión (opcional)</label>
        <input
          name="label"
          placeholder='Ej. "Cálculo inicial"'
          className="w-56 bg-panel border border-border rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-accent"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-accent text-accent-ink font-semibold rounded-lg px-3 py-1.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Creando..." : "Crear versión"}
      </button>
      {state?.message && <span className="text-xs text-ink-faint">{state.message}</span>}
    </form>
  );
}

export function RestoreVersionButton({
  dossierId,
  versionId,
  label,
}: {
  dossierId: string;
  versionId: string;
  label: string;
}) {
  const [state, action, pending] = useActionState(restoreDossierVersion, undefined);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `¿Restaurar el expediente a "${label}"? Se creará automáticamente una copia del estado actual antes de sobrescribir, por si quieres deshacerlo.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="dossierId" value={dossierId} />
      <input type="hidden" name="versionId" value={versionId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs border border-border-strong rounded-lg px-2.5 py-1 hover:border-accent transition-colors disabled:opacity-50"
      >
        {pending ? "Restaurando..." : "Restaurar"}
      </button>
      {state?.message && <p className="text-xs text-ink-faint mt-1">{state.message}</p>}
    </form>
  );
}
