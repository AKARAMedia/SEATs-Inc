import { asc } from "drizzle-orm";
import BrandsManager from "@/components/admin/home/BrandsManager";
import { db, ready } from "@/db";
import { brands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Brands" };

export default async function BrandsPage() {
  await requireAdmin("content");
  await ready();
  const list = await db.select().from(brands).orderBy(asc(brands.sortOrder), asc(brands.id));
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[22px] font-semibold">Brands</h1>
        <p className="text-[13px] text-[#888]">The “Our Brand” logos on the home page. Drag ⋮⋮ to change the order.</p>
      </div>
      <BrandsManager list={list} />
    </div>
  );
}
