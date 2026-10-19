import { loadUpload, uploadKey } from "@/lib/storage";

// Serves admin-uploaded images stored in the database (Cloudflare Workers). In local dev the files
// live in public/uploads/ and are served as static files before this route is reached.
export async function GET(_req: Request, { params }: RouteContext<"/uploads/[...key]">) {
  const key = uploadKey(`/uploads/${(await params).key.join("/")}`);
  const file = key ? await loadUpload(key) : null;
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType,
      // Keys contain a random UUID and are never overwritten, so browsers and Cloudflare's CDN can keep them
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
