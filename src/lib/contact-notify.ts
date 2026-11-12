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
 *  - web3FormsAccessKey (param, falls back to WEB3FORMS_ACCESS_KEY) → forward to Web3Forms
 *  - extraWeb3FormsAccessKeys (param) → forward to additional Web3Forms destinations alongside the above
 *  - CONTACT_WEBHOOK_URL set  → POST the message as JSON
 */
export async function notifyContact(
  message: ContactNotification,
  opts?: { web3FormsAccessKey?: string; extraWeb3FormsAccessKeys?: string[] },
): Promise<void> {
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

  const web3FormsAccessKey = opts?.web3FormsAccessKey ?? process.env.WEB3FORMS_ACCESS_KEY;
  const web3FormsKeys = new Set([web3FormsAccessKey, ...(opts?.extraWeb3FormsAccessKeys ?? [])].filter(Boolean));
  for (const accessKey of web3FormsKeys) {
    tasks.push(
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: accessKey, subject, ...message }),
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
