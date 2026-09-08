-- AlterTable
ALTER TABLE "bodyworks" ADD COLUMN     "completedApprovalDate" DATE,
ADD COLUMN     "completedApprovalNumber" TEXT,
ADD COLUMN     "finalStagePlateLocation" TEXT;

-- AlterTable
ALTER TABLE "cocs" ADD COLUMN     "seatCount" INTEGER;

-- CreateTable
CREATE TABLE "lighting_material_checklists" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "sideOutlineMarkerLamp" TEXT,
    "rearOutlineMarkerLamp" TEXT,
    "frontOutlineMarkerLamp" TEXT,
    "rearHangingOutlineMarkerLamp" TEXT,
    "plateLight" TEXT,
    "thirdBrakeLight" TEXT,
    "v23Red" TEXT,
    "v23White" TEXT,
    "spraySuppressionFlap" TEXT,
    "mudguard" TEXT,
    "manufacturingOrderRemarks" TEXT,
    "manufacturingOrderDate" TEXT,
    "lateralProtectionMaterial" TEXT,

    CONSTRAINT "lighting_material_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulatory_act_numbers" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "lightingActNumber" TEXT,
    "spraySuppressionActNumber" TEXT,
    "massesActNumber" TEXT,
    "rearPlateActNumber" TEXT,
    "rearProtectionActNumber" TEXT,
    "emcActNumber" TEXT,

    CONSTRAINT "regulatory_act_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lighting_material_checklists_dossierId_key" ON "lighting_material_checklists"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "regulatory_act_numbers_dossierId_key" ON "regulatory_act_numbers"("dossierId");

-- AddForeignKey
ALTER TABLE "lighting_material_checklists" ADD CONSTRAINT "lighting_material_checklists_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
