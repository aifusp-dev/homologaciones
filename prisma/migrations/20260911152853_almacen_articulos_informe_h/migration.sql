-- CreateTable
CREATE TABLE "h_report_articles" (
    "id" TEXT NOT NULL,
    "hReportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'ud',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "h_report_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_purchases" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "deliveryNoteNumber" TEXT NOT NULL,
    "purchaseDate" DATE NOT NULL,
    "supplier" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_installations" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "installDate" DATE NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_installations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "h_report_articles_hReportId_idx" ON "h_report_articles"("hReportId");

-- CreateIndex
CREATE INDEX "stock_purchases_articleId_idx" ON "stock_purchases"("articleId");

-- CreateIndex
CREATE INDEX "article_installations_articleId_idx" ON "article_installations"("articleId");

-- CreateIndex
CREATE INDEX "article_installations_dossierId_idx" ON "article_installations"("dossierId");

-- AddForeignKey
ALTER TABLE "h_report_articles" ADD CONSTRAINT "h_report_articles_hReportId_fkey" FOREIGN KEY ("hReportId") REFERENCES "h_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_purchases" ADD CONSTRAINT "stock_purchases_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "h_report_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_installations" ADD CONSTRAINT "article_installations_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "h_report_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_installations" ADD CONSTRAINT "article_installations_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
