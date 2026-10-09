import Link from "next/link";
import { asc } from "drizzle-orm";
import GlossaryEditor from "@/components/admin/translate/GlossaryEditor";
import { db, ready } from "@/db";
import { glossary } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Glossary" };

export default async function GlossaryPage() {
  await requireAdmin("translate");
  await ready();
  const terms = await db.select({ id: glossary.id, termEn: glossary.termEn, termJa: glossary.termJa, note: glossary.note }).from(glossary).orderBy(asc(glossary.termEn));
  return (
    <div className="max-w-[960px] space-y-4">
      <div>
        <Link href="/admin/translate/" className="text-[13px] text-[#888] hover:text-primary">
          ← Translation Center
        </Link>
        <h1 className="text-[22px] font-semibold">Glossary</h1>
        <p className="text-[13px] text-[#888]">
          Fixed translations for names and key terms. They are shown next to each paragraph that uses them, and you are warned when a translation leaves one out.
        </p>
      </div>
      <GlossaryEditor terms={terms} />
    </div>
  );
}
