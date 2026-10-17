import { z } from "zod";
import { db, ready } from "@/db";
import { contactMessages } from "@/db/schema";
import { notifyContact } from "@/lib/contact-notify";

// Public endpoint for the standalone JP recruiting landing page (public/jp/), a plain static HTML
// form with no React/server-action support — posts here as a drop-in replacement for the Formspree
// endpoint it used before, so submissions land in the same admin → Messages inbox as every other
// contact channel instead of a third-party dashboard or a personal inbox.
const schema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  country: z.string().trim().min(1).max(200),
  // Labeled "電話番号" (phone) in the form, but named "position" in its markup — kept as-is to match.
  position: z.string().trim().max(50).default(""),
  message: z.string().trim().max(5000).default(""),
});

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field. Pretend success so bots move on.
  if (form.get("botcheck")) return Response.json({ ok: true });

  const parsed = schema.safeParse({
    name: form.get("name") ?? "",
    email: form.get("email") ?? "",
    country: form.get("country") ?? "",
    position: form.get("position") ?? "",
    message: form.get("message") ?? "",
  });
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });

  const { name, email, country, position, message } = parsed.data;
  // Schema has no country column; recorded in `subject` (shown in admin alongside the message),
  // same convention the main contact form uses for its "Company" field.
  const subject = `[JP Casual Interview] Country: ${country}`;

  try {
    await ready();
    await db.insert(contactMessages).values({ name, email, phone: position, subject, message, lang: "ja" });
  } catch (e) {
    console.error("[jp-lead] failed to save message", e);
    return Response.json({ ok: false }, { status: 500 });
  }

  await notifyContact({ name, email, company: subject, message, lang: "ja" });
  return Response.json({ ok: true });
}
