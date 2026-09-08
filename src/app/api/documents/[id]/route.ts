import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { requireCompanyUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { absoluteDocumentPath } from "@/lib/pdf/render";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCompanyUser();

  const doc = await prisma.generatedDocument.findFirst({
    where: { id, dossier: { companyId: user.companyId } },
  });
  if (!doc) return new NextResponse("No encontrado", { status: 404 });

  const buffer = await readFile(absoluteDocumentPath(doc.filePath));
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${doc.filePath.split("/").pop()}"`,
    },
  });
}
