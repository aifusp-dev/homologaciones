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
