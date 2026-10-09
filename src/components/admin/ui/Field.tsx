import type { FormState } from "@/app/admin/actions";

export function FieldError({ state, field }: { state: FormState; field: string }) {
  const msg = state?.fieldErrors?.[field];
  return msg ? <p className="mt-1 text-[12px] text-red-600">{msg}</p> : null;
}

export function FormError({ state }: { state: FormState }) {
  return state?.error ? (
    <p role="alert" className="rounded-md bg-red-50 px-4 py-2.5 text-[13px] text-red-700 ring-1 ring-red-200">
      {state.error}
    </p>
  ) : null;
}
