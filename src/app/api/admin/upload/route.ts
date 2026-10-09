import { NextResponse } from "next/server";
import { db, ready } from "@/db";
import { media } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { saveImage } from "@/lib/storage";

/** Image size from the file itself (sharp), falling back to what the browser measured. */
async function dimensions(file: File, form: FormData) {
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(Buffer.from(await file.arrayBuffer())).metadata();
    if (meta.width && meta.height) return { width: meta.width, height: meta.height };
  } catch {}
  return { width: Number(form.get("width")) || 0, height: Number(form.get("height")) || 0 };
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !can(session.role, "translate")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  try {
    const url = await saveImage(file);
    const { width, height } = await dimensions(file, form);
    await ready();
    await db
      .insert(media)
      .values({ url, filename: file.name.slice(0, 200), contentType: file.type, width, height, size: file.size, uploadedBy: session.name || session.email })
      .onConflictDoNothing();
    return NextResponse.json({ url, width, height });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 400 });
  }
}
