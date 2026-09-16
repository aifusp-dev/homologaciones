"use server";

import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { revalidatePath, refresh } from "next/cache";
import { encryptSecret, decryptSecret } from "@/lib/eitvWs/secretCrypto";
import * as soapClient from "@/lib/eitvWs/soapClient";
import type { Entorno } from "@/lib/eitvWs/soapClient";
import type { TipoVehiculoContrasena } from "@/lib/eitvWs/xmlBuilders";
import type { EitvCard } from "@/lib/eitvWs/xmlParsers";

export type EitvWsState = { message?: string; errors?: Record<string, string[]> } | undefined;

function str(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

function entornoFromForm(formData: FormData): Entorno {
  return str(formData.get("entorno")) === "produccion" ? "produccion" : "pruebas";
}

/**
 * Datos de identidad RFFR + credenciales por entorno. Solo COMPANY_ADMIN
 * (mismo check inline que src/app/actions/companies.ts:55, no hay un
 * helper requireCompanyAdmin que reutilizar). No usa auditedUpsert porque
 * ese helper es 1:1 por Dossier (ver src/lib/audit.ts) y esto es dato de
 * empresa, no de expediente.
 */
export async function updateEitvWsConfig(_state: EitvWsState, formData: FormData): Promise<EitvWsState> {
  const user = await requireCompanyUser();
  if (user.role !== "COMPANY_ADMIN") {
    return { message: "Solo un administrador de la empresa puede editar esta configuración." };
  }

  const pruebasPassword = str(formData.get("pruebasPassword"));
  const produccionPassword = str(formData.get("produccionPassword"));

  await prisma.eitvWsConfig.upsert({
    where: { companyId: user.companyId },
    update: {
      fabricanteTipoDoc: str(formData.get("fabricanteTipoDoc")),
      fabricanteDoc: str(formData.get("fabricanteDoc")),
      fabricanteNombre: str(formData.get("fabricanteNombre")),
      representanteTipoDoc: str(formData.get("representanteTipoDoc")),
      representanteDoc: str(formData.get("representanteDoc")),
      representanteNombre: str(formData.get("representanteNombre")),
      marca: str(formData.get("marca")),
      entornoActivo: str(formData.get("entornoActivo")) ?? "pruebas",
      pruebasLogin: str(formData.get("pruebasLogin")),
      // Campo vacío = no cambiar el password ya guardado (así no hay que
      // reintroducirlo cada vez que se edita solo el resto de datos).
      ...(pruebasPassword ? { pruebasPasswordEncrypted: encryptSecret(pruebasPassword) } : {}),
      produccionLogin: str(formData.get("produccionLogin")),
      ...(produccionPassword ? { produccionPasswordEncrypted: encryptSecret(produccionPassword) } : {}),
    },
    create: {
      companyId: user.companyId,
      fabricanteTipoDoc: str(formData.get("fabricanteTipoDoc")),
      fabricanteDoc: str(formData.get("fabricanteDoc")),
      fabricanteNombre: str(formData.get("fabricanteNombre")),
      representanteTipoDoc: str(formData.get("representanteTipoDoc")),
      representanteDoc: str(formData.get("representanteDoc")),
      representanteNombre: str(formData.get("representanteNombre")),
      marca: str(formData.get("marca")),
      entornoActivo: str(formData.get("entornoActivo")) ?? "pruebas",
      pruebasLogin: str(formData.get("pruebasLogin")),
      pruebasPasswordEncrypted: pruebasPassword ? encryptSecret(pruebasPassword) : null,
      produccionLogin: str(formData.get("produccionLogin")),
      produccionPasswordEncrypted: produccionPassword ? encryptSecret(produccionPassword) : null,
    },
  });

  revalidatePath("/eitv-ws");
  refresh();
  return { message: "Configuración eITV guardada." };
}

async function credentialsFor(companyId: string, entorno: Entorno) {
  const config = await prisma.eitvWsConfig.findUnique({ where: { companyId } });
  if (!config) throw new Error("Falta configurar la identidad/credenciales eITV de la empresa.");

  const login = entorno === "pruebas" ? config.pruebasLogin : config.produccionLogin;
  const passwordEncrypted = entorno === "pruebas" ? config.pruebasPasswordEncrypted : config.produccionPasswordEncrypted;
  if (!login || !passwordEncrypted) {
    throw new Error(`Faltan credenciales eITV de ${entorno} para esta empresa.`);
  }
  return { config, login, password: decryptSecret(passwordEncrypted) };
}

export type RequestEitvRangeResult =
  | { message: string; errors?: Record<string, string[]> }
  | { message: string; rangeRequestId: string }
  | undefined;

/** Solicita un rango nuevo (SolicitarRangos) — cualquier usuario de la empresa, no solo admin. */
export async function requestEitvRange(_state: RequestEitvRangeResult, formData: FormData): Promise<RequestEitvRangeResult> {
  const user = await requireCompanyUser();

  const tipoTarjeta = str(formData.get("tipoTarjeta"));
  const nroSolicitadas = Number(formData.get("nroSolicitadas"));
  const solicitanteTipoDoc = str(formData.get("solicitanteTipoDoc"));
  const solicitanteDoc = str(formData.get("solicitanteDoc"));
  const tiposVeh = formData.getAll("tipoVeh").map((v) => String(v).trim());
  const contrasenas = formData.getAll("contrasena").map((v) => String(v).trim());

  if (!tipoTarjeta || !solicitanteTipoDoc || !solicitanteDoc || !nroSolicitadas || nroSolicitadas <= 0) {
    return { message: "Faltan datos obligatorios de la solicitud." };
  }
  const pares: TipoVehiculoContrasena[] = tiposVeh
    .map((tipoVeh, i) => ({ tipoVeh, contrasena: contrasenas[i] ?? "" }))
    .filter((p) => p.tipoVeh && p.contrasena);
  if (pares.length === 0) {
    return { message: "Añade al menos un par tipo de vehículo + contraseña." };
  }

  try {
    const entorno = entornoFromForm(formData);
    const { config, login, password } = await credentialsFor(user.companyId, entorno);

    const result = await soapClient.solicitarRangos({
      companyId: user.companyId,
      actorEmail: user.email,
      entorno,
      login,
      password,
      input: {
        solicitanteTipoDoc,
        solicitanteDoc,
        fabricanteTipoDoc: config.fabricanteTipoDoc ?? "",
        fabricanteDoc: config.fabricanteDoc ?? "",
        fabricanteNombre: config.fabricanteNombre ?? "",
        representanteTipoDoc: config.representanteTipoDoc ?? "",
        representanteDoc: config.representanteDoc ?? "",
        representanteNombre: config.representanteNombre ?? "",
        tipoTarjeta,
        marca: config.marca ?? "",
        nroSolicitadas,
        pares,
      },
    });

    const rangeRequest = await prisma.eitvWsRangeRequest.create({
      data: {
        companyId: user.companyId,
        operation: "SolicitarRangos",
        tipoTarjeta,
        nroSolicitadas,
        ministryIdSolicitud: result.idSolicitud,
        entorno,
        rawResponseXml: result.rawResponseXml,
        createdBy: user.email,
        authorizations: {
          create: pares.map((p) => ({ tipoVehiculo: p.tipoVeh, contrasena: p.contrasena, status: "pendiente" })),
        },
      },
    });

    revalidatePath("/eitv-ws");
    refresh();
    return {
      message: result.codigo === 0 ? `Solicitud enviada correctamente (${result.mensaje ?? ""}).` : `El Ministerio devolvió un error: ${result.mensaje ?? "sin mensaje"}.`,
      rangeRequestId: rangeRequest.id,
    };
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconocido al solicitar el rango." };
  }
}

/** Refresca el estado de una solicitud ya enviada contra ConsultaDeSolicitudes. */
export async function refreshEitvRangeStatus(_state: EitvWsState, formData: FormData): Promise<EitvWsState> {
  const user = await requireCompanyUser();
  const rangeRequestId = str(formData.get("rangeRequestId"));
  if (!rangeRequestId) return { message: "Solicitud no válida." };

  const rangeRequest = await prisma.eitvWsRangeRequest.findFirst({
    where: { id: rangeRequestId, companyId: user.companyId },
  });
  if (!rangeRequest) return { message: "Solicitud no encontrada." };
  if (!rangeRequest.ministryIdSolicitud) {
    return { message: "Esta solicitud todavía no tiene idsolicitud del Ministerio (revisa la respuesta cruda)." };
  }

  try {
    const { login, password } = await credentialsFor(user.companyId, rangeRequest.entorno as Entorno);
    const result = await soapClient.consultaDeSolicitudes({
      companyId: user.companyId,
      actorEmail: user.email,
      entorno: rangeRequest.entorno as Entorno,
      login,
      password,
      idSolicitud: rangeRequest.ministryIdSolicitud,
    });

    if (result.codigo !== null) {
      return { message: `El Ministerio devolvió un error: ${result.mensaje ?? "sin mensaje"}.` };
    }

    await prisma.$transaction([
      prisma.eitvWsRangeAuthorization.deleteMany({ where: { rangeRequestId } }),
      prisma.eitvWsRangeAuthorization.createMany({
        data: result.authorizations.map((a) => ({
          rangeRequestId,
          tipoVehiculo: a.tipoVehiculo,
          contrasena: a.contrasena,
          status: a.status,
          motivoRechazo: a.motivoRechazo,
        })),
      }),
      prisma.eitvWsRangeRequest.update({ where: { id: rangeRequestId }, data: { rawResponseXml: result.rawResponseXml } }),
    ]);

    revalidatePath("/eitv-ws");
    refresh();
    return { message: "Estado actualizado." };
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconocido al consultar el estado." };
  }
}

export type SearchEitvCardsResult = { message: string; cards?: EitvCard[] } | undefined;

/** Consulta de tarjetas ya matriculadas (ConsultaDeTarjetas) — no persiste nada. */
export async function searchEitvCards(_state: SearchEitvCardsResult, formData: FormData): Promise<SearchEitvCardsResult> {
  const user = await requireCompanyUser();
  const entorno = entornoFromForm(formData);

  try {
    const { config, login, password } = await credentialsFor(user.companyId, entorno);
    if (!config.fabricanteTipoDoc || !config.fabricanteDoc) {
      return { message: "Falta el tipo/número de documento del fabricante en la configuración." };
    }

    const result = await soapClient.consultaDeTarjetas({
      companyId: user.companyId,
      actorEmail: user.email,
      entorno,
      login,
      password,
      filtros: {
        tipoDocFabricante: config.fabricanteTipoDoc,
        docFabricante: config.fabricanteDoc,
        marca: str(formData.get("marca")) ?? undefined,
        contrasena: str(formData.get("contrasena")) ?? undefined,
        fechaInicio: str(formData.get("fechaInicio")) ?? undefined,
        fechaFin: str(formData.get("fechaFin")) ?? undefined,
        numSerieIndustria: str(formData.get("numSerieIndustria")) ?? undefined,
        numVIN: str(formData.get("numVIN")) ?? undefined,
      },
    });

    if (result.codigo !== null) {
      return { message: `El Ministerio devolvió un error: ${result.mensaje ?? "sin mensaje"}.` };
    }
    return { message: `${result.cards.length} tarjeta(s) encontrada(s).`, cards: result.cards };
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconocido al consultar tarjetas." };
  }
}
