"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { db, ready } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

async function ids(formData: FormData) {
  await requireAdmin("messages");
  await ready();
  return formData
    .getAll("id")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
}

/** Opened in the admin: mark as read and refresh the unread badge. */
export async function markReadAction(id: number) {
  await requireAdmin("messages");
  await ready();
  await db.update(contactMessages).set({ readAt: new Date() }).where(eq(contactMessages.id, id));
  refresh();
}

export async function setReadAction(formData: FormData) {
  const list = await ids(formData);
  const read = formData.get("read") === "true";
  if (list.length) await db.update(contactMessages).set({ readAt: read ? new Date() : null }).where(inArray(contactMessages.id, list));
  // From the message page, go back to the list (staying would mark it read again)
  const back = String(formData.get("back") ?? "");
  if (back.startsWith("/admin/messages/")) redirect(back);
  refresh();
}

export async function setArchivedAction(formData: FormData) {
  const list = await ids(formData);
  const archived = formData.get("archived") === "true";
  if (list.length) {
    await db
      .update(contactMessages)
      .set({ archivedAt: archived ? new Date() : null, ...(archived && { readAt: new Date() }) })
      .where(inArray(contactMessages.id, list));
  }
  const back = String(formData.get("back") ?? "");
  if (back.startsWith("/admin/messages/")) redirect(back);
  refresh();
}

export async function deleteMessagesAction(formData: FormData) {
  const list = await ids(formData);
  if (list.length) await db.delete(contactMessages).where(inArray(contactMessages.id, list));
  const back = String(formData.get("back") ?? "");
  redirect(`${back.startsWith("/admin/messages/") ? back : "/admin/messages/"}${back.includes("?") ? "&" : "?"}flash=msgDeleted`);
}
