import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { applicationFiles, jobApplications } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";

/** Download an applicant's CV. Only signed-in users with Careers access. */
export async function GET(req: Request, { params }: RouteContext<"/api/admin/cv/[id]">) {
  const session = await getSession();
  if (!session || !can(session.role, "careers")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  await ready();
  const [row] = await db
    .select({ data: applicationFiles.data, type: applicationFiles.contentType, name: jobApplications.cvName })
    .from(applicationFiles)
    .innerJoin(jobApplications, eq(applicationFiles.applicationId, jobApplications.id))
    .where(eq(applicationFiles.applicationId, id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const download = new URL(req.url).searchParams.has("download");
  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.type,
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${row.name.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
