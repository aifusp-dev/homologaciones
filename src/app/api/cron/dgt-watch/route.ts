import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapeInstrucciones } from "@/lib/dgtWatch/scrapeInstrucciones";
import type { Prisma } from "@/generated/prisma/client";

// Disparado periódicamente por un timer systemd en el host (fuera de este
// repo, mismo patrón que coolify-autodeploy.timer) — sin webhook público,
// solo un secreto compartido en el header Authorization.
export async function GET(req: Request) {
  const secret = process.env.DGT_WATCH_CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "DGT_WATCH_CRON_SECRET no configurado" }, { status: 500 });

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const items = await scrapeInstrucciones();

  let created = 0;
  for (const item of items) {
    const existing = await prisma.regulatoryUpdate.findUnique({ where: { externalId: item.externalId } });
    await prisma.regulatoryUpdate.upsert({
      where: { externalId: item.externalId },
      update: {
        title: item.title,
        category: item.category,
        status: item.status,
        publishedAt: item.publishedAt,
        summary: item.summary,
        documents: item.documents as unknown as Prisma.InputJsonValue,
      },
      create: {
        externalId: item.externalId,
        title: item.title,
        category: item.category,
        status: item.status,
        publishedAt: item.publishedAt,
        summary: item.summary,
        documents: item.documents as unknown as Prisma.InputJsonValue,
      },
    });
    if (!existing) created++;
  }

  return NextResponse.json({ scanned: items.length, created });
}
