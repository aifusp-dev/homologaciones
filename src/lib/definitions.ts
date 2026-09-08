import { z } from "zod";

export type FormState =
  | { message?: string; errors?: Record<string, string[]> }
  | undefined;

export const CreateCompanySchema = z.object({
  companyName: z.string().trim().min(2, "Nombre demasiado corto."),
  ownerEmail: z.string().trim().email("Email no válido."),
});

export const InviteTeammateSchema = z.object({
  email: z.string().trim().email("Email no válido."),
  role: z.enum(["COMPANY_ADMIN", "OPERATOR"]),
});
