"use client";

import { useActionState } from "react";
import { generateDocument } from "@/app/actions/documents";

const DOCUMENT_TYPES: { type: string; label: string; available: boolean }[] = [
  { type: "PRELIMINARY_REPORT", label: "Informe previo", available: true },
  { type: "MANUFACTURING_ORDER", label: "Orden de fabricación", available: true },
  { type: "BODYWORK_CERTIFICATE", label: "Certificado de carrozado", available: true },
  { type: "BODYWORK_CERTIFICATE_PART2", label: "Certificado de carrozado (parte 2)", available: true },
  { type: "REDUCED_DATASHEET", label: "Ficha reducida", available: true },
  { type: "COP_REGISTER", label: "Registro COP", available: true },
];

const DOCUMENT_LABELS: Record<string, string> = Object.fromEntries(
  DOCUMENT_TYPES.map((d) => [d.type, d.label])
);

function GenerateButton({ dossierId, type, label }: { dossierId: string; type: string; label: string }) {
  const [state, action, pending] = useActionState(generateDocument, undefined);
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="dossierId" value={dossierId} />
      <input type="hidden" name="type" value={type} />
      <button
        type="submit"
        disabled={pending}
        className="border border-border-strong rounded-lg px-3 py-1.5 text-sm hover:border-accent transition-colors disabled:opacity-50"
      >
        {pending ? "Generando..." : `Generar ${label}`}
      </button>
      {state?.message && <span className="text-xs text-ink-faint">{state.message}</span>}
    </form>
  );
}

export function DocumentsSection({
  dossierId,
  documents,
}: {
  dossierId: string;
  documents: { id: string; type: string; createdAt: Date }[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DOCUMENT_TYPES.map((d) =>
          d.available ? (
            <GenerateButton key={d.type} dossierId={dossierId} type={d.type} label={d.label} />
          ) : (
            <div key={d.type} className="text-sm text-ink-faint px-3 py-1.5">
              {d.label} <span className="text-xs">(fase futura)</span>
            </div>
          )
        )}
      </div>

      {documents.length > 0 && (
        <ul className="space-y-1.5 text-sm">
          {documents.map((doc) => (
            <li key={doc.id} className="flex justify-between border-t border-border pt-2">
              <a href={`/api/documents/${doc.id}`} target="_blank" className="text-ink-dim hover:text-white underline">
                {DOCUMENT_LABELS[doc.type] ?? doc.type}
              </a>
              <span className="text-ink-faint">{new Date(doc.createdAt).toLocaleString("es-ES")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
