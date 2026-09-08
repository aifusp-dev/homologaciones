/**
 * Motor de cálculo de "Carrozado" — estima peso y material de la caja
 * fabricada a partir de las dimensiones y materiales elegidos. Ninguna de
 * estas ~31 fórmulas se guarda como columna (ver Bodywork en
 * schema.prisma) — se recalculan siempre a partir de los campos de
 * entrada, igual que en FileMaker ("Sin almacenar").
 *
 * Puerto literal de las fórmulas de BackEnd/calculos/CALCULOS5-8.png.
 * Verificado contra un caso real de bbdd.xml: totalRoofMaterialM2 con
 * exteriorLength=8280, exteriorWidth=2550 da 21 (coincide exacto con el
 * valor ya calculado por FileMaker en ese expediente).
 *
 * NOTA: dos fórmulas (doorFiberM2, baseInteriorMeters) no se veían con el
 * argumento de precisión completo en la captura original — se han
 * implementado con el mismo redondeo a 0 decimales que el resto de la
 * sección por consistencia, pero convendría verificarlas contra un
 * expediente real de FileMaker con datos de puertas/base rellenos antes
 * de confiar en ellas para un documento oficial.
 */

export type BodyworkInputs = {
  interiorLength: number | null;
  interiorWidth: number | null;
  interiorHeight: number | null;
  exteriorLength: number | null;
  exteriorWidth: number | null;
  floorWeightPerM2: number | null;
  roofMaterialWeightPerM2: number | null;
  sideMaterialWeightPerM2: number | null;
  sideStructureTubeWeightPerMeter: number | null;
  skirtWeightPerM2: number | null;
  subchassisMaterialWeightPerMeter: number | null;
  roofStructureMaterialWeightPerMeter: number | null;
  trimWeightPerMeter: number | null;
  tieDownWeightPerMeter: number | null;
  tieDownCount: number | null;
  baseMaterialWeightPerMeter: number | null;
  baseMaterial: number | null;
  doorLined: boolean | null;
  doorFiberWeightPerM2: number | null;
  windDeflectorWeight: number | null;
  liftPlatformWeight: number | null;
  otherAccessoriesWeight: number | null;
  toolBoxWeight: number | null;
  extinguisherBoxWeight: number | null;
};

function round0(n: number): number {
  return Math.round(n);
}

// Metros_lineales_subchasis = Largo_interior * 2 / 1000
export function subchassisLinearMeters(b: BodyworkInputs): number | null {
  if (b.interiorLength == null) return null;
  return (b.interiorLength * 2) / 1000;
}

// Numero_tableros_piso = (Largo_interior / 1,52) / 1000
export function floorPanelCount(b: BodyworkInputs): number | null {
  if (b.interiorLength == null) return null;
  return b.interiorLength / 1.52 / 1000;
}

// Si_forrado_cojo valor_para_multiplicar_por2 = If(Forrado_interior_puertas = "SI"; "2"; "1")
export function doorLiningMultiplier(b: BodyworkInputs): number {
  return b.doorLined ? 2 : 1;
}

// M2_fibra_puertas = Round(((Ancho_interior-80)/1000) * ((Alto_interior-80)/1000))
export function doorFiberM2(b: BodyworkInputs): number | null {
  if (b.interiorWidth == null || b.interiorHeight == null) return null;
  return round0(((b.interiorWidth - 80) / 1000) * ((b.interiorHeight - 80) / 1000));
}

// M2_totales_fibra_puertas = M2_fibra_puertas * Si_forrado_cojo...
export function totalDoorFiberM2(b: BodyworkInputs): number | null {
  const m2 = doorFiberM2(b);
  if (m2 == null) return null;
  return m2 * doorLiningMultiplier(b);
}

// Metros_cuadrados_laterales = ((Largo_interior-50)*(Alto_interior+40)*2)/1000000
export function sideSquareMeters(b: BodyworkInputs): number | null {
  if (b.interiorLength == null || b.interiorHeight == null) return null;
  return ((b.interiorLength - 50) * (b.interiorHeight + 40) * 2) / 1000000;
}

// Metros_interior_base = Round((Largo_interior-Material_base)/(640+Material_base);0) * (Ancho_interior-(Material_base*2))
export function baseInteriorMeters(b: BodyworkInputs): number | null {
  if (b.interiorLength == null || b.interiorWidth == null || b.baseMaterial == null) return null;
  const panels = round0((b.interiorLength - b.baseMaterial) / (640 + b.baseMaterial));
  return panels * (b.interiorWidth - b.baseMaterial * 2);
}

