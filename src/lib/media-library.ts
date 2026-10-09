import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { brands, homeBanners, homeSlides, media, posts, siteSettings } from "@/db/schema";
import SITE_MEDIA from "@/content/site-media.json";

export type MediaItem = {
  id: number | null; // null = image shipped with the website (public/media), read-only
  url: string;
  filename: string;
  width: number;
  height: number;
  size: number;
  alt: string;
  uploadedBy: string;
  createdAt: string | null;
  source: "upload" | "site";
};

export type MediaUse = { label: string; href: string };

const siteItems: MediaItem[] = (SITE_MEDIA as { url: string; width: number; height: number; size: number }[])
  // Skip icons (flags etc.)
  .filter((m) => m.width >= 40 && m.height >= 40)
  .map((m) => ({ id: null, url: m.url, filename: m.url.split("/").pop() ?? m.url, width: m.width, height: m.height, size: m.size, alt: "", uploadedBy: "", createdAt: null, source: "site" }));

export async function listMedia(): Promise<MediaItem[]> {
  await ready();
  const rows = await db.select().from(media).orderBy(desc(media.createdAt));
  const uploads: MediaItem[] = rows.map((r) => ({
    id: r.id,
    url: r.url,
    filename: r.filename,
    width: r.width,
    height: r.height,
    size: r.size,
    alt: r.alt,
    uploadedBy: r.uploadedBy,
    createdAt: r.createdAt.toISOString(),
    source: "upload",
  }));
  return [...uploads, ...siteItems];
}

export async function getMediaByUrl(url: string) {
  const [row] = await db.select().from(media).where(eq(media.url, url));
  return row ?? null;
}

/** Everywhere an image URL is used, so in-use images can't be deleted. Keyed by URL. */
export async function mediaUsage(): Promise<Map<string, MediaUse[]>> {
  await ready();
  const [postRows, brandRows, slideRows, bannerRows, settingRows] = await Promise.all([
    db.select({ id: posts.id, title: posts.titleEn, imageUrl: posts.imageUrl, bodyEn: posts.bodyEn, bodyJa: posts.bodyJa }).from(posts),
    db.select({ name: brands.name, url: brands.logoUrl }).from(brands),
    db.select({ url: homeSlides.imageUrl }).from(homeSlides),
    db.select({ url: homeBanners.imageUrl }).from(homeBanners),
    db.select().from(siteSettings),
  ]);
  const uses = new Map<string, MediaUse[]>();
  const add = (url: string | null | undefined, use: MediaUse) => {
    if (!url) return;
    const list = uses.get(url) ?? [];
    if (!list.some((u) => u.label === use.label)) list.push(use);
    uses.set(url, list);
  };
  const imgSrc = /<img[^>]+src="([^"]+)"/g;
  for (const p of postRows) {
    const use = { label: `News: ${p.title}`, href: `/admin/posts/${p.id}/` };
    add(p.imageUrl, use);
    for (const m of `${p.bodyEn}${p.bodyJa}`.matchAll(imgSrc)) add(m[1], use);
  }
  for (const b of brandRows) add(b.url, { label: `Brand: ${b.name}`, href: "/admin/brands/" });
  for (const s of slideRows) add(s.url, { label: "Home page: hero slider", href: "/admin/home/" });
  for (const b of bannerRows) add(b.url, { label: "Home page: banner", href: "/admin/home/?tab=banners" });
  for (const s of settingRows) {
    const json = JSON.stringify(s.value);
    for (const m of json.matchAll(/"(\/(?:media|uploads)\/[^"]+|https:\/\/[^"]+\.blob\.vercel-storage\.com\/[^"]+)"/g)) {
      add(m[1], { label: s.key === "home" ? "Home page settings" : `Settings: ${s.key}`, href: s.key === "home" ? "/admin/home/" : `/admin/settings/?tab=${s.key}` });
    }
  }
  return uses;
}
