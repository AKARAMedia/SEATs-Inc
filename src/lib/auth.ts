import "server-only";
import { cache } from "react";
import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { and, asc, count, eq, gt, lt, ne } from "drizzle-orm";
import { db, ready } from "@/db";
import { adminSessions, adminUsers, loginAttempts, type Role } from "@/db/schema";
import { SESSION_COOKIE, sessionKey } from "./session-key";
import { can, type Perm } from "./permissions";

const MAX_AGE = 60 * 60 * 12; // 12h
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_EMAIL = 5;
const MAX_FAILS_PER_IP = 20;
const DUMMY_HASH = "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva";

export type Session = { id: number; email: string; name: string; role: Role; sid: string };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function passwordProblem(password: string): string | null {
  if (password.length < 10) return "Password must be at least 10 characters.";
  if (password.length > 200) return "Password is too long.";
  return null;
}

async function clientInfo() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim();
  return { ip, userAgent: (h.get("user-agent") ?? "").slice(0, 300) };
}

/** Minutes until the key is unlocked, or 0 when it isn't locked. */
async function lockedFor(key: string, max: number) {
  const since = new Date(Date.now() - LOCK_WINDOW_MS);
  const fails = await db
    .select({ createdAt: loginAttempts.createdAt })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.key, key), gt(loginAttempts.createdAt, since)))
    .orderBy(asc(loginAttempts.createdAt));
  if (fails.length < max) return 0;
  // Unlocks once enough of the oldest failures fall out of the window
  const unlockAt = fails[fails.length - max].createdAt.getTime() + LOCK_WINDOW_MS;
  return Math.max(1, Math.ceil((unlockAt - Date.now()) / 60000));
}

export type LoginResult = { ok: true; user: { id: number; name: string; email: string } } | { ok: false; error: string };

export async function login(rawEmail: string, password: string): Promise<LoginResult> {
  await ready();
  await ensureBootstrapAdmin();
  const email = rawEmail.toLowerCase().trim();
  const { ip, userAgent } = await clientInfo();
  const keys = [`email:${email}`, ...(ip ? [`ip:${ip}`] : [])];

  const [emailLock, ipLock] = await Promise.all([
    lockedFor(keys[0], MAX_FAILS_PER_EMAIL),
    ip ? lockedFor(keys[1], MAX_FAILS_PER_IP) : 0,
  ]);
  const wait = Math.max(emailLock, ipLock);
  if (wait) return { ok: false, error: `Too many failed attempts. Try again in ${wait} minute${wait > 1 ? "s" : ""}.` };

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
  // Compare against a dummy hash when the user doesn't exist to keep timing uniform
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || !user.active) {
    await db.insert(loginAttempts).values(keys.map((key) => ({ key })));
    await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)));
    return { ok: false, error: user && ok && !user.active ? "This account is disabled." : "Invalid email or password." };
  }

  await db.delete(loginAttempts).where(eq(loginAttempts.key, keys[0]));
  await startSession(user.id, { ip, userAgent });
  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
  return { ok: true, user: { id: user.id, name: user.name, email: user.email } };
}

async function startSession(userId: number, info: { ip: string; userAgent: string }) {
  const sid = crypto.randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000);
  await db.insert(adminSessions).values({ id: sid, userId, expiresAt, ...info });
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  const token = await new SignJWT({ sub: String(userId), sid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(sessionKey());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function logout() {
  const session = await getSession();
  if (session) await db.delete(adminSessions).where(eq(adminSessions.id, session.sid));
  (await cookies()).delete(SESSION_COOKIE);
}

/** End every session of a user, optionally keeping one (e.g. the current browser). */
export async function endSessions(userId: number, keepSid?: string) {
  await db
    .delete(adminSessions)
    .where(and(eq(adminSessions.userId, userId), keepSid ? ne(adminSessions.id, keepSid) : undefined));
}

/** Verified session for this request (cached per request). Checks the DB, so ended sessions stop working at once. */
export const getSession = cache(async (): Promise<Session | null> => {
  // Session checks read the clock (token expiry) and must never be prerendered
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  let sid: string;
  try {
    const { payload } = await jwtVerify(token, sessionKey());
    if (typeof payload.sid !== "string") return null;
    sid = payload.sid;
  } catch {
    return null;
  }
  await ready();
  const [row] = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      active: adminUsers.active,
      expiresAt: adminSessions.expiresAt,
      lastSeenAt: adminSessions.lastSeenAt,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(eq(adminSessions.id, sid));
  if (!row || !row.active || row.expiresAt < new Date()) return null;
  if (Date.now() - row.lastSeenAt.getTime() > 5 * 60 * 1000) {
    await db.update(adminSessions).set({ lastSeenAt: new Date() }).where(eq(adminSessions.id, sid));
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role, sid };
});

/** Require a signed-in user, and optionally a permission. */
export async function requireAdmin(perm?: Perm): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/login/");
  if (perm && !can(session.role, perm)) redirect("/admin/?flash=forbidden");
  return session;
}

export async function countAdmins() {
  const [{ n }] = await db
    .select({ n: count() })
    .from(adminUsers)
    .where(and(eq(adminUsers.role, "admin"), eq(adminUsers.active, true)));
  return n;
}

// First admin comes from ADMIN_EMAIL / ADMIN_PASSWORD env vars when the table is empty.
async function ensureBootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const existing = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  if (existing.length) return;
  await db.insert(adminUsers).values({ email: email.toLowerCase().trim(), passwordHash: await hashPassword(password), role: "admin" });
}
