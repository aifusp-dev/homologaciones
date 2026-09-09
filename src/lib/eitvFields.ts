// Campos manuales de EitvNationalData — los que no tienen correspondencia
// clara en Coc/Bodywork/Company y hay que pedirlos aparte. El resto de
// campos de DatosNacionales.xsd se calculan en vivo, ver
// src/lib/eitv/datosNacionalesXml.ts.
export type EitvFieldType = "text" | "date";

export const EITV_REMITENTE_FIELDS: { name: string; label: string; type: EitvFieldType }[] = [
  { name: "remitenteNombre", label: "Nombre del remitente", type: "text" },
  { name: "remitenteApellidos", label: "Apellidos del remitente", type: "text" },
  { name: "remitenteDocumento", label: "Nº de documento del remitente", type: "text" },
];

export const EITV_FIELDS: { name: string; label: string; type: EitvFieldType }[] = [
  { name: "tipodoc", label: "Tipo de documento", type: "text" },
  { name: "tipodocvehicomp", label: "Tipo de documento vehículo completado", type: "text" },
  { name: "docfabricante", label: "Nº documento de fabricante", type: "text" },
  { name: "docfabricantevehicomp", label: "Nº documento fabricante vehículo completado", type: "text" },
  { name: "tipotarjeta", label: "Tipo de tarjeta ITV", type: "text" },
  { name: "autorizado", label: "Autorizador del firmante", type: "text" },
  { name: "numcertificado", label: "Número de certificado", type: "text" },
  { name: "codprocedencia", label: "Código de procedencia (IM/EEE/N)", type: "text" },
  { name: "textobservaciones", label: "Observaciones (solo nacionales, no incluidas en el CoC)", type: "text" },
  { name: "relopciones", label: "Opciones incluidas en la homologación de tipo", type: "text" },
  { name: "lugarfirma", label: "Lugar de firma", type: "text" },
  { name: "fechafirma", label: "Fecha de firma", type: "date" },
  { name: "firmante", label: "Nombre del firmante de la certificación", type: "text" },
  { name: "sociedadinscrita", label: "Sociedad inscrita (tomo, folio y hoja)", type: "text" },
  { name: "volumenbodega", label: "Volumen de bodegas (m³)", type: "text" },
  { name: "cinseguridad", label: "Nº de cinturones de seguridad homologados", type: "text" },
  { name: "marcavb", label: "Marca original del vehículo base", type: "text" },
  { name: "numcertitvvehibase", label: "Nº certificado del vehículo base", type: "text" },
  { name: "masamarchavb", label: "Masa en orden de marcha del vehículo base", type: "text" },
  { name: "mmaeje4", label: "MMA eje 4", type: "text" },
];
