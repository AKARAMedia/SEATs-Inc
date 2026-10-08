"use client";

import { startTransition, useActionState } from "react";
import { loginAction } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form
      className="space-y-4"
      // Submit manually so a failed attempt doesn't reset the email field
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      <label className="block">
        <span className="mb-1 block text-[13px] font-semibold">Email</span>
        <input name="email" type="email" required autoComplete="username" className="admin-input" />
      </label>
      <label className="block">
        <span className="mb-1 block text-[13px] font-semibold">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="admin-input" />
      </label>
      {state?.error && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="admin-btn w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
