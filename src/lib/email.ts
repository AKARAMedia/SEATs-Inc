import "server-only";

export type Email = { to: string | string[]; subject: string; text: string; replyTo?: string };

/** True when outgoing email is configured (RESEND_API_KEY + EMAIL_FROM). */
export function emailConfigured() {
  return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Send a plain-text email through Resend (https://resend.com). Returns false — never throws —
 * when email isn't configured or delivery fails, so callers can treat email as best-effort.
 */
export async function sendEmail({ to, subject, text, replyTo }: Email): Promise<boolean> {
  if (!emailConfigured()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text, ...(replyTo && { reply_to: replyTo }) }),
    });
    if (!res.ok) console.error("[email] send failed", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("[email] send failed", e);
    return false;
  }
}
