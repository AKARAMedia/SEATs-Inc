import { LANGS, isLang } from "@/lib/i18n";
import { listNews } from "@/lib/news";

// Lightweight index of every live post (no bodies), prerendered at build time as a static file.
// The News & Event page loads it for pagination and search, since a static page can't query the database.
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function GET(_req: Request, { params }: RouteContext<"/[lang]/news-index.json">) {
  const { lang } = await params;
  if (!isLang(lang)) return new Response("Not found", { status: 404 });
  const { items } = await listNews(lang, { limit: 5000 });
  // Dates, titles and excerpts are all the cards render; keep each entry as small as possible
  const slim = items.map(({ slug, title, excerpt, imageUrl, publishedAt, category }) => ({ slug, title, excerpt, imageUrl, publishedAt, category }));
  return Response.json(slim);
}
