"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCompanyUser } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";

function textOrNull(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export async function createSavedCustomer(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const name = textOrNull(formData.get("name"));
  if (!name) return { message: "Falta el nombre del cliente." };

  await prisma.savedCustomer.create({
    data: {
      companyId: user.companyId,
      name,
      phone: textOrNull(formData.get("phone")),
      email: textOrNull(formData.get("email")),
      contactName: textOrNull(formData.get("contactName")),
      contactPhone: textOrNull(formData.get("contactPhone")),
      notes: textOrNull(formData.get("notes")),
    },
  });

  revalidatePath("/customers");
  refresh();
  return { message: "Cliente guardado en el catálogo." };
}

export async function deleteSavedCustomer(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  const id = formData.get("id");
  if (typeof id !== "string") return { message: "Cliente no válido." };

  const saved = await prisma.savedCustomer.findFirst({ where: { id, companyId: user.companyId } });
  if (!saved) return { message: "Cliente no encontrado." };

  await prisma.savedCustomer.delete({ where: { id } });

  revalidatePath("/customers");
  refresh();
  return { message: "Cliente eliminado del catálogo." };
}
