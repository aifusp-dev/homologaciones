import { XMLParser } from "fast-xml-parser";

// Parseo de las respuestas XML del WSEITV. Los formatos de <respuesta>...
// están transcritos de "4_EITV(DSI)XML01.docx" (secciones 1, 6 y 7 del
// welcome pack), pero la forma en que ese nodo llega envuelto en el SOAP
// (Envelope/Body/{Op}Response/{Op}Result/respuesta) y el hecho de que los
// errores de ConsultaDeTarjetas vengan en un subnodo <error> en vez de
// <codigo>/<mensaje> sueltos (a diferencia de SolicitarRangos, que sí usa
// la forma plana) se confirmó contra el WS real de pruebas durante la
// implementación (ver EitvWsCallLog) — el docx no lo especifica.
//
// Es la primera vez que este repo necesita parsear XML con nodos
// repetidos (grupo/tipovehiculo/tarjeta), de ahí fast-xml-parser (ligera,
// sin dependencias) en vez de regex a mano — para generar XML sí se sigue
// usando el estilo de templates de string (ver xmlBuilders.ts).

// removeNSPrefix quita los prefijos soap:/etc. para poder navegar por
// nombre de tag simple. isArray fuerza a array los nodos que pueden
// repetirse, aunque el WS solo devuelva uno (si no, fast-xml-parser
// colapsa a objeto cuando hay 1 sola ocurrencia).
const parser = new XMLParser({
  ignoreAttributes: true,
  removeNSPrefix: true,
  isArray: (tagName) => ["grupo", "tarjeta", "tipovehiculo"].includes(tagName),
});

function str(v: unknown): string | null {
  if (v === undefined || v === null || v === "") return null;
  return String(v);
}

function num(v: unknown): number | null {
  const s = str(v);
  if (s === null) return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

/** Navega Envelope.Body.{operation}Response.{operation}Result.respuesta. */
function extractRespuesta(xml: string, operation: string): Record<string, unknown> {
  const parsed = parser.parse(xml);
  const result = parsed?.Envelope?.Body?.[`${operation}Response`]?.[`${operation}Result`];
  return result?.respuesta ?? {};
}

/** Algunas operaciones (ConsultaDeTarjetas) meten el error en <error>, otras
 * (SolicitarRangos) lo dejan plano en la propia <respuesta> — se soportan
 * los dos sin asumir cuál usará cada método nuevo que se añada. */
function codigoYMensaje(respuesta: Record<string, unknown>): { codigo: number | null; mensaje: string | null } {
  const error = (respuesta.error as Record<string, unknown> | undefined) ?? respuesta;
  return { codigo: num(error.codigo), mensaje: str(error.mensaje) };
}

export type RangeCallResult = {
  codigo: number | null;
  mensaje: string | null;
  idSolicitud: string | null;
};

/** Respuesta de SolicitarRangos / SolicitarAmpliacionRangos (OK y KO). */
export function parseRangeCallResponse(xml: string, operation: "SolicitarRangos" | "SolicitarAmpliacionRangos"): RangeCallResult {
  const respuesta = extractRespuesta(xml, operation);
  return {
    ...codigoYMensaje(respuesta),
    idSolicitud: str(respuesta.idsolicitud),
  };
}

export type RangeAuthorizationStatus = {
  contrasena: string;
  tipoVehiculo: string;
  status: "pendiente" | "aceptado" | "rechazado";
  motivoRechazo: string | null;
};

export type ConsultaSolicitudesResult = {
  codigo: number | null; // solo presente si es una respuesta de error
  mensaje: string | null;
  idSolicitud: string | null;
  authorizations: RangeAuthorizationStatus[];
};

/** Respuesta de ConsultaDeSolicitudes (doc 4, sección 6). */
export function parseConsultaSolicitudesResponse(xml: string): ConsultaSolicitudesResult {
  const respuesta = extractRespuesta(xml, "ConsultaDeSolicitudes");

  if (!respuesta.contrasenas) {
    // Forma de error, o falta el nodo por otro motivo — se informa arriba,
    // no se intenta adivinar estados.
    return { ...codigoYMensaje(respuesta), idSolicitud: str(respuesta.idsolicitud), authorizations: [] };
  }

  const grupos = respuesta.contrasenas as Record<string, { grupo?: Record<string, unknown>[] }>;
  const authorizations: RangeAuthorizationStatus[] = [];

  for (const grupo of grupos.pendientes?.grupo ?? []) {
    authorizations.push({
      contrasena: String(grupo.contrasena ?? ""),
      tipoVehiculo: String(grupo.tipovehiculo ?? ""),
      status: "pendiente",
      motivoRechazo: null,
    });
  }
  for (const grupo of grupos.aceptadas?.grupo ?? []) {
    authorizations.push({
      contrasena: String(grupo.contrasena ?? ""),
      tipoVehiculo: String(grupo.tipovehiculo ?? ""),
      status: "aceptado",
      motivoRechazo: null,
    });
  }
  for (const grupo of grupos.rechazadas?.grupo ?? []) {
    authorizations.push({
      contrasena: String(grupo.contrasena ?? ""),
      tipoVehiculo: String(grupo.tipovehiculo ?? ""),
      status: "rechazado",
      motivoRechazo: str(grupo.motivo) ?? str(grupo.mensaje),
    });
  }

  return { codigo: null, mensaje: null, idSolicitud: str(respuesta.idsolicitud), authorizations };
}

export type EitvCard = { serieIndustria: string; firma: string | null };

export type ConsultaTarjetasResult = {
  codigo: number | null;
  mensaje: string | null;
  cards: EitvCard[];
};

/** Respuesta de ConsultaDeTarjetas (doc 4, sección 3). */
export function parseConsultaTarjetasResponse(xml: string): ConsultaTarjetasResult {
  const respuesta = extractRespuesta(xml, "ConsultaDeTarjetas");

  const aceptadas = respuesta.aceptadas as { tarjeta?: Record<string, unknown>[] } | "" | undefined;
  const cards: EitvCard[] = (typeof aceptadas === "object" ? aceptadas?.tarjeta ?? [] : []).map((t) => ({
    serieIndustria: String(t.serieindustria ?? ""),
    firma: str(t.firma),
  }));

  return { ...codigoYMensaje(respuesta), cards };
}
