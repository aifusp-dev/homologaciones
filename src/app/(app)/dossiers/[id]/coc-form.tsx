"use client";

import { useActionState, useRef, useState } from "react";
import { updateCoc } from "@/app/actions/coc";
import { COC_FIELDS, COC_SECTIONS, type CocSection } from "@/lib/cocFields";
import { parseEitvXml } from "@/lib/eitvImport";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "text-xs text-ink-dim";

type CocValues = Record<string, string | number | boolean | Date | null | undefined>;

function toInputValue(value: unknown, type: string): string {
  if (value === null || value === undefined) return "";
  if (type === "date" && value instanceof Date) return value.toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

// Campos "...Axle1/2/3" — con el nº de ejes ya sabemos cuáles no aplican
// (ver conversación: menos ruido visual sin perder datos). Se ocultan con
// CSS, nunca se quitan del formulario ni se deshabilitan: un input oculto
// pero presente sigue viajando en el FormData al guardar, así que si ya
// había un dato en el eje 3 y luego se pone el coche a 2 ejes, ese dato NO
// se pierde — solo deja de mostrarse mientras el eje 3 no aplique.
function axleIndexOf(fieldName: string): number | null {
  const m = fieldName.match(/Axle([1-3])$/);
  return m ? Number(m[1]) : null;
}

export function CocForm({
  dossierId,
  coc,
  fiscalHorsepower,
}: {
  dossierId: string;
  coc: CocValues | null;
  fiscalHorsepower: number | null;
}) {
  const [state, action, pending] = useActionState(updateCoc, undefined);
  const [axleCount, setAxleCount] = useState<number | null>(
    typeof coc?.axleCount === "number" ? coc.axleCount : coc?.axleCount ? Number(coc.axleCount) : null
  );
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const sections = Object.keys(COC_SECTIONS) as CocSection[];

  async function handleImportXml(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const text = await file.text();
    const result = parseEitvXml(text, file.name);
    if (!result.ok) {
      setImportMessage(`No se pudo importar: ${result.error}`);
      return;
    }

    const entries = Object.entries(result.values);
    if (entries.length === 0) {
      setImportMessage(`"${result.fileName}" no traía ningún campo reconocido.`);
      return;
    }

    for (const [fieldName, value] of entries) {
      const input = formRef.current?.elements.namedItem(fieldName);
      if (input instanceof HTMLInputElement) {
        input.value = value;
        if (fieldName === "axleCount") setAxleCount(Number(value) || null);
      }
    }

    // Abre la sección donde han caído los campos importados para que se
    // vean sin tener que buscarlos.
    const identificacion = formRef.current?.querySelector<HTMLDetailsElement>('details[data-section="identificacion"]');
    if (identificacion) identificacion.open = true;

    setImportMessage(`Importados ${entries.length} campos desde "${result.fileName}". Revisa y pulsa Guardar COC.`);
  }

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="dossierId" value={dossierId} />

      <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 bg-panel/40">
        <label className="text-sm font-medium text-ink shrink-0">Importar XML del fabricante</label>
        <input
          type="file"
          accept=".xml,text/xml,application/xml"
          onChange={handleImportXml}
          className="text-xs text-ink-faint file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-border-strong file:bg-panel file:text-ink file:text-xs file:cursor-pointer"
        />
      </div>
      {importMessage && <p className="text-sm text-ink-dim">{importMessage}</p>}

      {sections.map((section) => {
        const fields = COC_FIELDS.filter((f) => f.section === section);
        const hiddenCount = fields.filter((f) => {
          const axleIndex = axleIndexOf(f.name);
          return axleIndex !== null && axleCount !== null && axleIndex > axleCount;
        }).length;
        return (
          <details key={section} data-section={section} className="border border-border rounded-xl overflow-hidden group">
            <summary className="cursor-pointer select-none px-4 py-3 bg-panel text-sm font-medium flex items-center justify-between">
              {COC_SECTIONS[section]}
              <span className="text-ink-faint text-xs">
                {fields.length - hiddenCount} campos
                {hiddenCount > 0 && ` · ${hiddenCount} ocultos (eje no aplicable)`}
              </span>
            </summary>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {section === "motor" && (
                <div className="col-span-full text-xs text-ink-dim bg-panel/60 rounded-lg px-3 py-2">
                  Potencia fiscal (calculada): <b className="text-ink">{fiscalHorsepower ?? "—"}</b> CV
                </div>
              )}
              {fields.map((field) => {
                const axleIndex = axleIndexOf(field.name);
                const hiddenByAxleCount = axleIndex !== null && axleCount !== null && axleIndex > axleCount;
                return (
                  <div key={field.name} className={`space-y-1 ${hiddenByAxleCount ? "hidden" : ""}`}>
                    <label className={labelClass}>
                      <span className="text-ink-faint mr-1">{field.clause}</span>
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      type={field.type === "date" ? "date" : field.type === "text" ? "text" : "text"}
                      inputMode={field.type === "int" || field.type === "float" ? "decimal" : undefined}
                      defaultValue={toInputValue(coc?.[field.name], field.type)}
                      onChange={field.name === "axleCount" ? (e) => {
                        const n = Number(e.target.value);
                        setAxleCount(Number.isFinite(n) && e.target.value.trim() !== "" ? n : null);
                      } : undefined}
                      className={inputClass}
                    />
                  </div>
                );
              })}
            </div>
          </details>
        );
      })}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar COC"}
        </button>
        {state?.message && <p className="text-sm text-ink-dim">{state.message}</p>}
      </div>
    </form>
  );
}
