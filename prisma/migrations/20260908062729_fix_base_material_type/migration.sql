/*
  Warnings:

  - The `baseMaterial` column on the `bodyworks` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "bodyworks" DROP COLUMN "baseMaterial",
ADD COLUMN     "baseMaterial" INTEGER;
