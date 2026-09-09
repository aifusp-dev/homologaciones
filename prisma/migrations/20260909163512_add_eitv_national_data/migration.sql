-- CreateTable
CREATE TABLE "eitv_national_data" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "remitenteNombre" TEXT,
    "remitenteApellidos" TEXT,
    "remitenteDocumento" TEXT,
    "tipodoc" TEXT,
    "tipodocvehicomp" TEXT,
    "docfabricante" TEXT,
    "docfabricantevehicomp" TEXT,
    "tipotarjeta" TEXT,
    "autorizado" TEXT,
    "numcertificado" TEXT,
    "codprocedencia" TEXT,
    "textobservaciones" TEXT,
    "relopciones" TEXT,
    "lugarfirma" TEXT,
    "fechafirma" TEXT,
    "firmante" TEXT,
    "sociedadinscrita" TEXT,
    "volumenbodega" TEXT,
    "cinseguridad" TEXT,
    "marcavb" TEXT,
    "numcertitvvehibase" TEXT,
    "masamarchavb" TEXT,
    "mmaeje4" TEXT,

    CONSTRAINT "eitv_national_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "eitv_national_data_dossierId_key" ON "eitv_national_data"("dossierId");

-- AddForeignKey
ALTER TABLE "eitv_national_data" ADD CONSTRAINT "eitv_national_data_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
