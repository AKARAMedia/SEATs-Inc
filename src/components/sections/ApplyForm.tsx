"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { applyAction, type ApplyState } from "@/app/[lang]/careers/actions";
import type { Lang } from "@/lib/i18n";

const T = {
  title: { en: "Apply for this position", ja: "この求人に応募する" },
  name: { en: "Name *", ja: "お名前 *" },
  email: { en: "Email *", ja: "メールアドレス *" },
  phone: { en: "Phone", ja: "電話番号" },
  message: { en: "Message (optional)", ja: "メッセージ（任意）" },
  cv: { en: "CV / Résumé (PDF, max 4 MB) *", ja: "履歴書（PDF・最大4MB）*" },
  choose: { en: "Choose PDF file", ja: "PDFファイルを選択" },
  submit: { en: "Send application", ja: "応募する" },
  sending: { en: "Sending…", ja: "送信中…" },
  privacy: {
    en: "Your details and CV are only used for recruiting at S.E.A.T.S Inc.",
    ja: "ご提供いただいた情報と履歴書は、S.E.A.T.S Inc.の採用目的にのみ使用します。",
  },
};

const input =
  "block h-[52px] w-full rounded-[9px] border border-[#d5e8ef] bg-[#dff3fb] px-[14px] font-[Arial,Helvetica,sans-serif] text-[17px] text-[#1687bd] outline-none transition-colors placeholder:text-[#1687bd] focus:border-[#1687bd] focus:bg-white";

export default function ApplyForm({ lang, job }: { lang: Lang; job: string }) {
  const [state, action, pending] = useActionState<ApplyState, FormData>(applyAction, { status: "idle" });
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const err = (k: "name" | "email" | "cv") =>
    state.fieldErrors?.[k] ? (
      <span role="alert" className="mt-1 block text-[14px] text-[#dc3232]">
        {state.fieldErrors[k]}
      </span>
    ) : null;

  if (state.status === "success")
    return (
      <div role="status" className="rounded-[15px] border-2 border-[#46b450] bg-white p-8 text-center text-[17px] text-[#2f7d32]">
        ✓ {state.message}
      </div>
    );

  return (
    <div className="rounded-[15px] border-2 border-[#e4f1f6] bg-white px-[18px] pb-8 pt-6 tablet:px-10">
      <h2 className="mb-4 text-[20px] font-bold text-[#1687bd]">{T.title[lang]}</h2>
      <form
        ref={formRef}
        // Submitted manually: a plain form action clears every field, even when there is an error to fix
        onSubmit={(e) => {
          e.preventDefault();
          if (file && file.size > 4 * 1024 * 1024) {
            setClientError(lang === "ja" ? "ファイルが大きすぎます（最大4MB）。" : "The file is too large (max 4 MB).");
            return;
          }
          const fd = new FormData(e.currentTarget);
          startTransition(() => action(fd));
        }}
        className="space-y-3"
      >
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="job" value={job} />
        <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
        <div>
          <input className={input} name="name" placeholder={T.name[lang]} aria-label={T.name[lang]} required autoComplete="name" maxLength={200} />
          {err("name")}
        </div>
        <div>
          <input className={input} type="email" name="email" placeholder={T.email[lang]} aria-label={T.email[lang]} required autoComplete="email" maxLength={320} />
          {err("email")}
        </div>
        <input className={input} type="tel" name="phone" placeholder={T.phone[lang]} aria-label={T.phone[lang]} autoComplete="tel" maxLength={50} />
        <textarea
          name="message"
          placeholder={T.message[lang]}
          aria-label={T.message[lang]}
          maxLength={5000}
          className="block h-[110px] w-full resize-y rounded-[9px] border border-[#8fc8e1] p-[14px] font-[Arial,Helvetica,sans-serif] text-[16px] text-[#1687bd] outline-none placeholder:text-[#1687bd] focus:border-[#1687bd]"
        />
        <div>
          <span className="mb-1 block text-[15px] font-bold text-[#1687bd]">{T.cv[lang]}</span>
          <label className="flex cursor-pointer items-center gap-3 rounded-[9px] border-2 border-dashed border-[#8fc8e1] px-4 py-3 text-[15px] text-[#1687bd] hover:border-[#1687bd]">
            <input
              type="file"
              name="cv"
              accept="application/pdf,.pdf"
              required
              className="sr-only"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setClientError(null);
              }}
            />
            <span className="rounded-full bg-[#91d6f2] px-3 py-1 font-bold text-[#087cb4]">{T.choose[lang]}</span>
            <span className="min-w-0 truncate">{file ? `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)` : ""}</span>
          </label>
          {clientError && <span className="mt-1 block text-[14px] text-[#dc3232]">{clientError}</span>}
          {err("cv")}
        </div>
        <p className="text-[13px] text-[#777]">{T.privacy[lang]}</p>
        <button
          type="submit"
          disabled={pending}
          className="block h-[56px] w-full rounded-[35px] bg-[#91d6f2] text-[19px] font-bold uppercase text-[#087cb4] transition hover:bg-[#72c8eb] disabled:opacity-70"
        >
          {pending ? T.sending[lang] : T.submit[lang]}
        </button>
        {state.status === "error" && state.message && (
          <p role="alert" className="rounded-[9px] border border-[#dc3232] px-4 py-3 text-[15px] text-[#dc3232]">
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
