"use client";

import { startTransition, useEffect, useRef, useSyncExternalStore } from "react";

type Options = {
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};
type Pending = Options & { resolve: (ok: boolean) => void };

let pending: Pending | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Promise-based replacement for window.confirm, rendered by <ConfirmHost />. */
export function confirmDialog(options: Options): Promise<boolean> {
  pending?.resolve(false);
  return new Promise((resolve) => {
    pending = { ...options, resolve };
    emit();
  });
}

function close(ok: boolean) {
  pending?.resolve(ok);
  pending = null;
  emit();
}

export function ConfirmHost() {
  const current = useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => pending,
    () => null,
  );
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (current && !d.open) d.showModal();
    if (!current && d.open) d.close();
  }, [current]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        close(false);
      }}
      onClick={(e) => e.target === e.currentTarget && close(false)}
      className="admin-dialog m-auto w-[calc(100%-32px)] max-w-[420px] rounded-xl bg-white p-0 shadow-2xl backdrop:bg-black/40"
    >
      {current && (
        <div className="p-6">
          <h2 className="text-[17px] font-semibold text-[#222]">{current.title}</h2>
          {current.message && <div className="mt-2 text-[14px] leading-relaxed text-[#555]">{current.message}</div>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="admin-btn-secondary" onClick={() => close(false)}>
              {current.cancelLabel ?? "Cancel"}
            </button>
            <button
              type="button"
              autoFocus
              className={`admin-btn ${current.danger ? "!bg-red-600 hover:!bg-red-700" : ""}`}
              onClick={() => close(true)}
            >
              {current.confirmLabel ?? "Confirm"}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

/** A form that asks for confirmation before calling its server action. */
export function ConfirmForm({
  action,
  confirm,
  fields,
  className,
  children,
}: {
  action: (formData: FormData) => unknown;
  confirm: Options;
  fields?: Record<string, string | number>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      className={className}
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        if (await confirmDialog(confirm)) startTransition(() => void action(data));
      }}
    >
      {fields && Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {children}
    </form>
  );
}
