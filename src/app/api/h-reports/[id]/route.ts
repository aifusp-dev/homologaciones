import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { requireCompanyUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { absoluteUploadedFilePath } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCompanyUser();

  const report = await prisma.hReport.findFirst({
    where: { id, companyId: user.companyId },
  });
  if (!report?.filePath) return new NextResponse("No encontrado", { status: 404 });

  const buffer = await readFile(absoluteUploadedFilePath(report.filePath));
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${report.filePath.split("/").pop()}"`,
    },
  });
}
