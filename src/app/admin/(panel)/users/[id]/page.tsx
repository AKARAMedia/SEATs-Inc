import Link from "next/link";
import { notFound } from "next/navigation";
import UserForm from "@/components/admin/UserForm";
import { ConfirmForm } from "@/components/admin/ui/confirm";
import { adminGetUser, adminUserSessions, describeDevice, fmtDateTime } from "@/lib/admin-data";
import { getSession } from "@/lib/auth";
import { deleteUserAction, signOutUserAction } from "@/app/admin/user-actions";

export const metadata = { title: "Edit user" };

export default async function EditUserPage({ params }: PageProps<"/admin/users/[id]">) {
  const { id } = await params;
  const user = await adminGetUser(Number(id));
  if (!user) notFound();
  const [sessions, me] = await Promise.all([adminUserSessions(user.id), getSession()]);
  const isSelf = user.id === me?.id;

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/users/" className="text-[13px] text-[#888] hover:text-primary">
          ← All users
        </Link>
        <h1 className="text-[22px] font-semibold">{user.name || user.email}</h1>
        <p className="text-[13px] text-[#888]">
          Added {fmtDateTime(user.createdAt)} · Last sign-in {fmtDateTime(user.lastLoginAt)}
        </p>
      </div>

      <UserForm key={user.id} isSelf={isSelf} values={user} />

      <section className="admin-card max-w-[640px] p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold">Signed-in devices ({sessions.length})</h2>
          {sessions.length > (isSelf ? 1 : 0) && (
            <ConfirmForm
              action={signOutUserAction}
              fields={{ id: user.id }}
              confirm={{ title: "Sign out of all devices?", message: isSelf ? "Your other devices will be signed out. This browser stays signed in." : "This user will need to sign in again.", confirmLabel: "Sign out" }}
            >
              <button className="admin-btn-secondary text-[13px]">Sign out everywhere</button>
            </ConfirmForm>
          )}
        </div>
        {sessions.length ? (
          <ul className="divide-y divide-black/5 text-[13px]">
            {sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>
                  {describeDevice(s.userAgent)} {s.ip && <span className="text-[#999]">· {s.ip}</span>}
                  {s.id === me?.sid && <span className="admin-badge ml-2 bg-green-50 text-green-700">This browser</span>}
                </span>
                <span className="text-[#888]">Active {fmtDateTime(s.lastSeenAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-[#888]">Not signed in anywhere.</p>
        )}
      </section>

      {!isSelf && (
        <section className="max-w-[640px] rounded-[10px] p-5 ring-1 ring-red-200">
          <h2 className="text-[15px] font-semibold text-red-700">Delete user</h2>
          <p className="mb-3 mt-1 text-[13px] text-[#666]">Removes their access permanently. To block access temporarily, untick “Active” instead.</p>
          <ConfirmForm
            action={deleteUserAction}
            fields={{ id: user.id }}
            confirm={{ title: `Delete ${user.name || user.email}?`, message: "They will lose access immediately. This cannot be undone.", confirmLabel: "Delete user", danger: true }}
          >
            <button className="admin-btn-secondary !text-red-600 hover:!bg-red-50">Delete user</button>
          </ConfirmForm>
        </section>
      )}
    </div>
  );
}
