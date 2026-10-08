export const SESSION_COOKIE = "seats_admin";

export function sessionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return new TextEncoder().encode(secret ?? "dev-only-insecure-session-secret-change-me");
}
