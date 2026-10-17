"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db, ready } from "@/db";
import { contactMessages } from "@/db/schema";
import { notifyContact } from "@/lib/contact-notify";
import { href, isLang, type Lang } from "@/lib/i18n";
import { CONTACT } from "@/content/pages/contact";

export type ContactState = {
  status: "idle" | "error" | "invalid";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  company: z.string().trim().max(200).default(""),
  message: z.string().trim().min(1).max(5000),
});

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const langRaw = String(formData.get("lang") ?? "en");
  const lang: Lang = isLang(langRaw) ? langRaw : "en";
  const f = CONTACT.form;

  // Honeypot: real users never see or fill this field. Pretend success so bots move on.
  if (formData.get("botcheck")) redirect(href(lang, "/contact/thank-you/"));

  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    company: formData.get("company") ?? "",
    message: formData.get("message") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "name" | "email" | "message";
      if (fieldErrors[key]) continue;
      fieldErrors[key] = key === "email" && formData.get("email") ? f.badEmail[lang] : f.required[lang];
    }
    return { status: "invalid", message: f.invalid[lang], fieldErrors };
  }

  const { name, email, company, message } = parsed.data;
  try {
    await ready();
    // Schema has no company column; it's recorded in `subject` (shown in admin alongside the message)
    await db.insert(contactMessages).values({ name, email, subject: company ? `Company: ${company}` : "", message, lang });
  } catch (e) {
    console.error("[contact] failed to save message", e);
    return { status: "error", message: f.error[lang] };
  }
  await notifyContact({ name, email, company, message, lang });
  redirect(href(lang, "/contact/thank-you/"));
}
