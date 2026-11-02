import "server-only";
import { updateTag } from "next/cache";
import { after } from "next/server";

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

/** updateTag() for admin actions that change public content: also schedules the rebuild that publishes it. */
export function publishChange(tag: string) {
  updateTag(tag);
  requestRebuild();
}
