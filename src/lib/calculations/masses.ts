/**
 * Motor de cálculo de "Masas y dimensiones" — el más grande y el de más
 * riesgo de todo el proyecto (234 fórmulas). Cruza los datos de `Coc` con
 * la tara ya calculada de `Bodywork` para repartir masas por eje,
 * MMA/MMTA, kingpin y centros de gravedad — es lo que sale firmado en la
 * Ficha Reducida y el Registro COP.
 *
 * Cubre 4 configuraciones de vehículo, cada una con su propia lógica de
 * reparto (no son la misma fórmula parametrizada por nº de ejes):
 *   1. BASE — vehículo rígido de 2 ejes, con componentes opcionales
 *      (cámara frigorífica, plataforma elevadora, plazas x2, combustible,
 *      gancho de remolque) cada uno reste-partido entre eje1/eje2 según su
 *      centro de gravedad.
 *   2. TRIAXLE — vehículo rígido de 3 ejes, con grúa opcional. Reutiliza
 *      Tara_1_eje/Tara_2_eje de la configuración base pero añade un tercer
 *      eje y una rama de cálculo distinta para la grúa.
 *   3. SEMI_O4 — semirremolque de 2 ejes (kingpin en vez de eje1/eje2).
 *   4. SEMI_O4_3AXLE — semirremolque de 3 ejes, kingpin + grupo de ejes.
 *
 * Todas las fórmulas están "Sin almacenar" en el origen — aquí igual,
 * ninguna se guarda como columna en `MassesDimensions`, se recalculan
 * siempre. Cada función lleva la fórmula original de FileMaker en un
 * comentario justo encima, para poder auditar/corregir una fila sin tener
 * que releer las capturas de BackEnd/calculos/.
 *
 * VERIFICADO: las fórmulas de la sección BASE marcadas con ✓ se
 * comprobaron exactas contra un expediente real de bbdd.xml (fila con
 * dist_1y2=5000, largo_ext_carr=6600, De_1eje_a_caja=537 → Voladizo_trasero
 * =2137, Largo_total=8462, Tara_inicial=7246, MOM=7521,
 * Reparto_cargaMMA_eje1=2420, Reparto_cargaMMA_eje2=7984 — todos coinciden
 * al valor exacto que ya había calculado FileMaker). El resto de fórmulas
 * (TRIAXLE/SEMI_O4/SEMI_O4_3AXLE y varias de BASE sin ✓) están portadas
 * fielmente del texto de las capturas pero NO tenían dato real en los 5
 * expedientes de muestra para verificar numéricamente — antes de firmar un
 * documento oficial con un vehículo de 3 ejes o semirremolque, contrastar
 * al menos un caso real contra el FileMaker original.
 */

function r0(n: number): number {
  return Math.round(n);
}

export type MassesInputs = {
  // Coc (certificado)
  axleDistance0to1: number | null;
  axleDistance1to2: number | null;
  axleDistance2to3: number | null;
  staticCouplingPointMass: number | null; // COC::_19_Masa_estatica_punto_acoplamiento
  maxTechnicallyPermissibleMass: number | null; // 16.1
  maxTechnicallyPermissibleMassRequested: number | null; // 16.1.1
  maxTechnicallyPermissibleMassAxle1: number | null; // 16.2 eje1
  maxTechnicallyPermissibleMassAxle2: number | null; // 16.2 eje2
  maxTechnicallyPermissibleMassAxle3: number | null; // 16.2 eje3
  maxLadenMassRegistration: number | null; // 17.1
  maxLadenMassRegistrationAxle1: number | null; // 17.2 eje1
  maxLadenMassRegistrationAxle2: number | null; // 17.2 eje2
  maxLadenMassRegistrationAxle3: number | null; // 17.2 eje3
  momIncompleteAxle1: number | null; // 14.1 eje1
  momIncompleteAxle2: number | null; // 14.1 eje2
  momIncompleteVehicle: number | null; // 14
  semiTrailerMaxTechMassSolicited: number | null; // alias de maxTechnicallyPermissibleMassRequested para O4semi_3

  // Bodywork (carrozado)
  exteriorLength: number | null;

  // MassesDimensions (manual)
  firstAxleToBodyDistance: number | null; // De_1eje_a_caja
  frontOverhang: number | null; // Voladizo_delantero
  maxVehicleWidth: number | null; // Ancho_maximo_vehículo
  reeferUnitCentreOfGravity: number | null;
  reeferUnitMass: number | null;
  liftPlatformCentreOfGravity: number | null;
  liftPlatformMass: number | null;
  hookCentreOfGravity: number | null;
  seatsCentreOfGravity: number | null;
  seatsMass: number | null;
  seats2Mass: number | null;
  seats2CentreOfGravity: number | null;
  fuelCentreOfGravity: number | null;
  fuelCapacity: number | null;
  tareAxle1: number | null;
  tareAxle2: number | null;
  tareAxle3: number | null;
  centreAxleTrailerMass: number | null;
  semiTrailerTotalLength: number | null;
  semiTrailerBodyLength: number | null;
  semiTrailerTare: number | null;
  theoreticalBodyTare: number | null;
  chassisWeighbridgeTareAxle1: number | null;
  chassisWeighbridgeTareAxle2: number | null;
  craneCentreOfGravity: number | null;
  craneMass: number | null;
  craneBoxCentreOfGravity: number | null;
  boxMass: number | null;
  semiTrailer3AxleVd: number | null;
  semiTrailer3AxleVdAccessory: number | null;
  semiTrailer3AxleVp: number | null;
  semiTrailer3AxleLt: number | null;
  semiTrailer3AxleLc: number | null;
  semiTrailer3AxleBodyWeight: number | null;
};

// ============================================================
// BASE — vehículo rígido de 2 ejes
// ============================================================

// Voladizo_trasero = CARROZADO::Largo_exterior - (COC::_4.1_Distancia_entre_ejes_1y2 - De_1eje_a_caja) ✓
export function rearOverhang(i: MassesInputs): number | null {
  if (i.exteriorLength == null || i.axleDistance1to2 == null || i.firstAxleToBodyDistance == null) return null;
  return i.exteriorLength - (i.axleDistance1to2 - i.firstAxleToBodyDistance);
}

// Largo_total = Voladizo_delantero + Voladizo_trasero + COC::_4.1_Distancia_entre_ejes_1y2 ✓
export function totalLength(i: MassesInputs): number | null {
  const ro = rearOverhang(i);
  if (i.frontOverhang == null || ro == null || i.axleDistance1to2 == null) return null;
  return i.frontOverhang + ro + i.axleDistance1to2;
}

// Reparto_combustible_eje1 = Round(Capacidad_combustible*(dist1y2-Cdg_combustible)/dist1y2;0)
export function fuelDistributionAxle1(i: MassesInputs): number | null {
  if (i.fuelCapacity == null || i.axleDistance1to2 == null || i.fuelCentreOfGravity == null) return null;
  return r0((i.fuelCapacity * (i.axleDistance1to2 - i.fuelCentreOfGravity)) / i.axleDistance1to2);
}
// Reparto_combustible_eje2 = Round(Capacidad_combustible*(dist1y2-(dist1y2-Cdg_combustible))/dist1y2;0)
export function fuelDistributionAxle2(i: MassesInputs): number | null {
  if (i.fuelCapacity == null || i.axleDistance1to2 == null || i.fuelCentreOfGravity == null) return null;
  return r0((i.fuelCapacity * (i.axleDistance1to2 - (i.axleDistance1to2 - i.fuelCentreOfGravity))) / i.axleDistance1to2);
}

// Reparto_masafrio_eje1 = Masa_maq_frio - Reparto_masafrio_eje2
// Reparto_masafrio_eje2 = Round(Masa_maq_frio*(dist1y2-Cdg_maq_frio)/dist1y2;0)
export function reeferDistributionAxle2(i: MassesInputs): number | null {
  if (i.reeferUnitMass == null || i.axleDistance1to2 == null || i.reeferUnitCentreOfGravity == null) return null;
  return r0((i.reeferUnitMass * (i.axleDistance1to2 - i.reeferUnitCentreOfGravity)) / i.axleDistance1to2);
}
export function reeferDistributionAxle1(i: MassesInputs): number | null {
  const d2 = reeferDistributionAxle2(i);
  if (i.reeferUnitMass == null || d2 == null) return null;
  return i.reeferUnitMass - d2;
}

// Reparto_mplataforma_eje1 = Round(Masa_plataforma_elevadora*(dist1y2-(dist1y2+Cdg_plataforma_elevadora))/dist1y2;0)
// Reparto_mplataforma_eje2 = Round(Masa_plataforma_elevadora*(dist1y2+Cdg_plataforma_elevadora)/dist1y2;0)
export function liftPlatformDistributionAxle1(i: MassesInputs): number | null {
  if (i.liftPlatformMass == null || i.axleDistance1to2 == null || i.liftPlatformCentreOfGravity == null) return null;
  return r0(
    (i.liftPlatformMass * (i.axleDistance1to2 - (i.axleDistance1to2 + i.liftPlatformCentreOfGravity))) /
      i.axleDistance1to2
  );
}
export function liftPlatformDistributionAxle2(i: MassesInputs): number | null {
  if (i.liftPlatformMass == null || i.axleDistance1to2 == null || i.liftPlatformCentreOfGravity == null) return null;
  return r0((i.liftPlatformMass * (i.axleDistance1to2 + i.liftPlatformCentreOfGravity)) / i.axleDistance1to2);
}

// Reparto_masaplazas_eje1 = Round(Masa_plazas*(dist1y2-Cdg_plazas)/dist1y2;0)
// Reparto_masaplazas_eje2 = Masa_plazas - Reparto_masaplazas_eje1
export function seatsDistributionAxle1(i: MassesInputs): number | null {
  if (i.seatsMass == null || i.axleDistance1to2 == null || i.seatsCentreOfGravity == null) return null;
  return r0((i.seatsMass * (i.axleDistance1to2 - i.seatsCentreOfGravity)) / i.axleDistance1to2);
}
export function seatsDistributionAxle2(i: MassesInputs): number | null {
  const d1 = seatsDistributionAxle1(i);
  if (i.seatsMass == null || d1 == null) return null;
  return i.seatsMass - d1;
}

// Reparto_masaplazas2_eje1 = Round(Masa_plazas_2*(dist1y2-Cdg_plazas2)/dist1y2;0)
// Reparto_masaplazas2_eje2 = Round(Masa_plazas_2*(dist1y2-Cdg_plazas2)/dist1y2;0)  [misma fórmula que eje1 en origen]
export function seats2DistributionAxle1(i: MassesInputs): number | null {
  if (i.seats2Mass == null || i.axleDistance1to2 == null || i.seats2CentreOfGravity == null) return null;
  return r0((i.seats2Mass * (i.axleDistance1to2 - i.seats2CentreOfGravity)) / i.axleDistance1to2);
}
export function seats2DistributionAxle2(i: MassesInputs): number | null {
  if (i.seats2Mass == null || i.axleDistance1to2 == null || i.seats2CentreOfGravity == null) return null;
  return r0((i.seats2Mass * (i.axleDistance1to2 - i.seats2CentreOfGravity)) / i.axleDistance1to2);
}

// Reparto_plaz_eje1_MOM = Round((75*(dist1y2-Cdg_plazas))/dist1y2;0)
// Reparto_plaz_eje2_MOM = Round((75*(dist1y2-(dist1y2-Cdg_plazas)))/dist1y2;0)
export function driverMomDistributionAxle1(i: MassesInputs): number | null {
  if (i.axleDistance1to2 == null || i.seatsCentreOfGravity == null) return null;
  return r0((75 * (i.axleDistance1to2 - i.seatsCentreOfGravity)) / i.axleDistance1to2);
}
export function driverMomDistributionAxle2(i: MassesInputs): number | null {
  if (i.axleDistance1to2 == null || i.seatsCentreOfGravity == null) return null;
  return r0((75 * (i.axleDistance1to2 - (i.axleDistance1to2 - i.seatsCentreOfGravity))) / i.axleDistance1to2);
}

// Reparto_masagancho_eje1 = Round(COC::_19*(dist1y2-(dist1y2+Cdg_gancho))/dist1y2;0)
// Reparto_masagancho_eje2 = Round(COC::_19*(dist1y2+Cdg_gancho)/dist1y2;0)
export function hookMassDistributionAxle1(i: MassesInputs): number | null {
  if (i.staticCouplingPointMass == null || i.axleDistance1to2 == null || i.hookCentreOfGravity == null) return null;
  return r0(
    (i.staticCouplingPointMass * (i.axleDistance1to2 - (i.axleDistance1to2 + i.hookCentreOfGravity))) /
      i.axleDistance1to2
  );
}
export function hookMassDistributionAxle2(i: MassesInputs): number | null {
  if (i.staticCouplingPointMass == null || i.axleDistance1to2 == null || i.hookCentreOfGravity == null) return null;
  return r0((i.staticCouplingPointMass * (i.axleDistance1to2 + i.hookCentreOfGravity)) / i.axleDistance1to2);
}

// Tara_inicial_ sin accesorios = Tara_1_eje + Tara_2_eje ✓
export function initialTareNoAccessories(i: MassesInputs): number | null {
  if (i.tareAxle1 == null || i.tareAxle2 == null) return null;
  return i.tareAxle1 + i.tareAxle2;
}

