import MediaLibrary from "@/components/admin/media/MediaLibrary";
import { requireAdmin } from "@/lib/auth";
import { listMedia, mediaUsage } from "@/lib/media-library";

export const metadata = { title: "Media library" };

export default async function MediaPage() {
  await requireAdmin("content");
  const [items, usage] = await Promise.all([listMedia(), mediaUsage()]);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[22px] font-semibold">Media library</h1>
        <p className="text-[13px] text-[#888]">All images on the website. Uploaded images can be deleted once nothing uses them.</p>
      </div>
      <MediaLibrary items={items} usage={Object.fromEntries(usage)} />
    </div>
  );
}
