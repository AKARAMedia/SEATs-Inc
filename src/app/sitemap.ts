import type { MetadataRoute } from "next";
import { listNews } from "@/lib/news";
import { listOpenJobs } from "@/lib/careers";

const STATIC_PATHS = [
  "/", "/overview/", "/history/", "/philosophy-our-value/", "/ceo-message/",
  "/loka-japanese-foods-beverage/", "/nova-marketing/", "/pisa-food-retail/",
  "/news-event/", "/contact/", "/option-career/",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.SITE_URL ?? "https://seats-inc.com";
  const [{ items }, jobs] = await Promise.all([listNews("en", { limit: 1000 }), listOpenJobs("en")]);
  const entry = (path: string, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: site + path,
    lastModified,
    alternates: { languages: { en: site + path, ja: `${site}/ja${path}` } },
  });
  return [
    ...STATIC_PATHS.map((p) => entry(p)),
    ...items.map((i) => entry(`/${i.slug}/`, i.publishedAt)),
    ...jobs.map((j) => entry(`/careers/${j.slug}/`)),
  ];
}
