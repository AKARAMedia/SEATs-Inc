import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE, sessionKey } from "@/lib/session-key";
import { LANG_COOKIE } from "@/lib/i18n";
import LEGACY_SLUGS from "@/content/legacy-redirects.json";

const legacy: Record<string, string> = LEGACY_SLUGS;

// Deliberately middleware.ts (Edge runtime) rather than Next 16's proxy.ts (Node.js runtime only):
// the Node bundle adds ~2 MB to the Cloudflare Worker, which must stay under the size limit.

// One URL per page for both languages: /overview/ is English or Japanese depending on the visitor's
// language cookie (set by the language switcher, ?lang=ja|en). Internally the page is rendered from
//   /en/overview  or  /ja/overview
// Old /ja/... and /en/... links redirect to the clean URL and set the cookie.
// Automated vulnerability/exploit scanners constantly probe WordPress-style paths that don't
// exist on this Next.js site. Without this, each one still falls through to the full [lang]
// layout render (DB settings lookup, fonts, etc.) at real CPU cost — observed ~500ms+ CPU per
// hit in Workers logs. Bail out with a bare 404 before any of that runs.
const BOT_PROBE = /\.(php|asp|aspx|jsp|cgi|env)$|^\/(wp-admin|wp-content|wp-includes|wp-login|xmlrpc\.php|cgi-bin)(\/|$)/i;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BOT_PROBE.test(pathname)) return new NextResponse("Not found", { status: 404 });

  if (pathname.startsWith("/admin")) {
    if (pathname.replace(/\/$/, "") === "/admin/login") return NextResponse.next();
    // Optimistic check only; every admin page/action re-verifies the session.
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const ok = token && (await jwtVerify(token, sessionKey()).then(() => true, () => false));
    if (!ok) return NextResponse.redirect(new URL("/admin/login/", req.url));
    return NextResponse.next();
  }

  // Language switcher: ?lang=ja|en saves the choice and returns to the same page without the parameter
  const asked = req.nextUrl.searchParams.get("lang");
  if (asked === "ja" || asked === "en") {
    const url = req.nextUrl.clone();
    url.searchParams.delete("lang");
    return withLang(NextResponse.redirect(url, 307), asked);
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return withLang(NextResponse.redirect(url, 307), "en");
  }

  // Old WordPress permalinks that used Japanese slugs -> new ASCII slugs
  const m = safeDecode(pathname).match(/^(\/ja)?\/([^/]+)\/?$/);
  if (m && legacy[m[2]]) {
    const url = req.nextUrl.clone();
    url.pathname = `${m[1] ?? ""}/${legacy[m[2]]}/`;
    return NextResponse.redirect(url, 301);
  }

  // Standalone static JP recruiting site (mirrored as-is from the old server into public/jp/)
  if (pathname === "/ja/jp" || pathname === "/ja/jp/") {
    return NextResponse.redirect(new URL("/jp/", req.url), 301); // same as live
  }
  if (pathname === "/jp" || pathname === "/jp/") {
    const url = req.nextUrl.clone();
    url.pathname = "/jp/index.html";
    return NextResponse.rewrite(url);
  }
  if (pathname === "/jp/thanks" || pathname === "/jp/thanks/") {
    const url = req.nextUrl.clone();
    url.pathname = "/jp/thanks/index.html";
    return NextResponse.rewrite(url);
  }

  // Old Japanese URLs (/ja/overview/): same page at the clean URL, language remembered in the cookie
  if (pathname === "/ja" || pathname.startsWith("/ja/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return withLang(NextResponse.redirect(url, 307), "ja");
  }

  const lang = req.cookies.get(LANG_COOKIE)?.value === "ja" ? "ja" : "en";
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname}`;
  const res = NextResponse.rewrite(url);
  // Same URL, different page per language: caches must not share it between cookies
  res.headers.append("Vary", "Cookie");
  return res;
}

function withLang(res: NextResponse, lang: "en" | "ja") {
  res.cookies.set(LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export const config = {
  // No longer excludes dotted paths (e.g. "*.php") — those never match a real static asset
  // (which Cloudflare serves without invoking the Worker at all) so they'd otherwise fall
  // through to a full, expensive Next.js render just to 404. Let BOT_PROBE catch them cheaply.
  matcher: ["/((?!api|_next|media|uploads|favicon.ico|icon.png|robots.txt|sitemap.xml).*)"],
};
