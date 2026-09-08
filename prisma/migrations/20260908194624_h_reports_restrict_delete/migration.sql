-- DropForeignKey
ALTER TABLE "regulatory_act_numbers" DROP CONSTRAINT "regulatory_act_numbers_emcHReportId_fkey";

-- DropForeignKey
ALTER TABLE "regulatory_act_numbers" DROP CONSTRAINT "regulatory_act_numbers_lightingHReportId_fkey";

-- DropForeignKey
ALTER TABLE "regulatory_act_numbers" DROP CONSTRAINT "regulatory_act_numbers_massesHReportId_fkey";

-- DropForeignKey
ALTER TABLE "regulatory_act_numbers" DROP CONSTRAINT "regulatory_act_numbers_rearPlateHReportId_fkey";

-- DropForeignKey
ALTER TABLE "regulatory_act_numbers" DROP CONSTRAINT "regulatory_act_numbers_rearProtectionHReportId_fkey";

-- DropForeignKey
ALTER TABLE "regulatory_act_numbers" DROP CONSTRAINT "regulatory_act_numbers_spraySuppressionHReportId_fkey";

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_lightingHReportId_fkey" FOREIGN KEY ("lightingHReportId") REFERENCES "h_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_spraySuppressionHReportId_fkey" FOREIGN KEY ("spraySuppressionHReportId") REFERENCES "h_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_massesHReportId_fkey" FOREIGN KEY ("massesHReportId") REFERENCES "h_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_rearPlateHReportId_fkey" FOREIGN KEY ("rearPlateHReportId") REFERENCES "h_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_rearProtectionHReportId_fkey" FOREIGN KEY ("rearProtectionHReportId") REFERENCES "h_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_act_numbers" ADD CONSTRAINT "regulatory_act_numbers_emcHReportId_fkey" FOREIGN KEY ("emcHReportId") REFERENCES "h_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
