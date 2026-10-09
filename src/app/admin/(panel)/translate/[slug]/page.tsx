import { notFound } from "next/navigation";
import TranslationWorkspace from "@/components/admin/translate/TranslationWorkspace";
import { requireAdmin } from "@/lib/auth";
import { loadWorkspace } from "@/lib/translation/center";
import { slugToKey } from "@/lib/translation/text";

export const metadata = { title: "Translate" };

export default async function TranslateItemPage({ params }: PageProps<"/admin/translate/[slug]">) {
  await requireAdmin("translate");
  const { slug } = await params;
  const ws = await loadWorkspace(slugToKey(slug));
  if (!ws) notFound();
  return <TranslationWorkspace key={`${ws.key}|${ws.updatedAt.toISOString()}|${ws.publishedAt?.toISOString()}`} ws={ws} />;
}
