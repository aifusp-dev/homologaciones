"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createArticle, deleteArticle, createPurchase, deletePurchase } from "@/app/actions/stock";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs text-ink-dim";

type PurchaseValue = {
  id: string;
  quantity: number;
  deliveryNoteNumber: string;
  purchaseDate: Date;
  supplier: string | null;
  notes: string | null;
};
type InstallationValue = {
  id: string;
  quantity: number;
  installDate: Date;
  dossier: { id: string; number: string };
};
export type ArticleValue = {
  id: string;
  name: string;
  reference: string | null;
  unit: string;
  notes: string | null;
  purchases: PurchaseValue[];
  installations: InstallationValue[];
};

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("es-ES");
}

export function NewArticleForm({ hReportId }: { hReportId: string }) {
  const [state, action, pending] = useActionState(createArticle, undefined);
  return (
    <form action={action} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end border-t border-border pt-3">
      <input type="hidden" name="hReportId" value={hReportId} />
      <div className="space-y-1 sm:col-span-2">
        <label className={labelClass}>Artículo</label>
        <input name="name" placeholder="p.ej. Luz de matrícula" required className={inputClass} />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Referencia</label>
        <input name="reference" className={inputClass} />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="border border-border-strong rounded-lg px-3 py-2 text-sm hover:border-accent transition-colors disabled:opacity-50 shrink-0"
        >
          {pending ? "Añadiendo..." : "+ Artículo"}
        </button>
      </div>
      {state?.message && <p className="sm:col-span-4 text-xs text-ink-faint">{state.message}</p>}
    </form>
  );
}

function DeleteArticleButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteArticle, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="text-xs text-danger hover:underline disabled:opacity-50">
        {pending ? "Eliminando..." : "Eliminar artículo"}
      </button>
      {state?.message && <span className="ml-2 text-xs text-ink-faint">{state.message}</span>}
    </form>
  );
}

function DeletePurchaseButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deletePurchase, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="text-xs text-danger hover:underline disabled:opacity-50">
        {pending ? "..." : "Eliminar"}
      </button>
      {state?.message && <span className="ml-2 text-xs text-ink-faint">{state.message}</span>}
    </form>
  );
}

function NewPurchaseForm({ articleId }: { articleId: string }) {
  const [state, action, pending] = useActionState(createPurchase, undefined);
  return (
    <form action={action} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
      <input type="hidden" name="articleId" value={articleId} />
      <div className="space-y-1">
        <label className={labelClass}>Cantidad</label>
        <input name="quantity" type="number" min={1} required className={inputClass} />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Nº albarán</label>
        <input name="deliveryNoteNumber" required className={inputClass} />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Fecha compra</label>
        <input name="purchaseDate" type="date" required className={inputClass} />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Proveedor</label>
        <input name="supplier" className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-accent text-accent-ink font-semibold rounded-lg px-3 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
      >
        {pending ? "Guardando..." : "+ Compra"}
      </button>
      {state?.message && <p className="col-span-2 sm:col-span-5 text-xs text-ink-faint">{state.message}</p>}
    </form>
  );
}

export function ArticleCard({ article }: { article: ArticleValue }) {
  const purchased = article.purchases.reduce((sum, p) => sum + p.quantity, 0);
  const installed = article.installations.reduce((sum, i) => sum + i.quantity, 0);
  const stock = purchased - installed;

  return (
    <details className="border border-border rounded-xl overflow-hidden">
      <summary className="cursor-pointer select-none px-4 py-3 bg-panel text-sm font-medium flex items-center justify-between gap-3">
        <span className="min-w-0">
          {article.name}
          {article.reference && <span className="text-ink-faint"> · {article.reference}</span>}
        </span>
        <span className={`text-xs shrink-0 ${stock < 0 ? "text-danger" : "text-ink-faint"}`}>
          Stock: {stock} {article.unit}
        </span>
      </summary>
      <div className="p-4 space-y-4">
        <NewPurchaseForm articleId={article.id} />

        {article.purchases.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-ink-dim">Compras</h4>
            <ul className="space-y-1 text-sm">
              {article.purchases.map((p) => (
                <li key={p.id} className="flex justify-between items-center border-t border-border pt-1.5">
                  <span>
                    <span className="font-mono">{p.quantity}</span> {article.unit} · albarán{" "}
                    <span className="font-mono">{p.deliveryNoteNumber}</span> · {formatDate(p.purchaseDate)}
                    {p.supplier && <span className="text-ink-faint"> · {p.supplier}</span>}
                  </span>
                  <DeletePurchaseButton id={p.id} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {article.installations.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-ink-dim">Instalaciones</h4>
            <ul className="space-y-1 text-sm">
              {article.installations.map((i) => (
                <li key={i.id} className="flex justify-between items-center border-t border-border pt-1.5">
                  <span>
                    <span className="font-mono">{i.quantity}</span> {article.unit} en{" "}
                    <Link href={`/dossiers/${i.dossier.id}`} className="font-mono underline hover:text-ink">
                      {i.dossier.number}
                    </Link>{" "}
                    · {formatDate(i.installDate)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-1">
          <DeleteArticleButton id={article.id} />
        </div>
      </div>
    </details>
  );
}
