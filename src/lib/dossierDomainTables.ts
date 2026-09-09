// Única fuente de verdad de qué relaciones 1:1 de Dossier componen su
// "dominio" versionable/auditable — extraída del include que ya usaba
// dossiers/[id]/page.tsx. La reusan: el include de la página, el snapshot
// de DossierVersion y el restore (src/app/actions/dossierVersions.ts). Si
// se añade una tabla de dominio nueva en el futuro, solo hace falta tocar
// esta lista para que quede versionada/auditada automáticamente.
export const DOSSIER_DOMAIN_TABLES = [
  "customer",
  "dealer",
  "coc",
  "bodywork",
  "massesDimensions",
  "couplingDevice",
  "spraySuppression",
  "electromagneticCompatibility",
  "lateralProtection",
  "rearProtection",
  "lateralMarking",
  "lightingSide",
  "lightingPosition",
  "lightingReflector",
  "lightingBrake",
  "lightingTurnSignal",
  "lightingRearOutlineMarker",
  "lightingFrontOutlineMarker",
  "lightingPlate",
  "lightingReverse",
  "lightingFog",
  "lightingMaterialChecklist",
  "regulatoryActNumbers",
  "copCoverSheet",
  "registrationPlates",
  "platesInscriptions",
] as const;

export type DossierDomainTable = (typeof DOSSIER_DOMAIN_TABLES)[number];

export const TABLE_LABELS: Record<DossierDomainTable, string> = {
  customer: "Cliente",
  dealer: "Concesionario",
  coc: "COC",
  bodywork: "Carrozado",
  massesDimensions: "Masas y dimensiones",
  couplingDevice: "Dispositivo de acoplamiento",
  spraySuppression: "Antiproyección",
  electromagneticCompatibility: "Compatibilidad electromagnética",
  lateralProtection: "Protección lateral",
  rearProtection: "Protección trasera",
  lateralMarking: "Marcado lateral",
  lightingSide: "Alumbrado lateral",
  lightingPosition: "Alumbrado posición",
  lightingReflector: "Alumbrado reflectante",
  lightingBrake: "Alumbrado freno",
  lightingTurnSignal: "Alumbrado intermitentes",
  lightingRearOutlineMarker: "Alumbrado gálibo trasero",
  lightingFrontOutlineMarker: "Alumbrado gálibo delantero",
  lightingPlate: "Alumbrado matrícula",
  lightingReverse: "Alumbrado marcha atrás",
  lightingFog: "Alumbrado antiniebla",
  lightingMaterialChecklist: "Material de alumbrado y señalización",
  regulatoryActNumbers: "Actos reglamentarios / Informes H",
  copCoverSheet: "Portada Registro COP",
  registrationPlates: "Placas de matrícula",
  platesInscriptions: "Placas e inscripciones",
};

/// Objeto {tabla: true, ...} listo para pasar como (parte de) un `include`
/// de Prisma sobre Dossier.
export function domainInclude(): Record<DossierDomainTable, true> {
  return Object.fromEntries(DOSSIER_DOMAIN_TABLES.map((t) => [t, true])) as Record<
    DossierDomainTable,
    true
  >;
}
