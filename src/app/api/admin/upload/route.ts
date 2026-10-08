import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveImage } from "@/lib/storage";

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  try {
    return NextResponse.json({ url: await saveImage(file) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 400 });
  }
}
