"use client";

import { startTransition, useActionState } from "react";
import { changePasswordAction, updateProfileAction } from "@/app/admin/user-actions";
import { FieldError, FormError } from "./ui/Field";
import PasswordInput from "./PasswordInput";

function useForm(fn: typeof updateProfileAction) {
  const [state, action, pending] = useActionState(fn, undefined);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };
  return { state, pending, onSubmit };
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const { state, pending, onSubmit } = useForm(updateProfileAction);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormError state={state} />
      <label className="block">
        <span className="admin-label">Name</span>
        <input name="name" defaultValue={name} className="admin-input" />
      </label>
      <label className="block">
        <span className="admin-label">Email</span>
        <input value={email} disabled className="admin-input !bg-black/[0.03] text-[#777]" />
        <span className="mt-1 block text-[12px] text-[#999]">Ask an Admin to change your email.</span>
      </label>
      <button type="submit" disabled={pending} className="admin-btn">
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const { state, pending, onSubmit } = useForm(changePasswordAction);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormError state={state} />
      <label className="block">
        <span className="admin-label">Current password</span>
        <PasswordInput name="current" required autoComplete="current-password" invalid={!!state?.fieldErrors?.current} />
        <FieldError state={state} field="current" />
      </label>
      <label className="block">
        <span className="admin-label">New password</span>
        <PasswordInput name="next" required minLength={10} autoComplete="new-password" placeholder="At least 10 characters" invalid={!!state?.fieldErrors?.next} />
        <FieldError state={state} field="next" />
      </label>
      <label className="block">
        <span className="admin-label">Confirm new password</span>
        <PasswordInput name="confirm" required autoComplete="new-password" invalid={!!state?.fieldErrors?.confirm} />
        <FieldError state={state} field="confirm" />
      </label>
      <button type="submit" disabled={pending} className="admin-btn">
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
