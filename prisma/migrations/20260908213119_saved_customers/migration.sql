-- CreateTable
CREATE TABLE "saved_customers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_customers_companyId_idx" ON "saved_customers"("companyId");

-- AddForeignKey
ALTER TABLE "saved_customers" ADD CONSTRAINT "saved_customers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
