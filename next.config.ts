import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Keep WordPress-style URLs (/overview/) so existing links and SEO carry over
  trailingSlash: true,
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async redirects() {
    return [
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
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
