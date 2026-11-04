import { revalidatePath } from "next/cache";

// One-off ops utility: force-drops a specific path from the Workers-level cache. Needed because a page
// whose post was deleted/unpublished before src/lib/rebuild.ts called revalidatePath() for it can keep
// serving its last cached render indefinitely (Cache-Control: s-maxage=31536000).
export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) return new Response("Unauthorized", { status: 401 });
  const { path } = (await request.json()) as { path?: string };
  if (!path) return Response.json({ error: "path is required" }, { status: 400 });
  revalidatePath(path);
  return Response.json({ ok: true, path });
}
