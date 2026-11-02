import { getSession } from "@/lib/auth";

// State of the latest "Build and deploy" run (.github/workflows/deploy.yml), for the admin's publish banner.
// Public pages are static files rebuilt after each content edit, so editors need to see when that's done.
export type PublishState = "off" | "building" | "live" | "failed";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  if (!(await getSession())) return Response.json({ state: "off" satisfies PublishState }, { status: 401, headers });
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) return Response.json({ state: "off" satisfies PublishState }, { headers });

  const repo = process.env.GITHUB_REPO ?? "AKARAMedia/SEATs-Inc";
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/deploy.yml/runs?per_page=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "seats-inc-admin",
      },
    });
    // 403/404 usually means the token lacks "Actions: Read": the banner just stays hidden
    if (!res.ok) return Response.json({ state: "off" satisfies PublishState }, { headers });
    const { workflow_runs } = (await res.json()) as { workflow_runs?: { status: string; conclusion: string | null; updated_at: string; html_url: string }[] };
    const run = workflow_runs?.[0];
    if (!run) return Response.json({ state: "off" satisfies PublishState }, { headers });
    const state: PublishState = run.status !== "completed" ? "building" : run.conclusion === "success" ? "live" : "failed";
    return Response.json({ state, updatedAt: run.updated_at, url: run.html_url }, { headers });
  } catch {
    return Response.json({ state: "off" satisfies PublishState }, { headers });
  }
}
