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
};

// Calca BackEnd/FrontEnd/PDF-ORDENFABRICACION.png. Las secciones de
// "Actos reglamentarios" y "Material de alumbrado y señalización" quedan
// en blanco hasta migrar el grupo de dispositivos/señalización (Fase 4,
// 16 tablas) — fuera de alcance de esta fase.
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
    <div class="box" style="min-height:90px"></div>

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
    <div class="box" style="min-height:220px"></div>
  `;

  return documentShell("", body);
}
