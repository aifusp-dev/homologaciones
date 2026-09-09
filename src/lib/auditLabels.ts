import { COC_FIELDS } from "@/lib/cocFields";
import { BODYWORK_FIELDS } from "@/lib/bodyworkFields";
import { MASSES_FIELDS } from "@/lib/massesFields";
import { DEVICE_TABLES, type DeviceTableKey } from "@/lib/deviceFields";
import { TABLE_LABELS, type DossierDomainTable } from "@/lib/dossierDomainTables";

// customer/dealer no tienen fichero de metadatos propio (son 6-7 campos
// simples) — mismas etiquetas literales que customer-form.tsx/dealer-form.tsx.
const CUSTOMER_LABELS: Record<string, string> = {
  name: "Nombre",
  phone: "Teléfono",
  email: "Email",
  contactName: "Contacto",
  contactPhone: "Teléfono del contacto",
  notes: "Observaciones",
};

const DEALER_LABELS: Record<string, string> = {
  ...CUSTOMER_LABELS,
  contactEmail: "Email del contacto",
};

const REGULATORY_ACT_NUMBERS_LABELS: Record<string, string> = {
  lightingHReportId: "Informe H — Alumbrado",
  spraySuppressionHReportId: "Informe H — Antiproyección",
  massesHReportId: "Informe H — Masas",
  rearPlateHReportId: "Informe H — Placas traseras",
  rearProtectionHReportId: "Informe H — Protección trasera",
  emcHReportId: "Informe H — Compatibilidad electromagnética",
};

const FIELD_LABELS: Partial<Record<DossierDomainTable, Record<string, string>>> = {
  customer: CUSTOMER_LABELS,
  dealer: DEALER_LABELS,
  regulatoryActNumbers: REGULATORY_ACT_NUMBERS_LABELS,
  coc: Object.fromEntries(COC_FIELDS.map((f) => [f.name, f.label])),
  bodywork: Object.fromEntries(BODYWORK_FIELDS.map((f) => [f.name, f.label])),
  massesDimensions: Object.fromEntries(MASSES_FIELDS.map((f) => [f.name, f.label])),
};

for (const key of Object.keys(DEVICE_TABLES) as DeviceTableKey[]) {
  FIELD_LABELS[key] = Object.fromEntries(DEVICE_TABLES[key].fields.map((f) => [f.name, f.label]));
}

export function getTableLabel(tableName: string): string {
  return TABLE_LABELS[tableName as DossierDomainTable] ?? tableName;
}

export function getFieldLabel(tableName: string, fieldName: string): string {
  return FIELD_LABELS[tableName as DossierDomainTable]?.[fieldName] ?? fieldName;
}
