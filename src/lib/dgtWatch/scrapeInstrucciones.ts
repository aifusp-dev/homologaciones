import "server-only";
import * as cheerio from "cheerio";

// Scraper de las "Instrucciones VEH" de la DGT (normativa de homologación de
// vehículos) — la propia DGT no ofrece API ni RSS para esto (investigado en
// la sesión que dio origen a este módulo), solo un listado HTML paginado.
// Riesgo aceptado: si la DGT cambia el diseño de la página, esto deja de
// funcionar hasta que se actualicen los selectores.
//
// Solo se lee la primera página del listado (las instrucciones más
// recientes salen primero) — para vigilancia periódica es suficiente, no
// hace falta recorrer las 17 páginas cada vez.

const SOURCE_URL =
  "https://www.dgt.es/muevete-con-seguridad/conoce-las-normas-de-trafico/todas-las-normas/index.html?category=instrucciones";
const BASE_URL = "https://www.dgt.es";
const RELEVANT_CATEGORY = "Vehículos";

const SPANISH_MONTHS: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

function parseSpanishDate(text: string): Date | null {
  const match = text.trim().match(/^(\d{1,2})\s+([a-záéíóúñ]+)\s+(\d{4})$/i);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = SPANISH_MONTHS[monthName.toLowerCase()];
  if (month === undefined) return null;
  return new Date(Number(year), month, Number(day));
}

export type ScrapedInstruccion = {
  externalId: string;
  title: string;
  category: string;
  status: string | null;
  publishedAt: Date | null;
  summary: string | null;
  documents: { label: string; url: string }[];
};

export async function scrapeInstrucciones(): Promise<ScrapedInstruccion[]> {
  const res = await fetch(SOURCE_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; WorkshopManagementBot/1.0)" },
  });
  if (!res.ok) throw new Error(`DGT respondió ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const results: ScrapedInstruccion[] = [];

  $(".card.normatrafico[data-elem]").each((_, el) => {
    try {
      const card = $(el);
      const externalId = card.attr("data-elem");
      if (!externalId) return;

      const category = card.find(".card-title-container p.card-text.text-primary").first().text().trim();
      if (category !== RELEVANT_CATEGORY) return;

      const title = card.find("p.card-title").first().text().trim();
      if (!title) return;

      const status = card.find(".tags small.card-text.text-muted.active").first().text().trim() || null;
      const dateText = card.find("p.card-text.text-muted").first().text().trim();
      const publishedAt = dateText ? parseSpanishDate(dateText) : null;

      const summary = card.find("p.card-text").not(".text-muted").first().text().trim() || null;

      const documents: { label: string; url: string }[] = [];
      card.find("ul.resources li").each((__, li) => {
        const a = $(li).find("a[download]").first();
        const href = a.attr("href");
        if (!href) return;
        const label = $(li).find("p").first().text().trim();
        documents.push({ label: label || title, url: href.startsWith("http") ? href : `${BASE_URL}${href}` });
      });

      results.push({ externalId, title, category, status, publishedAt, summary, documents });
    } catch {
      // Un card mal formado no debe tirar abajo todo el sondeo.
    }
  });

  return results;
}
