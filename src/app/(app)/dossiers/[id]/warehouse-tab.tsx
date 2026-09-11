"use client";

import { useActionState } from "react";
import { createInstallation, deleteInstallation } from "@/app/actions/stock";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs text-ink-dim";

type ArticleOption = { id: string; name: string; reference: string | null; unit: string; hReportNumber: string };
type InstallationValue = {
  id: string;
  quantity: number;
  installDate: Date;
  notes: string | null;
  article: { id: string; name: string; unit: string; hReport: { number: string } };
};

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("es-ES");
}

function NewInstallationForm({ dossierId, articles }: { dossierId: string; articles: ArticleOption[] }) {
  const [state, action, pending] = useActionState(createInstallation, undefined);
  return (
    <form action={action} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end border border-border rounded-xl p-4">
      <input type="hidden" name="dossierId" value={dossierId} />
      <div className="space-y-1 sm:col-span-2">
        <label className={labelClass}>Artículo</label>
        <select name="articleId" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Elige un artículo
          </option>
          {articles.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
              {a.reference ? ` (${a.reference})` : ""} — Informe H {a.hReportNumber}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Cantidad</label>
        <input name="quantity" type="number" min={1} defaultValue={1} required className={inputClass} />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Fecha instalación</label>
        <input name="installDate" type="date" required className={inputClass} />
      </div>
      <div className="sm:col-span-3 space-y-1">
        <label className={labelClass}>Notas</label>
        <input name="notes" className={inputClass} />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Registrar instalación"}
        </button>
      </div>
      {state?.message && <p className="sm:col-span-4 text-sm text-ink-dim">{state.message}</p>}
    </form>
  );
}

function DeleteInstallationButton({ id, dossierId }: { id: string; dossierId: string }) {
  const [state, action, pending] = useActionState(deleteInstallation, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dossierId" value={dossierId} />
      <button type="submit" disabled={pending} className="text-xs text-danger hover:underline disabled:opacity-50">
        {pending ? "Eliminando..." : "Eliminar"}
      </button>
      {state?.message && <span className="ml-2 text-xs text-ink-faint">{state.message}</span>}
    </form>
  );
}

export function WarehouseTab({
  dossierId,
  articles,
  installations,
}: {
  dossierId: string;
  articles: ArticleOption[];
  installations: InstallationValue[];
}) {
  return (
    <div className="space-y-4">
      {articles.length === 0 ? (
        <p className="text-sm text-ink-faint">
          Todavía no hay artículos catalogados. Añádelos desde{" "}
          <a href="/almacen" className="text-accent hover:underline">
            Almacén
          </a>
          .
        </p>
      ) : (
        <NewInstallationForm dossierId={dossierId} articles={articles} />
      )}

      <div className="space-y-2">
        <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Artículos instalados en este expediente
        </h3>
        {installations.length === 0 ? (
          <p className="text-sm text-ink-faint">Ninguno todavía.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {installations.map((i) => (
              <li key={i.id} className="flex justify-between items-center border-t border-border pt-2">
                <span>
                  <span className="font-mono">{i.quantity}</span> {i.article.unit} de{" "}
                  <span className="font-medium">{i.article.name}</span>{" "}
                  <span className="text-ink-faint">(Informe H {i.article.hReport.number})</span> ·{" "}
                  {formatDate(i.installDate)}
                  {i.notes && <span className="text-ink-faint"> · {i.notes}</span>}
                </span>
                <DeleteInstallationButton id={i.id} dossierId={dossierId} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
