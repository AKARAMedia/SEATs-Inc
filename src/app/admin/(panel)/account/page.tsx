import { ProfileForm, PasswordForm } from "@/components/admin/AccountForms";
import { ConfirmForm } from "@/components/admin/ui/confirm";
import { adminUserSessions, describeDevice, fmtDateTime } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/permissions";
import { signOutOthersAction } from "@/app/admin/user-actions";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const me = await requireAdmin();
  const sessions = await adminUserSessions(me.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[22px] font-semibold">My account</h1>
        <p className="text-[13px] text-[#888]">
          Signed in as {me.email} · {ROLE_LABELS[me.role].label} — {ROLE_LABELS[me.role].description.toLowerCase()}
        </p>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section className="admin-card p-5">
          <h2 className="mb-4 text-[15px] font-semibold">Profile</h2>
          <ProfileForm key={me.name} name={me.name} email={me.email} />
        </section>
        <section className="admin-card p-5">
          <h2 className="mb-1 text-[15px] font-semibold">Change password</h2>
          <p className="mb-4 text-[13px] text-[#888]">Your other devices will be signed out.</p>
          <PasswordForm />
        </section>
      </div>

      <section className="admin-card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold">Where you&apos;re signed in ({sessions.length})</h2>
          {sessions.length > 1 && (
            <ConfirmForm
              action={signOutOthersAction}
              confirm={{ title: "Sign out other devices?", message: "Every other browser will need to sign in again. This one stays signed in.", confirmLabel: "Sign out others" }}
            >
              <button className="admin-btn-secondary text-[13px]">Sign out other devices</button>
            </ConfirmForm>
          )}
        </div>
        <ul className="divide-y divide-black/5 text-[13px]">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap justify-between gap-2 py-2">
              <span>
                {describeDevice(s.userAgent)} {s.ip && <span className="text-[#999]">· {s.ip}</span>}
                {s.id === me.sid && <span className="admin-badge ml-2 bg-green-50 text-green-700">This browser</span>}
              </span>
              <span className="text-[#888]">Active {fmtDateTime(s.lastSeenAt)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
