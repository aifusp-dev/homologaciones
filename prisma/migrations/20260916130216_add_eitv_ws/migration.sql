-- CreateTable
CREATE TABLE "eitv_ws_configs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fabricanteTipoDoc" TEXT,
    "fabricanteDoc" TEXT,
    "fabricanteNombre" TEXT,
    "representanteTipoDoc" TEXT,
    "representanteDoc" TEXT,
    "representanteNombre" TEXT,
    "marca" TEXT,
    "pruebasLogin" TEXT,
    "pruebasPasswordEncrypted" TEXT,
    "produccionLogin" TEXT,
    "produccionPasswordEncrypted" TEXT,
    "entornoActivo" TEXT NOT NULL DEFAULT 'pruebas',

    CONSTRAINT "eitv_ws_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eitv_ws_range_requests" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "tipoTarjeta" TEXT,
    "nroSolicitadas" INTEGER,
    "ministryIdSolicitud" TEXT,
    "entorno" TEXT NOT NULL,
    "rawResponseXml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "eitv_ws_range_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eitv_ws_range_authorizations" (
    "id" TEXT NOT NULL,
    "rangeRequestId" TEXT NOT NULL,
    "tipoVehiculo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "motivoRechazo" TEXT,
    "observaciones" TEXT,

    CONSTRAINT "eitv_ws_range_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eitv_ws_call_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "entorno" TEXT NOT NULL,
    "requestXml" TEXT NOT NULL,
    "responseXml" TEXT,
    "httpStatus" INTEGER,
    "errorMessage" TEXT,
    "actorEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eitv_ws_call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "eitv_ws_configs_companyId_key" ON "eitv_ws_configs"("companyId");

-- CreateIndex
CREATE INDEX "eitv_ws_range_requests_companyId_idx" ON "eitv_ws_range_requests"("companyId");

-- CreateIndex
CREATE INDEX "eitv_ws_call_logs_companyId_createdAt_idx" ON "eitv_ws_call_logs"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "eitv_ws_configs" ADD CONSTRAINT "eitv_ws_configs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eitv_ws_range_requests" ADD CONSTRAINT "eitv_ws_range_requests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eitv_ws_range_authorizations" ADD CONSTRAINT "eitv_ws_range_authorizations_rangeRequestId_fkey" FOREIGN KEY ("rangeRequestId") REFERENCES "eitv_ws_range_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eitv_ws_call_logs" ADD CONSTRAINT "eitv_ws_call_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
