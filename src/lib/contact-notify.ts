import "server-only";

export type ContactNotification = {
  name: string;
  email: string;
  company: string;
  message: string;
  lang: string;
};

/**
 * Notify staff of a new contact message. Messages are always stored in the DB first;
 * this is the delivery hook. Email provider is still TBD, so:
 *  - WEB3FORMS_ACCESS_KEY set → forward to Web3Forms (what the live WordPress form uses today)
 *  - CONTACT_WEBHOOK_URL set  → POST the message as JSON
 *  - neither                  → no-op
 */
export async function notifyContact(message: ContactNotification): Promise<void> {
  const subject = `${message.name} — New Contact Form Submission - SEATS Website`;
  const tasks: Promise<unknown>[] = [];

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
