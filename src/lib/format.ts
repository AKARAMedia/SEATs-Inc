// Display formatting shared by admin server and client components (Cambodia time).
const TZ = "Asia/Phnom_Penh";

const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const yearOf = (d: Date) => d.toLocaleDateString("en-GB", { timeZone: TZ, year: "numeric" });

/** "14:05" today, "Yesterday", "3 Oct" this year, else "3 Oct 2025". */
export function shortDate(d: Date, now = new Date()) {
  if (dayKey(d) === dayKey(now)) return d.toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  if (dayKey(d) === dayKey(new Date(now.getTime() - 86400000))) return "Yesterday";
  return d.toLocaleDateString("en-GB", { timeZone: TZ, day: "numeric", month: "short", ...(yearOf(d) !== yearOf(now) && { year: "numeric" }) });
}

export function longDate(d: Date) {
  return d.toLocaleString("en-GB", { timeZone: TZ, dateStyle: "full", timeStyle: "short" });
}

/** The contact form stores the company as "Company: X" in the subject. */
export function messageCompany(subject: string) {
  return subject.startsWith("Company: ") ? subject.slice(9) : "";
}
