-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PRELIMINARY_REPORT', 'MANUFACTURING_ORDER', 'BODYWORK_CERTIFICATE', 'BODYWORK_CERTIFICATE_PART2', 'REDUCED_DATASHEET', 'COP_REGISTER');

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "address" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "taxId" TEXT;

-- CreateTable
CREATE TABLE "generated_documents" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generated_documents_dossierId_idx" ON "generated_documents"("dossierId");

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
