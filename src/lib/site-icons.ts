import type { Metadata } from "next";

// Browser tab / bookmark / home-screen icons. The files are plain static files in public/ (the original logo image, resized;
// /media and /favicon.ico are served by Cloudflare directly, without running the Worker).
// "?v=3" makes browsers fetch the new icons instead of the old ones they cached; bump it if the files change.
export const SITE_ICONS: Metadata["icons"] = {
  icon: [
    { url: "/favicon.ico?v=3", sizes: "any" },
    { url: "/media/icon-32.png?v=3", sizes: "32x32", type: "image/png" },
    { url: "/media/icon-192.png?v=3", sizes: "192x192", type: "image/png" },
    { url: "/media/icon-512.png?v=3", sizes: "512x512", type: "image/png" },
  ],
  apple: [{ url: "/media/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" }],
};
