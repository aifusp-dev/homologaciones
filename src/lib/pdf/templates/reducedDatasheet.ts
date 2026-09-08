import { documentHeader, documentShell, fmt } from "../layout";

export type ReducedDatasheetData = {
  companyName: string;
  companyAddress: string | null;
  logoUrl: string | null;
  dossierNumber: string;
  vin: string | null;
  category: string | null;
  brand: string | null;
  type: string | null;
  variant: string | null;
  version: string | null;
  commercialName: string | null;
  manufacturerName: string | null;
  manufacturerAddress: string | null;
  baseApprovalNumber: string | null;
  baseApprovalDate: string | null;
  completedApprovalNumber: string | null;
  completedApprovalDate: string | null;
  basePlateLocation: string | null;
  finalStagePlateLocation: string | null;
  vinLocation: string | null;

  axleCount: number | null;
  wheelCount: number | null;
  drivenAxleCount: number | null;
  drivenAxleLocation: number | null;
  drivenAxleInterconnection: string | null;

  axleDistance0to1: number | null;
  axleDistance1to2: number | null;
  axleDistance2to3: number | null;
  trackWidthAxle1: number | null;
  trackWidthAxle2: number | null;
  trackWidthAxle3: number | null;
  totalLength: number | null;
  maxPermissibleLength: number | null;
  width: number | null;
  maxPermissibleWidth: number | null;
  heightFromGround: number | null;
  rearOverhang: number | null;
  mom: number | null;
  minCompletedMass: number | null;
  maxTechnicallyPermissibleMass: number | null;
  maxLadenMassRegistration: number | null;
  maxTechnicallyPermissibleMassAxle1: number | null;
  maxTechnicallyPermissibleMassAxle2: number | null;
  maxTechnicallyPermissibleMassAxle3: number | null;
  maxLadenMassRegistrationAxle1: number | null;
  maxLadenMassRegistrationAxle2: number | null;
  maxLadenMassRegistrationAxle3: number | null;
  maxTechnicallyPermissibleMassCombination: number | null;
  maxLadenMassRegistrationCombination: number | null;
  drawBarTrailerMass: number | null;
  centreAxleTrailerMass: number | null;
  unbrakedTrailerMass: number | null;
  staticCouplingPointMass: number | null;

  engineManufacturer: string | null;
  engineMarkingCode: string | null;
  operatingPrinciple: string | null;
  cylinderCount: number | null;
  cylinderArrangement: string | null;
  displacement: number | null;
  pureElectric: string | null;
  hybrid: string | null;
  maxNetPower: number | null;
  gearboxType: string | null;
  gearCount: string | null;
  frontSuspension: string | null;
  rearSuspension: string | null;
  tireSpecAxle1: string | null;
  tireSpecAxle2: string | null;
  tireSpecAxle3: string | null;
  steeringMethod: string | null;
  serviceBraking: string | null;
  secondaryBraking: string | null;
  parkingBraking: string | null;
  abs: string | null;

  bodyType: string | null;
  indirectVision: string | null;
  doorCountAndArrangement: string | null;
  seatCount: number | null;
  couplingDeviceApprovalNumber: string | null;
  frontProtection: string | null;

  maxSpeed: number | null;
  stationaryNoiseLevel: number | null;
  stationaryNoiseLevelRpm: number | null;
  drivingNoiseLevel: number | null;
  emissionsLevel: string | null;
  specificCo2Emissions: number | null;
  fiscalHorsepower: number | null;
  cabDeflector: string | null;
  typeApprovalOptions: string | null;
  remarks: string | null;

  responsibleName: string | null;
};

function kv(label: string, value: string): string {
  return `<div><span>${label}</span><b>${value}</b></div>`;
}

function section(title: string, rows: string): string {
  return `<h2 class="section">${title}</h2><div class="kv-list">${rows}</div>`;
}

function tireSpec(width: number | null, aspect: number | null, rim: number | null, load: number | null, speed: string | null): string | null {
  if (width == null && aspect == null && rim == null) return null;
  return `${fmt(width)}/${fmt(aspect)} R${fmt(rim)} ${fmt(load)}${speed ?? ""}`;
}

export { tireSpec };

