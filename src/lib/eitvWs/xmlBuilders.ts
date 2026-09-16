// Construcción de los XML internos (sXmlSolicitud) de las operaciones
// WSEITV sin firma — formato transcrito literalmente de
// "4_EITV(DSI)XML01.docx" (welcome pack eITV del Ministerio de
// Industria), no inventado. Mismo estilo de templates de string +
// escapeXml que ya usa src/lib/eitv/datosNacionalesXml.ts (trámite
// distinto, congelado) — aquí no se reutiliza ese código porque son XSD
// distintos, solo el estilo.

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type TipoVehiculoContrasena = { tipoVeh: string; contrasena: string };

export type SolicitarRangosInput = {
  solicitanteTipoDoc: string;
  solicitanteDoc: string;
  fabricanteTipoDoc: string;
  fabricanteDoc: string;
  fabricanteNombre: string;
  representanteTipoDoc: string;
  representanteDoc: string;
  representanteNombre: string;
  tipoTarjeta: string;
  marca: string;
  nroSolicitadas: number;
  pares: TipoVehiculoContrasena[];
};

function tiposVehiculosXml(pares: TipoVehiculoContrasena[]): string {
  const items = pares
    .map(
      (p) =>
        `<tipovehiculo><tipoveh>${escapeXml(p.tipoVeh)}</tipoveh><contrasena>${escapeXml(p.contrasena)}</contrasena></tipovehiculo>`
    )
    .join("");
  return `<tiposvehiculos>${items}</tiposvehiculos>`;
}

/** doc 4, sección 1 ("SOLICITUD DE RANGOS DE TARJETAS"). */
export function buildSolicitarRangosXml(input: SolicitarRangosInput): string {
  return `<?xml version="1.0" encoding="utf-8" ?>
<solicitudrangos>
<solicitante><tipodoc>${escapeXml(input.solicitanteTipoDoc)}</tipodoc><doc>${escapeXml(input.solicitanteDoc)}</doc></solicitante>
<fabricante><tipodoc>${escapeXml(input.fabricanteTipoDoc)}</tipodoc><doc>${escapeXml(input.fabricanteDoc)}</doc><nombre>${escapeXml(input.fabricanteNombre)}</nombre></fabricante>
<representante><tipodoc>${escapeXml(input.representanteTipoDoc)}</tipodoc><doc>${escapeXml(input.representanteDoc)}</doc><nombre>${escapeXml(input.representanteNombre)}</nombre></representante>
<tipotarjeta>${escapeXml(input.tipoTarjeta)}</tipotarjeta>
<marca>${escapeXml(input.marca)}</marca>
<nrosolicitadas>${input.nroSolicitadas}</nrosolicitadas>
${tiposVehiculosXml(input.pares)}
</solicitudrangos>`;
}

export type SolicitarAmpliacionRangosInput = {
  solicitanteTipoDoc: string;
  solicitanteDoc: string;
  idSolicitud: string;
  pares: TipoVehiculoContrasena[];
};

/** doc 4, sección 7 ("SOLICITUD DE AMPLIACIÓN DE CONTRASEÑAS..."). */
export function buildSolicitarAmpliacionRangosXml(input: SolicitarAmpliacionRangosInput): string {
  return `<?xml version="1.0" encoding="utf-8" ?>
<solicitudampliacionrangos>
<solicitante><tipodoc>${escapeXml(input.solicitanteTipoDoc)}</tipodoc><doc>${escapeXml(input.solicitanteDoc)}</doc></solicitante>
<idsolicitud>${escapeXml(input.idSolicitud)}</idsolicitud>
${tiposVehiculosXml(input.pares)}
</solicitudampliacionrangos>`;
}
