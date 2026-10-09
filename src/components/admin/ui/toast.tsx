"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Toast = { id: number; message: string; kind: "success" | "error" | "info" };

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(message: string, kind: Toast["kind"] = "success") {
  const id = nextId++;
  toasts = [...toasts, { id, message, kind }];
  emit();
  setTimeout(() => dismiss(id), kind === "error" ? 7000 : 4000);
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

const EMPTY: Toast[] = [];

export function Toaster() {
  const list = useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => toasts,
    () => EMPTY,
  );
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
      {list.map((t) => (
        <div
          key={t.id}
          role={t.kind === "error" ? "alert" : "status"}
          className={`admin-toast pointer-events-auto flex max-w-[480px] items-center gap-3 rounded-lg px-4 py-3 text-[14px] text-white shadow-lg ${
            t.kind === "error" ? "bg-red-600" : t.kind === "info" ? "bg-[#333]" : "bg-[#16a34a]"
          }`}
        >
          <span aria-hidden>{t.kind === "error" ? "⚠" : t.kind === "info" ? "ℹ" : "✓"}</span>
          <span className="flex-1">{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// Messages for ?flash=<key> set by server actions before redirecting
const FLASH: Record<string, [string, Toast["kind"]]> = {
  saved: ["Saved. Changes are live on the site.", "success"],
  created: ["Post created.", "success"],
  deleted: ["Post deleted.", "success"],
  msgDeleted: ["Message deleted.", "success"],
  forbidden: ["You don't have permission to open that page.", "error"],
  userCreated: ["User added.", "success"],
  userSaved: ["User updated.", "success"],
  userDeleted: ["User deleted.", "success"],
  passwordChanged: ["Password changed. Other devices were signed out.", "success"],
  profileSaved: ["Profile saved.", "success"],
  sessionsEnded: ["Signed out of all other devices.", "success"],
};

/** Shows a toast for ?flash=… and removes the parameter from the URL. */
export function FlashToast() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const flash = sp.get("flash");
  const shown = useRef<string | null>(null);

  useEffect(() => {
    // Reset once the param is gone so the same flash can show again later
    if (!flash) return void (shown.current = null);
    if (shown.current === flash) return;
    shown.current = flash;
    const entry = FLASH[flash];
    if (entry) toast(...entry);
    const rest = new URLSearchParams(sp);
    rest.delete("flash");
    const qs = rest.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [flash, sp, router, pathname]);

  return null;
}
