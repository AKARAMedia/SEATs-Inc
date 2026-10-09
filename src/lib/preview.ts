import "server-only";
import crypto from "node:crypto";
import { sessionKey } from "./session-key";

// Private preview links: an HMAC of the item, so a link works without signing in but can't be guessed.

export function previewToken(type: string, id: number | string) {
  return crypto.createHmac("sha256", Buffer.from(sessionKey())).update(`preview:${type}:${id}`).digest("base64url").slice(0, 24);
}

export function checkPreviewToken(type: string, id: number | string, token: string | undefined) {
  if (!token) return false;
  const expected = Buffer.from(previewToken(type, id));
  const given = Buffer.from(token);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}
