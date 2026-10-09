import Link from "next/link";
import { and, count, desc, eq, like } from "drizzle-orm";
import Pagination from "@/components/admin/ui/Pagination";
import { db, ready } from "@/db";
import { activityLog } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { fmtDateTime } from "@/lib/admin-data";
import { keyToSlug } from "@/lib/translation/text";

export const metadata = { title: "Activity log" };

const ACTIONS: Record<string, string> = {
  "post.create": "created the post",
  "post.update": "edited the post",
  "post.translate": "edited the Japanese of",
  "post.publish": "published",
  "post.unpublish": "moved to drafts",
  "post.delete": "deleted the post",
  "post.restore": "restored an earlier version of",
  "translation.publish": "published the Japanese of",
  "settings.update": "changed settings:",
  "settings.restore": "restored earlier settings:",
  "message.delete": "deleted",
  "glossary.create": "added a glossary term:",
  "glossary.update": "edited a glossary term:",
  "glossary.delete": "deleted a glossary term:",
  "user.create": "added the user",
  "user.update": "changed the user",
  "user.delete": "deleted the user",
  "user.login": "signed in",
  "user.password": "changed their password",
};

const AREAS = [
  { key: "", label: "Everything" },
  { key: "post", label: "News posts" },
  { key: "translation", label: "Translation" },
  { key: "settings", label: "Settings" },
  { key: "message", label: "Messages" },
  { key: "glossary", label: "Glossary" },
  { key: "user", label: "Users & sign-ins" },
];

function targetHref(type: string, id: string, action: string) {
  if (!id || action.endsWith(".delete")) return null;
  if (type === "post") return action === "translation.publish" ? `/admin/translate/${keyToSlug(id)}/` : `/admin/posts/${id}/`;
  if (action === "translation.publish") return `/admin/translate/${keyToSlug(id)}/`;
  if (type === "settings") return `/admin/settings/?tab=${id}`;
  if (type === "user") return `/admin/users/${id}/`;
  return null;
}

export default async function ActivityPage({ searchParams }: PageProps<"/admin/activity">) {
  await requireAdmin("activity");
  await ready();
  const sp = await searchParams;
  const area = AREAS.find((a) => a.key === sp.area)?.key ?? "";
  const user = typeof sp.user === "string" ? sp.user : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const size = 50;
  const where = and(area ? like(activityLog.action, `${area}.%`) : undefined, user ? eq(activityLog.userName, user) : undefined);
  const [rows, [{ total }], users] = await Promise.all([
    db.select().from(activityLog).where(where).orderBy(desc(activityLog.createdAt), desc(activityLog.id)).limit(size).offset((page - 1) * size),
    db.select({ total: count() }).from(activityLog).where(where),
    db.selectDistinct({ name: activityLog.userName }).from(activityLog),
  ]);
  const pages = Math.max(1, Math.ceil(total / size));
  const href = (patch: Record<string, string | number>) => {
    const p = new URLSearchParams({ ...(area && { area }), ...(user && { user }), ...Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, String(v)])) });
    for (const [k, v] of [...p]) if (!v || (k === "page" && v === "1")) p.delete(k);
    return `/admin/activity/${p.size ? `?${p}` : ""}`;
  };

  // Group entries by day for easier scanning
  const day = (d: Date) => d.toLocaleDateString("en-GB", { timeZone: "Asia/Phnom_Penh", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const groups: { day: string; rows: typeof rows }[] = [];
  for (const r of rows) {
    const d = day(r.createdAt);
    if (groups.at(-1)?.day !== d) groups.push({ day: d, rows: [] });
    groups.at(-1)!.rows.push(r);
  }

  return (
    <div className="max-w-[960px] space-y-4">
      <div>
        <h1 className="text-[22px] font-semibold">Activity log</h1>
        <p className="text-[13px] text-[#888]">Who changed what, and when. To undo a change to a post or a settings page, open its History.</p>
      </div>

      <form className="flex flex-wrap gap-2">
        <select name="area" defaultValue={area} className="admin-input !w-auto" aria-label="Area">
          {AREAS.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label}
            </option>
          ))}
        </select>
        <select name="user" defaultValue={user} className="admin-input !w-auto" aria-label="Person">
          <option value="">Everyone</option>
          {users.map((u) => (
            <option key={u.name} value={u.name}>
              {u.name}
            </option>
          ))}
        </select>
        <button className="admin-btn-secondary">Filter</button>
        {(area || user) && (
          <Link href="/admin/activity/" className="self-center text-[13px] text-primary hover:underline">
            Clear
          </Link>
        )}
      </form>

      {groups.length ? (
        groups.map((g) => (
          <section key={g.day} className="admin-card">
            <h2 className="border-b border-black/10 px-4 py-2 text-[13px] font-semibold text-[#666]">{g.day}</h2>
            <ul className="divide-y divide-black/5">
              {g.rows.map((r) => {
                const link = targetHref(r.targetType, r.targetId, r.action);
                return (
                  <li key={r.id} className="flex gap-3 px-4 py-2.5 text-[14px]">
                    <time className="w-12 shrink-0 pt-0.5 text-[12px] tabular-nums text-[#999]">
                      {r.createdAt.toLocaleTimeString("en-GB", { timeZone: "Asia/Phnom_Penh", hour: "2-digit", minute: "2-digit" })}
                    </time>
                    <p className="min-w-0 flex-1">
                      <strong className="font-semibold text-[#222]">{r.userName}</strong> <span className="text-[#555]">{ACTIONS[r.action] ?? r.action}</span>{" "}
                      {r.summary &&
                        (link ? (
                          <Link href={link} className="text-primary hover:underline">
                            {r.summary}
                          </Link>
                        ) : (
                          <span className="text-[#333]">{r.summary}</span>
                        ))}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      ) : (
        <p className="admin-card p-10 text-center text-[#888]">No activity recorded{area || user ? " for this filter" : " yet"}.</p>
      )}

      <Pagination page={page} pages={pages} href={(n) => href({ page: n })} />
      <p className="text-[12px] text-[#999]">Showing times in Cambodia time. Total entries: {total.toLocaleString()} · Last refreshed {fmtDateTime(new Date())}.</p>
    </div>
  );
}
