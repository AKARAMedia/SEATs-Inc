"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { saveSettingsAction } from "@/app/admin/settings-actions";
import type { Settings } from "@/lib/settings-schema";
import ImageField from "../ImageField";
import { FormError } from "../ui/Field";
import { useUnsavedChanges } from "../ui/useUnsavedChanges";

type Home = Settings["home"];

/** Both forms save the whole "home" settings group, so each carries the other's values as hidden fields. */
function Hidden({ value, skip }: { value: Home; skip: "hero" | "news" }) {
  return (
    <>
      {skip !== "hero" && (
        <>
          <input type="hidden" name="heroTitle" value={value.heroTitle} />
          <input type="hidden" name="typingPrefix" value={value.typingPrefix} />
          <input type="hidden" name="typingWords" value={value.typingWords.join("\n")} />
          <input type="hidden" name="typingSuffix" value={value.typingSuffix} />
          <input type="hidden" name="tagline.en" value={value.tagline.en} />
          <input type="hidden" name="tagline.ja" value={value.tagline.ja} />
          <input type="hidden" name="mobileImage" value={value.mobileImage} />
        </>
      )}
      {skip !== "news" && value.pinnedPostIds.map((id, i) => <input key={id} type="hidden" name={`pinnedPostIds.${i}`} value={id} />)}
    </>
  );
}

function useSettingsForm(back: string) {
  const [state, action, pending] = useActionState(saveSettingsAction, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useUnsavedChanges(ref);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("_group", "home");
    fd.set("_back", back);
    startTransition(() => action(fd));
  };
  return { state, pending, ref, onSubmit };
}

export function HeroTextForm({ value, firstSlide }: { value: Home; firstSlide?: string }) {
  const { state, pending, ref, onSubmit } = useSettingsForm("/admin/home/");
  const [v, setV] = useState({ title: value.heroTitle, prefix: value.typingPrefix, words: value.typingWords.join("\n"), suffix: value.typingSuffix, tagline: value.tagline.en });
  const firstWord = v.words.split("\n").find((w) => w.trim()) ?? "";

  return (
    <form ref={ref} onSubmit={onSubmit} className="admin-card space-y-4 p-5">
      <h2 className="text-[15px] font-semibold">Text over the slider</h2>
      <FormError state={state} />
      <Hidden value={value} skip="hero" />

      {/* Live preview */}
      <div
        className="relative flex aspect-[21/9] flex-col items-center justify-center overflow-hidden rounded-lg bg-cover bg-center px-4 text-center text-white"
        style={{ backgroundImage: firstSlide ? `url(${firstSlide})` : undefined, backgroundColor: "#334" }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <p className="relative text-[clamp(22px,4vw,40px)] font-bold leading-tight">{v.title}</p>
        <p className="relative text-[clamp(12px,1.6vw,16px)] font-semibold">
          {v.prefix}
          <span className="underline decoration-2 underline-offset-4">{firstWord}</span>
          {v.suffix}
        </p>
        <p className="relative mt-2 text-[clamp(14px,2.4vw,24px)] font-bold">{v.tagline}</p>
        <span className="absolute bottom-2 right-3 text-[11px] text-white/70">Preview</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="admin-label">Big title</span>
          <input name="heroTitle" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} required className="admin-input" />
        </label>
        <label className="block">
          <span className="admin-label">Typing words (one per line)</span>
          <textarea name="typingWords" rows={4} value={v.words} onChange={(e) => setV({ ...v, words: e.target.value })} className="admin-input" />
          <span className="mt-1 block text-[12px] text-[#999]">Typed one after another between the text before and after.</span>
        </label>
        <label className="block">
          <span className="admin-label">Text before the typing words</span>
          <input name="typingPrefix" value={v.prefix} onChange={(e) => setV({ ...v, prefix: e.target.value })} className="admin-input" />
        </label>
        <label className="block">
          <span className="admin-label">Text after the typing words</span>
          <input name="typingSuffix" value={v.suffix} onChange={(e) => setV({ ...v, suffix: e.target.value })} className="admin-input" />
        </label>
      </div>
      <fieldset>
        <legend className="admin-label">Tagline</legend>
        <div className="grid gap-3 md:grid-cols-2">
          <input name="tagline.en" value={v.tagline} onChange={(e) => setV({ ...v, tagline: e.target.value })} className="admin-input" aria-label="Tagline in English" />
          <input name="tagline.ja" defaultValue={value.tagline.ja} lang="ja" className="admin-input" aria-label="Tagline in Japanese" />
        </div>
      </fieldset>
      <div className="max-w-[280px]">
        <span className="admin-label">Background on phones</span>
        <ImageField name="mobileImage" defaultValue={value.mobileImage} aspect="aspect-[9/16]" />
        <p className="mt-1 text-[12px] text-[#999]">Phones show this one portrait-friendly image instead of the slides.</p>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="admin-btn">
          {pending ? "Saving…" : "Save text"}
        </button>
      </div>
    </form>
  );
}

