import { documentHeader, documentShell, fieldList, fmt } from "../layout";
import { DEVICE_TABLES, type DeviceTableKey } from "@/lib/deviceFields";

export type CopRegisterData = {
  companyName: string;
  logoUrl: string | null;
  dossierNumber: string;
  vin: string | null;
  brand: string | null;
  bodyType: string | null;
  category: string | null;
  mmta: number | null;
  totalLength: number | null;
  width: number | null;
  responsibleName: string | null;
  actNumbers: {
    lightingActNumber: string | null;
    spraySuppressionActNumber: string | null;
    massesActNumber: string | null;
    rearPlateActNumber: string | null;
    rearProtectionActNumber: string | null;
    emcActNumber: string | null;
  } | null;
  coverSheet: Record<string, unknown> | null;
  vinLocation: string | null;
  firstStagePlateLocation: string | null;
  finalStagePlateLocation: string | null;
  platesInscriptions: Record<string, unknown> | null;
  registrationPlates: Record<string, unknown> | null;
  massesSummary: { label: string; value: string }[];
  deviceRecords: Partial<Record<DeviceTableKey, Record<string, unknown> | null>>;
};

const ACT_LINES: { key: string; label: string }[] = [
  { key: "lightingActNumber", label: "Alumbrado y señalización 48R08" },
  { key: "spraySuppressionActNumber", label: "Dispositivos antiproyección UE 109/2011" },
  { key: "massesActNumber", label: "Masas y dimensiones UE 1230/2012" },
  { key: "rearPlateActNumber", label: "Placas de matrícula traseras UE 1003/2010" },
  { key: "rearProtectionActNumber", label: "Protección trasera 58R03" },
  { key: "emcActNumber", label: "Compatibilidad electromagnética 10R06" },
];

const LIGHTING_TABLES: DeviceTableKey[] = [
  "lightingSide",
  "lightingPosition",
  "lightingReflector",
  "lightingBrake",
  "lightingTurnSignal",
  "lightingRearOutlineMarker",
  "lightingFrontOutlineMarker",
  "lightingPlate",
  "lightingReverse",
  "lightingFog",
];

function deviceSection(d: CopRegisterData, key: DeviceTableKey): string {
  const config = DEVICE_TABLES[key];
  return `
    <h2 class="section">${config.label}</h2>
    ${fieldList(config.fields, d.deviceRecords[key])}
  `;
}

