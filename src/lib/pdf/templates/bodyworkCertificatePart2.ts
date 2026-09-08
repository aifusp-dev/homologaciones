import { documentHeader, documentShell, fmt } from "../layout";

export type BodyworkCertificatePart2Data = {
  companyName: string;
  logoUrl: string | null;
  dossierNumber: string;
  vin: string | null;
  category: string | null;

  axleCount: number | null;
  wheelCount: number | null;
  dualWheelAxlePosition: number | null;
  dualWheelAxleCount: number | null;
  drivenAxleCount: number | null;
  drivenAxleLocation: number | null;
  drivenAxleInterconnection: string | null;

  axleDistance1to2: number | null;
  axleDistance2to3: number | null;
  totalLength: number | null;
  width: number | null;
  heightFromGround: number | null;
  loadZoneLength: number | null;

  momIncompleteVehicle: number | null;
  maxTechnicallyPermissibleMass: number | null;
  maxTechnicallyPermissibleMassAxle1: number | null;
  maxTechnicallyPermissibleMassAxle2: number | null;
  maxTechnicallyPermissibleMassCombination: number | null;
  drawBarTrailerMass: number | null;
  semiTrailerMass: number | null;
  centreAxleTrailerMass: number | null;
  unbrakedTrailerMass: number | null;
  staticCouplingPointMass: number | null;

  engineManufacturer: string | null;
  engineMarkingCode: string | null;
  operatingPrinciple: string | null;
  pureElectric: string | null;
  hybrid: string | null;
  cylinderCount: number | null;
  cylinderArrangement: string | null;
  displacement: number | null;
  fuelType: number | null;
  singleFuel: string | null;
  maxNetPower: number | null;
  maxNetPowerRpm: number | null;
  gearboxType: string | null;
  maxSpeed: number | null;
  trackWidthAxle1: number | null;
  tireRimCombination: string | null;

  bodyType: string | null;
  color: string | null;
  doorCountAndArrangement: string | null;
  seatCount: number | null;
  couplingDeviceApprovalNumber: string | null;
  valueD: number | null;
  valueV: number | null;
  valueS: number | null;

  stationaryNoiseLevel: number | null;
  stationaryNoiseLevelRpm: number | null;
  drivingNoiseLevel: number | null;
  emissionsLevel: string | null;
  specificCo2Emissions: number | null;
  remarks: string | null;

  responsibleName: string | null;
};

function kv(label: string, value: string): string {
  return `<div><span>${label}</span><b>${value}</b></div>`;
}

function section(title: string, rows: string): string {
  return `<h2 class="section">${title}</h2><div class="kv-list">${rows}</div>`;
}

