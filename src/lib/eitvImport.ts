// Importación desde el XML de tarjeta eITV que entrega el fabricante con
// un chasis-cabina recién llegado al taller (formato "prematriculaciones",
// ver proyecto hermano eitv-taller y su demo/eitv_ejemplo_descarga.xml).
//
// Solo se mapean los campos de la sección <fabricante> donde la
// correspondencia con COC_FIELDS es inequívoca por significado — el propio
// proyecto eitv-taller avisa de que la DGT no publica el XSD real, así que
// las etiquetas son "una transliteración razonable", no las oficiales. Se
// deja fuera cualquier campo sin una correspondencia clara (nº de
// certificado, código ITV, tipo de tarjeta, etc.) en vez de arriesgarse a
// mapear mal un dato que acaba en un documento oficial.
export const EITV_FIELD_MAP: Record<string, string> = {
  nombre_fabricante: "manufacturerName",
  direccion_fabricante: "manufacturerAddress",
  n_de_identificacion_del_vehiculo_vin: "vin",
  marca: "brand",
  tipo: "type",
  variante: "variant",
  version: "version",
  denominacion: "commercialName",
  categoria_del_vehiculo: "vehicleCategory",
};

export type EitvImportResult =
  | { ok: true; values: Record<string, string>; fileName: string }
  | { ok: false; error: string };

export function parseEitvXml(xmlText: string, fileName: string): EitvImportResult {
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xmlText, "application/xml");
  } catch {
    return { ok: false, error: "No se pudo leer el archivo como XML." };
  }

  if (doc.querySelector("parsererror")) {
    return { ok: false, error: "El archivo no es un XML válido." };
  }

  const vehiculo = doc.querySelector("vehiculo");
  if (!vehiculo) {
    return { ok: false, error: "No se encontró ningún <vehiculo> en el archivo." };
  }

  const fabricante = vehiculo.querySelector("fabricante");
  if (!fabricante) {
    return { ok: false, error: "El vehículo no trae datos de <fabricante>." };
  }

  const values: Record<string, string> = {};
  for (const [xmlTag, cocField] of Object.entries(EITV_FIELD_MAP)) {
    const el = fabricante.querySelector(xmlTag);
    const text = el?.textContent?.trim();
    if (text) values[cocField] = text;
  }

  return { ok: true, values, fileName };
}
