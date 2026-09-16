import "server-only";
import { prisma } from "@/lib/db";
import {
  buildSolicitarRangosXml,
  buildSolicitarAmpliacionRangosXml,
  type SolicitarRangosInput,
  type SolicitarAmpliacionRangosInput,
} from "./xmlBuilders";
import {
  parseRangeCallResponse,
  parseConsultaSolicitudesResponse,
  parseConsultaTarjetasResponse,
} from "./xmlParsers";

// Cliente SOAP a mano contra WSEITV (Ministerio de Industria) — no hay
// ninguna librería SOAP instalada en el repo y son solo 4 operaciones
// (las que no requieren firma XAdES, ver plan "fluttering-splashing-puppy"
// Fase A), así que no se justifica añadir una dependencia pesada tipo
// `soap` solo para esto.
//
// Namespace y URLs de los dos entornos verificados contra el WSDL real
// (`?WSDL` en cada endpoint) durante la implementación — NO son una
// suposición: la doc 2 del welcome pack tiene un typo en la URL del WS de
// pruebas ("servicioesmin" en vez de "serviciosmin", que sí resuelve).
const NAMESPACE = "https://oficinavirtual.mityc.es/WS_Operaciones_Tarjetas_eITV";

export type Entorno = "pruebas" | "produccion";

