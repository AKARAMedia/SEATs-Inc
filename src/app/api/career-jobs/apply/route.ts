import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { applicationFiles, jobApplications, jobs } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { sendEmail } from "@/lib/email";

// Public endpoint for the seatsinc-career.com job application form (a separate Next.js app that
// only reads this database directly — writes, like applications, go through this API instead).
// The Telegram "Apply" link on that site stays too; this is a second, optional way to apply.
const MAX_CV = 4 * 1024 * 1024;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

const Input = z.object({
  job: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().max(320).pipe(z.email()),
  phone: z.string().trim().max(50).default(""),
  // Telegram usernames are 5-32 chars, letters/digits/underscores; strip an optional leading "@".
  telegram: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, ""))
    .pipe(z.string().regex(/^[a-zA-Z0-9_]{5,32}$/, "Enter a valid Telegram username")),
  message: z.string().trim().max(5000).default(""),
});

export async function POST(req: Request) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid form submission." }, { status: 400, headers: CORS });
  }

  // Honeypot: real applicants never see or fill this field. Pretend success so bots move on.
  if (fd.get("botcheck")) return Response.json({ ok: true }, { headers: CORS });

  const parsed = Input.safeParse({
    job: fd.get("job") ?? "",
    name: fd.get("name") ?? "",
    email: fd.get("email") ?? "",
    phone: fd.get("phone") ?? "",
    telegram: fd.get("telegram") ?? "",
    message: fd.get("message") ?? "",
  });
  if (!parsed.success) return Response.json({ ok: false, error: "Please check the form and try again." }, { status: 400, headers: CORS });

  await ready();
  const [job] = await db
    .select({ id: jobs.id, titleEn: jobs.titleEn })
    .from(jobs)
    .where(and(eq(jobs.slug, parsed.data.job), eq(jobs.site, "career"), eq(jobs.open, true)));
  if (!job) return Response.json({ ok: false, error: "This position is no longer accepting applications." }, { status: 404, headers: CORS });

  // CV is optional here (unlike the main site's form) to keep this a low-friction alternative to Telegram.
  let cvName = "";
  let bytes: Buffer | null = null;
  const cv = fd.get("cv");
  if (cv instanceof File && cv.size > 0) {
    if (cv.size > MAX_CV) return Response.json({ ok: false, error: "The CV file is too large (max 4 MB)." }, { status: 400, headers: CORS });
    bytes = Buffer.from(await cv.arrayBuffer());
    if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
      return Response.json({ ok: false, error: "Please attach your CV as a PDF file." }, { status: 400, headers: CORS });
    }
    cvName = (cv.name || "cv.pdf").replace(/[^\w.\- ]+/g, "_").slice(0, 120);
  }

  const d = parsed.data;
  try {
    const [app] = await db
      .insert(jobApplications)
      .values({
        jobId: job.id,
        jobTitle: job.titleEn,
        name: d.name,
        email: d.email,
        phone: d.phone,
        telegramUsername: d.telegram,
        message: d.message,
        lang: "en",
        cvName,
        cvSize: bytes?.length ?? 0,
      })
      .returning({ id: jobApplications.id });
    if (bytes) await db.insert(applicationFiles).values({ applicationId: app.id, contentType: "application/pdf", data: bytes });
  } catch (e) {
    console.error("[career-jobs apply] failed to save application", e);
    return Response.json({ ok: false, error: "Your application couldn't be sent. Please try again later." }, { status: 500, headers: CORS });
  }

  const { company, contact } = await getSettings();
  const to = [...new Set([company.recruitEmail, ...contact.notifyEmails].filter(Boolean))];
  if (to.length) {
    await sendEmail({
      to,
      replyTo: d.email,
      subject: `New application: ${job.titleEn} — ${d.name}`,
      text: [
        `Position: ${job.titleEn}`,
        `Name: ${d.name}`,
        `Email: ${d.email}`,
        ...(d.phone ? [`Phone: ${d.phone}`] : []),
        `Telegram: @${d.telegram}`,
        "",
        d.message,
        "",
        "Open the admin panel → Career Jobs to read it.",
      ].join("\n"),
    });
  }

  return Response.json({ ok: true }, { headers: CORS });
}
