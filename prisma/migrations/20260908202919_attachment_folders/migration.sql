-- CreateTable
CREATE TABLE "attachment_folders" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachment_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attachment_folders_dossierId_idx" ON "attachment_folders"("dossierId");

-- CreateIndex
CREATE INDEX "attachments_folderId_idx" ON "attachments"("folderId");

-- AddForeignKey
ALTER TABLE "attachment_folders" ADD CONSTRAINT "attachment_folders_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "attachment_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