// Metros_perimetro_base = Largo_interior*2 + Ancho_interior*2
export function basePerimeterMeters(b: BodyworkInputs): number | null {
  if (b.interiorLength == null || b.interiorWidth == null) return null;
  return b.interiorLength * 2 + b.interiorWidth * 2;
}

// Metros_lineales base = Round((Metros_perimetro_base + Metros_interior_base)/1000;0)
export function baseLinearMeters(b: BodyworkInputs): number | null {
  const perimeter = basePerimeterMeters(b);
  const interior = baseInteriorMeters(b);
  if (perimeter == null || interior == null) return null;
  return round0((perimeter + interior) / 1000);
}

// Metros_lineales_barras_interiores_laterales =
//   (Round((Largo_interior-Material_estrucctura_lateral)/(370+Material_estrucctura_lateral)-1;0)*2) * (Alto_interior+40)/1000
export function sideInteriorBarsLinearMeters(
  b: BodyworkInputs & { sideStructureMaterial: number | null }
): number | null {
  if (b.interiorLength == null || b.sideStructureMaterial == null || b.interiorHeight == null) return null;
  const bars = round0((b.interiorLength - b.sideStructureMaterial) / (370 + b.sideStructureMaterial) - 1);
  return (bars * 2 * (b.interiorHeight + 40)) / 1000;
}

// Metros_lineales_marco_laterales = ((Largo_exterior*4)+(Alto_interior*4))/1000
export function sideFrameLinearMeters(b: BodyworkInputs): number | null {
  if (b.exteriorLength == null || b.interiorHeight == null) return null;
  return (b.exteriorLength * 4 + b.interiorHeight * 4) / 1000;
}

// Metros_lineales_totales_laterales = Round(barras + marco;0)
export function totalSideLinearMeters(b: BodyworkInputs & { sideStructureMaterial: number | null }): number | null {
  const bars = sideInteriorBarsLinearMeters(b);
  const frame = sideFrameLinearMeters(b);
  if (bars == null || frame == null) return null;
  return round0(bars + frame);
}

// Peso_total_estructura_laterales = Peso_Mlineal_tubo_estructura_laterales * Metros_lineales_totales_laterales
export function totalSideStructureWeight(
  b: BodyworkInputs & { sideStructureMaterial: number | null }
): number | null {
  const meters = totalSideLinearMeters(b);
  if (meters == null || b.sideStructureTubeWeightPerMeter == null) return null;
  return b.sideStructureTubeWeightPerMeter * meters;
}

// Peso_total_material_laterales = Round(Peso_M2_material_lateral * Metros_cuadrados_laterales;0)
export function totalSideMaterialWeight(b: BodyworkInputs): number | null {
  const m2 = sideSquareMeters(b);
  if (m2 == null || b.sideMaterialWeightPerM2 == null) return null;
  return round0(b.sideMaterialWeightPerM2 * m2);
}

// peso_zocalo = ((((Largo_interior*2)+Ancho_interior)*,2)*Pesom2_zocalo)/1000
export function skirtWeight(b: BodyworkInputs): number | null {
  if (b.interiorLength == null || b.interiorWidth == null || b.skirtWeightPerM2 == null) return null;
  return ((b.interiorLength * 2 + b.interiorWidth) * 0.2 * b.skirtWeightPerM2) / 1000;
}

// Metros_lineales_material_recerco = Round((Largo_exterior*4)+(Ancho_exterior*2)+(Alto_interior*4);0)/1000
export function trimLinearMeters(b: BodyworkInputs): number | null {
  if (b.exteriorLength == null || b.exteriorWidth == null || b.interiorHeight == null) return null;
  return round0(b.exteriorLength * 4 + b.exteriorWidth * 2 + b.interiorHeight * 4) / 1000;
}

// Total_peso_material_recerco = Round(Peso_metro_lineal_recerco * Metros_lineales_material_recerco;0)
export function totalTrimMaterialWeight(b: BodyworkInputs): number | null {
  const meters = trimLinearMeters(b);
  if (meters == null || b.trimWeightPerMeter == null) return null;
  return round0(b.trimWeightPerMeter * meters);
}

