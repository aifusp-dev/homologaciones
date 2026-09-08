import { documentHeader, documentShell, fmt } from "../layout";

export type BodyworkCertificateData = {
  companyName: string;
  logoUrl: string | null;
  dossierNumber: string;
  vin: string | null;
  brand: string | null;
  type: string | null;
  variant: string | null;
  version: string | null;
  commercialName: string | null;
  approvalNumber: string | null;
  bodyType: string | null;
  isSemiTrailer: boolean;
  heightFromGround: number | null;
  width: number | null;
  totalLength: number | null;
  rearOverhang: number | null;
  mom: number | null;
  mma: number | null;
  mmaCouplingPoint: number | null;
  mmtaRequested: number | null;
  actNumbers: {
    lightingActNumber: string | null;
    spraySuppressionActNumber: string | null;
    massesActNumber: string | null;
    rearPlateActNumber: string | null;
    rearProtectionActNumber: string | null;
    emcActNumber: string | null;
  } | null;
  rearProtectionBrand: string | null;
  rearProtectionModel: string | null;
  responsibleName: string | null;
};

const ACT_LINES: { key: keyof NonNullable<BodyworkCertificateData["actNumbers"]>; label: string }[] = [
  { key: "lightingActNumber", label: "Alumbrado y señalización 48R08" },
  { key: "spraySuppressionActNumber", label: "Dispositivos antiproyección UE 109/2011" },
  { key: "massesActNumber", label: "Masas y dimensiones UE 1230/2012" },
  { key: "rearPlateActNumber", label: "Placas de matrícula traseras UE 1003/2010" },
  { key: "rearProtectionActNumber", label: "Protección trasera 58R03" },
  { key: "emcActNumber", label: "Compatibilidad electromagnética 10R06" },
];

// Calca BackEnd/FrontEnd/PDF-CERTIFICADOCARROZADO*.png. Las 3 variantes que
// tenía FileMaker (BASE / TRIAXLE+GRUA / SEMIRREMOLQUE) solo diferían en qué
// campos de masas se muestran — aquí se resuelve con isSemiTrailer, ya que
// BASE y TRIAXLE renderizan igual. La caja de "Actos reglamentarios" ya no
// va fija por variante: pinta solo las líneas que el operario haya
// rellenado en RegulatoryActNumbers (antes vacía con TODO).
export function renderBodyworkCertificate(d: BodyworkCertificateData): string {
  const header = documentHeader({
    title: "CERTIFICADO DE CARROZADO",
    companyName: d.companyName,
    logoUrl: d.logoUrl,
    dossierNumber: d.dossierNumber,
    vin: d.vin,
  });

  const actLines = ACT_LINES.filter((l) => d.actNumbers?.[l.key]);

  const massesBlock = d.isSemiTrailer
    ? `
      <div>MOM kg: <b>${fmt(d.mom)}</b></div>
      <div>MMA kg: <b>${fmt(d.mma)}</b></div>
      <div>MMA kg en punto de acoplamiento (solicitada): <b>${fmt(d.mmaCouplingPoint)}</b></div>
      <div>MMTA kg (solicitada): <b>${fmt(d.mmtaRequested)}</b></div>
    `
    : `
      <div>MOM kg: <b>${fmt(d.mom)}</b></div>
    `;

  const body = `
    ${header}
    <p style="margin-top:18px">Expresamente autorizado por la empresa <b>${d.companyName}</b>, certifica que el vehículo:</p>
    <p>Certifica que, el vehículo:</p>
    <table class="fields">
      <tr><td class="label">Marca:</td><td class="value">${fmt(d.brand)}</td></tr>
      <tr><td class="label">Tipo / Variante / Versión:</td><td class="value">${fmt(d.type)} / ${fmt(d.variant)} / ${fmt(d.version)}</td></tr>
      <tr><td class="label">Denominación comercial:</td><td class="value">${fmt(d.commercialName)}</td></tr>
      <tr><td class="label">Contraseña de homologación:</td><td class="value">${fmt(d.approvalNumber)}</td></tr>
      <tr><td class="label">VIN:</td><td class="value">${fmt(d.vin)}</td></tr>
    </table>

    <p>Ha sido sometido a su completado mediante carrozado tipo <b>${fmt(d.bodyType)}</b>, siguiendo las
    instrucciones de carrozado de: <b>${fmt(d.brand)}</b>, quedando con las siguientes características técnicas:</p>

    <table class="fields">
      <tr><td class="label">Clasificación nacional:</td><td class="value"></td></tr>
      <tr><td class="label">Clasificación europea:</td><td class="value"></td></tr>
      <tr><td class="label">Altura total desde el suelo mm:</td><td class="value">${fmt(d.heightFromGround)}</td></tr>
      <tr><td class="label">Ancho total mm:</td><td class="value">${fmt(d.width)}</td></tr>
      ${!d.isSemiTrailer ? `<tr><td class="label">Largo total mm:</td><td class="value">${fmt(d.totalLength)}</td></tr>` : ""}
      ${!d.isSemiTrailer ? `<tr><td class="label">Voladizo posterior mm:</td><td class="value">${fmt(d.rearOverhang)}</td></tr>` : ""}
    </table>

    <div class="box grid3">${massesBlock}</div>

    <h2 class="section">Actos reglamentarios / Informes H que le afectan y de los que disponemos:</h2>
    <div class="box" style="min-height:70px">
      ${actLines.length > 0
        ? actLines
            .map((l) => `<div style="display:flex;justify-content:space-between"><span>${l.label}:</span><i>${fmt(d.actNumbers?.[l.key])}</i></div>`)
            .join("")
        : ""}
    </div>

    <h2 class="section">Dispositivos que instala:</h2>
    <div class="box grid3" style="min-height:60px">
      <div>Protección trasera, marca: <b>${fmt(d.rearProtectionBrand)}</b></div>
      <div>Modelo: <b>${fmt(d.rearProtectionModel)}</b></div>
      <div></div>
    </div>

    <table class="fields" style="margin-top:40px"><tr>
      <td class="label">Nombre responsable:</td><td class="value">${fmt(d.responsibleName)}</td>
      <td class="label">Fecha informe:</td><td class="value"></td>
    </tr></table>
  `;

  return documentShell("", body);
}