// Calca BackEnd/FrontEnd/PDF-FICHAREDUCIDA*.png. FileMaker tenía 6
// paginaciones distintas según categoría (N1/N2-N3) y configuración
// (estándar/grúa/3 ejes/semirremolque) — aquí se construye UNA plantilla
// adaptativa: la práctica totalidad de los ~90 campos ya vivían en Coc
// (sección FR_*, portada en Fase 1) y solo faltaban 4 (ver Bodywork/Coc,
// Fase 5). Cada bloque de "distancia entre ejes/vía/masas por eje" se
// oculta solo si no tiene dato, en vez de mantener 6 layouts casi
// idénticos — simplificación deliberada, documentada en la memoria del
// proyecto.
export function renderReducedDatasheet(d: ReducedDatasheetData): string {
  const header = documentHeader({
    title: "FICHA REDUCIDA",
    subtitle: "Para vehículos completados categoría M1 y N1-N2-N3 (Anexo 3 Parte III RD 750/2010)",
    companyName: d.companyName,
    logoUrl: d.logoUrl,
    dossierNumber: d.dossierNumber,
    vin: d.vin,
  });

  const body = `
    ${header}

    ${section(
      "Identificación",
      [
        kv("Marca", fmt(d.brand)),
        kv("Tipo / variante / versión", `${fmt(d.type)} / ${fmt(d.variant)} / ${fmt(d.version)}`),
        kv("Denominación comercial", fmt(d.commercialName)),
        kv("Categoría del vehículo", fmt(d.category)),
        kv("Nombre fabricante vehículo base", fmt(d.manufacturerName)),
        kv("Dirección fabricante vehículo base", fmt(d.manufacturerAddress)),
        kv("Nombre fabricante última fase", fmt(d.companyName)),
        kv("Dirección fabricante última fase", fmt(d.companyAddress)),
        kv("Emplazamiento placa fab. vehículo base", fmt(d.basePlateLocation)),
        kv("Emplazamiento placa fab. última fase", fmt(d.finalStagePlateLocation)),
        kv("VIN", fmt(d.vin)),
        kv("Emplazamiento del VIN", fmt(d.vinLocation)),
        kv("Nº homologación CE vehículo base", fmt(d.baseApprovalNumber)),
        kv("Fecha homologación CE vehículo base", fmt(d.baseApprovalDate)),
        kv("Nº homologación CE vehículo completado", fmt(d.completedApprovalNumber)),
        kv("Fecha homologación CE vehículo completado", fmt(d.completedApprovalDate)),
      ].join("")
    )}

    ${section(
      "Constitución general del vehículo",
      [
        kv("Nº de ejes / ruedas", `${fmt(d.axleCount)} / ${fmt(d.wheelCount)}`),
        kv("Ejes motores (nº / posición)", `${fmt(d.drivenAxleCount)} / ${fmt(d.drivenAxleLocation)}`),
        kv("Interconexión ejes motores", fmt(d.drivenAxleInterconnection)),
      ].join("")
    )}

    <h1 class="page-break" style="font-size:13pt">Masas y dimensiones</h1>
    ${section(
      "Dimensiones",
      [
        kv("Distancia entre ejes 1-2 / 2-3 (mm)", `${fmt(d.axleDistance1to2)} / ${fmt(d.axleDistance2to3)}`),
        kv("Vía ejes 1º / 2º / 3º (mm)", `${fmt(d.trackWidthAxle1)} / ${fmt(d.trackWidthAxle2)} / ${fmt(d.trackWidthAxle3)}`),
        kv("Longitud (mm)", fmt(d.totalLength)),
        kv("Longitud máxima admisible completado (mm)", fmt(d.maxPermissibleLength)),
        kv("Anchura (mm)", fmt(d.width)),
        kv("Anchura máxima admisible completado (mm)", fmt(d.maxPermissibleWidth)),
        kv("Altura en orden de marcha (mm)", fmt(d.heightFromGround)),
        kv("Voladizo trasero (mm)", fmt(d.rearOverhang)),
      ].join("")
    )}
    ${section(
      "Masas",
      [
        kv("MOM — masa en orden de marcha (kg)", fmt(d.mom)),
        kv("Masa mínima admisible completado (kg)", fmt(d.minCompletedMass)),
        kv("MMTA (kg)", fmt(d.maxTechnicallyPermissibleMass)),
        kv("Masa máx. en carga prevista matriculación (kg)", fmt(d.maxLadenMassRegistration)),
        kv("MMTA por ejes 1º/2º/3º (kg)", `${fmt(d.maxTechnicallyPermissibleMassAxle1)} / ${fmt(d.maxTechnicallyPermissibleMassAxle2)} / ${fmt(d.maxTechnicallyPermissibleMassAxle3)}`),
        kv("MMA por ejes 1º/2º/3º (kg)", `${fmt(d.maxLadenMassRegistrationAxle1)} / ${fmt(d.maxLadenMassRegistrationAxle2)} / ${fmt(d.maxLadenMassRegistrationAxle3)}`),
        kv("MMTC — conjunto (kg)", fmt(d.maxTechnicallyPermissibleMassCombination)),
        kv("MMAC — conjunto matriculación (kg)", fmt(d.maxLadenMassRegistrationCombination)),
        kv("Remolque con barra de tracción (kg)", fmt(d.drawBarTrailerMass)),
        kv("Remolque de eje central (kg)", fmt(d.centreAxleTrailerMass)),
        kv("Remolque sin frenos (kg)", fmt(d.unbrakedTrailerMass)),
        kv("Carga vertical estática en punto de acoplamiento (kg)", fmt(d.staticCouplingPointMass)),
      ].join("")
    )}

    <h1 class="page-break" style="font-size:13pt">Unidad motriz, transmisión y frenado</h1>
    ${section(
      "Motor",
      [
        kv("Fabricante del motor", fmt(d.engineManufacturer)),
        kv("Código motor marcado", fmt(d.engineMarkingCode)),
        kv("Principio de funcionamiento", fmt(d.operatingPrinciple)),
        kv("Nº y disposición cilindros", `${fmt(d.cylinderCount)} — ${fmt(d.cylinderArrangement)}`),
        kv("Cilindrada (cc)", fmt(d.displacement)),
        kv("Motor eléctrico puro", fmt(d.pureElectric)),
        kv("Motor híbrido", fmt(d.hybrid)),
        kv("Potencia neta máxima (Kw)", fmt(d.maxNetPower)),
        kv("Potencia fiscal (CVF)", fmt(d.fiscalHorsepower)),
      ].join("")
    )}
    ${section(
      "Transmisión, suspensión, neumáticos, dirección y frenado",
      [
        kv("Caja de cambios (tipo)", fmt(d.gearboxType)),
        kv("Número de marchas", fmt(d.gearCount)),
        kv("Suspensión delantera", fmt(d.frontSuspension)),
        kv("Suspensión trasera", fmt(d.rearSuspension)),
        kv("Neumáticos eje 1º", fmt(d.tireSpecAxle1)),
        kv("Neumáticos eje 2º", fmt(d.tireSpecAxle2)),
        kv("Neumáticos eje 3º", fmt(d.tireSpecAxle3)),
        kv("Dirección, método de asistencia", fmt(d.steeringMethod)),
        kv("Frenado de servicio", fmt(d.serviceBraking)),
        kv("Frenado de socorro", fmt(d.secondaryBraking)),
        kv("Frenado de estacionamiento", fmt(d.parkingBraking)),
        kv("ABS", fmt(d.abs)),
      ].join("")
    )}

    <h1 class="page-break" style="font-size:13pt">Carrocería y varios</h1>
    ${section(
      "Carrocería",
      [
        kv("Tipo de carrocería", fmt(d.bodyType)),
        kv("Dispositivos visión indirecta distintos a retrovisor", fmt(d.indirectVision)),
        kv("Número y disposición de puertas", fmt(d.doorCountAndArrangement)),
        kv("Número de plazas de asiento (incluido conductor)", fmt(d.seatCount)),
        kv("Nº homologación CE dispositivo de acoplamiento", fmt(d.couplingDeviceApprovalNumber)),
        kv("Sistema de protección delantera", fmt(d.frontProtection)),
      ].join("")
    )}
    ${section(
      "Varios",
      [
        kv("Velocidad máxima (Km/h)", fmt(d.maxSpeed)),
        kv("Nivel de ruido parado (dB(A) a rpm)", `${fmt(d.stationaryNoiseLevel)} a ${fmt(d.stationaryNoiseLevelRpm)}`),
        kv("Nivel de ruido en marcha (dB(A))", fmt(d.drivingNoiseLevel)),
        kv("Nivel de emisiones", fmt(d.emissionsLevel)),
        kv("Emisiones CO2 ciclo mixto (g/km)", fmt(d.specificCo2Emissions)),
        kv("Instala deflector sobre cabina", fmt(d.cabDeflector)),
        kv("Opciones incluidas en la homologación de tipo", fmt(d.typeApprovalOptions)),
      ].join("")
    )}

    <h2 class="section">Observaciones</h2>
    <p>${fmt(d.remarks)}</p>

    <h2 class="section">Firma autorizada y fecha</h2>
    <table class="fields"><tr>
      <td class="label">Responsable:</td><td class="value">${fmt(d.responsibleName)}</td>
      <td class="label">Fecha:</td><td class="value"></td>
    </tr></table>
  `;

  return documentShell("", body);
}
