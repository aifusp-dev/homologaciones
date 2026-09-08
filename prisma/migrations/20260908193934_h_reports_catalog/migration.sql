/*
  Warnings:

  - You are about to drop the column `emcActNumber` on the `regulatory_act_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `lightingActNumber` on the `regulatory_act_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `massesActNumber` on the `regulatory_act_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `rearPlateActNumber` on the `regulatory_act_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `rearProtectionActNumber` on the `regulatory_act_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `spraySuppressionActNumber` on the `regulatory_act_numbers` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "HReportCategory" AS ENUM ('LIGHTING', 'SPRAY_SUPPRESSION', 'MASSES', 'REAR_PLATE', 'REAR_PROTECTION', 'EMC');

-- AlterTable
ALTER TABLE "regulatory_act_numbers" DROP COLUMN "emcActNumber",
DROP COLUMN "lightingActNumber",
DROP COLUMN "massesActNumber",
DROP COLUMN "rearPlateActNumber",
DROP COLUMN "rearProtectionActNumber",
DROP COLUMN "spraySuppressionActNumber",
ADD COLUMN     "emcHReportId" TEXT,
ADD COLUMN     "lightingHReportId" TEXT,
ADD COLUMN     "massesHReportId" TEXT,
ADD COLUMN     "rearPlateHReportId" TEXT,
ADD COLUMN     "rearProtectionHReportId" TEXT,
ADD COLUMN     "spraySuppressionHReportId" TEXT;

-- CreateTable
CREATE TABLE "h_reports" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" "HReportCategory" NOT NULL,
    "number" TEXT NOT NULL,
    "issuer" TEXT,
    "filePath" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "h_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "h_reports_companyId_idx" ON "h_reports"("companyId");

-- CreateIndex
CREATE INDEX "h_reports_companyId_category_idx" ON "h_reports"("companyId", "category");

-- AddForeignKey
ALTER TABLE "h_reports" ADD CONSTRAINT "h_reports_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_lightingHReportId_fkey" FOREIGN KEY ("lightingHReportId") REFERENCES "h_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_spraySuppressionHReportId_fkey" FOREIGN KEY ("spraySuppressionHReportId") REFERENCES "h_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_massesHReportId_fkey" FOREIGN KEY ("massesHReportId") REFERENCES "h_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_rearPlateHReportId_fkey" FOREIGN KEY ("rearPlateHReportId") REFERENCES "h_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_rearProtectionHReportId_fkey" FOREIGN KEY ("rearProtectionHReportId") REFERENCES "h_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_emcHReportId_fkey" FOREIGN KEY ("emcHReportId") REFERENCES "h_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
