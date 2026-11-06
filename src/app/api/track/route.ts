import { isBot, recordPageView } from "@/lib/stats";
import { TRACK_SAMPLE_RATE } from "@/lib/track-sample";

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  // Crawlers and scanners are never counted: skip the body parse and everything after it
  if (isBot(ua)) return new Response(null, { status: 204 });
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "").trim();
  let path: unknown;
  let w: unknown;
  try {
    ({ path, w } = await req.json());
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof path !== "string") return new Response(null, { status: 400 });
  // Sampled beacons stand for TRACK_SAMPLE_RATE visits; anything else (e.g. a tab still running the
  // old, unsampled script after a deploy) counts once
  const weight = w === TRACK_SAMPLE_RATE ? TRACK_SAMPLE_RATE : 1;
  await recordPageView({ path, ip, ua, weight }).catch((e) => console.error("[track]", e));
  return new Response(null, { status: 204 });
}
