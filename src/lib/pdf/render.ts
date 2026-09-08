import "server-only";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Reemplaza el "Guardar registros como PDF" de FileMaker: renderiza HTML/CSS
 * a PDF con Chromium headless en vez de posicionar casillas a mano con una
 * librería de primitivas (ver sección "Generación de PDF" del documento de
 * diseño). Un único navegador se reutiliza entre llamadas dentro del mismo
 * proceso para no pagar el arranque de Chromium en cada documento.
 */
let browserPromise: ReturnType<typeof chromium.launch> | null = null;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({ args: ["--no-sandbox"] });
  }
  return browserPromise;
}

export async function renderHtmlToPdfBuffer(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle" });
    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return buffer;
  } finally {
    await page.close();
  }
}

const documentsDir = process.env.DOCUMENTS_DIR ?? "/tmp/homologaciones-documents";

/**
 * Guarda el PDF en el volumen persistente, bajo <empresa>/<expediente>/, y
 * devuelve la ruta relativa para guardar en GeneratedDocument.filePath.
 */
export async function saveGeneratedPdf(
  companyId: string,
  dossierId: string,
  fileName: string,
  buffer: Buffer
): Promise<string> {
  const dir = path.join(/* turbopackIgnore: true */ documentsDir, companyId, dossierId);
  await mkdir(dir, { recursive: true });
  const relativePath = path.join(companyId, dossierId, fileName);
  await writeFile(path.join(/* turbopackIgnore: true */ documentsDir, relativePath), buffer);
  return relativePath;
}

export function absoluteDocumentPath(relativePath: string): string {
  return path.join(/* turbopackIgnore: true */ documentsDir, relativePath);
}
