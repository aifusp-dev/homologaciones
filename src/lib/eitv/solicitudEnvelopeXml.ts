import "server-only";
import { createHash } from "node:crypto";

// Envuelve el XML de DatosNacionales en Solicitud_Registro_Entrada.xsd
// (Welcome Pack eITV/ECOC de la DGT). Fase 1: <Firma> queda vacío con un
// comentario explícito — este XML NO está firmado, no se puede enviar tal
// cual a la DGT (falta certificado X.509 + firma XAdES, ver plan
// "elegant-tickling-gem"). Se genera para poder revisarlo/firmarlo con
// herramientas externas (p.ej. Autofirma) mientras se resuelve el acceso.

const ASUNTO_CODIGO = "OBCOC";
const ASUNTO_DESCRIPCION = "Operaciones Basicas sobre ECOCs para FIR";
const DESTINO_CODIGO = "EA0009418";
const DESTINO_DESCRIPCION = "DGT - vehiculos";
const RELE_VERSION = "5.0";

export type SolicitudEnvelopeInput = {
  remitenteNombre: string;
  remitenteApellidos: string;
  remitenteDocumento: string;
  bastidor: string;
  homologacionE9: boolean;
  datosNacionalesXml: string;
  datosNacionalesFileName: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildSolicitudRegistroEntradaXml(input: SolicitudEnvelopeInput): string {
  const hash = createHash("sha256").update(input.datosNacionalesXml, "utf8").digest("hex");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Solicitud_Registro_Entrada Version="${RELE_VERSION}">
  <Datos_Firmados>
    <Datos_Genericos>
      <Remitente>
        <Nombre>${escapeXml(input.remitenteNombre)}</Nombre>
        <Apellidos>${escapeXml(input.remitenteApellidos)}</Apellidos>
        <Documento_Identificacion>
          <Numero>${escapeXml(input.remitenteDocumento)}</Numero>
        </Documento_Identificacion>
      </Remitente>
      <Asunto>
        <Codigo>${ASUNTO_CODIGO}</Codigo>
        <Descripcion>${ASUNTO_DESCRIPCION}</Descripcion>
      </Asunto>
      <Destino>
        <Codigo>${DESTINO_CODIGO}</Codigo>
        <Descripcion>${DESTINO_DESCRIPCION}</Descripcion>
      </Destino>
    </Datos_Genericos>
    <Datos_Especificos>
      <Datos_Vehiculo>
        <tipo_operacion>inscripcion</tipo_operacion>
        <bastidor>${escapeXml(input.bastidor)}</bastidor>
        <Homologacione9>${input.homologacionE9 ? "SI" : "NO"}</Homologacione9>
      </Datos_Vehiculo>
    </Datos_Especificos>
    <Documentos>
      <Documento>
        <Codigo>DNAC</Codigo>
        <Nombre>${escapeXml(input.datosNacionalesFileName)}</Nombre>
        <Hash>${hash}</Hash>
      </Documento>
    </Documentos>
  </Datos_Firmados>
  <!-- PENDIENTE DE FIRMA: este documento NO está firmado. No enviar a la DGT tal cual. -->
  <Firma></Firma>
</Solicitud_Registro_Entrada>
`;
}