// Calca BackEnd/FrontEnd/PDF-CERTIFICADON1-1..5.png ("Parte 2 del
// certificado de homologación individual nacional", anexo RD 750/2010).
// En el original, la mayoría de estos ~53 campos numerados imprimían
// literalmente el texto "Ver COC" en vez de repetir el dato — aquí se
// pinta el valor real (ya disponible en Coc/Bodywork/masses, portado
// junto al resto de fases) porque es estrictamente más útil sin dejar de
// ser el mismo dato certificado. Los campos exclusivos de vehículo
// eléctrico/híbrido y los que no tienen fuente de datos todavía
// (mercancías peligrosas, vehículos especiales, kilometraje,
// ecoinnovaciones) quedan en blanco, igual que otras cajas sin cubrir en
// el resto de plantillas de esta fase.
export function renderBodyworkCertificatePart2(d: BodyworkCertificatePart2Data): string {
  const header = documentHeader({
    title: "PARTE 2 DEL CERTIFICADO DE HOMOLOGACIÓN INDIVIDUAL NACIONAL",
    subtitle: `Categoría de vehículos ${fmt(d.category)} (vehículos completos y completados)`,
    companyName: d.companyName,
    logoUrl: d.logoUrl,
    dossierNumber: d.dossierNumber,
    vin: d.vin,
  });

  const isElectric = d.pureElectric?.toUpperCase() === "SI";
  const evOrDash = (label: string, value: string) => kv(label, isElectric ? value : "No aplica");

  const body = `
    ${header}

    ${section(
      "Características generales de construcción",
      [
        kv("1. Número de ejes y de ruedas", `${fmt(d.axleCount)} / ${fmt(d.wheelCount)}`),
        kv("1.1. Número y posición de los ejes con ruedas gemelas", `${fmt(d.dualWheelAxleCount)} / ${fmt(d.dualWheelAxlePosition)}`),
        kv("3. Ejes motores (número, posición e interconexión)", `${fmt(d.drivenAxleCount)} / ${fmt(d.drivenAxleLocation)} / ${fmt(d.drivenAxleInterconnection)}`),
      ].join("")
    )}

    ${section(
      "Dimensiones principales",
      [
        kv("4.1. Distancia entre ejes 1-2 / 2-3 (mm)", `${fmt(d.axleDistance1to2)} / ${fmt(d.axleDistance2to3)}`),
        kv("5. Longitud (mm)", fmt(d.totalLength)),
        kv("6. Anchura (mm)", fmt(d.width)),
        kv("7. Altura (mm)", fmt(d.heightFromGround)),
        kv("8. Avance de la quinta rueda de un vehículo tractor de semirremolques (mm)", "No aplica"),
        kv("11. Longitud de la zona de carga (mm)", fmt(d.loadZoneLength)),
      ].join("")
    )}

    <h1 class="page-break" style="font-size:13pt">Masas</h1>
    ${section(
      "Masas",
      [
        kv("14. Masa del vehículo base en orden de marcha (kg)", fmt(d.momIncompleteVehicle)),
        kv("16. Masa máxima técnicamente admisible (kg)", fmt(d.maxTechnicallyPermissibleMass)),
        kv("16.2. Masa técnicamente admisible sobre cada eje 1º/2º (kg)", `${fmt(d.maxTechnicallyPermissibleMassAxle1)} / ${fmt(d.maxTechnicallyPermissibleMassAxle2)}`),
        kv("16.4. Masa máxima técnicamente admisible del conjunto (kg)", fmt(d.maxTechnicallyPermissibleMassCombination)),
        kv("18.1. Remolque con barra de tracción (kg)", fmt(d.drawBarTrailerMass)),
        kv("18.2. Semirremolque (kg)", fmt(d.semiTrailerMass)),
        kv("18.3. Remolque de eje central (kg)", fmt(d.centreAxleTrailerMass)),
        kv("18.4. Remolque sin frenos (kg)", fmt(d.unbrakedTrailerMass)),
        kv("19. Masa vertical estática máxima en el punto de acoplamiento (kg)", fmt(d.staticCouplingPointMass)),
      ].join("")
    )}

    <h1 class="page-break" style="font-size:13pt">Unidad motriz</h1>
    ${section(
      "Unidad motriz",
      [
        kv("20. Fabricante del motor", fmt(d.engineManufacturer)),
        kv("21. Código del motor marcado en este", fmt(d.engineMarkingCode)),
        kv("22. Principio de funcionamiento", fmt(d.operatingPrinciple)),
        kv("23. Eléctrico puro", fmt(d.pureElectric)),
        kv("23.1. Clase de vehículo (eléctrico) híbrido", fmt(d.hybrid)),
        kv("24. Número y disposición de los cilindros", `${fmt(d.cylinderCount)} — ${fmt(d.cylinderArrangement)}`),
        kv("25. Cilindrada del motor (cc)", fmt(d.displacement)),
        kv("26. Combustible", fmt(d.fuelType)),
        kv("26.1. Monocombustible / bicombustible / flexifuel / combustible dual", fmt(d.singleFuel)),
        kv("27.1. Potencia neta máxima (Kw a min-1)", `${fmt(d.maxNetPower)} a ${fmt(d.maxNetPowerRpm)}`),
        kv("28. Caja de cambios (tipo)", fmt(d.gearboxType)),
        kv("29. Velocidad máxima (km/h)", fmt(d.maxSpeed)),
        kv("30. Vía de los ejes (mm)", fmt(d.trackWidthAxle1)),
        kv("35. Combinación de neumático y rueda", fmt(d.tireRimCombination)),
      ].join("")
    )}

    <h1 class="page-break" style="font-size:13pt">Carrocería, acoplamiento y eficacia medioambiental</h1>
    ${section(
      "Carrocería",
      [
        kv("38. Código de la carrocería", fmt(d.bodyType)),
        kv("40. Color del vehículo", fmt(d.color)),
        kv("41. Número y disposición de las puertas", fmt(d.doorCountAndArrangement)),
        kv("42. Número de plazas de asiento (incluida la del conductor)", fmt(d.seatCount)),
        kv("42.3. Número de plazas accesibles para usuarios de sillas de ruedas", "0"),
      ].join("")
    )}
    ${section(
      "Dispositivo de acoplamiento",
      [
        kv("44. Número o marca de homologación del dispositivo de acoplamiento", fmt(d.couplingDeviceApprovalNumber)),
        kv("45.1. Valores característicos D / V / S", `${fmt(d.valueD)} / ${fmt(d.valueV)} / ${fmt(d.valueS)}`),
      ].join("")
    )}
    ${section(
      "Eficacia medioambiental",
      [
        kv("46. Nivel sonoro, parado (dB(A) a rpm) / en marcha (dB(A))", `${fmt(d.stationaryNoiseLevel)} a ${fmt(d.stationaryNoiseLevelRpm)} / ${fmt(d.drivingNoiseLevel)}`),
        kv("47. Nivel de emisiones de escape", fmt(d.emissionsLevel)),
        kv("48. Emisiones de escape — número del acto regulador de base y del último acto de modificación aplicable", "—"),
      ].join("")
    )}

    <h1 class="page-break" style="font-size:13pt">Emisiones de CO2, consumo y vehículos eléctricos</h1>
    ${section(
      "Emisiones de CO2 / consumo de combustible (NEDC)",
      [
        kv("49. Emisiones de CO2 ciclo mixto (g/km)", fmt(d.specificCo2Emissions)),
        evOrDash("2. Vehículos eléctricos puros e híbridos con carga exterior — consumo de energía eléctrica (ponderado, ciclo mixto)", "—"),
        kv("3. Vehículo equipado con ecoinnovaciones", "—"),
      ].join("")
    )}
    ${section(
      "Vehículos eléctricos puros y vehículos eléctricos híbridos con carga exterior",
      [
        evOrDash("5.1. Vehículos eléctricos puros — consumo de energía eléctrica / autonomía eléctrica", "—"),
        evOrDash("5.2. Vehículos eléctricos híbridos con carga exterior — consumo de energía eléctrica / autonomía eléctrica", "—"),
      ].join("")
    )}

    <h2 class="section">Varios</h2>
    <div class="kv-list">
      ${kv("50. Homologación de tipo para el transporte de mercancías peligrosas (Reglamento nº 105)", "—")}
      ${kv("51. Vehículos especiales — designación de conformidad con el Reglamento (UE) 2018/858", "—")}
      ${kv("53. Información complementaria (kilometraje...)", "—")}
    </div>

    <h2 class="section">52. Observaciones</h2>
    <p>${fmt(d.remarks)}</p>

    <h2 class="section">Firma autorizada y fecha</h2>
    <table class="fields"><tr>
      <td class="label">Nombre responsable:</td><td class="value">${fmt(d.responsibleName)}</td>
      <td class="label">Fecha:</td><td class="value"></td>
    </tr></table>
  `;

  return documentShell("", body);
}