// Total_peso_amarre = ((((Largo_interior*2)+Ancho_interior)*Numero_de_amarres)/1000) * Peso_metrolineal_amarre
export function totalTieDownWeight(b: BodyworkInputs): number | null {
  if (
    b.interiorLength == null ||
    b.interiorWidth == null ||
    b.tieDownCount == null ||
    b.tieDownWeightPerMeter == null
  )
    return null;
  return (((b.interiorLength * 2 + b.interiorWidth) * b.tieDownCount) / 1000) * b.tieDownWeightPerMeter;
}

// Total_peso_material_base = Round((Metros_perimetro_base+Metros_interior_base) * Peso_metro_lineal_material_base;0)/1000
export function totalBaseMaterialWeight(b: BodyworkInputs): number | null {
  const perimeter = basePerimeterMeters(b);
  const interior = baseInteriorMeters(b);
  if (perimeter == null || interior == null || b.baseMaterialWeightPerMeter == null) return null;
  return round0((perimeter + interior) * b.baseMaterialWeightPerMeter) / 1000;
}

// Total_peso_material_subchasis = (Largo_exterior*2) * Peso_Mlineal_material_subchasis / 1000
export function totalSubchassisMaterialWeight(b: BodyworkInputs): number | null {
  if (b.exteriorLength == null || b.subchassisMaterialWeightPerMeter == null) return null;
  return (b.exteriorLength * 2 * b.subchassisMaterialWeightPerMeter) / 1000;
}

// Total_peso_base = Total_peso_material_base + Total_peso_material_subchasis
export function totalBaseWeight(b: BodyworkInputs): number | null {
  const base = totalBaseMaterialWeight(b);
  const subchassis = totalSubchassisMaterialWeight(b);
  if (base == null || subchassis == null) return null;
  return base + subchassis;
}

// Peso_total_fibra_puertas = M2_totales_fibra_puertas * Peso_M2_fibra_puertas
export function totalDoorFiberWeight(b: BodyworkInputs): number | null {
  const m2 = totalDoorFiberM2(b);
  if (m2 == null || b.doorFiberWeightPerM2 == null) return null;
  return m2 * b.doorFiberWeightPerM2;
}

// Total_M2_material_techo = Round((Largo_exterior+50)*Ancho_exterior/1000000;0)
export function totalRoofMaterialM2(b: BodyworkInputs): number | null {
  if (b.exteriorLength == null || b.exteriorWidth == null) return null;
  return round0(((b.exteriorLength + 50) * b.exteriorWidth) / 1000000);
}

// Peso_total_material_techo = Round(Total_M2_material_techo * Peso_material_techo;0)
export function totalRoofMaterialWeight(b: BodyworkInputs): number | null {
  const m2 = totalRoofMaterialM2(b);
  if (m2 == null || b.roofMaterialWeightPerM2 == null) return null;
  return round0(m2 * b.roofMaterialWeightPerM2);
}

// Metros_lineales_estructura_interior_techo =
//   Round(((Largo_interior-(Material_estructura_techo*2))/(370+Material_estructura_techo)-1) * Ancho_exterior;0)/1000
export function roofInteriorStructureLinearMeters(
  b: BodyworkInputs & { roofStructureMaterial: number | null }
): number | null {
  if (b.interiorLength == null || b.roofStructureMaterial == null || b.exteriorWidth == null) return null;
  const value =
    ((b.interiorLength - b.roofStructureMaterial * 2) / (370 + b.roofStructureMaterial) - 1) * b.exteriorWidth;
  return round0(value) / 1000;
}

// Metros_lineales_marco_estrucctura_techo = Round((Largo_exterior*2)+(Ancho_exterior*2);0)/1000
export function roofFrameLinearMeters(b: BodyworkInputs): number | null {
  if (b.exteriorLength == null || b.exteriorWidth == null) return null;
  return round0(b.exteriorLength * 2 + b.exteriorWidth * 2) / 1000;
}

// Peso_total_estructura_techo = Round((estructura_interior+marco) * Peso_material_Estructura_techo;0)
export function totalRoofStructureWeight(
  b: BodyworkInputs & { roofStructureMaterial: number | null }
): number | null {
  const interior = roofInteriorStructureLinearMeters(b);
  const frame = roofFrameLinearMeters(b);
  if (interior == null || frame == null || b.roofStructureMaterialWeightPerMeter == null) return null;
  return round0((interior + frame) * b.roofStructureMaterialWeightPerMeter);
}