type PostOption = { id: number; title: string; date: string };

export function PinnedNewsForm({ value, posts, latest }: { value: Home; posts: PostOption[]; latest: PostOption[] }) {
  const { state, pending, ref, onSubmit } = useSettingsForm("/admin/home/?tab=news");
  const [pins, setPins] = useState<number[]>(value.pinnedPostIds.filter((id) => posts.some((p) => p.id === id)));
  const [q, setQ] = useState("");
  const byId = new Map(posts.map((p) => [p.id, p]));
  const result = [...pins.map((id) => byId.get(id)!), ...latest.filter((l) => !pins.includes(l.id))].slice(0, 3);
  const matches = posts.filter((p) => !pins.includes(p.id) && p.title.toLowerCase().includes(q.toLowerCase())).slice(0, 8);

  return (
    <form ref={ref} onSubmit={onSubmit} className="admin-card max-w-[860px] space-y-5 p-5">
      <FormError state={state} />
      <Hidden value={value} skip="news" />
      {pins.map((id, i) => (
        <input key={id} type="hidden" name={`pinnedPostIds.${i}`} value={id} />
      ))}

      <div>
        <h2 className="text-[15px] font-semibold">What the home page shows</h2>
        <p className="mb-3 text-[13px] text-[#888]">Three news cards: pinned posts first, then the newest posts.</p>
        <ol className="grid gap-2 sm:grid-cols-3">
          {result.map((p, i) => (
            <li key={p.id} className={`rounded-lg p-3 text-[13px] ring-1 ${pins.includes(p.id) ? "bg-primary/5 ring-primary/40" : "ring-black/10"}`}>
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#999]">
                {i + 1}. {pins.includes(p.id) ? "📌 Pinned" : "Newest"}
              </span>
              <span className="line-clamp-3 text-[#333]">{p.title}</span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="admin-label">Pinned posts ({pins.length}/3)</h3>
        {pins.length ? (
          <ul className="space-y-1.5">
            {pins.map((id, i) => (
              <li key={id} className="flex items-center gap-2 rounded-md bg-[#fafbfc] px-3 py-2 text-[13px] ring-1 ring-black/5">
                <span className="min-w-0 flex-1 truncate">{byId.get(id)?.title}</span>
                <button type="button" disabled={i === 0} onClick={() => setPins((p) => [...p.slice(0, i - 1), p[i], p[i - 1], ...p.slice(i + 1)])} className="admin-btn-secondary !px-2 !py-0.5 text-[12px] disabled:opacity-30" aria-label="Move up">
                  ↑
                </button>
                <button type="button" onClick={() => setPins((p) => p.filter((x) => x !== id))} className="admin-btn-secondary !px-2 !py-0.5 text-[12px] !text-red-600">
                  Unpin
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-[#999]">Nothing pinned — the home page shows the three newest posts.</p>
        )}
      </div>

      {pins.length < 3 && (
        <div>
          <label className="admin-label" htmlFor="pin-search">
            Pin a post
          </label>
          <input id="pin-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search published posts…" className="admin-input" />
          <ul className="mt-1.5 divide-y divide-black/5 rounded-md ring-1 ring-black/10">
            {matches.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => setPins((x) => [...x, p.id])} className="flex w-full items-center gap-3 px-3 py-2 text-left text-[13px] hover:bg-primary/5">
                  <span className="min-w-0 flex-1 truncate">{p.title}</span>
                  <span className="shrink-0 text-[12px] text-[#999]">{p.date}</span>
                  <span className="shrink-0 font-semibold text-primary">📌 Pin</span>
                </button>
              </li>
            ))}
            {!matches.length && <li className="px-3 py-2 text-[13px] text-[#999]">No matching posts.</li>}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="admin-btn">
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
