"use server";

import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, ready } from "@/db";
import { adminUsers, ROLES } from "@/db/schema";
import { countAdmins, endSessions, hashPassword, passwordProblem, requireAdmin, verifyPassword } from "@/lib/auth";
import type { FormState } from "./actions";

const fail = (field: string, message: string): FormState => ({ error: message, fieldErrors: { [field]: message } });

// ---------- user management (admins only) ----------

const UserInput = z.object({
  name: z.string().trim().max(100).default(""),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  role: z.enum(ROLES),
});

export async function createUserAction(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin("users");
  await ready();
  const parsed = UserInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(String(parsed.error.issues[0].path[0]), parsed.error.issues[0].message);
  const password = String(formData.get("password") ?? "");
  const problem = passwordProblem(password);
  if (problem) return fail("password", problem);

  const [exists] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, parsed.data.email));
  if (exists) return fail("email", "A user with this email already exists.");

  await db.insert(adminUsers).values({ ...parsed.data, passwordHash: await hashPassword(password) });
  redirect("/admin/users/?flash=userCreated");
}

export async function updateUserAction(_: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin("users");
  await ready();
  const id = Number(formData.get("id"));
  const parsed = UserInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(String(parsed.error.issues[0].path[0]), parsed.error.issues[0].message);
  const active = formData.get("active") === "on";
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
  if (!user) return { error: "User not found." };

  const [clash] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.email, parsed.data.email), ne(adminUsers.id, id)));
  if (clash) return fail("email", "Another user already uses this email.");

  const losesAdmin = user.role === "admin" && user.active && (parsed.data.role !== "admin" || !active);
  if (losesAdmin && (await countAdmins()) <= 1) return { error: "There must be at least one active Admin." };
  if (id === me.id && !active) return fail("active", "You can't disable your own account.");
  const password = String(formData.get("password") ?? "");
  const problem = password && passwordProblem(password);
  if (problem) return fail("password", problem);

  await db
    .update(adminUsers)
    .set({ ...parsed.data, active, ...(password && { passwordHash: await hashPassword(password) }) })
    .where(eq(adminUsers.id, id));
  // A disabled account or a reset password signs the user out everywhere
  if (!active || password) await endSessions(id, id === me.id ? me.sid : undefined);
  redirect(`/admin/users/?flash=userSaved`);
}

export async function signOutUserAction(formData: FormData) {
  const me = await requireAdmin("users");
  await ready();
  const id = Number(formData.get("id"));
  await endSessions(id, id === me.id ? me.sid : undefined);
  redirect(`/admin/users/${id}/?flash=sessionsEnded`);
}

export async function deleteUserAction(formData: FormData) {
  const me = await requireAdmin("users");
  await ready();
  const id = Number(formData.get("id"));
  if (id === me.id) redirect(`/admin/users/${id}/`);
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
  if (user?.role === "admin" && user.active && (await countAdmins()) <= 1) redirect(`/admin/users/${id}/`);
  await db.delete(adminUsers).where(eq(adminUsers.id, id));
  redirect("/admin/users/?flash=userDeleted");
}

// ---------- own account (any signed-in user) ----------

export async function updateProfileAction(_: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  await ready();
  const name = String(formData.get("name") ?? "").trim().slice(0, 100);
  await db.update(adminUsers).set({ name }).where(eq(adminUsers.id, me.id));
  redirect("/admin/account/?flash=profileSaved");
}

export async function changePasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  await ready();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, me.id));
  if (!user || !(await verifyPassword(current, user.passwordHash))) return fail("current", "Current password is incorrect.");
  const problem = passwordProblem(next);
  if (problem) return fail("next", problem);
  if (next !== confirm) return fail("confirm", "Passwords don't match.");
  if (next === current) return fail("next", "Choose a password different from the current one.");

  await db.update(adminUsers).set({ passwordHash: await hashPassword(next) }).where(eq(adminUsers.id, me.id));
  await endSessions(me.id, me.sid);
  redirect("/admin/account/?flash=passwordChanged");
}

export async function signOutOthersAction() {
  const me = await requireAdmin();
  await ready();
  await endSessions(me.id, me.sid);
  redirect("/admin/account/?flash=sessionsEnded");
}
