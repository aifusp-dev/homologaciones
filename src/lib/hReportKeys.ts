// Las 6 FK de RegulatoryActNumbers hacia HReport (ver prisma/schema.prisma) —
// compartido entre el server component del panel (dashboard/page.tsx) y el
// client component de la lista (dashboard/dossier-list.tsx). Vive fuera de
// dossier-list.tsx porque un módulo "use client" se compila como referencia
// de cliente al importarlo desde un server component — un array exportado
// desde ahí no llega como el valor real, solo funciones/componentes cruzan
// bien ese límite.
export const H_REPORT_FK_KEYS = [
  "lightingHReportId",
  "spraySuppressionHReportId",
  "massesHReportId",
  "rearPlateHReportId",
  "rearProtectionHReportId",
  "emcHReportId",
] as const;
