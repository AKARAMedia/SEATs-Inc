import type { MetadataRoute } from "next";
import { listNews } from "@/lib/news";

const STATIC_PATHS = [
  "/", "/overview/", "/history/", "/philosophy-our-value/", "/ceo-message/",
  "/loka-japanese-foods-beverage/", "/nova-marketing/", "/pisa-food-retail/",
  "/news-event/", "/contact/", "/option-career/",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.SITE_URL ?? "https://seats-inc.com";
  const { items } = await listNews("en", { limit: 1000 });
  const entry = (path: string, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: site + path,
    lastModified,
    alternates: { languages: { en: site + path, ja: `${site}/ja${path}` } },
  });
  return [
    ...STATIC_PATHS.map((p) => entry(p)),
    ...items.map((i) => entry(`/${i.slug}/`, i.publishedAt)),
  ];
}
