import Link from "next/link";
import ViewsChart from "@/components/admin/ViewsChart";
import { Icon, type IconName } from "@/components/admin/ui/icons";
import { adminDashboard } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { messageCompany, shortDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import { dailyStats, topPages } from "@/lib/stats";

export const metadata = { title: "Dashboard" };

const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/overview/": "Overview",
  "/history/": "History",
  "/philosophy-our-value/": "Philosophy & Our Value",
  "/ceo-message/": "CEO Message",
  "/news-event/": "News & Events (list)",
  "/contact/": "Contact",
  "/option-career/": "Recruit",
  "/nova-marketing/": "NOVA Marketing",
  "/pisa-food-retail/": "PISA Food Retail",
  "/loka-japanese-foods-beverage/": "LOKA Japanese Foods & Beverage",
};

function greeting() {
  const h = Number(new Date().toLocaleString("en-GB", { timeZone: "Asia/Phnom_Penh", hour: "2-digit", hour12: false }));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Stat({ label, value, hint, href, icon, tone = "default" }: { label: string; value: number | string; hint?: string; href?: string; icon: IconName; tone?: "default" | "alert" }) {
  const body = (
    <>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone === "alert" ? "bg-red-50 text-red-600" : "bg-primary/10 text-primary"}`}>
        <Icon name={icon} className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] text-[#777]">{label}</span>
        <span className="block text-[24px] font-semibold leading-tight text-[#222]">{value}</span>
        {hint && <span className="block truncate text-[12px] text-[#999]">{hint}</span>}
      </span>
    </>
  );
  const cls = "admin-card flex items-center gap-3 p-4";
  return href ? (
    <Link href={href} className={`${cls} hover:ring-primary/30`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function RankList({ items, empty }: { items: { key: string; label: string; views: number; href?: string }[]; empty: string }) {
  if (!items.length) return <p className="py-6 text-center text-[13px] text-[#999]">{empty}</p>;
  const max = Math.max(...items.map((i) => i.views));
  return (
    <ol className="space-y-1.5">
      {items.map((i) => (
        <li key={i.key} className="relative flex items-center gap-3 overflow-hidden rounded-md px-2.5 py-1.5 text-[13px]">
          <span className="absolute inset-y-0 left-0 rounded-md bg-primary/[0.08]" style={{ width: `${(i.views / max) * 100}%` }} aria-hidden />
          {i.href ? (
            <Link href={i.href} className="relative min-w-0 flex-1 truncate text-[#333] hover:text-primary">
              {i.label}
            </Link>
          ) : (
            <span className="relative min-w-0 flex-1 truncate text-[#333]">{i.label}</span>
          )}
          <span className="relative font-semibold tabular-nums text-[#555]">{i.views.toLocaleString()}</span>
        </li>
      ))}
    </ol>
  );
}

export default async function DashboardPage() {
  const session = await requireAdmin();
  const [d, days, top] = await Promise.all([adminDashboard(), dailyStats(30), topPages(30, 6)]);
  const showMessages = can(session.role, "messages");
  const canEdit = can(session.role, "editPosts");
  const views30 = days.reduce((s, x) => s + x.views, 0);
  const visitors30 = days.reduce((s, x) => s + x.visitors, 0);
  const today = days[days.length - 1];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-[22px] font-semibold">
            {greeting()}
            {session.name && `, ${session.name}`}
          </h1>
          <p className="text-[13px] text-[#888]">
            {new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Phnom_Penh", dateStyle: "full" })} · Here&apos;s what&apos;s happening on the website.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link href="/admin/posts/new/" className="admin-btn">
              <Icon name="plus" className="size-4" /> New post
            </Link>
          )}
          <a href="/" target="_blank" className="admin-btn-secondary">
            <Icon name="external" className="size-4" /> View site
          </a>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon="eye" label="Visitors · last 30 days" value={visitors30.toLocaleString()} hint={`${today.visitors} today`} />
        <Stat icon="dashboard" label="Page views · last 30 days" value={views30.toLocaleString()} hint={`${today.views} today`} />
        {showMessages ? (
          <Stat
            icon="mail"
            label="Unread messages"
            value={d.unread}
            hint={d.unread ? "Click to read" : "All caught up"}
            href={d.unread ? "/admin/messages/?view=unread" : "/admin/messages/"}
            tone={d.unread ? "alert" : "default"}
          />
        ) : (
          <Stat icon="news" label="Published posts" value={d.published} href="/admin/posts/" />
        )}
        <Stat
          icon="news"
          label="Missing Japanese"
          value={d.missingJa}
          hint={`${d.published} published · ${d.drafts} draft${d.drafts === 1 ? "" : "s"}`}
          href="/admin/posts/?status=missingja"
          tone={d.missingJa ? "alert" : "default"}
        />
      </div>

      <section className="admin-card p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-semibold">Page views · last 30 days</h2>
          <p className="text-[12px] text-[#999]">Counted without cookies. Bots are excluded.</p>
        </div>
        <ViewsChart data={days} />
      </section>

      <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
        <section className="admin-card p-5">
          <h2 className="mb-3 text-[15px] font-semibold">Top pages</h2>
          <RankList
            empty="No visits recorded yet."
            items={top.pages.map((p) => ({ key: p.key, label: PAGE_NAMES[p.key] ?? p.key, views: p.views }))}
          />
        </section>
        <section className="admin-card p-5">
          <h2 className="mb-3 text-[15px] font-semibold">Top news posts</h2>
          <RankList
            empty="No news posts viewed yet."
            items={top.posts.map((p) => ({ key: p.key, label: p.post?.titleEn ?? p.key, views: p.views, href: p.post ? `/admin/posts/${p.post.id}/` : undefined }))}
          />
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
        {showMessages && (
          <section className="admin-card">
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
              <h2 className="text-[15px] font-semibold">Latest messages</h2>
              <Link href="/admin/messages/" className="text-[13px] text-primary hover:underline">
                Open inbox →
              </Link>
            </div>
            {d.recentMessages.length ? (
              <ul className="divide-y divide-black/5">
                {d.recentMessages.map((m) => (
                  <li key={m.id}>
                    <Link href={`/admin/messages/${m.id}/`} prefetch={false} className="flex items-start gap-3 px-5 py-3 hover:bg-[#f7f9fb]">
                      <span className={`mt-2 size-2 shrink-0 rounded-full ${m.readAt ? "" : "bg-primary"}`} />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[14px] ${m.readAt ? "text-[#444]" : "font-bold text-[#111]"}`}>
                          {m.name}
                          {messageCompany(m.subject) && <span className="font-normal text-[#999]"> · {messageCompany(m.subject)}</span>}
                        </span>
                        <span className="block truncate text-[13px] text-[#777]">{m.message}</span>
                      </span>
                      <time className="shrink-0 text-[12px] text-[#999]">{shortDate(m.createdAt)}</time>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-8 text-center text-[13px] text-[#999]">No messages yet.</p>
            )}
          </section>
        )}

        <section className="admin-card">
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
            <h2 className="text-[15px] font-semibold">Recently edited posts</h2>
            <Link href="/admin/posts/" className="text-[13px] text-primary hover:underline">
              All posts →
            </Link>
          </div>
          <ul className="divide-y divide-black/5">
            {d.recentPosts.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/posts/${p.id}/`} prefetch={false} className="flex items-center gap-3 px-5 py-3 hover:bg-[#f7f9fb]">
                  <span className="min-w-0 flex-1 truncate text-[14px] text-[#333]">{p.titleEn}</span>
                  <span className={`admin-badge ${p.published ? "bg-primary/10 text-primary" : "bg-black/5 text-[#777]"}`}>{p.published ? "Published" : "Draft"}</span>
                  <time className="w-[70px] shrink-0 text-right text-[12px] text-[#999]">{shortDate(p.updatedAt)}</time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
