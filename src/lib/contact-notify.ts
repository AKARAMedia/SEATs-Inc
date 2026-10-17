import "server-only";
import { sendEmail } from "./email";
import { getSettings } from "./settings";

export type ContactNotification = {
  name: string;
  email: string;
  company: string;
  message: string;
  lang: string;
};

/**
 * Notify staff of a new contact message. Messages are always stored in the DB first;
 * this is the delivery hook. Every configured channel is used:
 *  - Settings → Contact form recipients (needs RESEND_API_KEY + EMAIL_FROM), plus the optional auto-reply
 *  - WEB3FORMS_ACCESS_KEY set → forward to Web3Forms (what the live WordPress form uses today)
 *  - CONTACT_WEBHOOK_URL set  → POST the message as JSON
 */
export async function notifyContact(message: ContactNotification): Promise<void> {
  const subject = `${message.name} — New Contact Form Submission - SEATS Website`;
  const tasks: Promise<unknown>[] = [];
  const { contact } = await getSettings();

  if (contact.notifyEmails.length) {
    tasks.push(
      sendEmail({
        to: contact.notifyEmails,
        subject,
        replyTo: message.email,
        text: [
          `Name: ${message.name}`,
          `Email: ${message.email}`,
          ...(message.company ? [`Company: ${message.company}`] : []),
          `Language: ${message.lang}`,
          "",
          message.message,
        ].join("\n"),
      }),
    );
  }
  if (contact.autoReply) {
    const lang = message.lang === "ja" ? "ja" : "en";
    tasks.push(
      sendEmail({
        to: message.email,
        subject: contact.autoReplySubject[lang],
        // A replacer function (not a plain string) is required here: when the replacement is a
        // string, replaceAll treats $&/$`/$'/$$ as special patterns even for a plain-string search —
        // a submitted name containing one would otherwise corrupt the auto-reply body.
        text: contact.autoReplyBody[lang].replaceAll("{name}", () => message.name),
        replyTo: contact.notifyEmails[0],
      }),
    );
  }

  if (process.env.WEB3FORMS_ACCESS_KEY) {
    tasks.push(
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: process.env.WEB3FORMS_ACCESS_KEY, subject, ...message }),
      }),
    );
  }
  if (process.env.CONTACT_WEBHOOK_URL) {
    tasks.push(
      fetch(process.env.CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, ...message }),
      }),
    );
  }

  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === "rejected") console.error("[contact-notify] delivery failed", r.reason);
    else if (r.value instanceof Response && !r.value.ok) {
      console.error("[contact-notify] delivery failed", r.value.status, await r.value.text().catch(() => ""));
    }
  }
}
