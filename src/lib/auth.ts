import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { adminUsers } from "@/db/schema";
import { SESSION_COOKIE, sessionKey } from "./session-key";

const MAX_AGE = 60 * 60 * 12; // 12h

export async function login(email: string, password: string): Promise<boolean> {
  await ready();
  await ensureBootstrapAdmin();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email.toLowerCase().trim()));
  // Compare against a dummy hash when the user doesn't exist to keep timing uniform
  const ok = await bcrypt.compare(password, user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva");
  if (!user || !ok) return false;
  const token = await new SignJWT({ sub: String(user.id), email: user.email })
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
  return true;
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession(): Promise<{ id: number; email: string } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey());
    return { id: Number(payload.sub), email: String(payload.email) };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

// First admin comes from ADMIN_EMAIL / ADMIN_PASSWORD env vars when the table is empty.
async function ensureBootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const existing = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  if (existing.length) return;
  await db.insert(adminUsers).values({ email: email.toLowerCase().trim(), passwordHash: await bcrypt.hash(password, 12) });
}