// Calca REGISTROCOP-MENU.png: 10 sub-documentos bundlados en un único PDF
// (Portada, Placas e Inscripciones, Placas de Matrícula, Alumbrado y
// Señalización, Protección Lateral, Protección Trasera, Antiproyección,
// Compatibilidad Electromagnética, Dispositivos de Acoplamiento, Masas y
// Dimensiones). El original de FileMaker maquetaba cada sub-documento como
// un formulario con diagramas técnicos propios del Reglamento (ver
// REGISTROCOP-ALUMBRADOYSEÑALIZADO*.png) — aquí se prioriza que el dato
// esté completo y correcto sobre replicar esos diagramas: cada sección usa
// una tabla label:valor genérica (fieldList, reusando el mismo
// DEVICE_TABLES de la Fase 4) en vez de re-dibujar el formulario oficial.
// No hace falta fusionar PDFs por separado — todo es un único documento
// HTML con saltos de página CSS, renderizado de una vez por Chromium.
export function renderCopRegister(d: CopRegisterData): string {
  const header = documentHeader({
    title: "REGISTRO DE LA CONFORMIDAD DE LA PRODUCCIÓN",
    companyName: d.companyName,
    logoUrl: d.logoUrl,
    dossierNumber: d.dossierNumber,
    vin: d.vin,
  });

  const actLines = ACT_LINES.filter((l) => d.actNumbers?.[l.key as keyof NonNullable<typeof d.actNumbers>]);

  const cover = `
    ${header}
    <table class="fields">
      <tr>
        <td class="label">Operario que realiza la toma de datos:</td><td class="value">${fmt(d.coverSheet?.dataCollectionOperator as string)}</td>
        <td class="label">Fecha de toma de datos:</td><td class="value">${fmt(d.coverSheet?.dataCollectionDate as string)}</td>
      </tr>
      <tr>
        <td class="label">Marca:</td><td class="value">${fmt(d.brand)}</td>
        <td class="label">Tipo de carrozado:</td><td class="value">${fmt(d.bodyType)}</td>
      </tr>
      <tr>
        <td class="label">Categoría:</td><td class="value">${fmt(d.category)}</td>
        <td class="label">MMTA (kg):</td><td class="value">${fmt(d.mmta)}</td>
      </tr>
      <tr>
        <td class="label">Longitud total (mm):</td><td class="value">${fmt(d.totalLength)}</td>
        <td class="label">Ancho total (mm):</td><td class="value">${fmt(d.width)}</td>
      </tr>
    </table>

    <h2 class="section">Actos reglamentarios / Informes H:</h2>
    <div class="box" style="min-height:60px">
      ${actLines.length > 0 ? actLines.map((l) => `<div style="display:flex;justify-content:space-between"><span>${l.label}:</span><i>${fmt(d.actNumbers?.[l.key as keyof NonNullable<typeof d.actNumbers>])}</i></div>`).join("") : ""}
    </div>

    <h2 class="section">Fecha última revisión equipos de medida:</h2>
    <p>${fmt(d.coverSheet?.measurementEquipmentReviewDate as string)}</p>

    <table class="fields" style="margin-top:30px"><tr>
      <td class="label">Responsable:</td><td class="value">${fmt(d.responsibleName)}</td>
    </tr></table>
  `;

  const platesInscriptions = `
    <h1 style="font-size:13pt">UE 2018/858 — Placas e inscripciones</h1>
    <div class="kv-list">
      <div><span>Ubicación del VIN</span><b>${fmt(d.vinLocation)}</b></div>
      <div><span>Ubicación placa fabricante 1ª fase</span><b>${fmt(d.firstStagePlateLocation)}</b></div>
      <div><span>Ubicación placa fabricante 2ª fase</span><b>${fmt(d.finalStagePlateLocation)}</b></div>
    </div>
    ${fieldList(DEVICE_TABLES.platesInscriptions.fields, d.platesInscriptions)}
  `;

  const registrationPlates = `
    <h1 style="font-size:13pt">UE 2021/535 — Placas de matrículas</h1>
    ${fieldList(DEVICE_TABLES.registrationPlates.fields, d.registrationPlates)}
  `;

  const lightingSections = LIGHTING_TABLES.map((key) => deviceSection(d, key)).join("");

  const massesSection = `
    <h1 style="font-size:13pt">Reglamento (UE) Nº 1230/2012 — Masas y dimensiones</h1>
    <div class="kv-list">
      ${d.massesSummary.map((m) => `<div><span>${m.label}</span><b>${m.value}</b></div>`).join("")}
    </div>
  `;

  const body = `
    ${cover}
    <div class="page-break">${platesInscriptions}</div>
    <div class="page-break">${registrationPlates}</div>
    <div class="page-break">
      <h1 style="font-size:13pt">48R08 — Alumbrado y señalización</h1>
      ${lightingSections}
    </div>
    <div class="page-break">${deviceSection(d, "lateralProtection")}</div>
    <div class="page-break">${deviceSection(d, "rearProtection")}</div>
    <div class="page-break">${deviceSection(d, "spraySuppression")}</div>
    <div class="page-break">${deviceSection(d, "electromagneticCompatibility")}</div>
    <div class="page-break">${deviceSection(d, "couplingDevice")}</div>
    <div class="page-break">${massesSection}</div>
  `;

  return documentShell("", body);
}
