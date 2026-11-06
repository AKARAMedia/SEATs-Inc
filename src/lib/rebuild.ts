import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { writeFileSync } from "node:fs";
import path from "node:path";

/**
 * `npm run dev` shares the live database but has no way to rebuild the live site. So every content save
 * on a developer machine rewrites this tiny tracked file: `git add .`, `git commit` and `git push`
 * (then merging into main, which Cloudflare builds) always have a change to carry, and the build that
 * follows reads the saved content from the database. Never runs on the live Worker.
 */
const CONTENT_MARKER = ".content-updated";
function markContentUpdated() {
  if (process.env.NODE_ENV !== "development") return;
  try {
    writeFileSync(path.join(process.cwd(), CONTENT_MARKER), `${new Date().toISOString()}\n`);
  } catch {
    // read-only or missing folder: the deploy just has to be triggered another way
  }
}

/**
 * Public pages are static files built from the database (see scripts/export-static.ts), so an admin
 * edit only reaches visitors after the site is rebuilt and redeployed. This asks GitHub to do that by
 * sending a `content-updated` event to .github/workflows/deploy.yml (which collapses a burst of edits
 * into one running build plus one queued build).
 *
 * Needs the GITHUB_DISPATCH_TOKEN secret (fine-grained token, this repo only, "Contents: Read and
 * write"); without it (e.g. local dev) nothing is sent.
 */
export function requestRebuild() {
  markContentUpdated();
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) return;
  const repo = process.env.GITHUB_REPO ?? "AKARAMedia/SEATs-Inc";
  const send = async () => {
    const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "seats-inc-admin",
      },
      body: JSON.stringify({ event_type: "content-updated" }),
    });
    if (!res.ok) console.error("[rebuild] GitHub dispatch failed:", res.status, await res.text());
  };
  try {
    after(send); // after the response is sent, so saving never waits on GitHub
  } catch {
    void send().catch((e) => console.error("[rebuild]", e));
  }
}

/**
 * updateTag() for admin actions that change public content: also schedules the rebuild that publishes
 * it, and (when the content has its own public page, e.g. a post) drops that exact page from the
 * Workers-level cache - Next's fetch-tag cache doesn't cover plain drizzle queries like this app's
 * pages use, so without this a since-deleted/unpublished page can keep serving its last cached render
 * indefinitely (Cache-Control is s-maxage=31536000) even after a full rebuild+redeploy.
 */
export function publishChange(tag: string, slugs?: string | (string | undefined)[]) {
  updateTag(tag);
  for (const slug of [slugs].flat()) {
    if (!slug) continue;
    revalidatePath(`/${slug}/`);
    revalidatePath(`/ja/${slug}/`);
  }
  requestRebuild();
}
