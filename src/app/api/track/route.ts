import { recordPageView } from "@/lib/stats";

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "").trim();
  let path: unknown;
  try {
    ({ path } = await req.json());
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof path !== "string") return new Response(null, { status: 400 });
  await recordPageView({ path, ip, ua }).catch((e) => console.error("[track]", e));
  return new Response(null, { status: 204 });
}
