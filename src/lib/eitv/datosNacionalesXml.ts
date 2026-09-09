// Genera el XML de DatosNacionales.xsd (Welcome Pack eITV/ECOC de la DGT,
// /root/ECOC - Welcome Pack V.1_0/datos-nacionales.xsd) a partir de los
// datos ya calculados/guardados del expediente. Fase 1: solo genera el
// XML, no lo firma ni lo envía — ver plan "elegant-tickling-gem".
//
// "Obligatorio" aquí se basa en minOccurs del propio XSD (no en la tabla
// descriptiva del manual, que en un par de campos —tipodocvehicomp— la
// contradice; se prioriza el contrato técnico real).

export type DatosNacionalesInput = {
  bastidor: string | null;
  tipodoc: string | null;
  tipodocvehicomp: string | null;
  docfabricante: string | null;
  docfabricantevehicomp: string | null;
  tipotarjeta: string | null;
  autorizado: string | null;
  numcertificado: string | null;
  clasificacion: string | null;
  potencfiscal: number | null;
  codprocedencia: string | null;
  textobservaciones: string | null;
  relopciones: string | null;
  lugarfirma: string | null;
  fechafirma: string | null; // AAAAMMDD
  firmante: string | null;
  sociedadinscrita: string | null;
  mma: number | null;
  mmaeje1: number | null;
  mmaeje2: number | null;
  mmaeje3: number | null;
  mmaeje4: string | null;
  volumenbodega: string | null;
  cinseguridad: string | null;
  marcavb: string | null;
  numhomovehicomp: string | null;
  numcertitvvehibase: string | null;
  masamarchavb: string | null;
  carrocero: string | null;
};

export const REQUIRED_FIELDS: { key: keyof DatosNacionalesInput; label: string }[] = [
  { key: "bastidor", label: "Bastidor" },
  { key: "tipodoc", label: "Tipo de documento" },
  { key: "docfabricante", label: "Nº documento de fabricante" },
  { key: "tipotarjeta", label: "Tipo de tarjeta ITV" },
  { key: "numcertificado", label: "Número de certificado" },
  { key: "clasificacion", label: "Clasificación del vehículo" },
  { key: "potencfiscal", label: "Potencia fiscal" },
  { key: "codprocedencia", label: "Código de procedencia" },
  { key: "fechafirma", label: "Fecha de firma" },
  { key: "firmante", label: "Nombre del firmante" },
  { key: "mma", label: "MMA total" },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function el(name: string, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  return `<${name}>${escapeXml(String(value))}</${name}>`;
}

export function missingDatosNacionalesFields(input: DatosNacionalesInput): string[] {
  return REQUIRED_FIELDS.filter((f) => {
    const v = input[f.key];
    return v === null || v === undefined || v === "";
  }).map((f) => f.label);
}

/** Asume que ya se comprobó missingDatosNacionalesFields(input).length === 0. */
export function buildDatosNacionalesXml(input: DatosNacionalesInput): string {
  const body = [
    el("bastidor", input.bastidor),
    el("tipodoc", input.tipodoc),
    el("tipodocvehicomp", input.tipodocvehicomp),
    el("docfabricante", input.docfabricante),
    el("docfabricantevehicomp", input.docfabricantevehicomp),
    el("tipotarjeta", input.tipotarjeta),
    el("autorizado", input.autorizado),
    el("numcertificado", input.numcertificado),
    el("clasificacion", input.clasificacion),
    el("potencfiscal", input.potencfiscal),
    el("codprocedencia", input.codprocedencia),
    el("textobservaciones", input.textobservaciones),
    el("relopciones", input.relopciones),
    el("lugarfirma", input.lugarfirma),
    el("fechafirma", input.fechafirma),
    el("firmante", input.firmante),
    el("sociedadinscrita", input.sociedadinscrita),
    el("mma", input.mma),
    el("mmaeje1", input.mmaeje1),
    el("mmaeje2", input.mmaeje2),
    el("mmaeje3", input.mmaeje3),
    el("mmaeje4", input.mmaeje4),
    el("volumenbodega", input.volumenbodega),
    el("cinseguridad", input.cinseguridad),
    el("marcavb", input.marcavb),
    el("numhomovehicomp", input.numhomovehicomp),
    el("numcertitvvehibase", input.numcertitvvehibase),
    el("masamarchavb", input.masamarchavb),
    el("carrocero", input.carrocero),
  ]
    .filter(Boolean)
    .join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<DatosNacionales>\n  ${body}\n</DatosNacionales>\n`;
}
