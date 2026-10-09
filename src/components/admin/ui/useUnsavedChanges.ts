"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { confirmDialog } from "./confirm";

function snapshot(form: HTMLFormElement) {
  const parts: string[] = [];
  for (const [k, v] of new FormData(form)) parts.push(`${k}=${typeof v === "string" ? v : v.name}`);
  return parts.join("&");
}

/**
 * Warns before leaving a form with unsaved edits — on tab close/reload and on in-app link clicks.
 * Dirty = current form data differs from what it was right after mount, so it also catches
 * hidden inputs driven by rich-text and image widgets. Saving redirects via the server action,
 * which is neither an unload nor a link click, so it is never blocked.
 */
export function useUnsavedChanges(formRef: React.RefObject<HTMLFormElement | null>) {
  const initial = useRef<string | null>(null);
  const bypass = useRef(false);
  const router = useRouter();

  const isDirty = useCallback(() => {
    const form = formRef.current;
    if (!form || bypass.current || initial.current === null) return false;
    return snapshot(form) !== initial.current;
  }, [formRef]);

  useEffect(() => {
    // Let widgets settle their initial hidden values first
    const t = setTimeout(() => formRef.current && (initial.current = snapshot(formRef.current)), 300);

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) e.preventDefault();
    };
    const onClick = async (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      if (!isDirty()) return;
      e.preventDefault();
      e.stopPropagation();
      const leave = await confirmDialog({
        title: "Leave without saving?",
        message: "You have unsaved changes on this page. They will be lost.",
        confirmLabel: "Leave page",
        cancelLabel: "Stay",
        danger: true,
      });
      if (leave) {
        bypass.current = true;
        router.push(url.pathname + url.search + url.hash);
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [formRef, isDirty, router]);

  return { isDirty };
}
