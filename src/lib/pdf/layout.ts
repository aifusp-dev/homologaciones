/**
 * Membrete y CSS compartidos por las plantillas de PDF — A4, con el logo
 * de la empresa (o su nombre si no ha subido logo todavía) en vez de
 * "Carrocerias Yecla" fijo como en el FileMaker original (ver Mejoras del
 * documento de diseño: es la única parte de las plantillas que varía
 * entre clientes).
 */

function esc(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function fmt(value: number | string | Date | null | undefined, unit = ""): string {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) return value.toLocaleDateString("es-ES");
  return `${value}${unit}`;
}

export function documentHead(): string {
  return `<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; color: #1a1a1a; margin: 0; }
  header.doc { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px; margin-bottom: 14px; }
  header.doc .brand { display: flex; align-items: center; gap: 10px; }
  header.doc .brand img { height: 40px; }
  header.doc .brand .name { font-size: 13pt; font-weight: bold; }
  header.doc .title { text-align: center; flex: 1; }
  header.doc .title h1 { font-size: 15pt; margin: 0; text-decoration: underline; }
  header.doc .meta { font-size: 10pt; margin-top: 4px; }
  header.doc .meta b { font-weight: bold; }
  h2.section { font-size: 10.5pt; text-decoration: underline; margin: 14px 0 6px; }
  table.fields { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  table.fields td { padding: 3px 6px; vertical-align: top; font-size: 10pt; }
  table.fields td.label { color: #444; white-space: nowrap; }
  table.fields td.value { font-weight: bold; border-bottom: 1px solid #999; }
  .box { border: 1px solid #1a1a1a; padding: 8px 12px; margin-bottom: 10px; }
  .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 16px; }
  .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px 16px; }
  .kv-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3px 20px; margin-bottom: 10px; }
  .kv-list div { display: flex; justify-content: space-between; gap: 8px; border-bottom: 1px dotted #ccc; padding: 1px 0; font-size: 9.5pt; }
  .kv-list b { text-align: right; }
  .page-break { page-break-before: always; }
  footer.doc { position: fixed; bottom: 8mm; left: 14mm; right: 14mm; font-size: 8pt; color: #666; display: flex; justify-content: space-between; }
</style>`;
}

export function documentHeader(opts: {
  title: string;
  subtitle?: string;
  companyName: string;
  logoUrl?: string | null;
  dossierNumber: string;
  vin?: string | null;
}): string {
  return `<header class="doc">
    <div class="brand">
      ${opts.logoUrl ? `<img src="${esc(opts.logoUrl)}" />` : `<span class="name">${esc(opts.companyName)}</span>`}
    </div>
    <div class="title">
      <h1>${esc(opts.title)}</h1>
      ${opts.subtitle ? `<p style="margin:2px 0 0;font-style:italic;font-size:9.5pt">${esc(opts.subtitle)}</p>` : ""}
      <p class="meta"><b>Expediente:</b> ${esc(opts.dossierNumber)}${opts.vin ? `&nbsp;&nbsp;&nbsp;<b>VIN:</b> ${esc(opts.vin)}` : ""}</p>
    </div>
    <div style="width:40px"></div>
  </header>`;
}

// Pinta una lista label:valor a partir de metadatos tipo DEVICE_TABLES —
// usado por Registro COP para reusar las 16+ tablas de la Fase 4 sin
// replicar el maquetado con diagramas del PDF original de FileMaker (ver
// comentario en copRegister.ts).
export function fieldList(fields: { name: string; label: string }[], data: Record<string, unknown> | null | undefined): string {
  const entries = fields.filter((f) => data?.[f.name] != null && data[f.name] !== "");
  if (entries.length === 0) return `<p style="color:#888;font-size:9.5pt">Sin datos registrados.</p>`;
  return `<div class="kv-list">${entries.map((f) => `<div><span>${f.label}</span><b>${esc(data?.[f.name] as string | number)}</b></div>`).join("")}</div>`;
}

export function documentShell(headHtml: string, bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">${documentHead()}${headHtml}</head><body>${bodyHtml}</body></html>`;
}
