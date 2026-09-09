"use server";

import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import { auditedUpsert } from "@/lib/audit";
import { revalidatePath, refresh } from "next/cache";
import { EITV_FIELDS, EITV_REMITENTE_FIELDS } from "@/lib/eitvFields";
import { fiscalHorsepower } from "@/lib/calculations/coc";
import {
  buildDatosNacionalesXml,
  missingDatosNacionalesFields,
  REQUIRED_FIELDS,
  type DatosNacionalesInput,
} from "@/lib/eitv/datosNacionalesXml";
import { buildSolicitudRegistroEntradaXml } from "@/lib/eitv/solicitudEnvelopeXml";
import type { FormState } from "@/lib/definitions";

function str(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

export async function updateEitvNationalData(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string") return { message: "Expediente no válido." };

  const dossier = await prisma.dossier.findFirst({ where: { id: dossierId, companyId: user.companyId } });
  if (!dossier) return { message: "Expediente no encontrado." };

  const data: Record<string, unknown> = {};
  for (const field of [...EITV_REMITENTE_FIELDS, ...EITV_FIELDS]) {
    data[field.name] = str(formData.get(field.name));
  }

  await auditedUpsert({
    delegate: prisma.eitvNationalData,
    dossierId,
    tableName: "eitvNationalData",
    actorEmail: user.email,
    data,
  });

  revalidatePath(`/dossiers/${dossierId}`);
  refresh();
  return { message: "Datos de eITV guardados." };
}

export type EitvMissingField = { label: string; field?: string; tab?: string };

export type EitvGenerateResult =
  | {
      message: string;
      missing: EitvMissingField[];
      datosNacionalesXml?: undefined;
      solicitudXml?: undefined;
    }
  | {
      message: string;
      missing?: undefined;
      datosNacionalesXml: string;
      datosNacionalesFileName: string;
      solicitudXml: string;
      solicitudFileName: string;
    }
  | undefined;

// Mapea cada campo requerido de DatosNacionales (y del sobre) al campo real
// del formulario donde se rellena, para que la UI pueda saltar directo a
// él (ver src/lib/fieldJump.ts) en vez de solo decir "falta X".
const JUMP_TARGETS: Record<string, { field: string; tab: string }> = {
  bastidor: { field: "vin", tab: "coc" },
  clasificacion: { field: "vehicleCategory", tab: "coc" },
  potencfiscal: { field: "displacement", tab: "coc" },
  mma: { field: "maxLadenMassRegistration", tab: "coc" },
  tipodoc: { field: "tipodoc", tab: "eitv" },
  docfabricante: { field: "docfabricante", tab: "eitv" },
  tipotarjeta: { field: "tipotarjeta", tab: "eitv" },
  numcertificado: { field: "numcertificado", tab: "eitv" },
  codprocedencia: { field: "codprocedencia", tab: "eitv" },
  fechafirma: { field: "fechafirma", tab: "eitv" },
  firmante: { field: "firmante", tab: "eitv" },
};

/**
 * Recalcula en vivo (sin guardar nada nuevo) el XML de DatosNacionales +
 * el sobre Solicitud_Registro_Entrada — ver mapeo de campos en el plan
 * "elegant-tickling-gem". No firma ni envía nada a la DGT.
 */
export async function generateEitvXml(_state: EitvGenerateResult, formData: FormData): Promise<EitvGenerateResult> {
  const user = await requireCompanyUser();
  const dossierId = formData.get("dossierId");
  if (typeof dossierId !== "string") return { message: "Expediente no válido.", missing: [] };

  const dossier = await prisma.dossier.findFirst({
    where: { id: dossierId, companyId: user.companyId },
    include: { coc: true, bodywork: true, eitvNationalData: true, company: { select: { taxId: true } } },
  });
  if (!dossier) return { message: "Expediente no encontrado.", missing: [] };

  const coc = dossier.coc;
  const manual = dossier.eitvNationalData;

  const potencfiscal = fiscalHorsepower(coc?.displacement, coc?.cylinderCount);
  const homologacionE9 = coc?.approvalNumber?.trim() ? coc.approvalNumber.trim().toLowerCase().startsWith("e9") : null;

  const merged: DatosNacionalesInput = {
    bastidor: coc?.vin ?? null,
    tipodoc: manual?.tipodoc ?? null,
    tipodocvehicomp: manual?.tipodocvehicomp ?? null,
    docfabricante: manual?.docfabricante ?? null,
    docfabricantevehicomp: manual?.docfabricantevehicomp ?? null,
    tipotarjeta: manual?.tipotarjeta ?? null,
    autorizado: manual?.autorizado ?? null,
    numcertificado: manual?.numcertificado ?? null,
    clasificacion: coc?.vehicleCategory ?? null,
    potencfiscal,
    codprocedencia: manual?.codprocedencia ?? null,
    textobservaciones: manual?.textobservaciones ?? null,
    relopciones: manual?.relopciones ?? null,
    lugarfirma: manual?.lugarfirma ?? null,
    fechafirma: manual?.fechafirma ? manual.fechafirma.replace(/-/g, "") : null,
    firmante: manual?.firmante ?? null,
    sociedadinscrita: manual?.sociedadinscrita ?? null,
    mma: coc?.maxLadenMassRegistration ?? null,
    mmaeje1: coc?.maxLadenMassRegistrationAxle1 ?? null,
    mmaeje2: coc?.maxLadenMassRegistrationAxle2 ?? null,
    mmaeje3: coc?.maxLadenMassRegistrationAxle3 ?? null,
    mmaeje4: manual?.mmaeje4 ?? null,
    volumenbodega: manual?.volumenbodega ?? null,
    cinseguridad: manual?.cinseguridad ?? null,
    marcavb: manual?.marcavb ?? null,
    numhomovehicomp: dossier.bodywork?.completedApprovalNumber ?? null,
    numcertitvvehibase: manual?.numcertitvvehibase ?? null,
    masamarchavb: manual?.masamarchavb ?? null,
    carrocero: dossier.company.taxId ?? null,
  };

  const missingLabels = new Set(missingDatosNacionalesFields(merged));
  const missing: EitvMissingField[] = REQUIRED_FIELDS.filter((f) => missingLabels.has(f.label)).map((f) => ({
    label: f.label,
    ...JUMP_TARGETS[f.key],
  }));

  if (homologacionE9 === null) {
    missing.push({
      label: "Homologación e9 (revisa la contraseña de homologación en COC)",
      field: "approvalNumber",
      tab: "coc",
    });
  }

  if (!manual?.remitenteNombre || !manual?.remitenteApellidos || !manual?.remitenteDocumento) {
    missing.push({ label: "Datos del remitente (nombre, apellidos, documento)", field: "remitenteNombre", tab: "eitv" });
  }

  if (missing.length > 0) {
    return { message: `Faltan ${missing.length} dato(s) por rellenar.`, missing };
  }

  const datosNacionalesXml = buildDatosNacionalesXml(merged);
  const datosNacionalesFileName = `DatosNacionales_${merged.bastidor}.xml`;
  const solicitudXml = buildSolicitudRegistroEntradaXml({
    remitenteNombre: manual!.remitenteNombre!,
    remitenteApellidos: manual!.remitenteApellidos!,
    remitenteDocumento: manual!.remitenteDocumento!,
    bastidor: merged.bastidor!,
    homologacionE9: homologacionE9!,
    datosNacionalesXml,
    datosNacionalesFileName,
  });

  return {
    message: "XML generado (sin firmar).",
    datosNacionalesXml,
    datosNacionalesFileName,
    solicitudXml,
    solicitudFileName: `SolicitudRegistroEntrada_${merged.bastidor}.xml`,
  };
}
