"use server";

import { z } from "zod";
import { db, ready } from "@/db";
import { applicationFiles, jobApplications } from "@/db/schema";
import { getOpenJob } from "@/lib/careers";
import { sendEmail } from "@/lib/email";
import { isLang, type Lang } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";

export type ApplyState = { status: "idle" | "success" | "error"; message?: string; fieldErrors?: Partial<Record<"name" | "email" | "cv", string>> };

const MAX_CV = 4 * 1024 * 1024; // Vercel request bodies are limited to 4.5 MB

const T = {
  success: { en: "Thank you! Your application has been sent. We will contact you by email.", ja: "ご応募ありがとうございます。担当者よりメールでご連絡いたします。" },
  error: { en: "Your application couldn't be sent. Please try again later.", ja: "送信できませんでした。しばらくしてから再度お試しください。" },
  closed: { en: "This position is no longer accepting applications.", ja: "この求人の募集は終了しました。" },
  required: { en: "Please fill out this field.", ja: "この項目は必須です。" },
  email: { en: "Please enter a valid email address.", ja: "有効なメールアドレスを入力してください。" },
  cvType: { en: "Please attach your CV as a PDF file.", ja: "履歴書はPDFファイルで添付してください。" },
  cvSize: { en: "The file is too large (max 4 MB).", ja: "ファイルが大きすぎます（最大4MB）。" },
};

const Input = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().max(320).pipe(z.email()),
  phone: z.string().trim().max(50).default(""),
  message: z.string().trim().max(5000).default(""),
});

export async function applyAction(_: ApplyState, fd: FormData): Promise<ApplyState> {
  const langRaw = String(fd.get("lang") ?? "en");
  const lang: Lang = isLang(langRaw) ? langRaw : "en";
  // Honeypot: pretend success so bots move on
  if (fd.get("botcheck")) return { status: "success", message: T.success[lang] };

  const job = await getOpenJob(lang, String(fd.get("job") ?? ""));
  if (!job) return { status: "error", message: T.closed[lang] };

  const parsed = Input.safeParse({ name: fd.get("name") ?? "", email: fd.get("email") ?? "", phone: fd.get("phone") ?? "", message: fd.get("message") ?? "" });
  const fieldErrors: ApplyState["fieldErrors"] = {};
  if (!parsed.success) {
    for (const i of parsed.error.issues) {
      const k = i.path[0] as "name" | "email";
      fieldErrors[k] ??= k === "email" && fd.get("email") ? T.email[lang] : T.required[lang];
    }
  }
  const cv = fd.get("cv");
  let bytes: Buffer | null = null;
  if (!(cv instanceof File) || cv.size === 0) fieldErrors.cv = T.cvType[lang];
  else if (cv.size > MAX_CV) fieldErrors.cv = T.cvSize[lang];
  else {
    bytes = Buffer.from(await cv.arrayBuffer());
    // Check the file really is a PDF (not just named .pdf)
    if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") fieldErrors.cv = T.cvType[lang];
  }
  if (Object.keys(fieldErrors).length || !parsed.success || !bytes) return { status: "error", fieldErrors };

  const d = parsed.data;
  const cvName = ((cv as File).name || "cv.pdf").replace(/[^\w.\- ]+/g, "_").slice(0, 120);
  try {
    await ready();
    const [app] = await db
      .insert(jobApplications)
      .values({ jobId: job.id, jobTitle: job.title, ...d, lang, cvName, cvSize: bytes.length })
      .returning({ id: jobApplications.id });
    await db.insert(applicationFiles).values({ applicationId: app.id, contentType: "application/pdf", data: bytes });
  } catch (e) {
    console.error("[careers] failed to save application", e);
    return { status: "error", message: T.error[lang] };
  }

  // Notify the recruiting address and the contact-form recipients (best effort)
  const { company, contact } = await getSettings();
  const to = [...new Set([company.recruitEmail, ...contact.notifyEmails].filter(Boolean))];
  if (to.length) {
    await sendEmail({
      to,
      replyTo: d.email,
      subject: `New application: ${job.title} — ${d.name}`,
      text: [`Position: ${job.title}`, `Name: ${d.name}`, `Email: ${d.email}`, ...(d.phone ? [`Phone: ${d.phone}`] : []), "", d.message, "", "Open the admin panel → Careers to read it and download the CV."]
        .join("\n"),
    });
  }
  return { status: "success", message: T.success[lang] };
}
