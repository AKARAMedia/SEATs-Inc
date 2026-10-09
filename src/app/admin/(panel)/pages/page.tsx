import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { fmtDateTime } from "@/lib/admin-data";
import { PAGE_KEYS, PAGES } from "@/lib/pages/registry";
import { pageSaveTimes } from "@/lib/pages/store";

export const metadata = { title: "Pages" };

export default async function PagesList() {
  await requireAdmin("content");
  const saved = await pageSaveTimes();
  return (
    <div className="max-w-[960px] space-y-4">
      <div>
        <h1 className="text-[22px] font-semibold">Pages</h1>
        <p className="text-[13px] text-[#888]">Edit the text and images of the company pages in English and Japanese. The design stays the same.</p>
      </div>
      <ul className="admin-card divide-y divide-black/5">
        {PAGE_KEYS.map((k) => {
          const s = saved.get(k);
          return (
            <li key={k}>
              <Link href={`/admin/pages/${k}/`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-[#f7f9fb]">
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-[#222]">{PAGES[k].title}</span>
                  <span className="block text-[13px] text-[#888]">{PAGES[k].description}</span>
                </span>
                <span className="text-[12px] text-[#999]">{s ? `Edited ${fmtDateTime(s.updatedAt)} by ${s.updatedBy}` : "Original content"}</span>
                <span className="text-[13px] font-semibold text-primary">Edit →</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
