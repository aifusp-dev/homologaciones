-- CreateTable
CREATE TABLE "cop_cover_sheets" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "dataCollectionOperator" TEXT,
    "dataCollectionDate" TEXT,
    "measurementEquipmentReviewDate" TEXT,

    CONSTRAINT "cop_cover_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_plates" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "heightEdgeLower" DOUBLE PRECISION,
    "heightEdgeUpper" DOUBLE PRECISION,
    "locationDimensions" TEXT,
    "longitudinalPlaneLocation" TEXT,
    "verticalAngleGround" TEXT,
    "verticalVisionAngle" TEXT,
    "horizontalVisionAngle" TEXT,
    "inspectionDate" TEXT,
    "measurementEquipment" TEXT,
    "notes" TEXT,

    CONSTRAINT "registration_plates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plates_inscriptions" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "plateType" TEXT,
    "plateContent" TEXT,
    "characterHeight" TEXT,
    "notes" TEXT,

    CONSTRAINT "plates_inscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cop_cover_sheets_dossierId_key" ON "cop_cover_sheets"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "registration_plates_dossierId_key" ON "registration_plates"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "plates_inscriptions_dossierId_key" ON "plates_inscriptions"("dossierId");

-- AddForeignKey
ALTER TABLE "cop_cover_sheets" ADD CONSTRAINT "cop_cover_sheets_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_plates" ADD CONSTRAINT "registration_plates_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plates_inscriptions" ADD CONSTRAINT "plates_inscriptions_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
