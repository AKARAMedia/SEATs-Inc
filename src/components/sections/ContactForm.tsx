"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContact, type ContactState } from "@/app/[lang]/contact/actions";
import { CONTACT } from "@/content/pages/contact";
import type { Lang } from "@/lib/i18n";

const input =
  "block h-[58px] w-full rounded-[9px] border border-[#d5e8ef] bg-[#dff3fb] px-[14px] font-[Arial,Helvetica,sans-serif] text-[17px] text-[#1687bd] outline-none transition-colors placeholder:text-[#1687bd] placeholder:opacity-100 focus:border-[#1687bd] focus:bg-white tablet:h-[67px] tablet:text-[20px]";

export default function ContactForm({ lang }: { lang: Lang }) {
  const f = CONTACT.form;
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const err = (k: "name" | "email" | "message") =>
    state.fieldErrors?.[k] ? (
      <span role="alert" className="mt-1 block text-[14px] text-[#dc3232]">
        {state.fieldErrors[k]}
      </span>
    ) : null;

  return (
    <div className="mx-auto w-full max-w-[675px] rounded-[15px] border-2 border-[#e4f1f6] bg-white px-[18px] pb-10 pt-[22px] tablet:rounded-[18px] tablet:px-[44px] tablet:pb-[58px] tablet:pt-[25px]">
      <div className="mb-[14px] text-[19px] font-bold leading-[1.3] text-[#1687bd] tablet:text-[20px]">{f.title[lang]}</div>
      <form ref={formRef} action={action} noValidate={false}>
        <input type="hidden" name="lang" value={lang} />
        {/* Honeypot */}
        <input
          type="checkbox"
          name="botcheck"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />
        <div className="mb-3">
          <input className={input} type="text" name="name" placeholder={f.name[lang]} aria-label={f.name[lang]} required autoComplete="name" maxLength={200} />
          {err("name")}
        </div>
        <div className="mb-3">
          <input className={input} type="email" name="email" placeholder={f.email[lang]} aria-label={f.email[lang]} required autoComplete="email" maxLength={320} />
          {err("email")}
        </div>
        <div className="mb-3">
          <input className={input} type="text" name="company" placeholder={f.company[lang]} aria-label={f.company[lang]} autoComplete="organization" maxLength={200} />
        </div>
        <div className="mb-8 mt-[38px] tablet:mt-12">
          <label htmlFor="contact-message" className="mb-[14px] block text-[19px] font-bold leading-[1.3] text-[#1687bd] tablet:text-[20px]">
            {f.message[lang]}
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            maxLength={5000}
            className="block h-[120px] min-h-[120px] w-full resize-y rounded-[9px] border border-[#8fc8e1] bg-white p-[14px] font-[Arial,Helvetica,sans-serif] text-[17px] text-[#1687bd] outline-none focus:border-[#1687bd] tablet:h-[110px] tablet:min-h-[110px] tablet:text-[20px]"
          />
          {err("message")}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="block h-[58px] w-full cursor-pointer rounded-[35px] bg-[#91d6f2] text-center font-[Arial,Helvetica,sans-serif] text-[21px] font-bold uppercase leading-[58px] text-[#087cb4] transition hover:bg-[#72c8eb] hover:text-[#0872a8] active:scale-[0.99] disabled:opacity-70 tablet:h-[65px] tablet:text-[24px] tablet:leading-[65px]"
        >
          {pending ? f.sending[lang] : f.submit[lang]}
        </button>
        {state.message && (
          <p
            role="status"
            className={`mt-5 rounded-[9px] border px-4 py-3 text-[16px] ${
              state.status === "success" ? "border-[#46b450] text-[#2f7d32]" : "border-[#dc3232] text-[#dc3232]"
            }`}
          >
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
