"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { saveSettingsAction } from "@/app/admin/settings-actions";
import type { FormState } from "@/app/admin/actions";
import { SOCIAL_LABELS, SOCIAL_NETWORKS, type Settings } from "@/lib/settings-schema";
import { SocialIcon } from "@/components/icons";
import ImageField from "./ImageField";
import { FormError } from "./ui/Field";
import { useUnsavedChanges } from "./ui/useUnsavedChanges";

type L = { en: string; ja: string };

function Shell({ group, children, note }: { group: keyof Settings; children: (state: FormState) => React.ReactNode; note?: string }) {
  const [state, action, pending] = useActionState(saveSettingsAction, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useUnsavedChanges(ref);
  return (
    <form
      ref={ref}
      className="admin-card max-w-[860px]"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      <input type="hidden" name="_group" value={group} />
      <div className="space-y-5 p-5">
        <FormError state={state} />
        {children(state)}
      </div>
      <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-b-[10px] border-t border-black/10 bg-white/95 px-5 py-3 backdrop-blur">
        {note && <span className="mr-auto text-[12px] text-[#999]">{note}</span>}
        <button type="submit" disabled={pending} className="admin-btn min-w-[140px]">
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

const err = (state: FormState, name: string) => state?.fieldErrors?.[name];

function Text({
  state,
  name,
  label,
  defaultValue,
  hint,
  type = "text",
  ...rest
}: { state: FormState; name: string; label: string; defaultValue: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const e = err(state, name);
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      <input {...rest} type={type} name={name} defaultValue={defaultValue} aria-invalid={!!e} className="admin-input" />
      {e ? <span className="mt-1 block text-[12px] text-red-600">{e}</span> : hint && <span className="mt-1 block text-[12px] text-[#999]">{hint}</span>}
    </label>
  );
}

/** English + Japanese inputs side by side (stacked on phones). */
function Pair({ state, name, label, value, rows, hint, maxLength }: { state: FormState; name: string; label: string; value: L; rows?: number; hint?: string; maxLength?: number }) {
  return (
    <fieldset>
      <legend className="admin-label">{label}</legend>
      <div className="grid gap-3 md:grid-cols-2">
        {(["en", "ja"] as const).map((lang) => {
          const n = `${name}.${lang}`;
          const e = err(state, n);
          const props = { name: n, defaultValue: value[lang], "aria-invalid": !!e, lang, maxLength, className: "admin-input" };
          return (
            <label key={lang} className="block">
              <span className="mb-1 flex items-center gap-1.5 text-[12px] text-[#888]">
                <span className="rounded bg-[#eef6fc] px-1.5 py-0.5 text-[10px] font-bold text-primary">{lang.toUpperCase()}</span>
                {lang === "en" ? "English" : "日本語"}
              </span>
              {rows ? <textarea rows={rows} {...props} /> : <input {...props} />}
              {e && <span className="mt-1 block text-[12px] text-red-600">{e}</span>}
            </label>
          );
        })}
      </div>
      {hint && <p className="mt-1 text-[12px] text-[#999]">{hint}</p>}
    </fieldset>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-t border-black/5 pt-5 first:border-0 first:pt-0">
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[#999]">{title}</h3>
      {children}
    </section>
  );
}

// ---------- tabs ----------

export function CompanyForm({ value }: { value: Settings["company"] }) {
  return (
    <Shell group="company" note="Shown in the footer, on the Contact page and in the header map link.">
      {(s) => (
        <>
          <Section title="Phone & hours">
            <div className="grid gap-4 md:grid-cols-2">
              <Text state={s} name="phone" label="Phone number" defaultValue={value.phone} hint="Shown as written; the call link uses the digits." />
            </div>
            <Pair state={s} name="phoneNote" label="Phone note" value={value.phoneNote} hint="e.g. languages spoken on the phone" />
            <Pair state={s} name="businessDays" label="Business days" value={value.businessDays} />
          </Section>
          <Section title="Email">
            <div className="grid gap-4 md:grid-cols-2">
              <Text state={s} type="email" name="inquiryEmail" label="General inquiries" defaultValue={value.inquiryEmail} />
              <Text state={s} type="email" name="recruitEmail" label="Recruiting" defaultValue={value.recruitEmail} />
            </div>
          </Section>
          <Section title="Address">
            <Pair state={s} name="address" label="Office address" value={value.address} rows={2} />
            <Text state={s} type="url" name="mapUrl" label="Google Maps link" defaultValue={value.mapUrl} hint="Open the office in Google Maps → Share → Copy link." />
          </Section>
        </>
      )}
    </Shell>
  );
}

export function SocialForm({ value }: { value: Settings["social"] }) {
  const nextId = useRef(value.links.length);
  const [links, setLinks] = useState(value.links.map((l, i) => ({ ...l, id: i })));
  const move = (i: number, d: number) =>
    setLinks((ls) => {
      const n = [...ls];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });

  return (
    <Shell group="social" note="Icons appear in the website header in this order.">
      {(s) => (
        <div className="space-y-2">
          {links.map((l, i) => {
            const e = err(s, `links.${i}.url`);
            return (
              <div key={l.id} className="flex flex-wrap items-center gap-2 rounded-lg p-2 ring-1 ring-black/10">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-black/5 text-[#444]">
                  <SocialIcon name={l.network} className="size-4" />
                </span>
                <select
                  name={`links.${i}.network`}
                  value={l.network}
                  onChange={(ev) => setLinks((ls) => ls.map((x) => (x.id === l.id ? { ...x, network: ev.target.value as typeof l.network } : x)))}
                  className="admin-input !w-[150px]"
                  aria-label="Network"
                >
                  {SOCIAL_NETWORKS.map((n) => (
                    <option key={n} value={n}>
                      {SOCIAL_LABELS[n]}
                    </option>
                  ))}
                </select>
                <input
                  name={`links.${i}.url`}
                  defaultValue={l.url}
                  type="url"
                  placeholder="https://…"
                  aria-invalid={!!e}
                  aria-label={`${SOCIAL_LABELS[l.network]} link`}
                  className="admin-input min-w-[200px] flex-1"
                />
                <div className="flex gap-1">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="admin-btn-secondary !px-2.5 !py-1.5 disabled:opacity-30" aria-label="Move up">
                    ↑
                  </button>
                  <button type="button" disabled={i === links.length - 1} onClick={() => move(i, 1)} className="admin-btn-secondary !px-2.5 !py-1.5 disabled:opacity-30" aria-label="Move down">
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinks((ls) => ls.filter((x) => x.id !== l.id))}
                    className="admin-btn-secondary !px-2.5 !py-1.5 !text-red-600"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
                {e && <p className="w-full pl-11 text-[12px] text-red-600">{e}</p>}
              </div>
            );
          })}
          {!links.length && <p className="rounded-lg bg-[#fafbfc] p-6 text-center text-[13px] text-[#999]">No social links. The header will show none.</p>}
          {links.length < 12 && (
            <button
              type="button"
              onClick={() => setLinks((ls) => [...ls, { network: "facebook", url: "", id: nextId.current++ }])}
              className="admin-btn-secondary"
            >
              + Add link
            </button>
          )}
        </div>
      )}
    </Shell>
  );
}

function SnippetPreview({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg bg-[#fafbfc] p-4 ring-1 ring-black/5">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#999]">Google preview</p>
      <p className="text-[12px] text-[#4d5156]">seats-inc.com</p>
      <p className="truncate text-[18px] leading-snug text-[#1a0dab]">{title || "—"}</p>
      <p className="line-clamp-2 text-[13px] text-[#4d5156]">{description || "—"}</p>
    </div>
  );
}

export function SeoForm({ value }: { value: Settings["seo"] }) {
  const [title, setTitle] = useState(value.siteTitle);
  const [desc, setDesc] = useState(value.description);
  return (
    <Shell group="seo" note="Used by Google and when links are shared on Facebook, Telegram, etc.">
      {(s) => (
        <>
          <label className="block">
            <span className="admin-label">Site name</span>
            <input name="siteTitle" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} className="admin-input" />
            <span className="mt-1 block text-[12px] text-[#999]">Added after each page title, e.g. “Overview - {title}”.</span>
          </label>
          <fieldset>
            <legend className="admin-label">Site description</legend>
            <div className="grid gap-3 md:grid-cols-2">
              {(["en", "ja"] as const).map((lang) => {
                const len = desc[lang].length;
                const limit = lang === "en" ? 160 : 90;
                return (
                  <label key={lang} className="block">
                    <span className="mb-1 flex items-center gap-1.5 text-[12px] text-[#888]">
                      <span className="rounded bg-[#eef6fc] px-1.5 py-0.5 text-[10px] font-bold text-primary">{lang.toUpperCase()}</span>
                      <span className="flex-1">{lang === "en" ? "English" : "日本語"}</span>
                      <span className={len > limit ? "font-semibold text-amber-600" : ""}>
                        {len} / {limit}
                      </span>
                    </span>
                    <textarea
                      name={`description.${lang}`}
                      rows={3}
                      lang={lang}
                      value={desc[lang]}
                      onChange={(e) => setDesc((d) => ({ ...d, [lang]: e.target.value }))}
                      className="admin-input"
                    />
                  </label>
                );
              })}
            </div>
            <p className="mt-1 text-[12px] text-[#999]">Search engines usually show about 160 English or 90 Japanese characters.</p>
          </fieldset>
          <div className="grid gap-4 md:grid-cols-2">
            <SnippetPreview title={title} description={desc.en} />
            <SnippetPreview title={title} description={desc.ja} />
          </div>
          <div className="max-w-[360px]">
            <span className="admin-label">Share image</span>
            <ImageField name="shareImage" defaultValue={value.shareImage} />
            <p className="mt-1 text-[12px] text-[#999]">Shown when the site is shared on social media. Best size: 1200 × 630 px. News posts use their own image.</p>
            {err(s, "shareImage") && <p className="text-[12px] text-red-600">{err(s, "shareImage")}</p>}
          </div>
        </>
      )}
    </Shell>
  );
}

export function ContactSettingsForm({ value, emailReady }: { value: Settings["contact"]; emailReady: boolean }) {
  const [autoReply, setAutoReply] = useState(value.autoReply);
  return (
    <Shell group="contact">
      {(s) => (
        <>
          {!emailReady && (
            <p className="rounded-md bg-amber-50 px-4 py-3 text-[13px] text-amber-800 ring-1 ring-amber-200">
              <strong>Email sending is not set up yet.</strong> Messages are still saved in the admin Inbox. To also send the emails below, add{" "}
              <code className="rounded bg-white/70 px-1">RESEND_API_KEY</code> and <code className="rounded bg-white/70 px-1">EMAIL_FROM</code> in the Vercel project settings.
            </p>
          )}
          <Section title="Notifications">
            <label className="block">
              <span className="admin-label">Send new messages to</span>
              <textarea
                name="notifyEmails"
                rows={3}
                defaultValue={value.notifyEmails.join("\n")}
                placeholder={"general@seats-inc.com\nmanager@seats-inc.com"}
                aria-invalid={Object.keys(s?.fieldErrors ?? {}).some((k) => k.startsWith("notifyEmails"))}
                className="admin-input font-mono text-[13px]"
              />
              <span className="mt-1 block text-[12px] text-[#999]">One email address per line (up to 10). Replying to the notification replies to the visitor.</span>
              {Object.entries(s?.fieldErrors ?? {})
                .filter(([k]) => k.startsWith("notifyEmails"))
                .slice(0, 1)
                .map(([k, m]) => (
                  <span key={k} className="mt-1 block text-[12px] text-red-600">
                    {m}
                  </span>
                ))}
            </label>
          </Section>
          <Section title="Automatic reply">
            <label className="flex items-start gap-3">
              <input type="checkbox" name="autoReply" checked={autoReply} onChange={(e) => setAutoReply(e.target.checked)} className="mt-1 size-4 accent-[var(--color-primary)]" />
              <span>
                <span className="block text-[14px] font-semibold">Send an automatic reply to the visitor</span>
                <span className="block text-[12px] text-[#777]">Sent in the language of the page they used (English or Japanese).</span>
              </span>
            </label>
            <div className={autoReply ? "space-y-4" : "pointer-events-none space-y-4 opacity-50"} aria-disabled={!autoReply}>
              <Pair state={s} name="autoReplySubject" label="Subject" value={value.autoReplySubject} />
              <Pair state={s} name="autoReplyBody" label="Message" value={value.autoReplyBody} rows={7} hint="{name} is replaced with the visitor's name." />
            </div>
          </Section>
        </>
      )}
    </Shell>
  );
}

export function MaintenanceForm({ value }: { value: Settings["maintenance"] }) {
  const [on, setOn] = useState(value.enabled);
  return (
    <Shell group="maintenance">
      {(s) => (
        <>
          <label className={`flex cursor-pointer items-start gap-4 rounded-lg p-4 ring-1 ${on ? "bg-red-50 ring-red-200" : "ring-black/10"}`}>
            <span className="relative mt-0.5 inline-flex">
              <input type="checkbox" name="enabled" checked={on} onChange={(e) => setOn(e.target.checked)} className="peer sr-only" />
              <span className="h-6 w-11 rounded-full bg-black/20 transition-colors peer-checked:bg-red-600 peer-focus-visible:ring-2 peer-focus-visible:ring-primary" />
              <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold">{on ? "Maintenance mode is ON" : "Maintenance mode is off"}</span>
              <span className="block text-[13px] text-[#666]">
                {on
                  ? "After saving, every public page shows the message below instead of its content. The admin panel keeps working."
                  : "Turn on while making big changes. Visitors will see the message below on every page."}
              </span>
            </span>
          </label>
          <Pair state={s} name="message" label="Message shown to visitors" value={value.message} rows={3} />
        </>
      )}
    </Shell>
  );
}

export function CareerHrContactForm({ value }: { value: Settings["careerHrContact"] }) {
  return (
    <Shell group="careerHrContact" note="Shown on every seatsinc-career.com job detail page. No photo is shown, by design.">
      {(s) => (
        <div className="grid gap-4 md:grid-cols-2">
          <Text state={s} name="name" label="Name" defaultValue={value.name} />
          <Text state={s} type="email" name="email" label="Email" defaultValue={value.email} />
          <Text state={s} name="phone" label="Phone" defaultValue={value.phone} />
          <Text state={s} name="address" label="Address" defaultValue={value.address} />
        </div>
      )}
    </Shell>
  );
}
