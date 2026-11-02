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

`src/middleware.ts` rewrites unprefixed paths to the internal `[lang]` segment, protects `/admin`, and 301s the two legacy
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

## Deploying (Cloudflare Workers, Free plan)

The Free plan gives a Worker only **10 ms of CPU per request** (error 1102 "Worker exceeded CPU time limit"
otherwise), far too little to render Next.js pages on demand. So the public site is **static**:

- `npm run cf:build` runs `next build`, which prerenders every public page from the database, then
  `scripts/export-static.ts` copies that HTML (plus `/uploads/` images and `news-index.json`) into the Worker's
  static assets. Cloudflare serves matching files *without running the Worker at all*.
- The Worker only handles what can't be static: `/admin`, `/api/*` (forms, page-view tracking) and unknown URLs.
- Images are served as-is (`images.unoptimized`), because `/_next/image` would run the Worker for every image.
- Every News & Event page is prerendered (`/news-event/`, `/news-event/page/2/`, ...). Search (`?s=`) runs in the browser
  from `/news-index.json` and matches title and excerpt.
- Admin sign-in checks passwords inside Postgres (`pgcrypto`, migration 0009) because bcrypt in JavaScript needs far more
  than 10 ms of CPU. Local dev (PGlite) uses bcryptjs.

**Admin edits go live after a rebuild** (about 2-3 minutes; the admin shows a banner while it runs). Saving in the admin calls `requestRebuild()`
(`src/lib/rebuild.ts`), which triggers `.github/workflows/deploy.yml` (migrate, build, deploy). The workflow also
runs every 6 hours so posts scheduled for a future date appear, and from the Actions tab ("Run workflow").
`npm run cf:deploy` still does the same thing from a local machine.

One-time setup:

1. GitHub repo -> Settings -> Secrets and variables -> Actions -> add `DATABASE_URL` (the Neon string the Worker uses),
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (same values as `.env.deploy`).
2. Create a fine-grained personal access token (https://github.com/settings/personal-access-tokens): this repo only,
   permissions **Contents: Read and write** (to trigger the rebuild) and **Actions: Read** (so the admin can show
   "Publishing…" / "Your changes are live" / "Publish failed" while it runs).
3. Give the Worker that token: `npx wrangler secret put GITHUB_DISPATCH_TOKEN`.
   (Optional `GITHUB_REPO=owner/name` if the repo is renamed; the default is `AKARAMedia/SEATs-Inc`.)

The workflow builds the `main` branch, so merge changes there for them to be included.

## Deploying (Vercel)

1. Import the GitHub repo `websitecreationakara-debug/SEATs-Inc` into Vercel (framework: Next.js, root directory: repo root).
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
