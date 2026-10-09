"use client";

import { startTransition, useActionState } from "react";
import type { Role } from "@/db/schema";
import { ROLE_LABELS } from "@/lib/permissions";
import { createUserAction, updateUserAction } from "@/app/admin/user-actions";
import { FieldError, FormError } from "./ui/Field";
import PasswordInput from "./PasswordInput";

type Values = { id?: number; name: string; email: string; role: Role; active: boolean };

export default function UserForm({ values, isSelf }: { values: Values; isSelf?: boolean }) {
  const [state, action, pending] = useActionState(values.id ? updateUserAction : createUserAction, undefined);
  const editing = !!values.id;

  return (
    <form
      className="admin-card max-w-[640px] space-y-5 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      {editing && <input type="hidden" name="id" value={values.id} />}
      <FormError state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="admin-label">Name</span>
          <input name="name" defaultValue={values.name} className="admin-input" placeholder="e.g. Sokha" />
        </label>
        <label className="block">
          <span className="admin-label">
            Email <span className="text-red-600">*</span>
          </span>
          <input name="email" type="email" required defaultValue={values.email} aria-invalid={!!state?.fieldErrors?.email} className="admin-input" />
          <FieldError state={state} field="email" />
        </label>
      </div>

      <fieldset>
        <legend className="admin-label">Role</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <label
              key={r}
              className="flex cursor-pointer gap-2 rounded-lg p-3 ring-1 ring-black/10 has-[:checked]:bg-primary/5 has-[:checked]:ring-2 has-[:checked]:ring-primary"
            >
              <input type="radio" name="role" value={r} defaultChecked={values.role === r} className="mt-0.5 accent-[var(--color-primary)]" />
              <span>
                <span className="block text-[14px] font-semibold">{ROLE_LABELS[r].label}</span>
                <span className="block text-[12px] leading-snug text-[#777]">{ROLE_LABELS[r].description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="admin-label">
          {editing ? "Reset password" : "Password"} {!editing && <span className="text-red-600">*</span>}
        </span>
        <PasswordInput
          name="password"
          generator
          required={!editing}
          autoComplete="new-password"
          placeholder={editing ? "Leave blank to keep the current password" : "At least 10 characters"}
          invalid={!!state?.fieldErrors?.password}
        />
        <span className="mt-1 block text-[12px] text-[#999]">
          {editing ? "Setting a new password signs this user out of all devices." : "Share it with the user securely; they can change it under My account."}
        </span>
        <FieldError state={state} field="password" />
      </label>

      {editing && (
        <label className="flex items-start gap-2">
          <input type="checkbox" name="active" defaultChecked={values.active} disabled={isSelf} className="mt-1 size-4 accent-[var(--color-primary)]" />
          <span>
            <span className="block text-[14px] font-semibold">Active</span>
            <span className="block text-[12px] text-[#777]">
              {isSelf ? "You can't disable your own account." : "Disabled users can't sign in and are signed out immediately."}
            </span>
          </span>
          {isSelf && <input type="hidden" name="active" value="on" />}
        </label>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="admin-btn">
          {pending ? "Saving…" : editing ? "Save changes" : "Add user"}
        </button>
      </div>
    </form>
  );
}
