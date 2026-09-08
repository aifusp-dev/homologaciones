import { documentHeader, documentShell, fmt } from "../layout";

export type ManufacturingOrderData = {
  companyName: string;
  logoUrl: string | null;
  dossierNumber: string;
  vin: string | null;
  bodyType: string | null;
  totalLength: number | null;
  width: number | null;
  heightFromGround: number | null;
  rearOverhang: number | null;
  liftPlatformBrand: string | null;
  liftPlatformCapacity: number | null;
  rearProtectionBrand: string | null;
  rearProtectionModel: string | null;
  couplingDeviceBrand: string | null;
  actNumbers: {
    lightingActNumber: string | null;
    spraySuppressionActNumber: string | null;
    massesActNumber: string | null;
    rearPlateActNumber: string | null;
    rearProtectionActNumber: string | null;
    emcActNumber: string | null;
  } | null;
  lightingMaterial: {
    sideOutlineMarkerLamp: string | null;
    rearOutlineMarkerLamp: string | null;
    frontOutlineMarkerLamp: string | null;
    rearHangingOutlineMarkerLamp: string | null;
    plateLight: string | null;
    thirdBrakeLight: string | null;
    v23Red: string | null;
    v23White: string | null;
    spraySuppressionFlap: string | null;
    mudguard: string | null;
    lateralProtectionMaterial: string | null;
  } | null;
};

const ACT_LINES: { key: string; label: string }[] = [
  { key: "lightingActNumber", label: "Alumbrado y señalización 48R08" },
  { key: "spraySuppressionActNumber", label: "Dispositivos antiproyección UE 109/2011" },
  { key: "massesActNumber", label: "Masas y dimensiones UE 1230/2012" },
  { key: "rearPlateActNumber", label: "Placas de matrícula traseras UE 1003/2010" },
  { key: "rearProtectionActNumber", label: "Protección trasera 58R03" },
  { key: "emcActNumber", label: "Compatibilidad electromagnética 10R06" },
];

const LIGHTING_MATERIAL_LINES: { key: string; label: string }[] = [
  { key: "sideOutlineMarkerLamp", label: "Piloto gálibo lateral" },
  { key: "rearOutlineMarkerLamp", label: "Piloto gálibo trasero" },
  { key: "frontOutlineMarkerLamp", label: "Piloto gálibo delantero" },
  { key: "rearHangingOutlineMarkerLamp", label: "Piloto gálibo trasero colgante" },
  { key: "plateLight", label: "Luz matrícula" },
  { key: "thirdBrakeLight", label: "Tercera luz freno" },
  { key: "v23Red", label: "V23 roja" },
  { key: "v23White", label: "V23 blanca" },
  { key: "spraySuppressionFlap", label: "Faldilla absorbente" },
  { key: "mudguard", label: "Guardabarros" },
  { key: "lateralProtectionMaterial", label: "Protección lateral" },
];

// Calca BackEnd/FrontEnd/PDF-ORDENFABRICACION.png. Las secciones de
// "Actos reglamentarios" y "Material de alumbrado y señalización" ya se
// alimentan de RegulatoryActNumbers/LightingMaterialChecklist (Fase 5),
// antes en blanco con TODO.
export function renderManufacturingOrder(d: ManufacturingOrderData): string {
  const header = documentHeader({
    title: "ORDEN DE FABRICACIÓN",
    subtitle: "Parte específica actos reglamentarios",
    companyName: d.companyName,
    logoUrl: d.logoUrl,
    dossierNumber: d.dossierNumber,
    vin: d.vin,
  });

  const body = `
    ${header}
    <table class="fields"><tr>
      <td class="label">Tipo de carrozado:</td><td class="value">${fmt(d.bodyType)}</td>
      <td class="label">Clasificación nacional:</td><td class="value"></td>
      <td class="label">Clasificación europea:</td><td class="value"></td>
    </tr></table>

    <div class="box grid4">
      <div>Largo total mm: <b>${fmt(d.totalLength)}</b></div>
      <div>Ancho total mm: <b>${fmt(d.width)}</b></div>
      <div>Altura total desde el suelo mm: <b>${fmt(d.heightFromGround)}</b></div>
      <div>Voladizo posterio mm: <b>${fmt(d.rearOverhang)}</b></div>
    </div>

    <h2 class="section">Actos reglamentarios / Informes H que le afectan:</h2>
    <div class="box" style="min-height:90px">
      ${ACT_LINES.filter((l) => d.actNumbers?.[l.key as keyof NonNullable<typeof d.actNumbers>])
        .map(
          (l) =>
            `<div style="display:flex;justify-content:space-between"><span>${l.label}:</span><i>${fmt(d.actNumbers?.[l.key as keyof NonNullable<typeof d.actNumbers>])}</i></div>`
        )
        .join("")}
    </div>

    <h2 class="section">Dispositivos UTIs que instala:</h2>
    <div class="box grid3">
      <div>Plataforma elevadora, marca: <b>${fmt(d.liftPlatformBrand)}</b></div>
      <div>Capacidad de elevación KG: <b>${fmt(d.liftPlatformCapacity)}</b></div>
      <div></div>
      <div>Protección trasera, marca: <b>${fmt(d.rearProtectionBrand)}</b></div>
      <div>Modelo: <b>${fmt(d.rearProtectionModel)}</b></div>
      <div></div>
      <div>Dispositivo de acoplamiento, marca: <b>${fmt(d.couplingDeviceBrand)}</b></div>
      <div>Modelo:</div>
      <div>Otros:</div>
    </div>

    <h2 class="section">Material de alumbrado y señalización:</h2>
    <div class="box grid3" style="min-height:120px">
      ${LIGHTING_MATERIAL_LINES.filter((l) => d.lightingMaterial?.[l.key as keyof NonNullable<typeof d.lightingMaterial>])
        .map(
          (l) =>
            `<div>${l.label}: <b>${fmt(d.lightingMaterial?.[l.key as keyof NonNullable<typeof d.lightingMaterial>])}</b></div>`
        )
        .join("")}
    </div>
  `;

  return documentShell("", body);
}
