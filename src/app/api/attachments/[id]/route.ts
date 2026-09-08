import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { requireCompanyUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { absoluteUploadedFilePath } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCompanyUser();

  const attachment = await prisma.attachment.findFirst({
    where: { id, folder: { dossier: { companyId: user.companyId } } },
  });
  if (!attachment) return new NextResponse("No encontrado", { status: 404 });

  const buffer = await readFile(absoluteUploadedFilePath(attachment.filePath));
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `inline; filename="${attachment.fileName}"`,
    },
  });
}