// MOM_eje1 = Reparto_mplataforma_eje1 + Tara_1_eje + Reparto_combustible_eje1 + Reparto_plaz_eje1_MOM + Reparto_masafrio_eje1
// MOM_eje2 = Reparto_mplataforma_eje2 + Tara_2_eje + Reparto_combustible_eje2 + Reparto_plaz_eje2_MOM + Reparto_masafrio_eje2
export function momAxle1(i: MassesInputs): number | null {
  const parts = [
    liftPlatformDistributionAxle1(i),
    i.tareAxle1,
    fuelDistributionAxle1(i),
    driverMomDistributionAxle1(i),
    reeferDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
export function momAxle2(i: MassesInputs): number | null {
  const parts = [
    liftPlatformDistributionAxle2(i),
    i.tareAxle2,
    fuelDistributionAxle2(i),
    driverMomDistributionAxle2(i),
    reeferDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// MOM = MOM_eje1 + MOM_eje2 ✓
export function mom(i: MassesInputs): number | null {
  const a1 = momAxle1(i);
  const a2 = momAxle2(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}

// MOM_eje1_teorico = Reparto_mplataforma_eje1 + Tara_eje1_fab_caja + Reparto_combustible_eje1 + Reparto_plaz_eje1_MOM
// MOM_eje2_teorico = Reparto_mplataforma_eje2 + Tara_eje2_fab_caja + Reparto_combustible_eje2 + Reparto_plaz_eje2_MOM
export function theoreticalMomAxle1(i: MassesInputs): number | null {
  const parts = [liftPlatformDistributionAxle1(i), bodyTareAxle1Factory(i), fuelDistributionAxle1(i), driverMomDistributionAxle1(i)];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
export function theoreticalMomAxle2(i: MassesInputs): number | null {
  const parts = [liftPlatformDistributionAxle2(i), bodyTareAxle2Factory(i), fuelDistributionAxle2(i), driverMomDistributionAxle2(i)];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// MOM_teorico = MOM_eje1_teorico + MOM_eje2_teorico
export function theoreticalMom(i: MassesInputs): number | null {
  const a1 = theoreticalMomAxle1(i);
  const a2 = theoreticalMomAxle2(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}

// Tara_teorica_carrozado_eje1 = Round(Tara_teorica_carrozado*((CARROZADO::Largo_exterior/2)-Voladizo_trasero)/dist1y2;0)
export function bodyTareAxle1Factory(i: MassesInputs): number | null {
  const ro = rearOverhang(i);
  if (i.theoreticalBodyTare == null || i.exteriorLength == null || ro == null || i.axleDistance1to2 == null)
    return null;
  return r0((i.theoreticalBodyTare * (i.exteriorLength / 2 - ro)) / i.axleDistance1to2);
}
// Tara_teorica_carrozado_eje2 = Round(Tara_teorica_carrozado - Tara_teorica_carrozado_eje1;0)
export function bodyTareAxle2Factory(i: MassesInputs): number | null {
  const eje1 = bodyTareAxle1Factory(i);
  if (i.theoreticalBodyTare == null || eje1 == null) return null;
  return r0(i.theoreticalBodyTare - eje1);
}

// Tara_eje1_fab_caja = COC::_14.1_MOM_incompleto_eje1 + Tara_teorica_carrozado_eje1
// Tara_eje2_fab_caja = COC::_14.1_MOM_incompleto_eje2 + Tara_teorica_carrozado_eje2
export function bodyBuilderTareAxle1(i: MassesInputs): number | null {
  const bt1 = bodyTareAxle1Factory(i);
  if (i.momIncompleteAxle1 == null || bt1 == null) return null;
  return i.momIncompleteAxle1 + bt1;
}
export function bodyBuilderTareAxle2(i: MassesInputs): number | null {
  const bt2 = bodyTareAxle2Factory(i);
  if (i.momIncompleteAxle2 == null || bt2 == null) return null;
  return i.momIncompleteAxle2 + bt2;
}
// Tara_total_fab_caja = COC::_14.1_MOM_incompleto_eje1 + COC::_14.1_MOM_incompleto_eje2 + Tara_teorica_carrozado_eje1 + Tara_teorica_carrozado_eje2
export function bodyBuilderTareTotal(i: MassesInputs): number | null {
  const a1 = bodyBuilderTareAxle1(i);
  const a2 = bodyBuilderTareAxle2(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}

// Tara_chasis_bascula = Tara_chasiseje1_bascula + Tara_chasis_eje2_bascula
export function chassisWeighbridgeTare(i: MassesInputs): number | null {
  if (i.chassisWeighbridgeTareAxle1 == null || i.chassisWeighbridgeTareAxle2 == null) return null;
  return i.chassisWeighbridgeTareAxle1 + i.chassisWeighbridgeTareAxle2;
}
// Tara_eje1_bas_caja = Tara_chasiseje1_bascula + Tara_teorica_carrozado_eje1
// Tara_eje2_bas_caja = Tara_chasis_eje2_bascula + Tara_teorica_carrozado_eje2
export function weighbridgeBodyTareAxle1(i: MassesInputs): number | null {
  const bt1 = bodyTareAxle1Factory(i);
  if (i.chassisWeighbridgeTareAxle1 == null || bt1 == null) return null;
  return i.chassisWeighbridgeTareAxle1 + bt1;
}
export function weighbridgeBodyTareAxle2(i: MassesInputs): number | null {
  const bt2 = bodyTareAxle2Factory(i);
  if (i.chassisWeighbridgeTareAxle2 == null || bt2 == null) return null;
  return i.chassisWeighbridgeTareAxle2 + bt2;
}
// Tara_total_bas_caja = Tara_chasis_bascula + Tara_teorica_carrozado
export function weighbridgeBodyTareTotal(i: MassesInputs): number | null {
  const base = chassisWeighbridgeTare(i);
  if (base == null || i.theoreticalBodyTare == null) return null;
  return base + i.theoreticalBodyTare;
}

// Masa_cargaMMA = COC::_17.1 - (Tara_inicial_sin_accesorios + Masa_plazas + Capacidad_combustible + Masa_plazas_2 + Masa_plataforma_elevadora + Masa_maq_frio)
export function loadMassMma(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxLadenMassRegistration == null ||
    tare == null ||
    i.seatsMass == null ||
    i.fuelCapacity == null ||
    i.seats2Mass == null ||
    i.liftPlatformMass == null ||
    i.reeferUnitMass == null
  )
    return null;
  return (
    i.maxLadenMassRegistration -
    (tare + i.seatsMass + i.fuelCapacity + i.seats2Mass + i.liftPlatformMass + i.reeferUnitMass)
  );
}
// Reparto_cargaMMA_eje1 = Round(Masa_cargaMMA*(Largo_exterior/2-Voladizo_trasero)/dist1y2;0) ✓
export function loadMmaDistributionAxle1(i: MassesInputs): number | null {
  const load = loadMassMma(i);
  const ro = rearOverhang(i);
  if (load == null || i.exteriorLength == null || ro == null || i.axleDistance1to2 == null) return null;
  return r0((load * (i.exteriorLength / 2 - ro)) / i.axleDistance1to2);
}
// Reparto_cargaMMA_eje2 = Round(Masa_cargaMMA*(Largo_exterior/2+De_1eje_a_caja)/dist1y2;0) ✓
export function loadMmaDistributionAxle2(i: MassesInputs): number | null {
  const load = loadMassMma(i);
  if (load == null || i.exteriorLength == null || i.firstAxleToBodyDistance == null || i.axleDistance1to2 == null)
    return null;
  return r0((load * (i.exteriorLength / 2 + i.firstAxleToBodyDistance)) / i.axleDistance1to2);
}

// Masa_cargaMMA_P = COC::_17.1 - (Masa_plataforma_elevadora + Capacidad_combustible + Tara_inicial + Masa_plazas + Masa_plazas_2)
export function loadMassMmaLiftPlatform(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxLadenMassRegistration == null ||
    i.liftPlatformMass == null ||
    i.fuelCapacity == null ||
    tare == null ||
    i.seatsMass == null ||
    i.seats2Mass == null
  )
    return null;
  return i.maxLadenMassRegistration - (i.liftPlatformMass + i.fuelCapacity + tare + i.seatsMass + i.seats2Mass);
}
export function loadMmaLiftPlatformDistributionAxle1(i: MassesInputs): number | null {
  const load = loadMassMmaLiftPlatform(i);
  const ro = rearOverhang(i);
  if (load == null || i.exteriorLength == null || ro == null || i.axleDistance1to2 == null) return null;
  return r0((load * (i.exteriorLength / 2 - ro)) / i.axleDistance1to2);
}
export function loadMmaLiftPlatformDistributionAxle2(i: MassesInputs): number | null {
  const load = loadMassMmaLiftPlatform(i);
  if (load == null || i.exteriorLength == null || i.firstAxleToBodyDistance == null || i.axleDistance1to2 == null)
    return null;
  return r0((load * (i.exteriorLength / 2 + i.firstAxleToBodyDistance)) / i.axleDistance1to2);
}

// Masa_cargaMMA_G = COC::_17.1 - (Capacidad_combustible + Tara_inicial + Masa_plazas + Masa_plazas_2 + Masa_maq_frio)
export function loadMassMmaHook(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxLadenMassRegistration == null ||
    i.fuelCapacity == null ||
    tare == null ||
    i.seatsMass == null ||
    i.seats2Mass == null ||
    i.reeferUnitMass == null
  )
    return null;
  return i.maxLadenMassRegistration - (i.fuelCapacity + tare + i.seatsMass + i.seats2Mass + i.reeferUnitMass);
}
export function loadMmaHookDistributionAxle1(i: MassesInputs): number | null {
  const load = loadMassMmaHook(i);
  const ro = rearOverhang(i);
  if (load == null || i.exteriorLength == null || ro == null || i.axleDistance1to2 == null) return null;
  return r0((load * (i.exteriorLength / 2 - ro)) / i.axleDistance1to2);
}
export function loadMmaHookDistributionAxle2(i: MassesInputs): number | null {
  const load = loadMassMmaHook(i);
  if (load == null || i.exteriorLength == null || i.firstAxleToBodyDistance == null || i.axleDistance1to2 == null)
    return null;
  return r0((load * (i.exteriorLength / 2 + i.firstAxleToBodyDistance)) / i.axleDistance1to2);
}

// Masa_cargaMMA_PyG = COC::_17.1 - (COC::_19 + Masa_plataforma_elevadora + Capacidad_combustible + Tara_inicial + Masa_plazas + Masa_plazas_2 + Masa_maq_frio)
export function loadMassMmaLiftPlatformHook(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxLadenMassRegistration == null ||
    i.staticCouplingPointMass == null ||
    i.liftPlatformMass == null ||
    i.fuelCapacity == null ||
    tare == null ||
    i.seatsMass == null ||
    i.seats2Mass == null ||
    i.reeferUnitMass == null
  )
    return null;
  return (
    i.maxLadenMassRegistration -
    (i.staticCouplingPointMass + i.liftPlatformMass + i.fuelCapacity + tare + i.seatsMass + i.seats2Mass + i.reeferUnitMass)
  );
}
export function loadMmaLiftPlatformHookDistributionAxle1(i: MassesInputs): number | null {
  const load = loadMassMmaLiftPlatformHook(i);
  if (load == null || i.exteriorLength == null || i.firstAxleToBodyDistance == null || i.axleDistance1to2 == null)
    return null;
  return r0((load * (i.exteriorLength / 2 - i.firstAxleToBodyDistance)) / i.axleDistance1to2);
}
export function loadMmaLiftPlatformHookDistributionAxle2(i: MassesInputs): number | null {
  const load = loadMassMmaLiftPlatformHook(i);
  if (load == null || i.exteriorLength == null || i.firstAxleToBodyDistance == null || i.axleDistance1to2 == null)
    return null;
  return r0((load * (i.exteriorLength / 2 + i.firstAxleToBodyDistance)) / i.axleDistance1to2);
}

// Masa_cargaMMTA = COC::_16.1.1 - (Tara_inicial + Masa_plazas + Capacidad_combustible + Masa_plazas_2 + Masa_plataforma_elevadora + Masa_maq_frio)
export function loadMassMmta(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxTechnicallyPermissibleMassRequested == null ||
    tare == null ||
    i.seatsMass == null ||
    i.fuelCapacity == null ||
    i.seats2Mass == null ||
    i.liftPlatformMass == null ||
    i.reeferUnitMass == null
  )
    return null;
  return (
    i.maxTechnicallyPermissibleMassRequested -
    (tare + i.seatsMass + i.fuelCapacity + i.seats2Mass + i.liftPlatformMass + i.reeferUnitMass)
  );
}
export function loadMmtaDistributionAxle1(i: MassesInputs): number | null {
  const load = loadMassMmta(i);
  const ro = rearOverhang(i);
  if (load == null || i.exteriorLength == null || ro == null || i.axleDistance1to2 == null) return null;
  return r0((load * (i.exteriorLength / 2 - ro)) / i.axleDistance1to2);
}
export function loadMmtaDistributionAxle2(i: MassesInputs): number | null {
  const load = loadMassMmta(i);
  if (load == null || i.exteriorLength == null || i.firstAxleToBodyDistance == null || i.axleDistance1to2 == null)
    return null;
  return r0((load * (i.exteriorLength / 2 + i.firstAxleToBodyDistance)) / i.axleDistance1to2);
}

// Masa_cargaMMTA_G = COC::_16.1.1 - (COC::_19 + Capacidad_combustible + Tara_inicial + Masa_plazas + Masa_plazas_2 + Masa_maq_frio)
export function loadMassMmtaHook(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxTechnicallyPermissibleMassRequested == null ||
    i.staticCouplingPointMass == null ||
    i.fuelCapacity == null ||
    tare == null ||
    i.seatsMass == null ||
    i.seats2Mass == null ||
    i.reeferUnitMass == null
  )
    return null;
  return (
    i.maxTechnicallyPermissibleMassRequested -
    (i.staticCouplingPointMass + i.fuelCapacity + tare + i.seatsMass + i.seats2Mass + i.reeferUnitMass)
  );
}
export function loadMmtaHookDistributionAxle1(i: MassesInputs): number | null {
  const load = loadMassMmtaHook(i);
  const ro = rearOverhang(i);
  if (load == null || i.exteriorLength == null || ro == null || i.axleDistance1to2 == null) return null;
  return r0((load * (i.exteriorLength / 2 - ro)) / i.axleDistance1to2);
}
export function loadMmtaHookDistributionAxle2(i: MassesInputs): number | null {
  const load = loadMassMmtaHook(i);
  if (load == null || i.exteriorLength == null || i.firstAxleToBodyDistance == null || i.axleDistance1to2 == null)
    return null;
  return r0((load * (i.exteriorLength / 2 + i.firstAxleToBodyDistance)) / i.axleDistance1to2);
}

// Masa_cargaMTMA_PyG = COC::_16.1.1 - (COC::_19 + Masa_plataforma_elevadora + Capacidad_combustible + Tara_inicial + Masa_plazas + Masa_plazas_2 + Masa_maq_frio)
export function loadMassMmtaLiftPlatformHook(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxTechnicallyPermissibleMassRequested == null ||
    i.staticCouplingPointMass == null ||
    i.liftPlatformMass == null ||
    i.fuelCapacity == null ||
    tare == null ||
    i.seatsMass == null ||
    i.seats2Mass == null ||
    i.reeferUnitMass == null
  )
    return null;
  return (
    i.maxTechnicallyPermissibleMassRequested -
    (i.staticCouplingPointMass + i.liftPlatformMass + i.fuelCapacity + tare + i.seatsMass + i.seats2Mass + i.reeferUnitMass)
  );
}
export function loadMmtaLiftPlatformHookDistributionAxle1(i: MassesInputs): number | null {
  const load = loadMassMmtaLiftPlatformHook(i);
  if (load == null || i.exteriorLength == null || i.firstAxleToBodyDistance == null || i.axleDistance1to2 == null)
    return null;
  return r0((load * (i.exteriorLength / 2 + i.firstAxleToBodyDistance)) / i.axleDistance1to2);
}
export function loadMmtaLiftPlatformHookDistributionAxle2(i: MassesInputs): number | null {
  const load = loadMassMmtaLiftPlatformHook(i);
  const ro = rearOverhang(i);
  if (load == null || i.exteriorLength == null || ro == null || i.axleDistance1to2 == null) return null;
  return r0((load * (i.exteriorLength / 2 - ro)) / i.axleDistance1to2);
}

// Total_eje1_singancho = Tara_1_eje + Reparto_combustible_eje1 + Reparto_masaplazas_eje1 + Reparto_masaplazas2_eje1 + Reparto_masafrio_eje1 + Reparto_cargaMMA_eje1
// Total_eje2_sin gancho = Tara_2_eje + Reparto_combustible_eje2 + Reparto_masaplazas_eje2 + Reparto_masaplazas2_eje2 + Reparto_combustible_eje2 + Reparto_cargaMMTA_eje2 + Reparto_mplataforma_eje2 + Reparto_masafrio_eje2
export function totalAxle1NoHook(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle1,
    fuelDistributionAxle1(i),
    seatsDistributionAxle1(i),
    seats2DistributionAxle1(i),
    reeferDistributionAxle1(i),
    loadMmaDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
export function totalAxle2NoHook(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle2,
    seatsDistributionAxle2(i),
    seats2DistributionAxle2(i),
    fuelDistributionAxle2(i),
    loadMmtaDistributionAxle2(i),
    liftPlatformDistributionAxle2(i),
    reeferDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// Total_masa_sin_gancho = Total_eje1_singancho + Total_eje2_sin gancho
export function totalMassNoHook(i: MassesInputs): number | null {
  const a1 = totalAxle1NoHook(i);
  const a2 = totalAxle2NoHook(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}

// Total_eje1_MMTA = Tara_1_eje + Reparto_combustible_eje1 + Reparto_masaplazas_eje1 + Reparto_masaplazas2_eje1 + Reparto_cargaMMTA_eje1 + Reparto_mplataforma_eje1 + Reparto_masafrio_eje1
export function totalAxle1Mmta(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle1,
    fuelDistributionAxle1(i),
    seatsDistributionAxle1(i),
    seats2DistributionAxle1(i),
    loadMmtaDistributionAxle1(i),
    liftPlatformDistributionAxle1(i),
    reeferDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// Total_eje2_MMTA = Tara_2_eje + Reparto_masaplazas_eje2 + Reparto_masaplazas2_eje2 + Reparto_combustible_eje2 + Reparto_cargaMMTA_eje2 + Reparto_mplataforma_eje2 + Reparto_masafrio_eje2
export function totalAxle2Mmta(i: MassesInputs): number | null {
  return totalAxle2NoHook(i); // misma composición que Total_eje2_sin gancho en el origen
}
// Total_MMTA_sin_gancho = Total_eje1_MMTA + Total_eje2_MMTA
export function totalMmtaNoHook(i: MassesInputs): number | null {
  const a1 = totalAxle1Mmta(i);
  const a2 = totalAxle2Mmta(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}

// Total_eje1_MMA_conPLat = Tara_1_eje + Reparto_masaplazas_eje1 + Reparto_combustible_eje1 + Cajon_masa_eje1 + Reparto_cargaMMA_PyG_eje1 + Reparto_masafrio_eje1
// Total_eje2_MMA_conPLat = Reparto_mplataforma_eje2 + Reparto_cargaMMA_P_eje2 + Reparto_masaplazas_eje2 + Reparto_masaplazas2_eje2 + Tara_2_eje + Reparto_combustible_eje2
export function totalAxle1MmaWithPlatform(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle1,
    seatsDistributionAxle1(i),
    fuelDistributionAxle1(i),
    craneBoxDistributionAxle1(i),
    loadMmaLiftPlatformHookDistributionAxle1(i),
    reeferDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
export function totalAxle2MmaWithPlatform(i: MassesInputs): number | null {
  const parts = [
    liftPlatformDistributionAxle2(i),
    loadMmaLiftPlatformDistributionAxle2(i),
    seatsDistributionAxle2(i),
    seats2DistributionAxle2(i),
    i.tareAxle2,
    fuelDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// Total_MMA_conPlat = Total_eje1_MMA_conPLat + Total_eje2_MMA_conPLat
export function totalMmaWithPlatform(i: MassesInputs): number | null {
  const a1 = totalAxle1MmaWithPlatform(i);
  const a2 = totalAxle2MmaWithPlatform(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}

// Masa_carga_MMAgancho = COC::_17.1 - (Capacidad_combustible + Tara_inicial + Masa_plazas + Masa_plazas_2 + Masa_maq_frio + COC::_19)
export function hookLoadMassMma(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxLadenMassRegistration == null ||
    i.fuelCapacity == null ||
    tare == null ||
    i.seatsMass == null ||
    i.seats2Mass == null ||
    i.reeferUnitMass == null ||
    i.staticCouplingPointMass == null
  )
    return null;
  return (
    i.maxLadenMassRegistration -
    (i.fuelCapacity + tare + i.seatsMass + i.seats2Mass + i.reeferUnitMass + i.staticCouplingPointMass)
  );
}
// Masa_carga_MMAgancho_eje1 = Round(Masa_carga_MMAgancho*((Largo_exterior/2)-Voladizo_trasero)/dist1y2;0)
export function hookLoadMmaDistributionAxle1(i: MassesInputs): number | null {
  const load = loadMassMmaHook(i);
  const ro = rearOverhang(i);
  if (load == null || i.exteriorLength == null || ro == null || i.axleDistance1to2 == null) return null;
  return r0((load * (i.exteriorLength / 2 - ro)) / i.axleDistance1to2);
}
// Masa_carga_MMAgancho_eje2 = Round(Masa_carga_MMAgancho*((Largo_exterior/2)+De_1eje_a_caja)/dist1y2;0)
export function hookLoadMmaDistributionAxle2(i: MassesInputs): number | null {
  const load = loadMassMmaHook(i);
  if (load == null || i.exteriorLength == null || i.firstAxleToBodyDistance == null || i.axleDistance1to2 == null)
    return null;
  return r0((load * (i.exteriorLength / 2 + i.firstAxleToBodyDistance)) / i.axleDistance1to2);
}
// Total_MMAgancho_eje1 = Reparto_masaplazas_eje1 + Tara_1_eje + Reparto_masagancho_eje1 + Cajon_masa_eje1 + Masa_grua_eje1 + Reparto_combustible_eje1
export function totalHookMmaAxle1(i: MassesInputs): number | null {
  const parts = [
    seatsDistributionAxle1(i),
    i.tareAxle1,
    hookMassDistributionAxle1(i),
    craneBoxDistributionAxle1(i),
    craneDistributionAxle1(i),
    fuelDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// Total_MMAgancho_eje2 = Reparto_masaplazas_eje2 + Tara_2_eje + Reparto_combustible_eje2 + Cajon_masa_eje2 + Masa_carga_MMAgancho_eje2 + Reparto_masagancho_eje2
export function totalHookMmaAxle2(i: MassesInputs): number | null {
  const parts = [
    seatsDistributionAxle2(i),
    i.tareAxle2,
    fuelDistributionAxle2(i),
    craneBoxDistributionAxle2(i),
    hookLoadMmaDistributionAxle2(i),
    hookMassDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// TotalMMA_GANCHO_ejes1_2 = Total_MMAgancho_eje1 + Total_MMAgancho_eje2
export function totalHookMma(i: MassesInputs): number | null {
  const a1 = totalHookMmaAxle1(i);
  const a2 = totalHookMmaAxle2(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}

// Masa_carga_MMTAgancho = COC::_16.1.1 - (Capacidad_combustible + Tara_inicial + Masa_plazas + Masa_plazas_2 + Masa_maq_frio + COC::_19)
export function hookLoadMassMmta(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxTechnicallyPermissibleMassRequested == null ||
    i.fuelCapacity == null ||
    tare == null ||
    i.seatsMass == null ||
    i.seats2Mass == null ||
    i.reeferUnitMass == null ||
    i.staticCouplingPointMass == null
  )
    return null;
  return (
    i.maxTechnicallyPermissibleMassRequested -
    (i.fuelCapacity + tare + i.seatsMass + i.seats2Mass + i.reeferUnitMass + i.staticCouplingPointMass)
  );
}
// Masa_carga_MMTAgancho_eje1 = Masa_carga_MMTAgancho - Masa_carga_MMTAgancho_eje2
// Masa_carga_MMTAgancho_eje2 = Round(Masa_carga_MMTAgancho*((Largo_exterior/2)+De_1eje_a_caja)/dist1y2;0)
export function hookLoadMmtaDistributionAxle2(i: MassesInputs): number | null {
  const load = hookLoadMassMmta(i);
  if (load == null || i.exteriorLength == null || i.firstAxleToBodyDistance == null || i.axleDistance1to2 == null)
    return null;
  return r0((load * (i.exteriorLength / 2 + i.firstAxleToBodyDistance)) / i.axleDistance1to2);
}
export function hookLoadMmtaDistributionAxle1(i: MassesInputs): number | null {
  const load = hookLoadMassMmta(i);
  const a2 = hookLoadMmtaDistributionAxle2(i);
  if (load == null || a2 == null) return null;
  return load - a2;
}
// Total_MMTAgancho_eje1 = Tara_1_eje + Reparto_masagancho_eje1 + Reparto_masaplazas_eje1 + Cajon_masa_eje1 + Masa_grua_eje1 + Reparto_combustible_eje1
export function totalHookMmtaAxle1(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle1,
    hookMassDistributionAxle1(i),
    seatsDistributionAxle1(i),
    craneBoxDistributionAxle1(i),
    craneDistributionAxle1(i),
    fuelDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// Total_MMTAgancho_eje2 = Reparto_masaplazas_eje2 + Tara_2_eje + Reparto_combustible_eje2 + Masa_grua_eje2 + Cajon_masa_eje2 + Masa_carga_MMTAgancho_eje2 + Reparto_masagancho_eje2
export function totalHookMmtaAxle2(i: MassesInputs): number | null {
  const parts = [
    seatsDistributionAxle2(i),
    i.tareAxle2,
    fuelDistributionAxle2(i),
    craneDistributionAxle2(i),
    craneBoxDistributionAxle2(i),
    hookLoadMmtaDistributionAxle2(i),
    hookMassDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// TotalMMTA_GANCHO_ejes1_2 = Total_MMTAgancho_eje1 + Total_MMTAgancho_eje2
export function totalHookMmta(i: MassesInputs): number | null {
  const a1 = totalHookMmtaAxle1(i);
  const a2 = totalHookMmtaAxle2(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}
// Total_MMTA_congancho_eje1 = Tara_1_eje + Reparto_combustible_eje1 + Reparto_masaplazas_eje1 + Reparto_masaplazas2_eje1 + Reparto_masagancho_eje1 + Reparto_cargaMMTA_G_eje1 + Reparto_masafrio_eje1
export function totalHookMmtaAxle1Alt(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle1,
    fuelDistributionAxle1(i),
    seatsDistributionAxle1(i),
    seats2DistributionAxle1(i),
    hookMassDistributionAxle1(i),
    loadMmtaHookDistributionAxle1(i),
    reeferDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// Total_MMTA_congancho_eje2 = Tara_2_eje + Reparto_masaplazas_eje2 + Reparto_masaplazas2_eje2 + Reparto_masagancho_eje2 + Reparto_cargaMMTA_G_eje2 + Reparto_combustible_eje2 + Reparto_masafrio_eje2
export function totalHookMmtaAxle2Alt(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle2,
    seatsDistributionAxle2(i),
    seats2DistributionAxle2(i),
    hookMassDistributionAxle2(i),
    loadMmtaHookDistributionAxle2(i),
    fuelDistributionAxle2(i),
    reeferDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// Total_MMTA_congancho = Total_MMTA_congancho_eje1 + Total_MMTA_congancho_eje2
export function totalHookMmtaAlt(i: MassesInputs): number | null {
  const a1 = totalHookMmtaAxle1Alt(i);
  const a2 = totalHookMmtaAxle2Alt(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}
// Total_MMTA_eje2_con gancho_menos_masa_punto_acoplamiento = Total_MMTA_congancho_eje2 - COC::_19
export function totalHookMmtaAxle2MinusCoupling(i: MassesInputs): number | null {
  const a2 = totalHookMmtaAxle2Alt(i);
  if (a2 == null || i.staticCouplingPointMass == null) return null;
  return a2 - i.staticCouplingPointMass;
}

// Total_masa_congancho_eje1 = Tara_1_eje + Reparto_combustible_eje1 + Reparto_masaplazas_eje1 + Reparto_masaplazas2_eje1 + Reparto_masagancho_eje1 + Reparto_masafrio_eje1
export function totalHookMassAxle1(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle1,
    fuelDistributionAxle1(i),
    seatsDistributionAxle1(i),
    seats2DistributionAxle1(i),
    hookMassDistributionAxle1(i),
    reeferDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// Total_masa_congancho_eje2 = Tara_2_eje + Reparto_masaplazas_eje2 + Reparto_masaplazas2_eje2 + Reparto_masagancho_eje2 + Reparto_cargaMMA_G_eje2 + Reparto_combustible_eje2 + Reparto_masafrio_eje2
export function totalHookMassAxle2(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle2,
    seatsDistributionAxle2(i),
    seats2DistributionAxle2(i),
    hookMassDistributionAxle2(i),
    loadMmaHookDistributionAxle2(i),
    fuelDistributionAxle2(i),
    reeferDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// Total_masa_congancho = Total_masa_congancho_eje1 + Total_masa_congancho_eje2
export function totalHookMass(i: MassesInputs): number | null {
  const a1 = totalHookMassAxle1(i);
  const a2 = totalHookMassAxle2(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}

// Total_masa_PyG_eje1 = Round(Reparto_mplataforma_eje1 + Reparto_masagancho_eje1 + Reparto_masaplazas_eje1 + Reparto_masaplazas2_eje1 + Tara_1_eje + Reparto_combustible_eje1 + Reparto_cargaMMA_PyG_eje1 + Reparto_masafrio_eje1;0)
export function totalPlatformHookMassAxle1(i: MassesInputs): number | null {
  const parts = [
    liftPlatformDistributionAxle1(i),
    hookMassDistributionAxle1(i),
    seatsDistributionAxle1(i),
    seats2DistributionAxle1(i),
    i.tareAxle1,
    fuelDistributionAxle1(i),
    loadMmaLiftPlatformHookDistributionAxle1(i),
    reeferDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return r0(parts.reduce((s, p) => s! + p!, 0)!);
}
// Total_masa_PyG_eje2 = Round(Reparto_mplataforma_eje2 + Reparto_masagancho_eje2 + Reparto_masaplazas_eje2 + Reparto_masaplazas2_eje2 + Tara_2_eje + Reparto_combustible_eje2 + Reparto_cargaMMA_PyG_eje2 + Reparto_masafrio_eje2;0)
export function totalPlatformHookMassAxle2(i: MassesInputs): number | null {
  const parts = [
    liftPlatformDistributionAxle2(i),
    hookMassDistributionAxle2(i),
    seatsDistributionAxle2(i),
    seats2DistributionAxle2(i),
    i.tareAxle2,
    fuelDistributionAxle2(i),
    loadMmaLiftPlatformHookDistributionAxle2(i),
    reeferDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return r0(parts.reduce((s, p) => s! + p!, 0)!);
}
// Total_masa_PyG = Total_masa_PyG_eje1 + Total_masa_PyG_eje2
export function totalPlatformHookMass(i: MassesInputs): number | null {
  const a1 = totalPlatformHookMassAxle1(i);
  const a2 = totalPlatformHookMassAxle2(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}
// Total_MMTA_PyG_eje1 = Round(igual que PyG_eje1 pero con Reparto_cargaMMTA_PyG_eje1;0)
export function totalPlatformHookMmtaAxle1(i: MassesInputs): number | null {
  const parts = [
    liftPlatformDistributionAxle1(i),
    hookMassDistributionAxle1(i),
    seatsDistributionAxle1(i),
    seats2DistributionAxle1(i),
    i.tareAxle1,
    fuelDistributionAxle1(i),
    loadMmtaLiftPlatformHookDistributionAxle1(i),
    reeferDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return r0(parts.reduce((s, p) => s! + p!, 0)!);
}
export function totalPlatformHookMmtaAxle2(i: MassesInputs): number | null {
  const parts = [
    liftPlatformDistributionAxle2(i),
    hookMassDistributionAxle2(i),
    seatsDistributionAxle2(i),
    seats2DistributionAxle2(i),
    i.tareAxle2,
    fuelDistributionAxle2(i),
    loadMmtaLiftPlatformHookDistributionAxle2(i),
    reeferDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return r0(parts.reduce((s, p) => s! + p!, 0)!);
}
export function totalPlatformHookMmta(i: MassesInputs): number | null {
  const a1 = totalPlatformHookMmtaAxle1(i);
  const a2 = totalPlatformHookMmtaAxle2(i);
  if (a1 == null || a2 == null) return null;
  return r0(a1 + a2);
}

// Cajon_masa_eje1 = Round(Masa_cajon*(dist1y2-Cdg_cajon_grua)/dist1y2;0)
export function craneBoxDistributionAxle1(i: MassesInputs): number | null {
  if (i.boxMass == null || i.axleDistance1to2 == null || i.craneBoxCentreOfGravity == null) return null;
  return r0((i.boxMass * (i.axleDistance1to2 - i.craneBoxCentreOfGravity)) / i.axleDistance1to2);
}
// Cajon_masa_eje2 = Round(Masa_cajon - Cajon_masa_eje1;0)
export function craneBoxDistributionAxle2(i: MassesInputs): number | null {
  const a1 = craneBoxDistributionAxle1(i);
  if (i.boxMass == null || a1 == null) return null;
  return r0(i.boxMass - a1);
}
// Masa_grua_eje1 = Round(Masa_grua*(dist1y2-Cdg_GRUA)/dist1y2;0)
export function craneDistributionAxle1(i: MassesInputs): number | null {
  if (i.craneMass == null || i.axleDistance1to2 == null || i.craneCentreOfGravity == null) return null;
  return r0((i.craneMass * (i.axleDistance1to2 - i.craneCentreOfGravity)) / i.axleDistance1to2);
}
// Masa_grua_eje2 = Masa_grua - Masa_grua_eje1
export function craneDistributionAxle2(i: MassesInputs): number | null {
  const a1 = craneDistributionAxle1(i);
  if (i.craneMass == null || a1 == null) return null;
  return i.craneMass - a1;
}

// Masa_carga_2ejes_grua = Round(COC::_17.1 - (Tara_inicial + Masa_plazas + Capacidad_combustible + Masa_grua + Masa_cajon);0)
export function craneLoadMassMma(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxLadenMassRegistration == null ||
    tare == null ||
    i.seatsMass == null ||
    i.fuelCapacity == null ||
    i.craneMass == null ||
    i.boxMass == null
  )
    return null;
  return r0(i.maxLadenMassRegistration - (tare + i.seatsMass + i.fuelCapacity + i.craneMass + i.boxMass));
}
// Masa_Carga_2ejesgrua_2eje = Round(Masa_carga_2ejes_grua*((Largo_exterior/2)+De_1eje_a_caja)/dist1y2;0)
export function craneLoadMmaDistributionAxle2(i: MassesInputs): number | null {
  const load = craneLoadMassMma(i);
  if (load == null || i.exteriorLength == null || i.firstAxleToBodyDistance == null || i.axleDistance1to2 == null)
    return null;
  return r0((load * (i.exteriorLength / 2 + i.firstAxleToBodyDistance)) / i.axleDistance1to2);
}
// Masa_Carga_2ejesgrua_1eje = Masa_carga_2ejes_grua - Masa_Carga_2ejesgrua_2eje
export function craneLoadMmaDistributionAxle1(i: MassesInputs): number | null {
  const load = craneLoadMassMma(i);
  const a2 = craneLoadMmaDistributionAxle2(i);
  if (load == null || a2 == null) return null;
  return load - a2;
}
// Total_grua2ejes_1eje = Tara_1_eje + Reparto_masaplazas_eje1 + Reparto_combustible_eje1 + Cajon_masa_eje1 + Masa_Carga_2ejesgrua_1eje + Masa_grua_eje1
export function totalCrane2AxleAxle1(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle1,
    seatsDistributionAxle1(i),
    fuelDistributionAxle1(i),
    craneBoxDistributionAxle1(i),
    craneLoadMmaDistributionAxle1(i),
    craneDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// Total_grua2ejes_2eje = Tara_2_eje + Reparto_combustible_eje2 + Reparto_masaplazas_eje2 + Cajon_masa_eje2 + Masa_Carga_2ejesgrua_2eje + Masa_grua_eje2
export function totalCrane2AxleAxle2(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle2,
    fuelDistributionAxle2(i),
    seatsDistributionAxle2(i),
    craneBoxDistributionAxle2(i),
    craneLoadMmaDistributionAxle2(i),
    craneDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// Total_eje1_eje2 = Total_grua2ejes_1eje + Total_grua2ejes_2eje
export function totalCrane2Axle(i: MassesInputs): number | null {
  const a1 = totalCrane2AxleAxle1(i);
  const a2 = totalCrane2AxleAxle2(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}
// MOM_grua2ejes_eje1 = Tara_1_eje + Reparto_combustible_eje1 + Cajon_masa_eje1 + Masa_grua_eje1 + Reparto_plaz_eje1_MOM
export function momCrane2AxleAxle1(i: MassesInputs): number | null {
  const parts = [i.tareAxle1, fuelDistributionAxle1(i), craneBoxDistributionAxle1(i), craneDistributionAxle1(i), driverMomDistributionAxle1(i)];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// MOM_grua2ejes_eje2 = Tara_2_eje + Reparto_combustible_eje2 + Cajon_masa_eje2 + Reparto_plaz_eje2_MOM + Masa_grua_eje2
export function momCrane2AxleAxle2(i: MassesInputs): number | null {
  const parts = [i.tareAxle2, fuelDistributionAxle2(i), craneBoxDistributionAxle2(i), driverMomDistributionAxle2(i), craneDistributionAxle2(i)];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// Total_MOM_grua2ejes = MOM_grua2ejes_eje1 + MOM_grua2ejes_eje2
export function totalMomCrane2Axle(i: MassesInputs): number | null {
  const a1 = momCrane2AxleAxle1(i);
  const a2 = momCrane2AxleAxle2(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}

// MasaMMTA_carga_2ejes_grua = Round(COC::_16.1.1 - (Tara_inicial + Masa_plazas + Capacidad_combustible + Masa_grua + Masa_cajon);0)
export function craneLoadMassMmta(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxTechnicallyPermissibleMassRequested == null ||
    tare == null ||
    i.seatsMass == null ||
    i.fuelCapacity == null ||
    i.craneMass == null ||
    i.boxMass == null
  )
    return null;
  return r0(i.maxTechnicallyPermissibleMassRequested - (tare + i.seatsMass + i.fuelCapacity + i.craneMass + i.boxMass));
}
// MasaMMTA_Carga_2ejesgrua_2eje = Round(MasaMMTA_carga_2ejes_grua*((Largo_exterior/2)+De_1eje_a_caja)/dist1y2;0)
export function craneLoadMmtaDistributionAxle2(i: MassesInputs): number | null {
  const load = craneLoadMassMmta(i);
  if (load == null || i.exteriorLength == null || i.firstAxleToBodyDistance == null || i.axleDistance1to2 == null)
    return null;
  return r0((load * (i.exteriorLength / 2 + i.firstAxleToBodyDistance)) / i.axleDistance1to2);
}
// MasaMMTA_Carga_2ejesgrua_1eje = MasaMMTA_carga_2ejes_grua - MasaMMTA_Carga_2ejesgrua_2eje
export function craneLoadMmtaDistributionAxle1(i: MassesInputs): number | null {
  const load = craneLoadMassMmta(i);
  const a2 = craneLoadMmtaDistributionAxle2(i);
  if (load == null || a2 == null) return null;
  return load - a2;
}
// TotalMMTA_grua2ejes_1eje = Tara_1_eje + Reparto_masaplazas_eje1 + Reparto_combustible_eje1 + Cajon_masa_eje1 + MasaMMTA_Carga_2ejesgrua_1eje + Masa_grua_eje1
export function totalCrane2AxleMmtaAxle1(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle1,
    seatsDistributionAxle1(i),
    fuelDistributionAxle1(i),
    craneBoxDistributionAxle1(i),
    craneLoadMmtaDistributionAxle1(i),
    craneDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// TotalMMTA_grua2ejes_2eje = Tara_2_eje + Reparto_combustible_eje2 + Reparto_masaplazas_eje2 + Cajon_masa_eje2 + MasaMMTA_Carga_2ejesgrua_2eje + Masa_grua_eje2
export function totalCrane2AxleMmtaAxle2(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle2,
    fuelDistributionAxle2(i),
    seatsDistributionAxle2(i),
    craneBoxDistributionAxle2(i),
    craneLoadMmtaDistributionAxle2(i),
    craneDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// TotalMMTA_eje1_eje2 = TotalMMTA_grua2ejes_1eje + TotalMMTA_grua2ejes_2eje
export function totalCrane2AxleMmta(i: MassesInputs): number | null {
  const a1 = totalCrane2AxleMmtaAxle1(i);
  const a2 = totalCrane2AxleMmtaAxle2(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}
// TotalMMTA_singancho_3eje (usa "Masacarga_MTMA_sin_gancho_3ejegrua" — TRIAXLE, ver esa sección)
// TotalMMTA_cargagancho_eje1_2 = Masa_carga_MMTAgancho_eje1 + Masa_carga_MMTAgancho_eje2
export function totalHookLoadMmta(i: MassesInputs): number | null {
  const a1 = hookLoadMmtaDistributionAxle1(i);
  const a2 = hookLoadMmtaDistributionAxle2(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2;
}

// Dist_centrogancho_borde_delanterovehículo = Voladizo_delantero + Cdg_gancho + dist1y2
export function hookCentreToFrontEdgeDistance(i: MassesInputs): number | null {
  if (i.frontOverhang == null || i.hookCentreOfGravity == null || i.axleDistance1to2 == null) return null;
  return i.frontOverhang + i.hookCentreOfGravity + i.axleDistance1to2;
}
// Dist_3eje_prottrasera — depende de PROTECCIONTRASERA::Dist_parte_posterior_vehículo (tabla aún no migrada, fase futura)

// Longitud_carga_eje_central = Round(18750-(Voladizo_delantero+dist1y2+Voladizo_trasero+1000);0)
export function centreAxleLoadLength(i: MassesInputs): number | null {
  const ro = rearOverhang(i);
  if (i.frontOverhang == null || i.axleDistance1to2 == null || ro == null) return null;
  return r0(18750 - (i.frontOverhang + i.axleDistance1to2 + ro + 1000));
}
// Longitud_lanza_eje_central = Round((Longitud_carga_eje_central/2)+1000+(Voladizo_trasero-Cdg_gancho);0)
export function centreAxleDrawbarLength(i: MassesInputs): number | null {
  const load = centreAxleLoadLength(i);
  const ro = rearOverhang(i);
  if (load == null || ro == null || i.hookCentreOfGravity == null) return null;
  return r0(load / 2 + 1000 + (ro - i.hookCentreOfGravity));
}
// Valor_resultante_V = Round(1,8*(Longitud_carga_eje_central^2/Longitud_lanza_eje_central^2)*(Masa_remolque_ejes_centrales/1000);0)
export function couplingValueV(i: MassesInputs): number | null {
  const load = centreAxleLoadLength(i);
  const drawbar = centreAxleDrawbarLength(i);
  if (load == null || drawbar == null || i.centreAxleTrailerMass == null || drawbar === 0) return null;
  return r0(1.8 * (load ** 2 / drawbar ** 2) * (i.centreAxleTrailerMass / 1000));
}
// Valor_resultante_Dc = Round(9,81*((COC::_17.1/1000)*(Masa_remolque_ejes_centrales/1000))/((COC::_17.1/1000)+(Masa_remolque_ejes_centrales/1000));0)
export function couplingValueDc(i: MassesInputs): number | null {
  if (i.maxLadenMassRegistration == null || i.centreAxleTrailerMass == null) return null;
  const a = i.maxLadenMassRegistration / 1000;
  const b = i.centreAxleTrailerMass / 1000;
  return r0((9.81 * (a * b)) / (a + b));
}
// Valor_resultante_D = Round(((COC::_18.3*COC::_16.1.1)/(COC::_16.1.1+COC::_18.3))*(9,81/1000);0)
export function couplingValueD(i: MassesInputs, semiTrailerCentreAxleMaxMass: number | null): number | null {
  if (semiTrailerCentreAxleMaxMass == null || i.maxTechnicallyPermissibleMassRequested == null) return null;
  return r0(
    ((semiTrailerCentreAxleMaxMass * i.maxTechnicallyPermissibleMassRequested) /
      (i.maxTechnicallyPermissibleMassRequested + semiTrailerCentreAxleMaxMass)) *
      (9.81 / 1000)
  );
}

// Resto_kinby_MMTA = Round(COC::_19-(Reparto_CARGA_MMTA_Kinby_O4+Reparto_tara_Kinby_O4);0)  [pertenece a SEMI_O4, ver esa sección]
// Resto_kinby_MMA = Round(COC::_19-(Reparto_CARGA_MMA_Kinby_O4+Reparto_tara_Kinby_O4);0)    [pertenece a SEMI_O4]

// Tara_chasis_fabricante = COC::_14.1_MOM_incompleto_eje1 + COC::_14.1_MOM_incompleto_eje2
export function manufacturerChassisTare(i: MassesInputs): number | null {
  if (i.momIncompleteAxle1 == null || i.momIncompleteAxle2 == null) return null;
  return i.momIncompleteAxle1 + i.momIncompleteAxle2;
}

// ============================================================
// TRIAXLE — vehículo rígido de 3 ejes, con grúa opcional
// ============================================================

// DtcgMMTA_3ejes = Round((dist2y3*eje3_16.2)/(eje3_16.2+eje2_16.2);0)
export function centreOfGravityDistanceMmta3Axle(i: MassesInputs): number | null {
  if (
    i.axleDistance2to3 == null ||
    i.maxTechnicallyPermissibleMassAxle3 == null ||
    i.maxTechnicallyPermissibleMassAxle2 == null
  )
    return null;
  const denom = i.maxTechnicallyPermissibleMassAxle3 + i.maxTechnicallyPermissibleMassAxle2;
  if (denom === 0) return null;
  return r0((i.axleDistance2to3 * i.maxTechnicallyPermissibleMassAxle3) / denom);
}
// DtcgMMA_3ejes = Round((dist2y3*eje3_17.2)/(eje3_17.2+eje2_17.2);0)
export function centreOfGravityDistanceMma3Axle(i: MassesInputs): number | null {
  if (
    i.axleDistance2to3 == null ||
    i.maxLadenMassRegistrationAxle3 == null ||
    i.maxLadenMassRegistrationAxle2 == null
  )
    return null;
  const denom = i.maxLadenMassRegistrationAxle3 + i.maxLadenMassRegistrationAxle2;
  if (denom === 0) return null;
  return r0((i.axleDistance2to3 * i.maxLadenMassRegistrationAxle3) / denom);
}
// DEE_MTMA_3ejes = dist1y2 + DtcgMMTA_3ejes
export function equivalentAxleDistanceMmta3Axle(i: MassesInputs): number | null {
  const d = centreOfGravityDistanceMmta3Axle(i);
  if (i.axleDistance1to2 == null || d == null) return null;
  return i.axleDistance1to2 + d;
}
// DEE_MMA_3ejes = dist1y2 + DtcgMMA_3ejes
export function equivalentAxleDistanceMma3Axle(i: MassesInputs): number | null {
  const d = centreOfGravityDistanceMma3Axle(i);
  if (i.axleDistance1to2 == null || d == null) return null;
  return i.axleDistance1to2 + d;
}

// VPMTMA_3ejes = Round(Largo_exterior - (DEE_MTMA_3ejes - De_1eje_a_caja);0)
export function pivotPointMmta3Axle(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMmta3Axle(i);
  if (i.exteriorLength == null || dee == null || i.firstAxleToBodyDistance == null) return null;
  return r0(i.exteriorLength - (dee - i.firstAxleToBodyDistance));
}
// VPMMA_3ejes = Round(Largo_exterior - (DEE_MMA_3ejes - De_1eje_a_caja);0)
export function pivotPointMma3Axle(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMma3Axle(i);
  if (i.exteriorLength == null || dee == null || i.firstAxleToBodyDistance == null) return null;
  return r0(i.exteriorLength - (dee - i.firstAxleToBodyDistance));
}
// Voladizo_trasero_3ejes = (De_1eje_a_caja + Largo_exterior) - (dist1y2 + dist2y3)
export function rearOverhang3Axle(i: MassesInputs): number | null {
  if (
    i.firstAxleToBodyDistance == null ||
    i.exteriorLength == null ||
    i.axleDistance1to2 == null ||
    i.axleDistance2to3 == null
  )
    return null;
  return i.firstAxleToBodyDistance + i.exteriorLength - (i.axleDistance1to2 + i.axleDistance2to3);
}

// PL_MTMA_1eje_3ejes = Round(Masa_plazas*(DEE_MTMA_3ejes-Cdg_plazas)/DEE_MTMA_3ejes;0)
export function seatsMmta3AxleAxle1(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMmta3Axle(i);
  if (i.seatsMass == null || dee == null || i.seatsCentreOfGravity == null || dee === 0) return null;
  return r0((i.seatsMass * (dee - i.seatsCentreOfGravity)) / dee);
}
// PL_MTMA_2eje_3ejes = Round(Masa_plazas*(DEE_MTMA_3ejes-(DEE_MTMA_3ejes-Cdg_plazas))/DEE_MTMA_3ejes;0)
export function seatsMmta3AxleAxle2(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMmta3Axle(i);
  if (i.seatsMass == null || dee == null || i.seatsCentreOfGravity == null || dee === 0) return null;
  return r0((i.seatsMass * (dee - (dee - i.seatsCentreOfGravity))) / dee);
}
// PL_MMA_1eje_3ejes / PL_MMA_2eje_3ejes — igual que arriba con DEE_MMA_3ejes
export function seatsMma3AxleAxle1(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMma3Axle(i);
  if (i.seatsMass == null || dee == null || i.seatsCentreOfGravity == null || dee === 0) return null;
  return r0((i.seatsMass * (dee - i.seatsCentreOfGravity)) / dee);
}
export function seatsMma3AxleAxle2(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMma3Axle(i);
  if (i.seatsMass == null || dee == null || i.seatsCentreOfGravity == null || dee === 0) return null;
  return r0((i.seatsMass * (dee - (dee - i.seatsCentreOfGravity))) / dee);
}
// PL_MOM_MMA_1eje_3ejes = Round(75*(DEE_MMA_3ejes-Cdg_plazas)/DEE_MMA_3ejes;0)
export function driverMomMma3AxleAxle1(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMma3Axle(i);
  if (dee == null || i.seatsCentreOfGravity == null || dee === 0) return null;
  return r0((75 * (dee - i.seatsCentreOfGravity)) / dee);
}
// PL_MOM_MMA_2eje_3ejes = Round(75*(DEE_MMA_3ejes-(DEE_MMA_3ejes-Cdg_plazas))/DEE_MMA_3ejes;0)
export function driverMomMma3AxleAxle2(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMma3Axle(i);
  if (dee == null || i.seatsCentreOfGravity == null || dee === 0) return null;
  return r0((75 * (dee - (dee - i.seatsCentreOfGravity))) / dee);
}
// MOM_MMA_1PLAZA_eje1_3eje / eje2y3 = PL_MMA_.../ 2
export function driverMom3AxleAxle1(i: MassesInputs): number | null {
  const v = seatsMma3AxleAxle1(i);
  return v == null ? null : v / 2;
}
export function driverMom3AxleAxle2y3(i: MassesInputs): number | null {
  const v = seatsMma3AxleAxle2(i);
  return v == null ? null : v / 2;
}

// Comb_MTMA_1eje_3ejes = Round(Capacidad_combustible*(DEE_MTMA_3ejes-Cdg_combustible)/DEE_MTMA_3ejes;0)
export function fuelMmta3AxleAxle1(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMmta3Axle(i);
  if (i.fuelCapacity == null || dee == null || i.fuelCentreOfGravity == null || dee === 0) return null;
  return r0((i.fuelCapacity * (dee - i.fuelCentreOfGravity)) / dee);
}
export function fuelMmta3AxleAxle2(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMmta3Axle(i);
  if (i.fuelCapacity == null || dee == null || i.fuelCentreOfGravity == null || dee === 0) return null;
  return r0((i.fuelCapacity * (dee - (dee - i.fuelCentreOfGravity))) / dee);
}
export function fuelMma3AxleAxle1(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMma3Axle(i);
  if (i.fuelCapacity == null || dee == null || i.fuelCentreOfGravity == null || dee === 0) return null;
  return r0((i.fuelCapacity * (dee - i.fuelCentreOfGravity)) / dee);
}
export function fuelMma3AxleAxle2(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMma3Axle(i);
  if (i.fuelCapacity == null || dee == null || i.fuelCentreOfGravity == null || dee === 0) return null;
  return r0((i.fuelCapacity * (dee - (dee - i.fuelCentreOfGravity))) / dee);
}

// Grua_MTMA_1eje_3ejes = Round(Masa_grua*(DEE_MTMA_3ejes-Cdg_GRUA)/DEE_MTMA_3ejes;0)
export function crane3AxleMmtaAxle1(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMmta3Axle(i);
  if (i.craneMass == null || dee == null || i.craneCentreOfGravity == null || dee === 0) return null;
  return r0((i.craneMass * (dee - i.craneCentreOfGravity)) / dee);
}
export function crane3AxleMmtaAxle2(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMmta3Axle(i);
  if (i.craneMass == null || dee == null || i.craneCentreOfGravity == null || dee === 0) return null;
  return r0((i.craneMass * (dee - (dee - i.craneCentreOfGravity))) / dee);
}
export function crane3AxleMmaAxle1(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMma3Axle(i);
  if (i.craneMass == null || dee == null || i.craneCentreOfGravity == null || dee === 0) return null;
  return r0((i.craneMass * (dee - i.craneCentreOfGravity)) / dee);
}
export function crane3AxleMmaAxle2(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMma3Axle(i);
  if (i.craneMass == null || dee == null || i.craneCentreOfGravity == null || dee === 0) return null;
  return r0((i.craneMass * (dee - (dee - i.craneCentreOfGravity))) / dee);
}

// Masacarga_MTMA_sin_gancho_3ejegrua = COC::_16.1.1 - (Masa_grua+Capacidad_combustible+Masa_plazas+Tara_inicial)
export function craneLoadMmta3AxleNoHook(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxTechnicallyPermissibleMassRequested == null ||
    i.craneMass == null ||
    i.fuelCapacity == null ||
    i.seatsMass == null ||
    tare == null
  )
    return null;
  return i.maxTechnicallyPermissibleMassRequested - (i.craneMass + i.fuelCapacity + i.seatsMass + tare);
}
// Masacarga_MTMA_con_gancho_3ejegrua = ...- COC::_19
export function craneLoadMmta3AxleWithHook(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxTechnicallyPermissibleMassRequested == null ||
    i.craneMass == null ||
    i.fuelCapacity == null ||
    i.seatsMass == null ||
    tare == null ||
    i.staticCouplingPointMass == null
  )
    return null;
  return (
    i.maxTechnicallyPermissibleMassRequested - (i.craneMass + i.fuelCapacity + i.seatsMass + tare + i.staticCouplingPointMass)
  );
}
// Masacarga_MMA_sin_gancho_3ejegrua = COC::_17.1 - (Masa_grua+Capacidad_combustible+Masa_plazas+Tara_inicial)
export function craneLoadMma3AxleNoHook(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxLadenMassRegistration == null ||
    i.craneMass == null ||
    i.fuelCapacity == null ||
    i.seatsMass == null ||
    tare == null
  )
    return null;
  return i.maxLadenMassRegistration - (i.craneMass + i.fuelCapacity + i.seatsMass + tare);
}
export function craneLoadMma3AxleWithHook(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  if (
    i.maxLadenMassRegistration == null ||
    i.craneMass == null ||
    i.fuelCapacity == null ||
    i.seatsMass == null ||
    tare == null ||
    i.staticCouplingPointMass == null
  )
    return null;
  return i.maxLadenMassRegistration - (i.craneMass + i.fuelCapacity + i.seatsMass + tare + i.staticCouplingPointMass);
}

// RepartocargaMTMA_eje1_singancho_3ejes = Round(Masacarga_MTMA_sin_gancho_3ejegrua*((Largo_exterior/2)-VPMTMA_3ejes)/DEE_MTMA_3ejes;0)
export function craneLoadMmta3AxleNoHookDistributionAxle1(i: MassesInputs): number | null {
  const load = craneLoadMmta3AxleNoHook(i);
  const vp = pivotPointMmta3Axle(i);
  const dee = equivalentAxleDistanceMmta3Axle(i);
  if (load == null || vp == null || dee == null || i.exteriorLength == null || dee === 0) return null;
  return r0((load * (i.exteriorLength / 2 - vp)) / dee);
}
// RepartocargaMTMA_eje2_singancho_3ejes = Masacarga_MTMA_sin_gancho_3ejegrua - eje1
export function craneLoadMmta3AxleNoHookDistributionAxle2(i: MassesInputs): number | null {
  const load = craneLoadMmta3AxleNoHook(i);
  const a1 = craneLoadMmta3AxleNoHookDistributionAxle1(i);
  if (load == null || a1 == null) return null;
  return r0(load - a1);
}
export function craneLoadMmta3AxleWithHookDistributionAxle1(i: MassesInputs): number | null {
  const load = craneLoadMmta3AxleWithHook(i);
  const vp = pivotPointMmta3Axle(i);
  const dee = equivalentAxleDistanceMmta3Axle(i);
  if (load == null || vp == null || dee == null || i.exteriorLength == null || dee === 0) return null;
  return r0((load * (i.exteriorLength / 2 - vp)) / dee);
}
export function craneLoadMmta3AxleWithHookDistributionAxle2(i: MassesInputs): number | null {
  const load = craneLoadMmta3AxleWithHook(i);
  const a1 = craneLoadMmta3AxleWithHookDistributionAxle1(i);
  if (load == null || a1 == null) return null;
  return r0(load - a1);
}
export function craneLoadMma3AxleNoHookDistributionAxle1(i: MassesInputs): number | null {
  const load = craneLoadMma3AxleNoHook(i);
  const vp = pivotPointMma3Axle(i);
  const dee = equivalentAxleDistanceMma3Axle(i);
  if (load == null || vp == null || dee == null || i.exteriorLength == null || dee === 0) return null;
  return r0((load * (i.exteriorLength / 2 - vp)) / dee);
}
export function craneLoadMma3AxleNoHookDistributionAxle2(i: MassesInputs): number | null {
  const load = craneLoadMma3AxleNoHook(i);
  const a1 = craneLoadMma3AxleNoHookDistributionAxle1(i);
  if (load == null || a1 == null) return null;
  return r0(load - a1);
}
export function craneLoadMma3AxleWithHookDistributionAxle1(i: MassesInputs): number | null {
  const load = craneLoadMma3AxleWithHook(i);
  const vp = pivotPointMma3Axle(i);
  const dee = equivalentAxleDistanceMma3Axle(i);
  if (load == null || vp == null || dee == null || i.exteriorLength == null || dee === 0) return null;
  return r0((load * (i.exteriorLength / 2 - vp)) / dee);
}
export function craneLoadMma3AxleWithHookDistributionAxle2(i: MassesInputs): number | null {
  const load = craneLoadMma3AxleWithHook(i);
  const a1 = craneLoadMma3AxleWithHookDistributionAxle1(i);
  if (load == null || a1 == null) return null;
  return r0(load - a1);
}

// RepartoMMTA_gancho1eje_3eje = Round(COC::_19*(DEE_MTMA_3ejes-(DEE_MTMA_3ejes+Cdg_gancho))/DEE_MTMA_3ejes;0)
export function hook3AxleMmtaDistributionAxle1(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMmta3Axle(i);
  if (i.staticCouplingPointMass == null || dee == null || i.hookCentreOfGravity == null || dee === 0) return null;
  return r0((i.staticCouplingPointMass * (dee - (dee + i.hookCentreOfGravity))) / dee);
}
// RepartoMMTA_gancho2eje_3eje = COC::_19 - eje1
export function hook3AxleMmtaDistributionAxle2(i: MassesInputs): number | null {
  const a1 = hook3AxleMmtaDistributionAxle1(i);
  if (i.staticCouplingPointMass == null || a1 == null) return null;
  return i.staticCouplingPointMass - a1;
}
export function hook3AxleMmaDistributionAxle1(i: MassesInputs): number | null {
  const dee = equivalentAxleDistanceMma3Axle(i);
  if (i.staticCouplingPointMass == null || dee == null || i.hookCentreOfGravity == null || dee === 0) return null;
  return r0((i.staticCouplingPointMass * (dee - (dee + i.hookCentreOfGravity))) / dee);
}
export function hook3AxleMmaDistributionAxle2(i: MassesInputs): number | null {
  const a1 = hook3AxleMmaDistributionAxle1(i);
  if (i.staticCouplingPointMass == null || a1 == null) return null;
  return i.staticCouplingPointMass - a1;
}

// TotalMMTA_eje1_singancho_3eje = Tara_1_eje + PL_MTMA_1eje_3ejes + Comb_MTMA_1eje_3ejes + Grua_MTMA_1eje_3ejes + RepartocargaMTMA_eje1_singancho_3ejes
export function total3AxleMmtaNoHookAxle1(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle1,
    seatsMmta3AxleAxle1(i),
    fuelMmta3AxleAxle1(i),
    crane3AxleMmtaAxle1(i),
    craneLoadMmta3AxleNoHookDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
export function total3AxleMmtaNoHookAxle2(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle2,
    seatsMmta3AxleAxle2(i),
    fuelMmta3AxleAxle2(i),
    crane3AxleMmtaAxle2(i),
    craneLoadMmta3AxleNoHookDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
// TotalMMTA_singancho_3eje = Tara_inicial + Masa_plazas + Capacidad_combustible + Masacarga_MTMA_sin_gancho_3ejegrua + Masa_grua
export function total3AxleMmtaNoHook(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  const load = craneLoadMmta3AxleNoHook(i);
  if (tare == null || i.seatsMass == null || i.fuelCapacity == null || load == null || i.craneMass == null)
    return null;
  return tare + i.seatsMass + i.fuelCapacity + load + i.craneMass;
}
// TotalMMTA_congancho_3eje = Tara_inicial + Masa_plazas + Capacidad_combustible + Masa_grua + Masacarga_MTMA_con_gancho_3ejegrua + COC::_19
export function total3AxleMmtaWithHook(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  const load = craneLoadMmta3AxleWithHook(i);
  if (
    tare == null ||
    i.seatsMass == null ||
    i.fuelCapacity == null ||
    i.craneMass == null ||
    load == null ||
    i.staticCouplingPointMass == null
  )
    return null;
  return tare + i.seatsMass + i.fuelCapacity + i.craneMass + load + i.staticCouplingPointMass;
}
export function total3AxleMmtaWithHookAxle1(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle1,
    seatsMmta3AxleAxle1(i),
    fuelMmta3AxleAxle1(i),
    crane3AxleMmtaAxle1(i),
    craneLoadMmta3AxleWithHookDistributionAxle1(i),
    hook3AxleMmtaDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
export function total3AxleMmtaWithHookAxle2(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle2,
    seatsMmta3AxleAxle2(i),
    fuelMmta3AxleAxle2(i),
    crane3AxleMmtaAxle2(i),
    craneLoadMmta3AxleWithHookDistributionAxle2(i),
    hook3AxleMmtaDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}

export function total3AxleMmaNoHookAxle1(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle1,
    seatsMma3AxleAxle1(i),
    fuelMma3AxleAxle1(i),
    crane3AxleMmaAxle1(i),
    craneLoadMma3AxleNoHookDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
export function total3AxleMmaNoHookAxle2(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle2,
    seatsMma3AxleAxle2(i),
    fuelMma3AxleAxle2(i),
    crane3AxleMmaAxle2(i),
    craneLoadMma3AxleNoHookDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
export function total3AxleMmaWithHook(i: MassesInputs): number | null {
  const tare = initialTareNoAccessories(i);
  const load = craneLoadMma3AxleWithHook(i);
  if (
    tare == null ||
    i.seatsMass == null ||
    i.fuelCapacity == null ||
    i.craneMass == null ||
    load == null ||
    i.staticCouplingPointMass == null
  )
    return null;
  return tare + i.seatsMass + i.fuelCapacity + i.craneMass + load + i.staticCouplingPointMass;
}
export function total3AxleMmaWithHookAxle1(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle1,
    seatsMma3AxleAxle1(i),
    fuelMma3AxleAxle1(i),
    crane3AxleMmaAxle1(i),
    craneLoadMma3AxleWithHookDistributionAxle1(i),
    hook3AxleMmaDistributionAxle1(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}
export function total3AxleMmaWithHookAxle2(i: MassesInputs): number | null {
  const parts = [
    i.tareAxle2,
    seatsMma3AxleAxle2(i),
    fuelMma3AxleAxle2(i),
    crane3AxleMmaAxle2(i),
    craneLoadMma3AxleWithHookDistributionAxle2(i),
    hook3AxleMmaDistributionAxle2(i),
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((s, p) => s! + p!, 0);
}

// MOM_MMA_1eje_3eje = Round(Tara_1_eje + PL_MOM_MMA_1eje_3ejes + Comb_MMA_1eje_3ejes + Grua_MMA_1eje_3ejes;0)
export function mom3AxleAxle1(i: MassesInputs): number | null {
  const parts = [i.tareAxle1, driverMomMma3AxleAxle1(i), fuelMma3AxleAxle1(i), crane3AxleMmaAxle1(i)];
  if (parts.some((p) => p == null)) return null;
  return r0(parts.reduce((s, p) => s! + p!, 0)!);
}
// MOM_MMA_suma2y3eje_3eje = Round(Tara_2_eje + PL_MOM_MMA_2eje_3ejes + Comb_MMA_2eje_3ejes + Grua_MMA_2eje_3ejes;0)
export function mom3AxleAxle2and3(i: MassesInputs): number | null {
  const parts = [i.tareAxle2, driverMomMma3AxleAxle2(i), fuelMma3AxleAxle2(i), crane3AxleMmaAxle2(i)];
  if (parts.some((p) => p == null)) return null;
  return r0(parts.reduce((s, p) => s! + p!, 0)!);
}
// MOM_MMA_3ejes = MOM_MMA_1eje_3eje + MOM_MMA_suma2y3eje_3eje
export function mom3Axle(i: MassesInputs): number | null {
  const a1 = mom3AxleAxle1(i);
  const a23 = mom3AxleAxle2and3(i);
  if (a1 == null || a23 == null) return null;
  return a1 + a23;
}

// ============================================================
// SEMI_O4 — semirremolque de 2 ejes (kingpin)
// ============================================================

// DtcgeT_O4 = Round((dist1y2*eje2_16.2)/(eje2_16.2+eje1_16.2);0)
export function centreOfGravityDistanceMtO4(i: MassesInputs): number | null {
  if (
    i.axleDistance1to2 == null ||
    i.maxTechnicallyPermissibleMassAxle2 == null ||
    i.maxTechnicallyPermissibleMassAxle1 == null
  )
    return null;
  const denom = i.maxTechnicallyPermissibleMassAxle2 + i.maxTechnicallyPermissibleMassAxle1;
  if (denom === 0) return null;
  return r0((i.axleDistance1to2 * i.maxTechnicallyPermissibleMassAxle2) / denom);
}
// DtcgeM_O4 = Round((dist1y2*eje2_17.2)/(eje2_17.2+eje1_17.2);0)
export function centreOfGravityDistanceMmO4(i: MassesInputs): number | null {
  if (
    i.axleDistance1to2 == null ||
    i.maxLadenMassRegistrationAxle2 == null ||
    i.maxLadenMassRegistrationAxle1 == null
  )
    return null;
  const denom = i.maxLadenMassRegistrationAxle2 + i.maxLadenMassRegistrationAxle1;
  if (denom === 0) return null;
  return r0((i.axleDistance1to2 * i.maxLadenMassRegistrationAxle2) / denom);
}
// DEET_O4 = Round(dist0_1 + DtcgeT_O4;0)
export function equivalentDistanceMtO4(i: MassesInputs): number | null {
  const d = centreOfGravityDistanceMtO4(i);
  if (i.axleDistance0to1 == null || d == null) return null;
  return r0(i.axleDistance0to1 + d);
}
// DEEM_O4 = Round(dist0_1 + DtcgeM_O4;0)
export function equivalentDistanceMmO4(i: MassesInputs): number | null {
  const d = centreOfGravityDistanceMmO4(i);
  if (i.axleDistance0to1 == null || d == null) return null;
  return r0(i.axleDistance0to1 + d);
}
// VPT_O4 = Round(Largo_carrozado_O4 - (dist0_1 + DtcgeT_O4 + Voladizo_delantero);0)
export function pivotPointTO4(i: MassesInputs): number | null {
  const d = centreOfGravityDistanceMtO4(i);
  if (i.semiTrailerBodyLength == null || i.axleDistance0to1 == null || d == null || i.frontOverhang == null)
    return null;
  return r0(i.semiTrailerBodyLength - (i.axleDistance0to1 + d + i.frontOverhang));
}
// VPM_O4 = Round(Largo_carrozado_O4 - (dist0_1 + DtcgeM_O4 + Voladizo_delantero);0)
export function pivotPointMO4(i: MassesInputs): number | null {
  const d = centreOfGravityDistanceMmO4(i);
  if (i.semiTrailerBodyLength == null || i.axleDistance0to1 == null || d == null || i.frontOverhang == null)
    return null;
  return r0(i.semiTrailerBodyLength - (i.axleDistance0to1 + d + i.frontOverhang));
}
// VP_O4 = Round(Largo_total_O4 - (Voladizo_delantero + dist0_1 + dist1y2 + dist2y3);0)
export function pivotPointO4(i: MassesInputs): number | null {
  if (
    i.semiTrailerTotalLength == null ||
    i.frontOverhang == null ||
    i.axleDistance0to1 == null ||
    i.axleDistance1to2 == null ||
    i.axleDistance2to3 == null
  )
    return null;
  return r0(
    i.semiTrailerTotalLength - (i.frontOverhang + i.axleDistance0to1 + i.axleDistance1to2 + i.axleDistance2to3)
  );
}

// Superficie_suelo_cubierta_O4 = Round((Ancho_maximo_vehículo/1000)*(Largo_carrozado_O4/1000);0)
export function coveredFloorAreaO4(i: MassesInputs): number | null {
  if (i.maxVehicleWidth == null || i.semiTrailerBodyLength == null) return null;
  return r0((i.maxVehicleWidth / 1000) * (i.semiTrailerBodyLength / 1000));
}

// Masa_Carga_MMTA_04 = COC::_16.1.1 - TARA_O4
export function loadMassMmtaO4(i: MassesInputs): number | null {
  if (i.maxTechnicallyPermissibleMassRequested == null || i.semiTrailerTare == null) return null;
  return i.maxTechnicallyPermissibleMassRequested - i.semiTrailerTare;
}
// Masa_Carga_MMA_04 = COC::_17.1 - TARA_O4
export function loadMassMmaO4(i: MassesInputs): number | null {
  if (i.maxLadenMassRegistration == null || i.semiTrailerTare == null) return null;
  return i.maxLadenMassRegistration - i.semiTrailerTare;
}

// Reparto_CARGA_MMTA_Kinby_O4 = Round(Masa_Carga_MMTA_04*((Largo_carrozado_O4/2)-VPT_O4)/DEET_O4;0)
export function loadMmtaKingpinDistributionO4(i: MassesInputs): number | null {
  const load = loadMassMmtaO4(i);
  const vp = pivotPointTO4(i);
  const dee = equivalentDistanceMtO4(i);
  if (load == null || vp == null || dee == null || i.semiTrailerBodyLength == null || dee === 0) return null;
  return r0((load * (i.semiTrailerBodyLength / 2 - vp)) / dee);
}
// Reparto_CARGA_MMTA_grupoejes_1_2_O4 = Masa_Carga_MMTA_04 - Reparto_CARGA_MMTA_Kinby_O4
export function loadMmtaAxleGroupDistributionO4(i: MassesInputs): number | null {
  const load = loadMassMmtaO4(i);
  const kingpin = loadMmtaKingpinDistributionO4(i);
  if (load == null || kingpin == null) return null;
  return r0(load - kingpin);
}
// Reparto_CARGA_MMA_Kinby_O4 = Round(Masa_Carga_MMA_04*((Largo_carrozado_O4/2)-VPM_O4)/DEEM_O4;0)
export function loadMmaKingpinDistributionO4(i: MassesInputs): number | null {
  const load = loadMassMmaO4(i);
  const vp = pivotPointMO4(i);
  const dee = equivalentDistanceMmO4(i);
  if (load == null || vp == null || dee == null || i.semiTrailerBodyLength == null || dee === 0) return null;
  return r0((load * (i.semiTrailerBodyLength / 2 - vp)) / dee);
}
export function loadMmaAxleGroupDistributionO4(i: MassesInputs): number | null {
  const load = loadMassMmaO4(i);
  const kingpin = loadMmaKingpinDistributionO4(i);
  if (load == null || kingpin == null) return null;
  return r0(load - kingpin);
}

// Reparto_tara_Kinby_O4 = Round(TARA_O4*((Largo_carrozado_O4/2)-(VP_O4+((dist1y2+dist2y3)/2)))/(dist0_1+((dist1y2+dist2y3)/2));0)
export function tareKingpinDistributionO4(i: MassesInputs): number | null {
  const vp = pivotPointO4(i);
  if (
    i.semiTrailerTare == null ||
    i.semiTrailerBodyLength == null ||
    vp == null ||
    i.axleDistance1to2 == null ||
    i.axleDistance2to3 == null ||
    i.axleDistance0to1 == null
  )
    return null;
  const half = (i.axleDistance1to2 + i.axleDistance2to3) / 2;
  const denom = i.axleDistance0to1 + half;
  if (denom === 0) return null;
  return r0((i.semiTrailerTare * (i.semiTrailerBodyLength / 2 - (vp + half))) / denom);
}
// Reparto_tara_eje1_eje2_O4 = Round(TARA_O4 - Reparto_tara_Kinby_O4;0)
export function tareAxleGroupDistributionO4(i: MassesInputs): number | null {
  const kingpin = tareKingpinDistributionO4(i);
  if (i.semiTrailerTare == null || kingpin == null) return null;
  return r0(i.semiTrailerTare - kingpin);
}

// Reparto_totalMMTA_kinby_O4 = Reparto_CARGA_MMTA_Kinby_O4 + Reparto_tara_Kinby_O4
export function totalMmtaKingpinO4(i: MassesInputs): number | null {
  const load = loadMmtaKingpinDistributionO4(i);
  const tare = tareKingpinDistributionO4(i);
  if (load == null || tare == null) return null;
  return load + tare;
}
// Reparto_totalMMAT_ejes1_2_O4 = Reparto_CARGA_MMTA_grupoejes_1_2_O4 + Reparto_tara_eje1_eje2_O4
export function totalMmtaAxleGroupO4(i: MassesInputs): number | null {
  const load = loadMmtaAxleGroupDistributionO4(i);
  const tare = tareAxleGroupDistributionO4(i);
  if (load == null || tare == null) return null;
  return load + tare;
}
// Reparto_totalMMA_kinby_O4 = Reparto_CARGA_MMA_Kinby_O4 + Reparto_tara_Kinby_O4
export function totalMmaKingpinO4(i: MassesInputs): number | null {
  const load = loadMmaKingpinDistributionO4(i);
  const tare = tareKingpinDistributionO4(i);
  if (load == null || tare == null) return null;
  return load + tare;
}
// Reparto_totalMMA_ejes1_2_O4 = Reparto_tara_eje1_eje2_O4 + Reparto_CARGA_MMA_grupoejes_1_2_O4
export function totalMmaAxleGroupO4(i: MassesInputs): number | null {
  const load = loadMmaAxleGroupDistributionO4(i);
  const tare = tareAxleGroupDistributionO4(i);
  if (load == null || tare == null) return null;
  return load + tare;
}

// Resto_kinby_MMTA = Round(COC::_19-(Reparto_CARGA_MMTA_Kinby_O4+Reparto_tara_Kinby_O4);0)
export function remainingKingpinMmta(i: MassesInputs): number | null {
  const total = totalMmtaKingpinO4(i);
  if (i.staticCouplingPointMass == null || total == null) return null;
  return r0(i.staticCouplingPointMass - total);
}
// Resto_kinby_MMA = Round(COC::_19-(Reparto_CARGA_MMA_Kinby_O4+Reparto_tara_Kinby_O4);0)
export function remainingKingpinMma(i: MassesInputs): number | null {
  const total = totalMmaKingpinO4(i);
  if (i.staticCouplingPointMass == null || total == null) return null;
  return r0(i.staticCouplingPointMass - total);
}
// Resto_ejes_MMTA_O4 = Round((eje1_16.2+eje2_16.2)-(Reparto_CARGA_MMTA_grupoejes_1_2_O4+Reparto_tara_eje1_eje2_O4);0)
export function remainingAxleGroupMmta(i: MassesInputs): number | null {
  const total = totalMmtaAxleGroupO4(i);
  if (i.maxTechnicallyPermissibleMassAxle1 == null || i.maxTechnicallyPermissibleMassAxle2 == null || total == null)
    return null;
  return r0(i.maxTechnicallyPermissibleMassAxle1 + i.maxTechnicallyPermissibleMassAxle2 - total);
}
// Resto_ejes_MMA_O4 = Round((eje1_17.2+eje2_17.2)-(Reparto_CARGA_MMA_grupoejes_1_2_O4+Reparto_tara_eje1_eje2_O4);0)
export function remainingAxleGroupMma(i: MassesInputs): number | null {
  const total = totalMmaAxleGroupO4(i);
  if (i.maxLadenMassRegistrationAxle1 == null || i.maxLadenMassRegistrationAxle2 == null || total == null)
    return null;
  return r0(i.maxLadenMassRegistrationAxle1 + i.maxLadenMassRegistrationAxle2 - total);
}

/** Calcula todo el bloque SEMI_O4 de una vez, para el formulario. */
export function calculateSemiO4Masses(i: MassesInputs) {
  return {
    coveredFloorAreaO4: coveredFloorAreaO4(i),
    loadMassMmtaO4: loadMassMmtaO4(i),
    loadMassMmaO4: loadMassMmaO4(i),
    totalMmtaKingpinO4: totalMmtaKingpinO4(i),
    totalMmtaAxleGroupO4: totalMmtaAxleGroupO4(i),
    totalMmaKingpinO4: totalMmaKingpinO4(i),
    totalMmaAxleGroupO4: totalMmaAxleGroupO4(i),
    remainingKingpinMmta: remainingKingpinMmta(i),
    remainingKingpinMma: remainingKingpinMma(i),
    remainingAxleGroupMmta: remainingAxleGroupMmta(i),
    remainingAxleGroupMma: remainingAxleGroupMma(i),
  };
}

// ============================================================
// SEMI_O4_3AXLE — semirremolque de 3 ejes (kingpin + grupo de ejes)
// ============================================================

// O4semi_3_kingpin_a_centro_ejes = Round(dist0_1+((dist1y2+dist2y3)/2);0)
export function kingpinToAxleCentre3Axle(i: MassesInputs): number | null {
  if (i.axleDistance0to1 == null || i.axleDistance1to2 == null || i.axleDistance2to3 == null) return null;
  return r0(i.axleDistance0to1 + (i.axleDistance1to2 + i.axleDistance2to3) / 2);
}
// O4semi_3_VP_a_centro_ejes = O4semi_3VP + ((dist1y2+dist2y3)/2)
export function pivotToAxleCentre3Axle(i: MassesInputs): number | null {
  if (i.semiTrailer3AxleVp == null || i.axleDistance1to2 == null || i.axleDistance2to3 == null) return null;
  return i.semiTrailer3AxleVp + (i.axleDistance1to2 + i.axleDistance2to3) / 2;
}
// O4semi3_VD_diferentcia = O4semi3_VD_accesorio - O4semi_3VD
export function vdDifference3Axle(i: MassesInputs): number | null {
  if (i.semiTrailer3AxleVdAccessory == null || i.semiTrailer3AxleVd == null) return null;
  return i.semiTrailer3AxleVdAccessory - i.semiTrailer3AxleVd;
}

// O4semi_3_tara_inicial = COC::_14_MOM_vehiculo_incompleto
export function initialTare3AxleSemi(i: MassesInputs): number | null {
  return i.momIncompleteVehicle;
}
// O4semi_3_tara_inicial_1eje/2eje/3eje = COC::_14.1_MOM_incompleto_ejeN (eje3 no está en Coc todavía — fase futura)
export function initialTare3AxleSemiAxle1(i: MassesInputs): number | null {
  return i.momIncompleteAxle1;
}
export function initialTare3AxleSemiAxle2(i: MassesInputs): number | null {
  return i.momIncompleteAxle2;
}
// O4semi_3_tara_inicial_grupo_ejes123 = suma de los 3 ejes (eje3 pendiente de mapear en Coc, ver nota arriba)
export function initialTareAxleGroup3Axle(i: MassesInputs): number | null {
  const a1 = initialTare3AxleSemiAxle1(i);
  const a2 = initialTare3AxleSemiAxle2(i);
  if (a1 == null || a2 == null) return null;
  return a1 + a2; // TODO: + eje3 cuando Coc tenga _14.1_MOM_incompleto_eje3
}
// O4semi_3_tara_inicial_kingpin = O4semi_3_tara_inicial - O4semi_3_tara_inicial_grupo_ejes123
export function initialTareKingpin3Axle(i: MassesInputs): number | null {
  const total = initialTare3AxleSemi(i);
  const group = initialTareAxleGroup3Axle(i);
  if (total == null || group == null) return null;
  return total - group;
}

// O4semi_3_reparto_carrozado_ejes123 = Round(O4semi_3_peso_carrozado*(O4semi_3LC/2-O4semi_3VD)/O4semi_3_kingpin_a_centro_ejes;0)
export function bodyDistributionAxleGroup3Axle(i: MassesInputs): number | null {
  const centre = kingpinToAxleCentre3Axle(i);
  if (
    i.semiTrailer3AxleBodyWeight == null ||
    i.semiTrailer3AxleLc == null ||
    i.semiTrailer3AxleVd == null ||
    centre == null ||
    centre === 0
  )
    return null;
  return r0((i.semiTrailer3AxleBodyWeight * (i.semiTrailer3AxleLc / 2 - i.semiTrailer3AxleVd)) / centre);
}
// O4semi_3_reparto_carrozado_kingpin = O4semi_3_peso_carrozado - O4semi_3_reparto_carrozado_ejes123
export function bodyDistributionKingpin3Axle(i: MassesInputs): number | null {
  const group = bodyDistributionAxleGroup3Axle(i);
  if (i.semiTrailer3AxleBodyWeight == null || group == null) return null;
  return i.semiTrailer3AxleBodyWeight - group;
}
// O4semi_3_masa_carrozado_ejeN = Round(O4semi_3_reparto_carrozado_ejes123/3;0)
export function bodyMassPerAxle3Axle(i: MassesInputs): number | null {
  const group = bodyDistributionAxleGroup3Axle(i);
  if (group == null) return null;
  return r0(group / 3);
}

// O4semi3_MOM = O4semi_3_tara_inicial + O4semi_3_peso_carrozado
export function mom3AxleSemi(i: MassesInputs): number | null {
  const tare = initialTare3AxleSemi(i);
  if (tare == null || i.semiTrailer3AxleBodyWeight == null) return null;
  return tare + i.semiTrailer3AxleBodyWeight;
}

// O4semi_3_caraga_MMA = Round(COC::_17.1 - (O4semi_3_tara_inicial+O4semi_3_peso_carrozado);0)
export function loadMma3AxleSemi(i: MassesInputs): number | null {
  const mom = mom3AxleSemi(i);
  if (i.maxLadenMassRegistration == null || mom == null) return null;
  return r0(i.maxLadenMassRegistration - mom);
}
// O4semi_3_caraga_MMA_grupo_ejes123 = Round(O4semi_3_caraga_MMA*(O4semi_3LC/2-O4semi_3VD)/O4semi_3_kingpin_a_centro_ejes;0)
export function loadMmaAxleGroup3Axle(i: MassesInputs): number | null {
  const load = loadMma3AxleSemi(i);
  const centre = kingpinToAxleCentre3Axle(i);
  if (load == null || i.semiTrailer3AxleLc == null || i.semiTrailer3AxleVd == null || centre == null || centre === 0)
    return null;
  return r0((load * (i.semiTrailer3AxleLc / 2 - i.semiTrailer3AxleVd)) / centre);
}
// O4semi_3_caraga_MMA_KINGPIN = O4semi_3_caraga_MMA - O4semi_3_caraga_MMA_grupo_ejes123
export function loadMmaKingpin3Axle(i: MassesInputs): number | null {
  const load = loadMma3AxleSemi(i);
  const group = loadMmaAxleGroup3Axle(i);
  if (load == null || group == null) return null;
  return load - group;
}
// O4semi_3_cargaMMA_ejeN = Round(O4semi_3_caraga_MMA_grupo_ejes123/3;0)
export function loadMmaPerAxle3Axle(i: MassesInputs): number | null {
  const group = loadMmaAxleGroup3Axle(i);
  if (group == null) return null;
  return r0(group / 3);
}
// O4semi_3_MMA_total = Round(O4semi_3_tara_inicial+O4semi_3_peso_carrozado+O4semi_3_caraga_MMA;0)
export function totalMma3AxleSemi(i: MassesInputs): number | null {
  const mom = mom3AxleSemi(i);
  const load = loadMma3AxleSemi(i);
  if (mom == null || load == null) return null;
  return r0(mom + load);
}
// O4semi_3_MMA_total_grupo123 = Round(tara_grupo+reparto_carrozado_grupo+carga_grupo;0)
export function totalMmaAxleGroup3Axle(i: MassesInputs): number | null {
  const tare = initialTareAxleGroup3Axle(i);
  const body = bodyDistributionAxleGroup3Axle(i);
  const load = loadMmaAxleGroup3Axle(i);
  if (tare == null || body == null || load == null) return null;
  return r0(tare + body + load);
}
// O4semi_3_MMA_total_ejeN = Round(O4semi_3_MMA_total_grupo123/3;0)
export function totalMmaPerAxle3Axle(i: MassesInputs): number | null {
  const group = totalMmaAxleGroup3Axle(i);
  if (group == null) return null;
  return r0(group / 3);
}
// O4semi_3_MMA_total_Kingpin = Round(tara_kingpin+reparto_carrozado_kingpin+carga_kingpin;0)
export function totalMmaKingpin3Axle(i: MassesInputs): number | null {
  const tare = initialTareKingpin3Axle(i);
  const body = bodyDistributionKingpin3Axle(i);
  const load = loadMmaKingpin3Axle(i);
  if (tare == null || body == null || load == null) return null;
  return r0(tare + body + load);
}

// O4semi_3_carga_MMTA = Round(COC::_16.1.1 - (O4semi_3_tara_inicial+O4semi_3_peso_carrozado);0)
export function loadMmta3AxleSemi(i: MassesInputs): number | null {
  const mom = mom3AxleSemi(i);
  if (i.maxTechnicallyPermissibleMassRequested == null || mom == null) return null;
  return r0(i.maxTechnicallyPermissibleMassRequested - mom);
}
// O4semi_3_carga_MMTA_grupo_ejes123 = Round(O4semi_3_carga_MMTA*(O4semi_3LC/2-O4semi_3VD)/O4semi_3_kingpin_a_centro_ejes;0)
export function loadMmtaAxleGroup3Axle(i: MassesInputs): number | null {
  const load = loadMmta3AxleSemi(i);
  const centre = kingpinToAxleCentre3Axle(i);
  if (load == null || i.semiTrailer3AxleLc == null || i.semiTrailer3AxleVd == null || centre == null || centre === 0)
    return null;
  return r0((load * (i.semiTrailer3AxleLc / 2 - i.semiTrailer3AxleVd)) / centre);
}
// O4semi_3_carga_MMTA_KINGPIN = O4semi_3_carga_MMTA - O4semi_3_carga_MMTA_grupo_ejes123
export function loadMmtaKingpin3Axle(i: MassesInputs): number | null {
  const load = loadMmta3AxleSemi(i);
  const group = loadMmtaAxleGroup3Axle(i);
  if (load == null || group == null) return null;
  return load - group;
}
// O4semi_3_carga_MMTA_ejeN = Round(O4semi_3_carga_MMTA_grupo_ejes123/3;0)
export function loadMmtaPerAxle3Axle(i: MassesInputs): number | null {
  const group = loadMmtaAxleGroup3Axle(i);
  if (group == null) return null;
  return r0(group / 3);
}
// O4semi3_MMTA_total = Round(O4semi_3_tara_inicial+O4semi_3_peso_carrozado+O4semi_3_carga_MMTA;0)
export function totalMmta3AxleSemi(i: MassesInputs): number | null {
  const mom = mom3AxleSemi(i);
  const load = loadMmta3AxleSemi(i);
  if (mom == null || load == null) return null;
  return r0(mom + load);
}
// O4semi3_MMTA_total_Kinping = Round(tara_kingpin+reparto_carrozado_kingpin+carga_MMTA_kingpin;0)
export function totalMmtaKingpin3Axle(i: MassesInputs): number | null {
  const tare = initialTareKingpin3Axle(i);
  const body = bodyDistributionKingpin3Axle(i);
  const load = loadMmtaKingpin3Axle(i);
  if (tare == null || body == null || load == null) return null;
  return r0(tare + body + load);
}
// O4semi3_MMTA_total_ejeN = Round(tara_ejeN+masa_carrozado_ejeN+carga_MMTA_ejeN;0) — usa las mismas taras/masas por eje que MMA (fieles al origen)
export function totalMmtaPerAxle3Axle(i: MassesInputs): number | null {
  const tare = initialTareAxleGroup3Axle(i);
  const body = bodyMassPerAxle3Axle(i);
  const load = loadMmtaPerAxle3Axle(i);
  if (tare == null || body == null || load == null) return null;
  return r0(tare / 3 + body + load);
}

/** Calcula todo el bloque SEMI_O4_3AXLE de una vez, para el formulario. */
export function calculateSemiO4ThreeAxleMasses(i: MassesInputs) {
  return {
    mom3AxleSemi: mom3AxleSemi(i),
    loadMma3AxleSemi: loadMma3AxleSemi(i),
    loadMmta3AxleSemi: loadMmta3AxleSemi(i),
    totalMma3AxleSemi: totalMma3AxleSemi(i),
    totalMmta3AxleSemi: totalMmta3AxleSemi(i),
    totalMmaKingpin3Axle: totalMmaKingpin3Axle(i),
    totalMmtaKingpin3Axle: totalMmtaKingpin3Axle(i),
    totalMmaPerAxle3Axle: totalMmaPerAxle3Axle(i),
    vdDifference3Axle: vdDifference3Axle(i),
  };
}

/** Calcula todo el bloque TRIAXLE de una vez, para el formulario. */
export function calculateTriaxleMasses(i: MassesInputs) {
  return {
    rearOverhang3Axle: rearOverhang3Axle(i),
    craneLoadMmta3AxleNoHook: craneLoadMmta3AxleNoHook(i),
    craneLoadMma3AxleNoHook: craneLoadMma3AxleNoHook(i),
    total3AxleMmtaNoHook: total3AxleMmtaNoHook(i),
    total3AxleMmtaWithHook: total3AxleMmtaWithHook(i),
    total3AxleMmaWithHook: total3AxleMmaWithHook(i),
    mom3Axle: mom3Axle(i),
    total3AxleMmtaNoHookAxle1: total3AxleMmtaNoHookAxle1(i),
    total3AxleMmtaNoHookAxle2: total3AxleMmtaNoHookAxle2(i),
    total3AxleMmaNoHookAxle1: total3AxleMmaNoHookAxle1(i),
    total3AxleMmaNoHookAxle2: total3AxleMmaNoHookAxle2(i),
  };
}

/** Calcula todo el bloque BASE de una vez, para el formulario. */
export function calculateBaseMasses(i: MassesInputs) {
  return {
    rearOverhang: rearOverhang(i),
    totalLength: totalLength(i),
    initialTareNoAccessories: initialTareNoAccessories(i),
    mom: mom(i),
    momAxle1: momAxle1(i),
    momAxle2: momAxle2(i),
    theoreticalMom: theoreticalMom(i),
    bodyBuilderTareTotal: bodyBuilderTareTotal(i),
    weighbridgeBodyTareTotal: weighbridgeBodyTareTotal(i),
    loadMassMma: loadMassMma(i),
    loadMmaDistributionAxle1: loadMmaDistributionAxle1(i),
    loadMmaDistributionAxle2: loadMmaDistributionAxle2(i),
    loadMassMmta: loadMassMmta(i),
    loadMmtaDistributionAxle1: loadMmtaDistributionAxle1(i),
    loadMmtaDistributionAxle2: loadMmtaDistributionAxle2(i),
    totalMassNoHook: totalMassNoHook(i),
    totalMmtaNoHook: totalMmtaNoHook(i),
    totalMmaWithPlatform: totalMmaWithPlatform(i),
    totalHookMma: totalHookMma(i),
    totalHookMmta: totalHookMmta(i),
    totalHookMass: totalHookMass(i),
    totalPlatformHookMass: totalPlatformHookMass(i),
    totalPlatformHookMmta: totalPlatformHookMmta(i),
    totalCrane2Axle: totalCrane2Axle(i),
    totalMomCrane2Axle: totalMomCrane2Axle(i),
    totalCrane2AxleMmta: totalCrane2AxleMmta(i),
    totalHookLoadMmta: totalHookLoadMmta(i),
    couplingValueV: couplingValueV(i),
    couplingValueDc: couplingValueDc(i),
    manufacturerChassisTare: manufacturerChassisTare(i),
  };
}
