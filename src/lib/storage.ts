import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Mismo volumen persistente que los PDF generados (ver src/lib/pdf/render.ts,
// DOCUMENTS_DIR), bajo su propio subdirectorio para no mezclarse con
// GeneratedDocument. Helper aparte para no arrastrar la dependencia de
// Playwright (que carga render.ts) a un flujo que no genera PDFs.
const documentsDir = process.env.DOCUMENTS_DIR ?? "/tmp/homologaciones-documents";

export async function saveUploadedFile(
  companyId: string,
  subdir: string,
  fileName: string,
  buffer: Buffer
): Promise<string> {
  const dir = path.join(/* turbopackIgnore: true */ documentsDir, subdir, companyId);
  await mkdir(dir, { recursive: true });
  const relativePath = path.join(subdir, companyId, fileName);
  await writeFile(path.join(/* turbopackIgnore: true */ documentsDir, relativePath), buffer);
  return relativePath;
}

export function absoluteUploadedFilePath(relativePath: string): string {
  return path.join(/* turbopackIgnore: true */ documentsDir, relativePath);
}
