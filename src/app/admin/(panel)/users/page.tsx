import Link from "next/link";
import { adminUsersList, fmtDateTime } from "@/lib/admin-data";
import { getSession } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/permissions";

export const metadata = { title: "Users" };

const ROLE_STYLE = {
  admin: "bg-primary/10 text-primary",
  editor: "bg-violet-50 text-violet-700",
  translator: "bg-amber-50 text-amber-700",
  hr: "bg-emerald-50 text-emerald-700",
};

export default async function UsersPage() {
  const [users, me] = await Promise.all([adminUsersList(), getSession()]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-[22px] font-semibold">
            Users <span className="text-[14px] font-normal text-[#888]">({users.length})</span>
          </h1>
          <p className="text-[13px] text-[#888]">People who can sign in to this admin panel.</p>
        </div>
        <Link href="/admin/users/new/" className="admin-btn">
          + Add user
        </Link>
      </div>

      <ul className="admin-card divide-y divide-black/5">
        {users.map((u) => (
          <li key={u.id}>
            <Link href={`/admin/users/${u.id}/`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-[#fafbfc]">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-[14px] font-semibold text-[#555]">
                {(u.name || u.email).slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-[#222]">
                  {u.name || u.email}
                  {u.id === me?.id && <span className="ml-2 text-[12px] font-normal text-[#999]">(you)</span>}
                </span>
                {u.name && <span className="block truncate text-[13px] text-[#777]">{u.email}</span>}
              </span>
              <span className={`admin-badge ${ROLE_STYLE[u.role]}`}>{ROLE_LABELS[u.role].label}</span>
              {!u.active && <span className="admin-badge bg-red-50 text-red-700">Disabled</span>}
              <span className="w-full text-[12px] text-[#999] sm:w-[190px] sm:text-right">Last sign-in: {fmtDateTime(u.lastLoginAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