const ENDPOINTS: Record<Entorno, string> = {
  pruebas: "https://industria.serviciosmin.gob.es/pr_wseitv/wseitv.asmx",
  produccion: "https://industria.serviciosmin.gob.es/wseitv/wseitv.asmx",
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildEnvelope(operation: string, paramsXml: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${operation} xmlns="${NAMESPACE}">
      ${paramsXml}
    </${operation}>
  </soap:Body>
</soap:Envelope>`;
}

type CallLogParams = {
  companyId: string;
  operation: string;
  entorno: Entorno;
  actorEmail: string;
};

/**
 * Hace la llamada SOAP y deja SIEMPRE un EitvWsCallLog (incluso en error),
 * para que ninguna llamada al Ministerio quede sin rastro. Devuelve el
 * body de la respuesta ya extraído de dentro del <soap:Body>, o lanza si
 * la llamada HTTP falla.
 */
async function callSoap(log: CallLogParams, requestXml: string): Promise<string> {
  let responseText: string | null = null;
  let httpStatus: number | null = null;
  let errorMessage: string | null = null;

  try {
    const res = await fetch(ENDPOINTS[log.entorno], {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `${NAMESPACE}/${log.operation}`,
      },
      body: requestXml,
    });
    httpStatus = res.status;
    responseText = await res.text();
    if (!res.ok) {
      errorMessage = `WSEITV devolvió ${res.status}: ${responseText}`;
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  await prisma.eitvWsCallLog.create({
    data: {
      companyId: log.companyId,
      operation: log.operation,
      entorno: log.entorno,
      requestXml,
      responseXml: responseText,
      httpStatus,
      errorMessage,
      actorEmail: log.actorEmail,
    },
  });

  if (errorMessage) throw new Error(errorMessage);
  // El body de respuesta del método viene envuelto en soap:Envelope/soap:Body
  // — para lo que necesitamos (parsear el <respuesta>... de dentro) basta
  // con devolver el texto completo, los parsers de xmlParsers.ts ya buscan
  // el nodo <respuesta> donde esté anidado.
  return responseText ?? "";
}

export async function solicitarRangos(opts: {
  companyId: string;
  actorEmail: string;
  entorno: Entorno;
  login: string;
  password: string;
  input: SolicitarRangosInput;
}) {
  const sXmlSolicitud = buildSolicitarRangosXml(opts.input);
  const requestXml = buildEnvelope(
    "SolicitarRangos",
    `<sLogin>${escapeXml(opts.login)}</sLogin><sPassword>${escapeXml(opts.password)}</sPassword><sXmlSolicitud>${escapeXml(sXmlSolicitud)}</sXmlSolicitud>`
  );
  const responseXml = await callSoap(
    { companyId: opts.companyId, operation: "SolicitarRangos", entorno: opts.entorno, actorEmail: opts.actorEmail },
    requestXml
  );
  return { ...parseRangeCallResponse(responseXml, "SolicitarRangos"), rawResponseXml: responseXml };
}

export async function solicitarAmpliacionRangos(opts: {
  companyId: string;
  actorEmail: string;
  entorno: Entorno;
  login: string;
  password: string;
  input: SolicitarAmpliacionRangosInput;
}) {
  const sXmlSolicitud = buildSolicitarAmpliacionRangosXml(opts.input);
  const requestXml = buildEnvelope(
    "SolicitarAmpliacionRangos",
    `<sLogin>${escapeXml(opts.login)}</sLogin><sPassword>${escapeXml(opts.password)}</sPassword><sXmlSolicitud>${escapeXml(sXmlSolicitud)}</sXmlSolicitud>`
  );
  const responseXml = await callSoap(
    {
      companyId: opts.companyId,
      operation: "SolicitarAmpliacionRangos",
      entorno: opts.entorno,
      actorEmail: opts.actorEmail,
    },
    requestXml
  );
  return { ...parseRangeCallResponse(responseXml, "SolicitarAmpliacionRangos"), rawResponseXml: responseXml };
}

export async function consultaDeSolicitudes(opts: {
  companyId: string;
  actorEmail: string;
  entorno: Entorno;
  login: string;
  password: string;
  idSolicitud: string;
}) {
  const requestXml = buildEnvelope(
    "ConsultaDeSolicitudes",
    `<sLogin>${escapeXml(opts.login)}</sLogin><sPassword>${escapeXml(opts.password)}</sPassword><idSolicitud>${escapeXml(opts.idSolicitud)}</idSolicitud>`
  );
  const responseXml = await callSoap(
    { companyId: opts.companyId, operation: "ConsultaDeSolicitudes", entorno: opts.entorno, actorEmail: opts.actorEmail },
    requestXml
  );
  return { ...parseConsultaSolicitudesResponse(responseXml), rawResponseXml: responseXml };
}

export async function consultaDeTarjetas(opts: {
  companyId: string;
  actorEmail: string;
  entorno: Entorno;
  login: string;
  password: string;
  filtros: {
    tipoDocFabricante: string;
    docFabricante: string;
    marca?: string;
    contrasena?: string;
    fechaInicio?: string;
    fechaFin?: string;
    numSerieIndustria?: string;
    numVIN?: string;
  };
}) {
  const f = opts.filtros;
  const requestXml = buildEnvelope(
    "ConsultaDeTarjetas",
    `<sLogin>${escapeXml(opts.login)}</sLogin><sPassword>${escapeXml(opts.password)}</sPassword>` +
      `<tipoDocFabricante>${escapeXml(f.tipoDocFabricante)}</tipoDocFabricante>` +
      `<docFabricante>${escapeXml(f.docFabricante)}</docFabricante>` +
      `<marca>${escapeXml(f.marca ?? "")}</marca>` +
      `<contrasena>${escapeXml(f.contrasena ?? "")}</contrasena>` +
      `<fechaInicio>${escapeXml(f.fechaInicio ?? "")}</fechaInicio>` +
      `<fechaFin>${escapeXml(f.fechaFin ?? "")}</fechaFin>` +
      `<numSerieIndustria>${escapeXml(f.numSerieIndustria ?? "")}</numSerieIndustria>` +
      `<numVIN>${escapeXml(f.numVIN ?? "")}</numVIN>`
  );
  const responseXml = await callSoap(
    { companyId: opts.companyId, operation: "ConsultaDeTarjetas", entorno: opts.entorno, actorEmail: opts.actorEmail },
    requestXml
  );
  return { ...parseConsultaTarjetasResponse(responseXml), rawResponseXml: responseXml };
}
