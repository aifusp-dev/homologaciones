"use server";

import { revalidatePath, refresh } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole, requireCompanyUser } from "@/lib/dal";
import { CreateCompanySchema, InviteTeammateSchema } from "@/lib/definitions";
import type { FormState } from "@/lib/definitions";

/**
 * Solo super_admin. Crea la empresa y deja una invitación pendiente para su
 * primer "dueño" (company_admin) — no hay alta self-service, esta es la
 * única puerta de entrada para una empresa nueva.
 */
export async function createCompany(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("SUPER_ADMIN");

  const validated = CreateCompanySchema.safeParse({
    companyName: formData.get("companyName"),
    ownerEmail: formData.get("ownerEmail"),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { companyName, ownerEmail } = validated.data;
  const email = ownerEmail.toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { message: "Ya existe una cuenta con ese email." };
  }

  await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({ data: { name: companyName } });
    await tx.invitation.create({
      data: { companyId: company.id, email, role: "COMPANY_ADMIN" },
    });
  });

  // revalidatePath solo invalida cache para próximas navegaciones; refresh()
  // es lo que realmente vuelve a renderizar esta misma página ya cargada
  // (Next 16 con Cache Components separa ambas cosas, a diferencia de
  // versiones anteriores donde revalidatePath ya refrescaba la actual).
  revalidatePath("/super-admin");
  refresh();
  return { message: `Empresa "${companyName}" creada. Invitación enviada a ${email}.` };
}

/**
 * Cualquier company_admin puede invitar a más gente de su propio taller,
 * como operario o como otro company_admin (no hay un único "dueño").
 */
export async function inviteTeammate(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCompanyUser();
  if (user.role !== "COMPANY_ADMIN") {
    return { message: "Solo un administrador de la empresa puede invitar." };
  }

  const validated = InviteTeammateSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email: rawEmail, role } = validated.data;
  const email = rawEmail.toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { message: "Ya existe una cuenta con ese email." };
  }

  await prisma.invitation.upsert({
    where: { companyId_email: { companyId: user.companyId, email } },
    update: { role, consumedAt: null },
    create: { companyId: user.companyId, email, role },
  });

  revalidatePath("/dashboard");
  refresh();
  return { message: `Invitación enviada a ${email}.` };
}