// Peso_TOTAL_techo = Round(Peso_total_estructura_techo + Peso_total_material_techo;0)
export function totalRoofWeight(b: BodyworkInputs & { roofStructureMaterial: number | null }): number | null {
  const structure = totalRoofStructureWeight(b);
  const material = totalRoofMaterialWeight(b);
  if (structure == null || material == null) return null;
  return round0(structure + material);
}

// Peso_total_piso = Round(Largo_interior*Ancho_interior*Peso_piso/1000000;2)
export function totalFloorWeight(b: BodyworkInputs): number | null {
  if (b.interiorLength == null || b.interiorWidth == null || b.floorWeightPerM2 == null) return null;
  const value = (b.interiorLength * b.interiorWidth * b.floorWeightPerM2) / 1000000;
  return Math.round(value * 100) / 100;
}

// Peso_total_laterales = Round(estructura+material + 10 + zocalo + recerco + amarre;0)
export function totalSideWeight(b: BodyworkInputs & { sideStructureMaterial: number | null }): number | null {
  const structure = totalSideStructureWeight(b);
  const material = totalSideMaterialWeight(b);
  const skirt = skirtWeight(b);
  const trim = totalTrimMaterialWeight(b);
  const tieDown = totalTieDownWeight(b);
  if (structure == null || material == null || skirt == null || trim == null || tieDown == null) return null;
  return round0(structure + material + 10 + skirt + trim + tieDown);
}

// Total_peso_otros_Accesorios = extintor + herramientas + otros + plataforma + cortavientos
export function totalOtherAccessoriesWeight(b: BodyworkInputs): number | null {
  const parts = [
    b.extinguisherBoxWeight,
    b.toolBoxWeight,
    b.otherAccessoriesWeight,
    b.liftPlatformWeight,
    b.windDeflectorWeight,
  ];
  if (parts.some((p) => p == null)) return null;
  return parts.reduce((sum, p) => sum! + p!, 0);
}

/**
 * Calcula todo el motor de una vez, para mostrar en el formulario. Los
 * campos que dependen de material_estructura_lateral/techo (que son
 * códigos de material, no medidas) se pasan por separado porque
 * BodyworkInputs no los incluye por defecto — ver CocForm/BodyworkForm.
 */
export function calculateBodywork(
  b: BodyworkInputs & { sideStructureMaterial: number | null; roofStructureMaterial: number | null }
) {
  return {
    subchassisLinearMeters: subchassisLinearMeters(b),
    floorPanelCount: floorPanelCount(b),
    totalDoorFiberM2: totalDoorFiberM2(b),
    sideSquareMeters: sideSquareMeters(b),
    baseInteriorMeters: baseInteriorMeters(b),
    basePerimeterMeters: basePerimeterMeters(b),
    baseLinearMeters: baseLinearMeters(b),
    totalSideLinearMeters: totalSideLinearMeters(b),
    totalSideStructureWeight: totalSideStructureWeight(b),
    totalSideMaterialWeight: totalSideMaterialWeight(b),
    skirtWeight: skirtWeight(b),
    trimLinearMeters: trimLinearMeters(b),
    totalTrimMaterialWeight: totalTrimMaterialWeight(b),
    totalTieDownWeight: totalTieDownWeight(b),
    totalBaseMaterialWeight: totalBaseMaterialWeight(b),
    totalSubchassisMaterialWeight: totalSubchassisMaterialWeight(b),
    totalBaseWeight: totalBaseWeight(b),
    totalDoorFiberWeight: totalDoorFiberWeight(b),
    totalRoofMaterialM2: totalRoofMaterialM2(b),
    totalRoofMaterialWeight: totalRoofMaterialWeight(b),
    roofInteriorStructureLinearMeters: roofInteriorStructureLinearMeters(b),
    roofFrameLinearMeters: roofFrameLinearMeters(b),
    totalRoofStructureWeight: totalRoofStructureWeight(b),
    totalRoofWeight: totalRoofWeight(b),
    totalFloorWeight: totalFloorWeight(b),
    totalSideWeight: totalSideWeight(b),
    totalOtherAccessoriesWeight: totalOtherAccessoriesWeight(b),
  };
}
