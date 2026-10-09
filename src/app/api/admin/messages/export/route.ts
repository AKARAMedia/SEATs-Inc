import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { adminExportMessages, type MessageView } from "@/lib/admin-data";
import { messageCompany } from "@/lib/format";
import { cambodiaDay } from "@/lib/stats";

/** CSV cell; prefixes formula-like values so Excel doesn't execute them. */
function cell(v: string) {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !can(session.role, "messages")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const view = (["inbox", "unread", "archived", "all"].includes(sp.get("view") ?? "") ? sp.get("view") : "inbox") as MessageView;
  const rows = await adminExportMessages({ view, q: sp.get("q") ?? "", lang: sp.get("lang") ?? "" });

  const header = ["Received (Cambodia time)", "Name", "Email", "Company", "Phone", "Language", "Message", "Status"];
  const lines = rows.map((m) =>
    [
      new Date(m.createdAt.getTime() + 7 * 3600000).toISOString().slice(0, 16).replace("T", " "),
      m.name,
      m.email,
      messageCompany(m.subject),
      m.phone,
      m.lang.toUpperCase(),
      m.message,
      m.archivedAt ? "Archived" : m.readAt ? "Read" : "Unread",
    ]
      .map(cell)
      .join(","),
  );
  // UTF-8 BOM so Excel shows Japanese text correctly
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="seats-messages-${cambodiaDay()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
