-- CreateTable
CREATE TABLE "regulatory_updates" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT,
    "publishedAt" TIMESTAMP(3),
    "summary" TEXT,
    "documents" JSONB NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regulatory_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regulatory_updates_externalId_key" ON "regulatory_updates"("externalId");
