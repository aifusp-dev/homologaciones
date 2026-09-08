-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "nextDossierNumber" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "dossiers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dossiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealers" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,

    CONSTRAINT "dealers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cocs" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "vin" TEXT,
    "vehicleCategory" TEXT,
    "brand" TEXT,
    "type" TEXT,
    "variant" TEXT,
    "version" TEXT,
    "commercialName" TEXT,
    "manufacturerName" TEXT,
    "manufacturerAddress" TEXT,
    "vinLocation" TEXT,
    "platesAttachmentMethod" TEXT,
    "platesLocation" TEXT,
    "approvalDate" DATE,
    "manufactureDate" DATE,
    "approvalNumber" TEXT,
    "wheelCount" INTEGER,
    "axleCount" INTEGER,
    "dualWheelAxlePosition" INTEGER,
    "dualWheelAxleCount" INTEGER,
    "steeredAxlePosition" INTEGER,
    "steeredAxleCount" INTEGER,
    "drivenAxleCount" INTEGER,
    "drivenAxleLocation" INTEGER,
    "drivenAxleInterconnection" TEXT,
    "axleDistance0to1" DOUBLE PRECISION,
    "axleDistance1to2" DOUBLE PRECISION,
    "axleDistance2to3" DOUBLE PRECISION,
    "maxPermissibleLength" DOUBLE PRECISION,
    "maxPermissibleWidth" DOUBLE PRECISION,
    "maxPermissibleHeight" DOUBLE PRECISION,
    "pivotToRearEdgeDistance" DOUBLE PRECISION,
    "kingpinToRearEdgeDistance" DOUBLE PRECISION,
    "maxPermissibleRearOverhang" DOUBLE PRECISION,
    "momIncompleteVehicle" DOUBLE PRECISION,
    "momIncompleteAxle3" DOUBLE PRECISION,
    "momIncompleteAxle2" DOUBLE PRECISION,
    "momIncompleteAxle1" DOUBLE PRECISION,
    "currentIncompleteVehicleMass" DOUBLE PRECISION,
    "minCompletedMass" DOUBLE PRECISION,
    "minCompletedMassDistributionAxle1" DOUBLE PRECISION,
    "minCompletedMassDistributionAxle2" DOUBLE PRECISION,
    "minCompletedMassDistributionAxle3" DOUBLE PRECISION,
    "maxTechnicallyPermissibleMass" DOUBLE PRECISION,
    "maxTechnicallyPermissibleMassRequested" DOUBLE PRECISION,
    "maxTechnicallyPermissibleMassAxleGroup2" DOUBLE PRECISION,
    "maxTechnicallyPermissibleMassAxleGroup1" DOUBLE PRECISION,
    "maxTechnicallyPermissibleMassAxle3" DOUBLE PRECISION,
    "maxTechnicallyPermissibleMassAxle2" DOUBLE PRECISION,
    "maxTechnicallyPermissibleMassAxle1" DOUBLE PRECISION,
    "maxTechnicallyPermissibleMassCombination" DOUBLE PRECISION,
    "maxLadenMassRegistration" DOUBLE PRECISION,
    "maxLadenMassRegistrationAxle3" DOUBLE PRECISION,
    "maxLadenMassRegistrationAxle2" DOUBLE PRECISION,
    "maxLadenMassRegistrationAxle1" DOUBLE PRECISION,
    "maxLadenMassRegistrationAxleGroup1" DOUBLE PRECISION,
    "maxLadenMassRegistrationCombination" DOUBLE PRECISION,
    "semiTrailerMass" DOUBLE PRECISION,
    "drawBarTrailerMass" DOUBLE PRECISION,
    "centreAxleTrailerMass" DOUBLE PRECISION,
    "rigidDrawBarTrailerMass" DOUBLE PRECISION,
    "unbrakedTrailerMass" DOUBLE PRECISION,
    "staticCouplingPointMass" DOUBLE PRECISION,
    "staticKingpinMass" DOUBLE PRECISION,
    "engineManufacturer" TEXT,
    "engineMarkingCode" TEXT,
    "operatingPrinciple" TEXT,
    "pureElectric" TEXT,
    "hybrid" TEXT,
    "cylinderCount" INTEGER,
    "cylinderArrangement" TEXT,
    "displacement" DOUBLE PRECISION,
    "fuelType" INTEGER,
    "singleFuel" TEXT,
    "ratedPower" DOUBLE PRECISION,
    "ratedPowerRpm" DOUBLE PRECISION,
    "maxNetPower" DOUBLE PRECISION,
    "gearboxType" TEXT,
    "maxSpeed" DOUBLE PRECISION,
    "trackWidthAxle1" DOUBLE PRECISION,
    "trackWidthAxle2" DOUBLE PRECISION,
    "trackWidthAxle3" DOUBLE PRECISION,
    "retractableAxlePosition" INTEGER,
    "liftableAxlePosition" INTEGER,
    "pneumaticSteeredAxles" TEXT,
    "tireCount" INTEGER,
    "tireWidthAxle1" DOUBLE PRECISION,
    "tireWidthAxle2" DOUBLE PRECISION,
    "tireWidthAxle3" DOUBLE PRECISION,
    "tireAspectRatioAxle1" DOUBLE PRECISION,
    "tireAspectRatioAxle2" DOUBLE PRECISION,
    "tireAspectRatioAxle3" DOUBLE PRECISION,
    "rimDiameterAxle1" DOUBLE PRECISION,
    "rimDiameterAxle2" DOUBLE PRECISION,
    "rimDiameterAxle3" DOUBLE PRECISION,
    "speedRatingAxle1" TEXT,
    "speedRatingAxle2" TEXT,
    "speedRatingAxle3" TEXT,
    "loadIndexAxle1" INTEGER,
    "loadIndexAxle2" INTEGER,
    "loadIndexAxle3" INTEGER,
    "trailerBrakeConnectionType" TEXT,
    "brakingPressure" DOUBLE PRECISION,
    "couplingDeviceApprovalNumber" TEXT,
    "couplingDeviceBrand" TEXT,
    "installableCouplingDevices" TEXT,
    "valueDc" DOUBLE PRECISION,
    "valueV" DOUBLE PRECISION,
    "valueD" DOUBLE PRECISION,
    "valueS" DOUBLE PRECISION,
    "stationaryNoiseLevel" DOUBLE PRECISION,
    "stationaryNoiseLevelRpm" DOUBLE PRECISION,
    "drivingNoiseLevel" DOUBLE PRECISION,
    "emissionsLevel" TEXT,
    "specificCo2Emissions" DOUBLE PRECISION,
    "remarks" TEXT,
    "vehicleEquippedWith" TEXT,
    "gearCount" TEXT,
    "frontSuspension" TEXT,
    "rearSuspension" TEXT,
    "steeringMethod" TEXT,
    "serviceBraking" TEXT,
    "secondaryBraking" TEXT,
    "parkingBraking" TEXT,
    "abs" TEXT,
    "indirectVision" TEXT,
    "doorCountAndArrangement" TEXT,
    "frontProtection" TEXT,
    "cabDeflector" TEXT,
    "typeApprovalOptions" TEXT,

    CONSTRAINT "cocs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dossiers_companyId_idx" ON "dossiers"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "dossiers_companyId_number_key" ON "dossiers"("companyId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "customers_dossierId_key" ON "customers"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "dealers_dossierId_key" ON "dealers"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "cocs_dossierId_key" ON "cocs"("dossierId");

-- AddForeignKey
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealers" ADD CONSTRAINT "dealers_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cocs" ADD CONSTRAINT "cocs_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
