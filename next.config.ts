import type { NextConfig } from "next";

// Set by the cf:* scripts. Workers have a size limit, so leave out modules that can't run there anyway.
const cloudflare = process.env.CLOUDFLARE_BUILD === "1";
const CLOUDFLARE_STUBS = "./src/db/cloudflare-stubs.ts";

const nextConfig: NextConfig = {
  // Lets a test server run beside `npm run dev` without sharing build output (pair with PGLITE_DIR)
  ...(process.env.NEXT_DIST_DIR && { distDir: process.env.NEXT_DIST_DIR }),
  // No cacheComponents: it hangs every page render on Cloudflare Workers (OpenNext). Pages render per request.
  // Keep WordPress-style URLs (/overview/) so existing links and SEO carry over
  trailingSlash: true,
  ...(!cloudflare && { serverExternalPackages: ["@electric-sql/pglite"] }),
  experimental: {
    // Job applications upload a CV (max 4 MB) through a server action; the default limit is 1 MB
    serverActions: { bodySizeLimit: "4.5mb" },
    // Local builds use the embedded PGlite DB, which only one process may open at a time
    ...(!process.env.DATABASE_URL && { cpus: 1 }),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async redirects() {
    return [
      // www -> apex, as on the old site
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.seats-inc.com" }],
        destination: "https://seats-inc.com/:path*",
        permanent: true,
      },
      // Old WP feeds/admin entry points
      { source: "/wp-admin/:path*", destination: "/admin/", permanent: false },
      { source: "/wp-login.php", destination: "/admin/login/", permanent: false },
      { source: "/feed/", destination: "/news-event/", permanent: true },
      // WordPress archives -> News & Events listing
      { source: "/category/:path*", destination: "/news-event/", permanent: true },
      { source: "/ja/category/:path*", destination: "/ja/news-event/", permanent: true },
      { source: "/author/:path*", destination: "/news-event/", permanent: true },
      { source: "/news-event/page/:n/", destination: "/news-event/", permanent: true },
      // Old hot-linked uploads keep working
      { source: "/wp-content/uploads/:path*", destination: "/media/:path*", permanent: true },
    ];
  },
  turbopack: {
    ...(cloudflare && {
      resolveAlias: {
        "@electric-sql/pglite": CLOUDFLARE_STUBS,
        "drizzle-orm/pglite": CLOUDFLARE_STUBS,
        "drizzle-orm/pglite/migrator": CLOUDFLARE_STUBS,
        sharp: CLOUDFLARE_STUBS,
      },
    }),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
