// Generado a partir de BackEnd/bbdd.xml — metadatos de UI de las 16 tablas de
// dispositivos y señalización (Fase 4). Sin cálculos, todo entrada manual.
export type DeviceFieldType = "text" | "float";

export type DeviceTableKey =
  | "couplingDevice"
  | "spraySuppression"
  | "electromagneticCompatibility"
  | "lateralProtection"
  | "rearProtection"
  | "lateralMarking"
  | "lightingSide"
  | "lightingPosition"
  | "lightingReflector"
  | "lightingBrake"
  | "lightingTurnSignal"
  | "lightingRearOutlineMarker"
  | "lightingFrontOutlineMarker"
  | "lightingPlate"
  | "lightingReverse"
  | "lightingFog"
  | "lightingMaterialChecklist"
  | "regulatoryActNumbers"
  | "copCoverSheet"
  | "registrationPlates"
  | "platesInscriptions";

export const DEVICE_TABLES: Record<DeviceTableKey, { label: string; fields: { name: string; label: string; type: DeviceFieldType }[] }> = {
  couplingDevice: {
    label: "Dispositivo de acoplamiento",
    fields: [
      { name: "device1stPhase", label: "Dispositivo1fase", type: "text" },
      { name: "device2ndPhase", label: "Dispositivo2fase", type: "text" },
      { name: "brand", label: "Marca", type: "text" },
      { name: "type", label: "Tipo", type: "text" },
      { name: "approvalNumber", label: "Homologacion", type: "text" },
      { name: "dValue", label: "D", type: "text" },
      { name: "dcValue", label: "Dc", type: "text" },
      { name: "sValue", label: "S", type: "text" },
      { name: "vValue", label: "V", type: "text" },
      { name: "heightClearanceToGround", label: "Altura libre alsuelo", type: "float" },
      { name: "distanceCentreFinalcaja", label: "Distancia centro finalcaja", type: "float" },
      { name: "typeActuation", label: "Tipo accionamiento", type: "text" },
      { name: "seCompliantAngles", label: "Se cumplen angulos", type: "text" },
      { name: "notes", label: "Observaciones", type: "text" }
    ],
  },
  spraySuppression: {
    label: "Antiproyección",
    fields: [
      { name: "markingDevice", label: "Marcado dispositivo", type: "text" },
      { name: "distanceBordeinferiorSkirtGround", label: "Dist bordeinferior faldilla suelo", type: "float" },
      { name: "distanceFaldillaposteriorTyre", label: "Dist faldillaposterior neumatico", type: "float" },
      { name: "widthMudguard", label: "Ancho guardabarros", type: "float" },
      { name: "widthTyre", label: "Ancho neumatico", type: "float" },
      { name: "widthBandTread", label: "Ancho banda rodadura", type: "float" },
      { name: "widthSkirtRear", label: "Ancho faldilla posterior", type: "float" },
      { name: "angleCoberturatraseroDispproyeccion", label: "Angulo coberturatrasero dispproyeccion", type: "float" },
      { name: "distanceBordeinferiorSkirtCentroneumatico", label: "Dist bordeinferior faldilla centroneumatico", type: "float" },
      { name: "heightSkirtExterior", label: "Altura faldilla exterior", type: "float" },
      { name: "ausenciaOpenings", label: "Ausencia aberturas", type: "text" },
      { name: "widthCubretotalneumatico", label: "Anchura cubretotalneumatico", type: "text" },
      { name: "partRear150mmPlanohorizontal", label: "Parte posterior 150mm planohorizontal", type: "text" },
      { name: "notes", label: "Observaciones", type: "text" },
      { name: "optionTo", label: "Opcion A", type: "text" },
      { name: "optionB", label: "Opcion B", type: "text" },
      { name: "optionC", label: "Opcion C", type: "text" },
      { name: "optionD", label: "Opcion D", type: "text" },
      { name: "hasRearSpraySuppressionSystem", label: "5.6 Dispone parte posterior sistema antiproyección", type: "text" },
      { name: "refInternal", label: "Ref interna", type: "text" }
    ],
  },
  electromagneticCompatibility: {
    label: "Compatibilidad electromagnética",
    fields: [
      { name: "fittedSystemsElectronicElectrical", label: "Instala sistemas electronicos electricos", type: "text" },
      { name: "appliesRegulation10", label: "Aplica reglamento10", type: "text" },
      { name: "descripcin1Subassemblies", label: "Descripción1 subconjuntos", type: "text" },
      { name: "descripcin2Subassemblies", label: "Descripción2 subconjuntos", type: "text" },
      { name: "descripcin3Subassemblies", label: "Descripción3 subconjuntos", type: "text" },
      { name: "operatesRestricted", label: "Funciona restringido", type: "text" },
      { name: "fixedNosepuedadesmontar", label: "Fijado nosepuedadesmontar", type: "text" },
      { name: "approvalCodeApprovalNumber", label: "Contraseña homologacion", type: "text" },
      { name: "checkInstalacionDiagrams", label: "Comprobacio instalacion esquemas", type: "text" },
      { name: "connectedPorInTerfaz", label: "Conectado por in terfaz", type: "text" },
      { name: "applicabilityDelRegulation", label: "Aplicabilidad del reglamento", type: "text" },
      { name: "equipmentMeasurementUsed", label: "Equipos medida utilizados", type: "text" }
    ],
  },
  lateralProtection: {
    label: "Protección lateral",
    fields: [
      { name: "markingDevice", label: "Marcado dispositivo", type: "text" },
      { name: "distancePartLowerToGroundRight", label: "Dist part inferior asuelo DE", type: "float" },
      { name: "distancePartLowerToGroundLeft", label: "Dist part inferior asuelo IZ", type: "float" },
      { name: "distanceEdgeAnteriorRuedadelanteraRight", label: "Dist borde anterior ruedadelantera DE", type: "float" },
      { name: "distanceEdgeAnteriorRuedadelanteraLeft", label: "Dist borde anterior ruedadelantera IZ", type: "float" },
      { name: "distanceEdgeAnteriorCentropivoteRight", label: "Dist borde anterior centropivote DE", type: "float" },
      { name: "distanceEdgeAnteriorCentropivoteLeft", label: "Dist borde anterior centropivote IZ", type: "float" },
      { name: "distanceEdgeAnteriorMidPointLegsRight", label: "Dist borde anterior pmedio patas DE", type: "float" },
      { name: "distanceEdgeAnteriorMidPointLegsLeft", label: "Dist borde anterior pmedio patas IZ", type: "float" },
      { name: "distanceEdgeRearRuedatraseraRight", label: "Dist borde posterior ruedatrasera DE", type: "float" },
      { name: "distanceEdgeRearRuedatraseraLeft", label: "Dist borde posterior ruedatrasera IZ", type: "float" },
      { name: "widthChassisRailsRight", label: "Ancho largueros DE", type: "float" },
      { name: "widthChassisRailsLeft", label: "Ancho largueros IZ", type: "float" },
      { name: "distanceChassisRailsRight", label: "Dist largueros DE", type: "float" },
      { name: "distanceChassisRailsLeft", label: "Dist largueros IZ", type: "float" },
      { name: "distanceBordesuperiorToBodyworkRight", label: "Dist bordesuperior a carroceria DE", type: "float" },
      { name: "distanceBordesuperiorToBodyworkLeft", label: "Dist bordesuperior a carroceria IZ", type: "float" },
      { name: "distanceDeviceToBordecarroceriaRight", label: "Dist dispositivo a bordecarroceria DE", type: "float" },
      { name: "distanceDeviceToBordecarroceriaLeft", label: "Dist dispositivo a bordecarroceria IZ", type: "float" },
      { name: "distanceExtdispositivoBordeextTyreRight", label: "Dist extdispositivo bordeext neumatico DE", type: "float" },
      { name: "distanceExtdispositivoBordeextTyreLeft", label: "Dist extdispositivo bordeext neumatico IZ", type: "float" },
      { name: "distanceAttachmentPointsChassisRight", label: "Dist puntosunion chasis DE", type: "float" },
      { name: "distanceAttachmentPointsChassisLeft", label: "Dist puntosunion chasis IZ", type: "float" },
      { name: "overhangFrontProtectionRight", label: "Voladizo delantero proteccion DE", type: "float" },
      { name: "overhangFrontProtectionLeft", label: "Voladizo delantero proteccion IZ", type: "float" },
      { name: "overhangRearProtectionLeft", label: "Voladizo trasero proteccion IZ", type: "float" },
      { name: "overhangRearProtectionRight", label: "Voladizo trasero proteccion DE", type: "float" },
      { name: "firstPhase", label: "PL DE PRIMERA FASE", type: "text" },
      { name: "notes", label: "Observaciones", type: "text" },
      { name: "refInternalProtSide", label: "Ref interna prot lateral", type: "text" }
    ],
  },
  rearProtection: {
    label: "Protección trasera",
    fields: [
      { name: "protRear1fase", label: "Prot trasera 1fase", type: "text" },
      { name: "hasDHomologado", label: "Dispone d homologado", type: "text" },
      { name: "numberHomnologacionProtRear", label: "Numero homnologacion prot trasera", type: "text" },
      { name: "distanceExteAxleMasancho", label: "Dist exte eje masancho", type: "float" },
      { name: "valueDeformation", label: "Cota deformacion", type: "float" },
      { name: "edgesSides", label: "Aristas laterales", type: "float" },
      { name: "heightProfile", label: "Altura perfil", type: "float" },
      { name: "distanceBrackets", label: "Distancia soportes", type: "float" },
      { name: "heightGroundEdgeLower", label: "Altura suelo borde inferior", type: "float" },
      { name: "mMTAValidDevice", label: "MMTA VALIDA DISPOSITIVO", type: "float" },
      { name: "distancePartRearVehicle", label: "Dist parte posterior vehículo", type: "float" },
      { name: "alturapaplicacion", label: "Alturap-aplicacion", type: "float" },
      { name: "notes", label: "Observaciones", type: "text" },
      { name: "refInternalProtRear", label: "Ref interna prot trasera", type: "text" }
    ],
  },
  lateralMarking: {
    label: "Marcado lateral",
    fields: [
      { name: "sideOptionMarking", label: "Lateral opcion marcado", type: "text" },
      { name: "sideDistanceGroundEdgeLowerRight", label: "Lateral dist suelo borde inferior DE", type: "float" },
      { name: "sideDistanceGroundEdgeLowerLeft", label: "Lateral dist suelo borde inferior IZ", type: "float" },
      { name: "sideDistanceGroundEdgeUpperRight", label: "Lateral dist suelo borde superior DE", type: "float" },
      { name: "sideDistanceGroundEdgeUpperLeft", label: "Lateral dist suelo borde superior IZ", type: "float" },
      { name: "sideEdgeExteriorToFrontCajaLeft", label: "Lateral borde exterior a frontal caja IZ", type: "float" },
      { name: "sideEdgeExteriorToFrontCajaRight", label: "Lateral borde exterior a frontal caja DE", type: "float" },
      { name: "sideEdgeExteriorToRearCajaRight", label: "Lateral borde exterior a trasera caja DE", type: "float" },
      { name: "sideEdgeExteriorToRearCajaLeft", label: "Lateral borde exterior a trasera caja IZ", type: "float" },
      { name: "sideDistanceBInteriorToBsuperiorCajaRight", label: "Lateral dist b interior a bsuperior caja DE", type: "float" },
      { name: "sideDistanceBInteriorToBsuperiorCajaLeft", label: "Lateral dist b interior a bsuperior caja IZ", type: "float" },
      { name: "sideType", label: "Lateral tipo", type: "text" },
      { name: "sideApprovalNumber", label: "Lateral homologacion", type: "text" },
      { name: "sideColor", label: "Lateral color", type: "text" },
      { name: "sideLongitudMarkingParcialRight", label: "Lateral longitud marcado parcial DE", type: "text" },
      { name: "sideLongitudMarkingParcialLeft", label: "Lateral longitud marcado parcial IZ", type: "text" },
      { name: "rearOptionMarking", label: "Trasera opcion marcado", type: "text" },
      { name: "rearDistanceGroundEdgeLowerLeft", label: "Trasera dist suelo borde inferior IZ", type: "float" },
      { name: "rearDistanceGroundEdgeLowerRight", label: "Trasera dist suelo borde inferior DE", type: "float" },
      { name: "rearDistanceGroundEdgeUpperLeft", label: "Trasera dist suelo borde superior IZ", type: "float" },
      { name: "rearDistanceGroundEdgeUpperRight", label: "Trasera dist suelo borde superior DE", type: "float" },
      { name: "rearDistanceMarkingToLuzfreno", label: "Trasera dist marcado a luzfreno", type: "float" },
      { name: "rearColor", label: "Trasera color", type: "float" },
      { name: "rearLongitudMarkingParcial", label: "Trasera longitud marcado parcial", type: "float" },
      { name: "notes", label: "Observaciones", type: "text" },
      { name: "refInternalWhite", label: "Ref interna blanca", type: "text" },
      { name: "refInternalRed", label: "Ref interna roja", type: "text" },
      { name: "o4OptionMarkingFront", label: "O4 opcion marcado delantero", type: "text" },
      { name: "o4FrontDistanceGroundEdgeLower", label: "O4 delantero dist suelo borde inferior", type: "float" },
      { name: "o4FrontDistanceGroundEdgeUpper", label: "O4 delantero dist suelo borde superior", type: "float" },
      { name: "o4FrontApprovalNumber", label: "O4 delantero homologacion", type: "text" },
      { name: "o4FrontLongitudMarkingParcial", label: "O4 delantero longitud marcado parcial", type: "float" },
      { name: "o4DistanceEdgeExteriorCaja", label: "O4 distancia borde exterior caja", type: "float" }
    ],
  },
  lightingSide: {
    label: "Señalización lateral",
    fields: [
      { name: "fittedLights", label: "Instala pilotos", type: "text" },
      { name: "fittedReflector", label: "Instala capta", type: "text" },
      { name: "heightEdgeUpperLight", label: "Altura borde superior piloto", type: "float" },
      { name: "heightEdgeUpperReflector", label: "Altura borde superior capta", type: "float" },
      { name: "distanceFinalVehicleLightsRight", label: "Distancia final vehiculo pilotos De", type: "float" },
      { name: "distanceFinalVehicleLightsLeft", label: "Distancia final vehiculo pilotos Iz", type: "float" },
      { name: "distanceFinalVehicleReflectorRight", label: "Distancia final vehiculo capta De", type: "float" },
      { name: "distanceFinalVehicleReflectorLeft", label: "Distancia final vehiculo capta Iz", type: "float" },
      { name: "deAxle1To1LightRight", label: "De 1eje a 1 piloto De", type: "float" },
      { name: "o4Front1LightRight", label: "O4 frontal 1º piloto De", type: "float" },
      { name: "deAxle1To1LightLeft", label: "De 1eje a 1 piloto Iz", type: "float" },
      { name: "o4Front1LightLeft", label: "O4 frontal 1º piloto Iz", type: "float" },
      { name: "deLight1To2LightRight", label: "De 1piloto a 2 piloto De", type: "float" },
      { name: "deLight1To2LightLeft", label: "De 1piloto a 2 piloto Iz", type: "float" },
      { name: "deLight2To3LightRight", label: "De 2piloto a 3 piloto De", type: "float" },
      { name: "deLight2To3LightLeft", label: "De 2piloto a 3 piloto Iz", type: "float" },
      { name: "deLight3To4LightRight", label: "De 3piloto a 4 piloto De", type: "float" },
      { name: "deLight4To5LightRight", label: "De 4piloto a 5 piloto De", type: "float" },
      { name: "deLight3To4LightLeft", label: "De 3piloto a 4 piloto Iz", type: "float" },
      { name: "deLight4To5LightLeft", label: "De 4piloto a 5 piloto Iz", type: "float" },
      { name: "deAxle1ToReflector1Right", label: "De 1eje a 1capta De", type: "float" },
      { name: "o4Front1ReflectorRight", label: "O4 frontal 1º capta De", type: "float" },
      { name: "deAxle1ToReflector1Left", label: "De 1eje a 1capta Iz", type: "float" },
      { name: "o4Front1ReflectorLeft", label: "O4 frontal 1º capta Iz", type: "float" },
      { name: "deReflector1ToReflector2Left", label: "De 1capta a 2capta Iz", type: "float" },
      { name: "deReflector1ToReflector2Right", label: "De 1capta a 2capta De", type: "float" },
      { name: "deReflector2ToReflector3Right", label: "De 2capta a 3capta De", type: "float" },
      { name: "deReflector2ToReflector3Left", label: "De 2capta a 3capta Iz", type: "float" },
      { name: "deReflector3ToReflector4Right", label: "De 3capta a 4capta De", type: "float" },
      { name: "deReflector4ToReflector5Right", label: "De 4capta a 5capta De", type: "float" },
      { name: "deReflector3ToReflector4Left", label: "De 3capta a 4capta Iz", type: "float" },
      { name: "deReflector4ToReflector5Left", label: "De 4capta a 5capta Iz", type: "float" },
      { name: "distanceMaxLights", label: "Distancia maxima pilotos", type: "float" },
      { name: "distanceMaxReflector", label: "Distancia maxima capta", type: "float" },
      { name: "compliantHorizontalLight", label: "Cumple horizontal piloto", type: "float" },
      { name: "compliantVerticalLight", label: "Cumple vertical piloto", type: "float" },
      { name: "fittedReflector2", label: "Instala captadioptrico", type: "text" },
      { name: "compliantVerticalReflector", label: "Cumple vertical capta", type: "float" },
      { name: "compliantHorizontalReflector", label: "Cumple horizontal capta", type: "text" },
      { name: "color", label: "Color", type: "text" },
      { name: "numberLightsSides", label: "Numero pilotos laterales", type: "text" },
      { name: "numberReflectorsSides", label: "Numero capta larterales", type: "text" },
      { name: "approvalCodeApprovalNumberLight", label: "Contraseña homologacion piloto", type: "text" },
      { name: "approvalCodeApprovalNumberReflector", label: "Contraseña homologacion capta", type: "text" },
      { name: "distanceStartFirstLight", label: "Distancia principio primer piloto", type: "text" },
      { name: "distanceStartFirstReflector", label: "Distancia principio primer capta", type: "text" },
      { name: "notesSideLighting", label: "Observaciones señalización lateral", type: "text" },
      { name: "secondColorLightSide", label: "Segundo color piloto lateral", type: "text" },
      { name: "refInternalLight", label: "Ref interna piloto", type: "text" },
      { name: "refInternalReflector", label: "Ref interna capta", type: "text" },
      { name: "o4DeLight5To6LightRight", label: "O4 De 5piloto a 6 piloto De", type: "float" },
      { name: "o4DeLight5To6LightLeft", label: "O4 De 5piloto a 6 piloto IZ", type: "float" },
      { name: "o4DeReflector5ToReflector6Left", label: "O4 De 5capta a 6capta Iz", type: "float" },
      { name: "o4DeReflector5ToReflector6Right", label: "O4 De 5capta a 6capta De", type: "float" },
      { name: "o4DistanceInicioFirstLightGalibo", label: "O4 distancia inicio primero piloto galibo", type: "float" },
      { name: "o4DistanceInicioFirstReflector", label: "O4 distancia inicio primero capta", type: "float" }
    ],
  },
  lightingPosition: {
    label: "Señalización de posición",
    fields: [
      { name: "heightEdgeLower", label: "Altura borde inferior", type: "float" },
      { name: "heightEdgeUpper", label: "Altura borde superior", type: "float" },
      { name: "spacing", label: "Separacion", type: "float" },
      { name: "distanceLeft", label: "Distancia izquierda", type: "float" },
      { name: "distanceRight", label: "Distancia derecha", type: "float" },
      { name: "count", label: "Unidades", type: "float" },
      { name: "approvalNumber", label: "Homologacion", type: "text" },
      { name: "angleVertical", label: "Angulo vertical", type: "text" },
      { name: "angleHorizontal", label: "Angulo horizontal", type: "text" },
      { name: "color", label: "Color", type: "text" },
      { name: "o4HeightEdgeLowerFront", label: "O4 Altura borde inferior delantera", type: "float" },
      { name: "o4HeightEdgeUpperFront", label: "O4 Altura borde superior delantera", type: "float" },
      { name: "o4SpacingFront", label: "O4 Separacion delantera", type: "float" },
      { name: "o4DistanceLeftFront", label: "O4 Distancia izquierda delantera", type: "float" },
      { name: "o4DistanceRightFront", label: "O4 Distancia derecha delantera", type: "float" },
      { name: "o4CountFront", label: "O4 unidades delantera", type: "float" },
      { name: "o4ApprovalNumberFront", label: "O4 Homologacion delantera", type: "text" },
      { name: "o4AngleVerticalFront", label: "O4 Angulo vertical delantera", type: "text" },
      { name: "o4AngleHorizontalFront", label: "O4 Angulo horizontal delantera", type: "text" },
      { name: "o4ColorFront", label: "O4 Color delantera", type: "text" }
    ],
  },
  lightingReflector: {
    label: "Captafaros",
    fields: [
      { name: "heightEdgeLower", label: "Altura borde inferior", type: "float" },
      { name: "heightEdgeUpper", label: "Altura borde superior", type: "float" },
      { name: "spacing", label: "Separacion", type: "float" },
      { name: "distanceLeft", label: "Distancia izquierda", type: "float" },
      { name: "distanceRight", label: "Distancia derecha", type: "float" },
      { name: "count", label: "Unidades", type: "float" },
      { name: "approvalNumber", label: "Homologacion", type: "text" },
      { name: "angleVertical", label: "Angulo vertical", type: "text" },
      { name: "angleHorizontal", label: "Angulo horizontal", type: "text" },
      { name: "color", label: "Color", type: "text" },
      { name: "o4HeightEdgeLowerFront", label: "O4 Altura borde inferior delantero", type: "float" },
      { name: "o4HeightEdgeUpperFront", label: "O4 Altura borde superior delantero", type: "float" },
      { name: "o4SpacingFront", label: "O4 Separacion delantero", type: "float" },
      { name: "o4DistanceLeftFront", label: "O4 Distancia izquierda delantero", type: "float" },
      { name: "o4DistanceRightFront", label: "O4 Distancia derecha delantero", type: "float" },
      { name: "o4CountFront", label: "O4 unidades delantero", type: "float" },
      { name: "o4ApprovalNumberFront", label: "O4 Homologacion delantero", type: "text" },
      { name: "o4AngleVerticalFront", label: "O4 Angulo vertical delantero", type: "text" },
      { name: "o4ColorFront", label: "O4 Color delantero", type: "text" },
      { name: "o4AngleHorizontalFront", label: "O4 Angulo horizontal delantero", type: "text" }
    ],
  },
  lightingBrake: {
    label: "Señalización de frenado",
    fields: [
      { name: "heightEdgeLower", label: "Altura borde inferior", type: "float" },
      { name: "heightEdgeUpper", label: "Altura borde superior", type: "float" },
      { name: "spacing", label: "Separacion", type: "float" },
      { name: "distanceSideLeft", label: "Distancia lateral izquierdo", type: "float" },
      { name: "distanceSideRight", label: "Distancia lateral derecho", type: "float" },
      { name: "angleHorizontal", label: "Angulo horizontal", type: "text" },
      { name: "angleVertical", label: "Angulo vertical", type: "text" },
      { name: "approvalNumber", label: "Homologacion", type: "text" },
      { name: "heightThirdLightBrake", label: "Altura tercera luz freno", type: "float" },
      { name: "approvalNumberThirdLightBrake", label: "Homologacion tercera luz freno", type: "text" },
      { name: "countLucesBrake", label: "Cantidad luces freno", type: "float" },
      { name: "angle3LightVertical", label: "Angulo 3luz vertical", type: "text" },
      { name: "angle3LightHorizontal", label: "Angulo 3luz horizontal", type: "text" },
      { name: "color", label: "Color", type: "text" },
      { name: "notesBrakes", label: "Observaciones frenos", type: "text" },
      { name: "refInternal3luzfreno", label: "Ref interna 3luzfreno", type: "text" },
      { name: "refInternalLightsRearIntegral", label: "Ref interna pilotos traseros integrales", type: "text" }
    ],
  },
  lightingTurnSignal: {
    label: "Intermitentes",
    fields: [
      { name: "heightEdgeLower", label: "Altura borde inferior", type: "float" },
      { name: "heightEdgeUpper", label: "Altura borde superior", type: "float" },
      { name: "spacing", label: "Separacion", type: "float" },
      { name: "distanceLeft", label: "Distancia izquierda", type: "float" },
      { name: "distanceRight", label: "Distancia derecha", type: "float" },
      { name: "count", label: "Unidades", type: "float" },
      { name: "approvalNumber", label: "Homologacion", type: "text" },
      { name: "angleVertical", label: "Angulo vertical", type: "text" },
      { name: "angleHorizontal", label: "Angulo horizontal", type: "text" },
      { name: "color", label: "Color", type: "text" },
      { name: "approvalNumberInterSide", label: "Homologacion inter lateral", type: "text" },
      { name: "numberInterSide", label: "Numero inter lateral", type: "float" },
      { name: "angleHorizontalInterSide", label: "Angulo horizontal inter lateral", type: "text" },
      { name: "angleVerticalInterSide", label: "Angulo vertical inter lateral", type: "text" },
      { name: "notesIntermitentes", label: "Observaciones intermitentes", type: "text" },
      { name: "heightGroundInterSide", label: "Altura suelo inter lateral", type: "float" }
    ],
  },
  lightingRearOutlineMarker: {
    label: "Gálibo trasero",
    fields: [
      { name: "count", label: "Unidades", type: "float" },
      { name: "approvalNumber", label: "Homologacion", type: "text" },
      { name: "color", label: "Color", type: "text" },
      { name: "angleVertical", label: "Angulo vertical", type: "text" },
      { name: "angleHorizontal", label: "Angulo horizontal", type: "text" },
      { name: "notes", label: "Observaciones", type: "float" },
      { name: "distanceLightPosicion", label: "Distancia luz posicion", type: "float" },
      { name: "distanceEdgeBodywork", label: "Distancia borde carroceria", type: "float" },
      { name: "refInternal", label: "Ref interna", type: "text" },
      { name: "refInterna2", label: "Ref interna2", type: "text" }
    ],
  },
  lightingFrontOutlineMarker: {
    label: "Gálibo delantero",
    fields: [
      { name: "count", label: "Unidades", type: "float" },
      { name: "approvalNumber", label: "Homologacion", type: "text" },
      { name: "color", label: "Color", type: "text" },
      { name: "angleVertical", label: "Angulo vertical", type: "text" },
      { name: "angleHorizontal", label: "Angulo horizontal", type: "text" },
      { name: "notes", label: "Observaciones", type: "float" },
      { name: "distanceEndsBodywork", label: "Distancia extremos carroceria", type: "float" },
      { name: "refInternal", label: "Ref interna", type: "text" }
    ],
  },
  lightingPlate: {
    label: "Luz de matrícula",
    fields: [
      { name: "count", label: "Unidades", type: "float" },
      { name: "approvalNumber", label: "Homologacion", type: "text" },
      { name: "color", label: "Color", type: "text" },
      { name: "spacing", label: "Interdistancia", type: "float" },
      { name: "optionMounting", label: "Opcion montaje", type: "text" },
      { name: "notes", label: "Observaciones", type: "text" },
      { name: "refInternal", label: "Ref interna", type: "text" }
    ],
  },
  lightingReverse: {
    label: "Marcha atrás",
    fields: [
      { name: "heightEdgeUpper", label: "Altura borde superior", type: "float" },
      { name: "count", label: "Unidades", type: "float" },
      { name: "approvalNumber", label: "Homologacion", type: "text" },
      { name: "color", label: "Color", type: "text" },
      { name: "angleVertical", label: "Angulo vertical", type: "text" },
      { name: "angleHorizontal", label: "Angulo horizontal", type: "text" },
      { name: "notes", label: "Observaciones", type: "float" }
    ],
  },
  lightingFog: {
    label: "Antiniebla",
    fields: [
      { name: "heightEdgeUpper", label: "Altura borde superior", type: "float" },
      { name: "count", label: "Unidades", type: "float" },
      { name: "approvalNumber", label: "Homologacion", type: "text" },
      { name: "angleVertical", label: "Angulo vertical", type: "text" },
      { name: "angleHorizontal", label: "Angulo horizontal", type: "text" }
    ],
  },
  lightingMaterialChecklist: {
    label: "Material de alumbrado y señalización (orden de fabricación)",
    fields: [
      { name: "sideOutlineMarkerLamp", label: "Piloto gálibo lateral", type: "text" },
      { name: "rearOutlineMarkerLamp", label: "Piloto gálibo trasero", type: "text" },
      { name: "frontOutlineMarkerLamp", label: "Piloto gálibo delantero", type: "text" },
      { name: "rearHangingOutlineMarkerLamp", label: "Piloto gálibo trasero colgante", type: "text" },
      { name: "plateLight", label: "Luz matrícula", type: "text" },
      { name: "thirdBrakeLight", label: "Tercera luz freno", type: "text" },
      { name: "v23Red", label: "V23 roja", type: "text" },
      { name: "v23White", label: "V23 blanca", type: "text" },
      { name: "spraySuppressionFlap", label: "Faldilla absorbente", type: "text" },
      { name: "mudguard", label: "Guardabarros", type: "text" },
      { name: "lateralProtectionMaterial", label: "Protección lateral", type: "text" },
      { name: "manufacturingOrderDate", label: "Fecha orden de fabricación", type: "text" },
      { name: "manufacturingOrderRemarks", label: "Observaciones orden de fabricación", type: "text" }
    ],
  },
  regulatoryActNumbers: {
    label: "Actos reglamentarios / Informes H",
    fields: [
      { name: "lightingActNumber", label: "Alumbrado y señalización 48R08", type: "text" },
      { name: "spraySuppressionActNumber", label: "Dispositivos antiproyección UE 109/2011", type: "text" },
      { name: "massesActNumber", label: "Masas y dimensiones UE 1230/2012", type: "text" },
      { name: "rearPlateActNumber", label: "Placas de matrícula traseras UE 1003/2010", type: "text" },
      { name: "rearProtectionActNumber", label: "Protección trasera 58R03", type: "text" },
      { name: "emcActNumber", label: "Compatibilidad electromagnética 10R06", type: "text" }
    ],
  },
  copCoverSheet: {
    label: "Portada del Registro COP",
    fields: [
      { name: "dataCollectionOperator", label: "Operario que realiza la toma de datos", type: "text" },
      { name: "dataCollectionDate", label: "Fecha de toma de datos", type: "text" },
      { name: "measurementEquipmentReviewDate", label: "Fecha última revisión equipos de medida", type: "text" }
    ],
  },
  registrationPlates: {
    label: "Placas de matrícula",
    fields: [
      { name: "heightEdgeLower", label: "Altura borde inferior respecto del suelo", type: "float" },
      { name: "heightEdgeUpper", label: "Altura borde superior respecto del suelo", type: "float" },
      { name: "locationDimensions", label: "Dimensiones del emplazamiento", type: "text" },
      { name: "longitudinalPlaneLocation", label: "Emplazamiento centro placa / plano longitudinal medio", type: "text" },
      { name: "verticalAngleGround", label: "Ángulo vertical de la placa respecto del suelo", type: "text" },
      { name: "verticalVisionAngle", label: "Cumple ángulo de visión vertical >15º", type: "text" },
      { name: "horizontalVisionAngle", label: "Cumple ángulo de visión horizontal >30º", type: "text" },
      { name: "inspectionDate", label: "Fecha inspección", type: "text" },
      { name: "measurementEquipment", label: "Equipo de medida", type: "text" },
      { name: "notes", label: "Observaciones / Exenciones", type: "text" }
    ],
  },
  platesInscriptions: {
    label: "Placas e inscripciones",
    fields: [
      { name: "plateType", label: "Placa metálica / etiqueta adhesiva antimanipulación 2ª fase", type: "text" },
      { name: "plateContent", label: "Contenido de la placa de fabricante 2ª fase", type: "text" },
      { name: "characterHeight", label: "Altura de caracteres (≥4mm)", type: "text" },
      { name: "notes", label: "Observaciones / Exenciones", type: "text" }
    ],
  },
};
