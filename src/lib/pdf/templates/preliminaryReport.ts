import { documentHeader, documentShell, fmt } from "../layout";

export type PreliminaryReportData = {
  companyName: string;
  logoUrl: string | null;
  dossierNumber: string;
  vin: string | null;
  brand: string | null;
  bodyType: string | null;
  mma: number | null;
  mmta: number | null;
  tare: number | null;
  axle1Tare: number | null;
  axle2Tare: number | null;
  mmaAxle1: number | null;
  mmtaAxle1: number | null;
  mmaAxle2: number | null;
  mmtaAxle2: number | null;
  staticCouplingMass: number | null;
  totalLength: number | null;
  width: number | null;
  heightFromGround: number | null;
  rearOverhang: number | null;
  responsibleName: string | null;
};

// Calca BackEnd/FrontEnd/PDF-INFORMEPREVIO.png. Los recuadros de "Actos
// reglamentarios" y "Dispositivos que instala NO de 1ª fase" quedan en
// blanco hasta que se migre el grupo Documentación (Material_actosreglamentarios) —
// fuera de alcance de esta fase.
export function renderPreliminaryReport(d: PreliminaryReportData): string {
  const header = documentHeader({
    title: "INFORME PREVIO A COMPLETADO",
    companyName: d.companyName,
    logoUrl: d.logoUrl,
    dossierNumber: d.dossierNumber,
    vin: d.vin,
  });

  const body = `
    ${header}
    <p>Se informa que, según los datos del chasis cabina en nuestro poder y teniendo en cuenta las
    características del completado que se pretende, este se tramitará como homologación individual
    nacional en virtud al reglamento; UE 2018/858, RD 750/2010 y normas de carrozado de:
    <b>${d.brand ?? "—"}</b></p>
    <p>Este informe pone a disposición del cliente y concesionario para su revisión y posibles
    correcciones si se da el caso.</p>

    <table class="fields"><tr>
      <td class="label">Tipo de carrozado:</td><td class="value">${fmt(d.bodyType)}</td>
      <td class="label">Clasificación nacional:</td><td class="value"></td>
      <td class="label">Clasificación europea:</td><td class="value"></td>
    </tr></table>

    <h2 class="section">Actos reglamentarios / Informes H que le afectan y de los que disponemos:</h2>
    <div class="box" style="min-height:90px"></div>

    <h2 class="section">Dispositivos que instala NO de 1ª fase:</h2>
    <div class="box" style="min-height:70px"></div>

    <h2 class="section">Masas:</h2>
    <div class="box grid4">
      <div>MMA kg: <b>${fmt(d.mma)}</b></div>
      <div>MMTA kg: <b>${fmt(d.mmta)}</b></div>
      <div>Tara kg: <b>${fmt(d.tare)}</b></div>
      <div>Eje 1º kg: <b>${fmt(d.axle1Tare)}</b></div>
      <div>MMA eje 1º kg: <b>${fmt(d.mmaAxle1)}</b></div>
      <div>MMTA eje 1º kg: <b>${fmt(d.mmtaAxle1)}</b></div>
      <div>Eje 2º kg: <b>${fmt(d.axle2Tare)}</b></div>
      <div>M.Estatica kg: <b>${fmt(d.staticCouplingMass)}</b></div>
      <div>MMA eje 2º kg: <b>${fmt(d.mmaAxle2)}</b></div>
      <div>MMTA eje 2º kg: <b>${fmt(d.mmtaAxle2)}</b></div>
    </div>

    <h2 class="section">Dimensiones:</h2>
    <div class="box grid4">
      <div>Largo total mm: <b>${fmt(d.totalLength)}</b></div>
      <div>Ancho total mm: <b>${fmt(d.width)}</b></div>
      <div>Altura total desde el suelo mm: <b>${fmt(d.heightFromGround)}</b></div>
      <div>Voladizo posterior mm: <b>${fmt(d.rearOverhang)}</b></div>
    </div>

    <table class="fields" style="margin-top:40px"><tr>
      <td class="label">Nombre responsable:</td><td class="value">${fmt(d.responsibleName)}</td>
      <td class="label">Fecha informe previo:</td><td class="value"></td>
    </tr></table>
  `;

  return documentShell("", body);
}
