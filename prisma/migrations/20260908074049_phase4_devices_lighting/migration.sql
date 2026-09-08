-- CreateTable
CREATE TABLE "coupling_devices" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "device1stPhase" TEXT,
    "device2ndPhase" TEXT,
    "brand" TEXT,
    "type" TEXT,
    "approvalNumber" TEXT,
    "dValue" TEXT,
    "dcValue" TEXT,
    "sValue" TEXT,
    "vValue" TEXT,
    "heightClearanceToGround" DOUBLE PRECISION,
    "distanceCentreFinalcaja" DOUBLE PRECISION,
    "typeActuation" TEXT,
    "seCompliantAngles" TEXT,
    "notes" TEXT,

    CONSTRAINT "coupling_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spray_suppressions" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "markingDevice" TEXT,
    "distanceBordeinferiorSkirtGround" DOUBLE PRECISION,
    "distanceFaldillaposteriorTyre" DOUBLE PRECISION,
    "widthMudguard" DOUBLE PRECISION,
    "widthTyre" DOUBLE PRECISION,
    "widthBandTread" DOUBLE PRECISION,
    "widthSkirtRear" DOUBLE PRECISION,
    "angleCoberturatraseroDispproyeccion" DOUBLE PRECISION,
    "distanceBordeinferiorSkirtCentroneumatico" DOUBLE PRECISION,
    "heightSkirtExterior" DOUBLE PRECISION,
    "ausenciaOpenings" TEXT,
    "widthCubretotalneumatico" TEXT,
    "partRear150mmPlanohorizontal" TEXT,
    "notes" TEXT,
    "optionTo" TEXT,
    "optionB" TEXT,
    "optionC" TEXT,
    "optionD" TEXT,
    "hasRearSpraySuppressionSystem" TEXT,
    "refInternal" TEXT,

    CONSTRAINT "spray_suppressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "electromagnetic_compatibilities" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "fittedSystemsElectronicElectrical" TEXT,
    "appliesRegulation10" TEXT,
    "descripcin1Subassemblies" TEXT,
    "descripcin2Subassemblies" TEXT,
    "descripcin3Subassemblies" TEXT,
    "operatesRestricted" TEXT,
    "fixedNosepuedadesmontar" TEXT,
    "approvalCodeApprovalNumber" TEXT,
    "checkInstalacionDiagrams" TEXT,
    "connectedPorInTerfaz" TEXT,
    "applicabilityDelRegulation" TEXT,
    "equipmentMeasurementUsed" TEXT,

    CONSTRAINT "electromagnetic_compatibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lateral_protections" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "markingDevice" TEXT,
    "distancePartLowerToGroundRight" DOUBLE PRECISION,
    "distancePartLowerToGroundLeft" DOUBLE PRECISION,
    "distanceEdgeAnteriorRuedadelanteraRight" DOUBLE PRECISION,
    "distanceEdgeAnteriorRuedadelanteraLeft" DOUBLE PRECISION,
    "distanceEdgeAnteriorCentropivoteRight" DOUBLE PRECISION,
    "distanceEdgeAnteriorCentropivoteLeft" DOUBLE PRECISION,
    "distanceEdgeAnteriorMidPointLegsRight" DOUBLE PRECISION,
    "distanceEdgeAnteriorMidPointLegsLeft" DOUBLE PRECISION,
    "distanceEdgeRearRuedatraseraRight" DOUBLE PRECISION,
    "distanceEdgeRearRuedatraseraLeft" DOUBLE PRECISION,
    "widthChassisRailsRight" DOUBLE PRECISION,
    "widthChassisRailsLeft" DOUBLE PRECISION,
    "distanceChassisRailsRight" DOUBLE PRECISION,
    "distanceChassisRailsLeft" DOUBLE PRECISION,
    "distanceBordesuperiorToBodyworkRight" DOUBLE PRECISION,
    "distanceBordesuperiorToBodyworkLeft" DOUBLE PRECISION,
    "distanceDeviceToBordecarroceriaRight" DOUBLE PRECISION,
    "distanceDeviceToBordecarroceriaLeft" DOUBLE PRECISION,
    "distanceExtdispositivoBordeextTyreRight" DOUBLE PRECISION,
    "distanceExtdispositivoBordeextTyreLeft" DOUBLE PRECISION,
    "distanceAttachmentPointsChassisRight" DOUBLE PRECISION,
    "distanceAttachmentPointsChassisLeft" DOUBLE PRECISION,
    "overhangFrontProtectionRight" DOUBLE PRECISION,
    "overhangFrontProtectionLeft" DOUBLE PRECISION,
    "overhangRearProtectionLeft" DOUBLE PRECISION,
    "overhangRearProtectionRight" DOUBLE PRECISION,
    "firstPhase" TEXT,
    "notes" TEXT,
    "refInternalProtSide" TEXT,

    CONSTRAINT "lateral_protections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rear_protections" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "protRear1fase" TEXT,
    "hasDHomologado" TEXT,
    "numberHomnologacionProtRear" TEXT,
    "distanceExteAxleMasancho" DOUBLE PRECISION,
    "valueDeformation" DOUBLE PRECISION,
    "edgesSides" DOUBLE PRECISION,
    "heightProfile" DOUBLE PRECISION,
    "distanceBrackets" DOUBLE PRECISION,
    "heightGroundEdgeLower" DOUBLE PRECISION,
    "mMTAValidDevice" DOUBLE PRECISION,
    "distancePartRearVehicle" DOUBLE PRECISION,
    "alturapaplicacion" DOUBLE PRECISION,
    "notes" TEXT,
    "refInternalProtRear" TEXT,

    CONSTRAINT "rear_protections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lateral_markings" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "sideOptionMarking" TEXT,
    "sideDistanceGroundEdgeLowerRight" DOUBLE PRECISION,
    "sideDistanceGroundEdgeLowerLeft" DOUBLE PRECISION,
    "sideDistanceGroundEdgeUpperRight" DOUBLE PRECISION,
    "sideDistanceGroundEdgeUpperLeft" DOUBLE PRECISION,
    "sideEdgeExteriorToFrontCajaLeft" DOUBLE PRECISION,
    "sideEdgeExteriorToFrontCajaRight" DOUBLE PRECISION,
    "sideEdgeExteriorToRearCajaRight" DOUBLE PRECISION,
    "sideEdgeExteriorToRearCajaLeft" DOUBLE PRECISION,
    "sideDistanceBInteriorToBsuperiorCajaRight" DOUBLE PRECISION,
    "sideDistanceBInteriorToBsuperiorCajaLeft" DOUBLE PRECISION,
    "sideType" TEXT,
    "sideApprovalNumber" TEXT,
    "sideColor" TEXT,
    "sideLongitudMarkingParcialRight" TEXT,
    "sideLongitudMarkingParcialLeft" TEXT,
    "rearOptionMarking" TEXT,
    "rearDistanceGroundEdgeLowerLeft" DOUBLE PRECISION,
    "rearDistanceGroundEdgeLowerRight" DOUBLE PRECISION,
    "rearDistanceGroundEdgeUpperLeft" DOUBLE PRECISION,
    "rearDistanceGroundEdgeUpperRight" DOUBLE PRECISION,
    "rearDistanceMarkingToLuzfreno" DOUBLE PRECISION,
    "rearColor" DOUBLE PRECISION,
    "rearLongitudMarkingParcial" DOUBLE PRECISION,
    "notes" TEXT,
    "refInternalWhite" TEXT,
    "refInternalRed" TEXT,
    "o4OptionMarkingFront" TEXT,
    "o4FrontDistanceGroundEdgeLower" DOUBLE PRECISION,
    "o4FrontDistanceGroundEdgeUpper" DOUBLE PRECISION,
    "o4FrontApprovalNumber" TEXT,
    "o4FrontLongitudMarkingParcial" DOUBLE PRECISION,
    "o4DistanceEdgeExteriorCaja" DOUBLE PRECISION,

    CONSTRAINT "lateral_markings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lighting_sides" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "fittedLights" TEXT,
    "fittedReflector" TEXT,
    "heightEdgeUpperLight" DOUBLE PRECISION,
    "heightEdgeUpperReflector" DOUBLE PRECISION,
    "distanceFinalVehicleLightsRight" DOUBLE PRECISION,
    "distanceFinalVehicleLightsLeft" DOUBLE PRECISION,
    "distanceFinalVehicleReflectorRight" DOUBLE PRECISION,
    "distanceFinalVehicleReflectorLeft" DOUBLE PRECISION,
    "deAxle1To1LightRight" DOUBLE PRECISION,
    "o4Front1LightRight" DOUBLE PRECISION,
    "deAxle1To1LightLeft" DOUBLE PRECISION,
    "o4Front1LightLeft" DOUBLE PRECISION,
    "deLight1To2LightRight" DOUBLE PRECISION,
    "deLight1To2LightLeft" DOUBLE PRECISION,
    "deLight2To3LightRight" DOUBLE PRECISION,
    "deLight2To3LightLeft" DOUBLE PRECISION,
    "deLight3To4LightRight" DOUBLE PRECISION,
    "deLight4To5LightRight" DOUBLE PRECISION,
    "deLight3To4LightLeft" DOUBLE PRECISION,
    "deLight4To5LightLeft" DOUBLE PRECISION,
    "deAxle1ToReflector1Right" DOUBLE PRECISION,
    "o4Front1ReflectorRight" DOUBLE PRECISION,
    "deAxle1ToReflector1Left" DOUBLE PRECISION,
    "o4Front1ReflectorLeft" DOUBLE PRECISION,
    "deReflector1ToReflector2Left" DOUBLE PRECISION,
    "deReflector1ToReflector2Right" DOUBLE PRECISION,
    "deReflector2ToReflector3Right" DOUBLE PRECISION,
    "deReflector2ToReflector3Left" DOUBLE PRECISION,
    "deReflector3ToReflector4Right" DOUBLE PRECISION,
    "deReflector4ToReflector5Right" DOUBLE PRECISION,
    "deReflector3ToReflector4Left" DOUBLE PRECISION,
    "deReflector4ToReflector5Left" DOUBLE PRECISION,
    "distanceMaxLights" DOUBLE PRECISION,
    "distanceMaxReflector" DOUBLE PRECISION,
    "compliantHorizontalLight" DOUBLE PRECISION,
    "compliantVerticalLight" DOUBLE PRECISION,
    "fittedReflector2" TEXT,
    "compliantVerticalReflector" DOUBLE PRECISION,
    "compliantHorizontalReflector" TEXT,
    "color" TEXT,
    "numberLightsSides" TEXT,
    "numberReflectorsSides" TEXT,
    "approvalCodeApprovalNumberLight" TEXT,
    "approvalCodeApprovalNumberReflector" TEXT,
    "distanceStartFirstLight" TEXT,
    "distanceStartFirstReflector" TEXT,
    "notesSideLighting" TEXT,
    "secondColorLightSide" TEXT,
    "refInternalLight" TEXT,
    "refInternalReflector" TEXT,
    "o4DeLight5To6LightRight" DOUBLE PRECISION,
    "o4DeLight5To6LightLeft" DOUBLE PRECISION,
    "o4DeReflector5ToReflector6Left" DOUBLE PRECISION,
    "o4DeReflector5ToReflector6Right" DOUBLE PRECISION,
    "o4DistanceInicioFirstLightGalibo" DOUBLE PRECISION,
    "o4DistanceInicioFirstReflector" DOUBLE PRECISION,

    CONSTRAINT "lighting_sides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lighting_positions" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "heightEdgeLower" DOUBLE PRECISION,
    "heightEdgeUpper" DOUBLE PRECISION,
    "spacing" DOUBLE PRECISION,
    "distanceLeft" DOUBLE PRECISION,
    "distanceRight" DOUBLE PRECISION,
    "count" DOUBLE PRECISION,
    "approvalNumber" TEXT,
    "angleVertical" TEXT,
    "angleHorizontal" TEXT,
    "color" TEXT,
    "o4HeightEdgeLowerFront" DOUBLE PRECISION,
    "o4HeightEdgeUpperFront" DOUBLE PRECISION,
    "o4SpacingFront" DOUBLE PRECISION,
    "o4DistanceLeftFront" DOUBLE PRECISION,
    "o4DistanceRightFront" DOUBLE PRECISION,
    "o4CountFront" DOUBLE PRECISION,
    "o4ApprovalNumberFront" TEXT,
    "o4AngleVerticalFront" TEXT,
    "o4AngleHorizontalFront" TEXT,
    "o4ColorFront" TEXT,

    CONSTRAINT "lighting_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lighting_reflectors" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "heightEdgeLower" DOUBLE PRECISION,
    "heightEdgeUpper" DOUBLE PRECISION,
    "spacing" DOUBLE PRECISION,
    "distanceLeft" DOUBLE PRECISION,
    "distanceRight" DOUBLE PRECISION,
    "count" DOUBLE PRECISION,
    "approvalNumber" TEXT,
    "angleVertical" TEXT,
    "angleHorizontal" TEXT,
    "color" TEXT,
    "o4HeightEdgeLowerFront" DOUBLE PRECISION,
    "o4HeightEdgeUpperFront" DOUBLE PRECISION,
    "o4SpacingFront" DOUBLE PRECISION,
    "o4DistanceLeftFront" DOUBLE PRECISION,
    "o4DistanceRightFront" DOUBLE PRECISION,
    "o4CountFront" DOUBLE PRECISION,
    "o4ApprovalNumberFront" TEXT,
    "o4AngleVerticalFront" TEXT,
    "o4ColorFront" TEXT,
    "o4AngleHorizontalFront" TEXT,

    CONSTRAINT "lighting_reflectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lighting_brakes" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "heightEdgeLower" DOUBLE PRECISION,
    "heightEdgeUpper" DOUBLE PRECISION,
    "spacing" DOUBLE PRECISION,
    "distanceSideLeft" DOUBLE PRECISION,
    "distanceSideRight" DOUBLE PRECISION,
    "angleHorizontal" TEXT,
    "angleVertical" TEXT,
    "approvalNumber" TEXT,
    "heightThirdLightBrake" DOUBLE PRECISION,
    "approvalNumberThirdLightBrake" TEXT,
    "countLucesBrake" DOUBLE PRECISION,
    "angle3LightVertical" TEXT,
    "angle3LightHorizontal" TEXT,
    "color" TEXT,
    "notesBrakes" TEXT,
    "refInternal3luzfreno" TEXT,
    "refInternalLightsRearIntegral" TEXT,

    CONSTRAINT "lighting_brakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lighting_turn_signals" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "heightEdgeLower" DOUBLE PRECISION,
    "heightEdgeUpper" DOUBLE PRECISION,
    "spacing" DOUBLE PRECISION,
    "distanceLeft" DOUBLE PRECISION,
    "distanceRight" DOUBLE PRECISION,
    "count" DOUBLE PRECISION,
    "approvalNumber" TEXT,
    "angleVertical" TEXT,
    "angleHorizontal" TEXT,
    "color" TEXT,
    "approvalNumberInterSide" TEXT,
    "numberInterSide" DOUBLE PRECISION,
    "angleHorizontalInterSide" TEXT,
    "angleVerticalInterSide" TEXT,
    "notesIntermitentes" TEXT,
    "heightGroundInterSide" DOUBLE PRECISION,

    CONSTRAINT "lighting_turn_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lighting_rear_outline_markers" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "count" DOUBLE PRECISION,
    "approvalNumber" TEXT,
    "color" TEXT,
    "angleVertical" TEXT,
    "angleHorizontal" TEXT,
    "notes" DOUBLE PRECISION,
    "distanceLightPosicion" DOUBLE PRECISION,
    "distanceEdgeBodywork" DOUBLE PRECISION,
    "refInternal" TEXT,
    "refInterna2" TEXT,

    CONSTRAINT "lighting_rear_outline_markers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lighting_front_outline_markers" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "count" DOUBLE PRECISION,
    "approvalNumber" TEXT,
    "color" TEXT,
    "angleVertical" TEXT,
    "angleHorizontal" TEXT,
    "notes" DOUBLE PRECISION,
    "distanceEndsBodywork" DOUBLE PRECISION,
    "refInternal" TEXT,

    CONSTRAINT "lighting_front_outline_markers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lighting_plates" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "count" DOUBLE PRECISION,
    "approvalNumber" TEXT,
    "color" TEXT,
    "spacing" DOUBLE PRECISION,
    "optionMounting" TEXT,
    "notes" TEXT,
    "refInternal" TEXT,

    CONSTRAINT "lighting_plates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lighting_reverses" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "heightEdgeUpper" DOUBLE PRECISION,
    "count" DOUBLE PRECISION,
    "approvalNumber" TEXT,
    "color" TEXT,
    "angleVertical" TEXT,
    "angleHorizontal" TEXT,
    "notes" DOUBLE PRECISION,

    CONSTRAINT "lighting_reverses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lighting_fogs" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "heightEdgeUpper" DOUBLE PRECISION,
    "count" DOUBLE PRECISION,
    "approvalNumber" TEXT,
    "angleVertical" TEXT,
    "angleHorizontal" TEXT,

    CONSTRAINT "lighting_fogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupling_devices_dossierId_key" ON "coupling_devices"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "spray_suppressions_dossierId_key" ON "spray_suppressions"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "electromagnetic_compatibilities_dossierId_key" ON "electromagnetic_compatibilities"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "lateral_protections_dossierId_key" ON "lateral_protections"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "rear_protections_dossierId_key" ON "rear_protections"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "lateral_markings_dossierId_key" ON "lateral_markings"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "lighting_sides_dossierId_key" ON "lighting_sides"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "lighting_positions_dossierId_key" ON "lighting_positions"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "lighting_reflectors_dossierId_key" ON "lighting_reflectors"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "lighting_brakes_dossierId_key" ON "lighting_brakes"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "lighting_turn_signals_dossierId_key" ON "lighting_turn_signals"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "lighting_rear_outline_markers_dossierId_key" ON "lighting_rear_outline_markers"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "lighting_front_outline_markers_dossierId_key" ON "lighting_front_outline_markers"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "lighting_plates_dossierId_key" ON "lighting_plates"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "lighting_reverses_dossierId_key" ON "lighting_reverses"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "lighting_fogs_dossierId_key" ON "lighting_fogs"("dossierId");

-- AddForeignKey
ALTER TABLE "coupling_devices" ADD CONSTRAINT "coupling_devices_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spray_suppressions" ADD CONSTRAINT "spray_suppressions_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "electromagnetic_compatibilities" ADD CONSTRAINT "electromagnetic_compatibilities_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lateral_protections" ADD CONSTRAINT "lateral_protections_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rear_protections" ADD CONSTRAINT "rear_protections_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lateral_markings" ADD CONSTRAINT "lateral_markings_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lighting_sides" ADD CONSTRAINT "lighting_sides_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lighting_positions" ADD CONSTRAINT "lighting_positions_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lighting_reflectors" ADD CONSTRAINT "lighting_reflectors_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lighting_brakes" ADD CONSTRAINT "lighting_brakes_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lighting_turn_signals" ADD CONSTRAINT "lighting_turn_signals_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lighting_rear_outline_markers" ADD CONSTRAINT "lighting_rear_outline_markers_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lighting_front_outline_markers" ADD CONSTRAINT "lighting_front_outline_markers_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lighting_plates" ADD CONSTRAINT "lighting_plates_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lighting_reverses" ADD CONSTRAINT "lighting_reverses_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lighting_fogs" ADD CONSTRAINT "lighting_fogs_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
