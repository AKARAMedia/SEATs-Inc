// Import the 41 seatsinc-career.com job postings into the shared `jobs` table
// (tagged site="career"), from the discovery export in the sibling repo.
// Idempotent: upserts on slug. Usage: npx tsx scripts/import-career-jobs.ts
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { jobs } from "../src/db/schema";
import { sanitizeBody } from "../src/lib/sanitize";
import { scriptDb } from "./script-db";

const root = path.resolve(import.meta.dirname, "..", "..", "SEATs-Inc-Career", "content-export");
const wpJobs: { id: number; slug: string; title: string; date: string }[] = JSON.parse(
  fs.readFileSync(path.join(root, "jobs.json"), "utf8"),
);

function decode(s: string) {
  return cheerio.load(`<p>${s}</p>`)("p").text();
}

function parseJob(slug: string) {
  const file = path.join(root, "jobs", `${slug}.html`);
  const $ = cheerio.load(fs.readFileSync(file, "utf8"));

  // The info row is 3 columns (labels / colons / values), each a list of
  // .elementor-heading-title widgets. In document order that's 4 labels,
  // then 4 colons, then 4 values — same template across every job.
  const jobTypeLabel = $(".elementor-heading-title").filter((_, el) => $(el).text().trim() === "Job Type").first();
  const infoSection = jobTypeLabel.closest("section");
  const infoTexts = infoSection.find(".elementor-heading-title").map((_, el) => $(el).text().trim()).get();
  const [jobType = "", salaryRange = "", workDays = "", workplace = ""] = infoTexts.slice(8, 12);

  // First text-editor widget on the page is the Responsibilities/requirements
  // body; the second is the HR contact card sidebar, which we don't import.
  const bodyHtml = $(".elementor-widget-text-editor .elementor-widget-container").first().html() ?? "";

  return { type: jobType, salaryRange, workDays, location: workplace, descriptionEn: sanitizeBody(bodyHtml) };
}

async function main() {
  const { db, close } = await scriptDb();
  for (const [i, j] of wpJobs.entries()) {
    const parsed = parseJob(j.slug);
    const values = {
      site: "career" as const,
      slug: j.slug,
      titleEn: decode(j.title),
      wpId: j.id,
      sortOrder: i,
      createdAt: new Date(j.date + "+07:00"),
      ...parsed,
    };
    await db
      .insert(jobs)
      .values(values)
      .onConflictDoUpdate({
        target: jobs.slug,
        set: { ...values, updatedAt: new Date() },
      });
    console.log("career job", j.slug);
  }
  await close();
  console.log(`imported ${wpJobs.length} career-site jobs`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
