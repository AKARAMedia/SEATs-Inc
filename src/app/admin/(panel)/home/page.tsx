import Link from "next/link";
import { and, asc, desc, eq, lte } from "drizzle-orm";
import { HeroTextForm, PinnedNewsForm } from "@/components/admin/home/HomeSettingsForms";
import ScheduledImages from "@/components/admin/home/ScheduledImages";
import { db, ready } from "@/db";
import { homeBanners, homeSlides, posts } from "@/db/schema";
import { adminSettings } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Home page" };

const TABS = [
  { key: "hero", label: "Hero slider", description: "The big photos and text at the top" },
  { key: "banners", label: "Banners", description: "Image banners below the news (recruiting)" },
  { key: "news", label: "News on home", description: "Which news posts appear on the home page" },
] as const;

export default async function HomePageAdmin({ searchParams }: PageProps<"/admin/home">) {
  await requireAdmin("content");
  await ready();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const { values } = await adminSettings();
  const now = new Date();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-[22px] font-semibold">Home page</h1>
          <p className="text-[13px] text-[#888]">Changes appear on the website as soon as they are saved.</p>
        </div>
        <a href="/" target="_blank" className="admin-btn-secondary">
          View home page ↗
        </a>
      </div>

      <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-black/10 px-4 lg:mx-0 lg:px-0" aria-label="Home page sections">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/home/${t.key === "hero" ? "" : `?tab=${t.key}`}`}
            aria-current={t.key === tab.key ? "page" : undefined}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-[14px] font-semibold ${
              t.key === tab.key ? "border-primary text-primary" : "border-transparent text-[#666] hover:text-[#222]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <p className="text-[13px] text-[#888]">{tab.description}</p>

      {tab.key === "hero" && <HeroTab home={values.home} now={now.getTime()} />}
      {tab.key === "banners" && <BannersTab now={now.getTime()} />}
      {tab.key === "news" && <NewsTab home={values.home} now={now} />}
    </div>
  );
}

async function HeroTab({ home, now }: { home: Awaited<ReturnType<typeof adminSettings>>["values"]["home"]; now: number }) {
  const slides = await db.select().from(homeSlides).orderBy(asc(homeSlides.sortOrder), asc(homeSlides.id));
  return (
    <div className="max-w-[960px] space-y-6">
      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold">Slides</h2>
        <ScheduledImages kind="slide" items={slides} now={now} />
      </section>
      <HeroTextForm key={JSON.stringify(home)} value={home} firstSlide={slides.find((s) => s.visible)?.imageUrl} />
    </div>
  );
}

async function BannersTab({ now }: { now: number }) {
  const banners = await db.select().from(homeBanners).orderBy(asc(homeBanners.sortOrder), asc(homeBanners.id));
  return (
    <div className="max-w-[960px]">
      <ScheduledImages kind="banner" items={banners} now={now} />
    </div>
  );
}

async function NewsTab({ home, now }: { home: Awaited<ReturnType<typeof adminSettings>>["values"]["home"]; now: Date }) {
  const rows = await db
    .select({ id: posts.id, title: posts.titleEn, publishedAt: posts.publishedAt })
    .from(posts)
    .where(and(eq(posts.published, true), lte(posts.publishedAt, now)))
    .orderBy(desc(posts.publishedAt));
  const options = rows.map((r) => ({ id: r.id, title: r.title, date: r.publishedAt.toLocaleDateString("en-GB", { timeZone: "Asia/Phnom_Penh", day: "numeric", month: "short", year: "numeric" }) }));
  return <PinnedNewsForm key={home.pinnedPostIds.join()} value={home} posts={options} latest={options.slice(0, 3)} />;
}
