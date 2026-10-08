# seats-inc.com — coded rebuild

Next.js rebuild of the WordPress site (Woodmart + Elementor + TranslatePress). Static, hardcoded EN/JA pages
pixel-matched to the live site, plus a login-gated admin for **News & Events only**.

| | |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4 |
| Data | Postgres via Drizzle ORM — Neon in production, embedded PGlite (`.data/`) locally |
| Images | Site images in `public/media` (exported from WP). News uploads → Vercel Blob (prod) / `public/uploads` (dev) |
| Admin | `/admin` — email + password, signed HTTP-only cookie, bcrypt hashes |

## URLs & languages

URLs are identical to WordPress so links and SEO carry over:

- English at the root: `/overview/`, `/news-event/`, `/<post-slug>/`
- Japanese under `/ja`: `/ja/overview/`, `/ja/<post-slug>/`

`src/proxy.ts` rewrites unprefixed paths to the internal `[lang]` segment, protects `/admin`, and 301s the two legacy
Japanese-slug posts. `next.config.ts` redirects old WP archive/upload URLs (`/category/*`, `/wp-content/uploads/*`, …).
The language switcher in the header swaps to the same page in the other language.

- Static page copy: `src/content/pages/*.ts` (EN/JA pairs) and `src/content/site.ts` (nav, footer).
- News posts: DB, edited in `/admin` with side-by-side EN / JP fields. Empty JP fields fall back to English on `/ja/`.

## Local development

```bash
npm install
cp .env.example .env.local      # set ADMIN_EMAIL / ADMIN_PASSWORD / SESSION_SECRET
npm run db:import-wp            # loads the 41 exported WordPress posts (EN + JA) into local PGlite
npm run dev                     # http://localhost:3000 — admin at /admin
```

The first admin account is created automatically from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on first login when no admin exists.

Useful scripts:

| Script | What it does |
|---|---|
| `npm run db:generate` | Create a migration after editing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations (also runs automatically in `npm run build`) |
| `npm run db:import-wp` | Idempotent import of `content-export/posts.json` + JA pages (upserts by slug) |
| `npm run export:live` | Re-export pages/posts/media from the live WordPress site into `content-export/` + `public/media/` |
| `npm run qa:screens -- <baseUrl> <outDir> [paths…]` | Full-page desktop (1440) + mobile (390) screenshots for pixel comparison |

## Deploying (Vercel)

1. Import the repo into Vercel (framework: Next.js, root: `web/`).
2. Storage → connect **Neon Postgres** (sets `DATABASE_URL`) and **Vercel Blob** (sets `BLOB_READ_WRITE_TOKEN`).
3. Environment variables: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET` (32+ random bytes), `SITE_URL=https://seats-inc.com`,
   optionally `CONTACT_WEBHOOK_URL`.
4. Deploy. The build runs migrations against Neon.
5. Import content once against production: `DATABASE_URL=<neon url> npm run db:import-wp`.
6. QA the preview URL: `npm run qa:screens -- https://<preview>.vercel.app qa/preview` and compare with `qa/live`.
7. Log in at `/admin`, change the bootstrap password if desired, and verify create/edit/delete.

### DNS cutover (seats-inc.com)

1. In Vercel → Domains, add `seats-inc.com` and `www.seats-inc.com` (redirect www → apex, matching today).
2. Lower the TTL on the current DNS records ~24h ahead.
3. Point the apex `A` record to Vercel (`76.76.21.21`) and `www` `CNAME` to `cname.vercel-dns.com`
   (use the exact values Vercel shows for the project).
4. Keep the WordPress host running read-only for a rollback window; revert the DNS records to roll back.
5. After cutover: submit `https://seats-inc.com/sitemap.xml` in Google Search Console, spot-check old URLs
   (posts, `/ja/...`, `/category/...`, `/wp-content/uploads/...`).

The separate group sites (`seatsfarm.com`, `lokajapanesefoodsbeverage.com`, `sherpagent.com`, `seatsinc-career.com`) are separate and unaffected.
