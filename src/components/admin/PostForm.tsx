"use client";

import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";
import { saveEnglishAction, saveJapaneseAction, type FormState } from "@/app/admin/actions";
import RichTextEditor from "./RichTextEditor";
import ImageField from "./ImageField";
import { useUnsavedChanges } from "./ui/useUnsavedChanges";

export type PostFormValues = {
  id?: number;
  slug: string;
  titleEn: string;
  titleJa: string;
  excerptEn: string;
  excerptJa: string;
  bodyEn: string;
  bodyJa: string;
  categoryId: number | null;
  imageUrl: string;
  publishedAt: string; // yyyy-MM-ddTHH:mm in Cambodia time
  published: boolean;
};

type Category = { id: number; nameEn: string };

function Err({ state, field }: { state: FormState; field: string }) {
  const msg = state?.fieldErrors?.[field];
  return msg ? <p className="mt-1 text-[12px] text-red-600">{msg}</p> : null;
}

/** Draft / Publish choice plus date; a future date with "Publish" means scheduled. */
function PublishControls({ published, publishedAt, error }: { published: boolean; publishedAt: string; error?: string }) {
  const [pub, setPub] = useState(published);
  const [date, setDate] = useState(publishedAt);
  const [now] = useState(Date.now);
  const when = new Date(`${date}:00+07:00`);
  const scheduled = pub && !Number.isNaN(when.getTime()) && when.getTime() > now;
  const label = when.toLocaleString("en-GB", { timeZone: "Asia/Phnom_Penh", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <>
      <div>
        <span className="admin-label">Status</span>
        <div className="grid grid-cols-2 rounded-md bg-black/5 p-1">
          {[false, true].map((v) => (
            <label key={String(v)} className={`cursor-pointer rounded px-2 py-1.5 text-center text-[13px] font-semibold ${pub === v ? "bg-white text-[#222] shadow-sm" : "text-[#666]"}`}>
              <input type="radio" name="published" value={v ? "on" : ""} checked={pub === v} onChange={() => setPub(v)} className="sr-only" />
              {v ? "Publish" : "Draft"}
            </label>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="admin-label">{pub ? "Publish date & time" : "Date"} (Cambodia time)</span>
        <input type="datetime-local" name="publishedAt" value={date} onChange={(e) => setDate(e.target.value)} required aria-invalid={!!error} className="admin-input" />
        {error && <p className="mt-1 text-[12px] text-red-600">{error}</p>}
      </label>
      <p
        className={`rounded-md px-3 py-2 text-[12px] ${scheduled ? "bg-sky-50 text-sky-800 ring-1 ring-sky-200" : pub ? "bg-green-50 text-green-800" : "bg-black/[0.03] text-[#666]"}`}
      >
        {scheduled ? (
          <>
            ⏰ <strong>Scheduled</strong> — goes live automatically on {label}.
          </>
        ) : pub ? (
          "● Visible on the website after saving."
        ) : (
          "Not visible on the website. Use Preview to check it."
        )}
      </p>
    </>
  );
}

/** English shown as reference for translators (not part of the form). */
function ReadOnlyEnglish({ values }: { values: PostFormValues }) {
  return (
    <>
      <div>
        <span className="admin-label">Title</span>
        <p className="rounded-md bg-[#f7f8fa] px-3 py-2 text-[16px]">{values.titleEn}</p>
      </div>
      {values.excerptEn && (
        <div>
          <span className="admin-label">Excerpt</span>
          <p className="whitespace-pre-wrap rounded-md bg-[#f7f8fa] px-3 py-2">{values.excerptEn}</p>
        </div>
      )}
      <div>
        <span className="admin-label">Body</span>
        <div className="prose-seats max-h-[640px] overflow-y-auto rounded-md bg-[#f7f8fa] px-4 py-3" dangerouslySetInnerHTML={{ __html: values.bodyEn }} />
      </div>
    </>
  );
}

/**
 * mode="translate" (Translator role): English is read-only and only the JP fields are submitted.
 * mode="full": English and Japanese are edited and saved independently (one language's tab is active
 * at a time) so a save only sanitizes and writes the one body that changed - saving both together in one
 * request was enough CPU work to risk Cloudflare's free-plan 10ms-per-request limit (error 1102) on
 * image-heavy posts.
 */
export default function PostForm({ values, categories, mode = "full" }: { values: PostFormValues; categories: Category[]; mode?: "full" | "translate" }) {
  const translateOnly = mode === "translate";
  const [stateEn, actionEn, pendingEn] = useActionState(saveEnglishAction, undefined);
  const [stateJa, actionJa, pendingJa] = useActionState(saveJapaneseAction, undefined);
  const [tab, setTab] = useState<"en" | "ja">(translateOnly ? "ja" : "en");
  const formRef = useRef<HTMLFormElement>(null);
  useUnsavedChanges(formRef);

  // Lifted so switching tabs (which mounts/unmounts the inactive language's editor) doesn't discard
  // unsaved typed content.
  const [titleEn, setTitleEn] = useState(values.titleEn);
  const [excerptEn, setExcerptEn] = useState(values.excerptEn);
  const [bodyEn, setBodyEn] = useState(values.bodyEn);
  const [titleJa, setTitleJa] = useState(values.titleJa);
  const [excerptJa, setExcerptJa] = useState(values.excerptJa);
  const [bodyJa, setBodyJa] = useState(values.bodyJa);

  // A new, never-saved post has no id yet - Japanese can't be saved until English creates the post.
  const canTabToJa = translateOnly || Boolean(values.id);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (tab === "ja") startTransition(() => actionJa(data));
    else startTransition(() => actionEn(data));
  }

  const enColumn = (
    <section key="en" lang="en" className="min-w-0 space-y-4 rounded-lg bg-white p-4 ring-1 ring-black/5">
      <h2 className="flex items-center gap-2 text-[15px] font-semibold">
        <span className="rounded bg-[#eef6fc] px-1.5 py-0.5 text-[11px] font-bold text-primary">EN</span>
        English
      </h2>
      <label className="block">
        <span className="admin-label">
          Title <span className="text-red-600">*</span>
        </span>
        <input
          name="titleEn"
          value={titleEn}
          onChange={(e) => setTitleEn(e.target.value)}
          required
          aria-invalid={!!stateEn?.fieldErrors?.titleEn}
          className="admin-input text-[16px]"
        />
        <Err state={stateEn} field="titleEn" />
      </label>
      <label className="block">
        <span className="admin-label">Excerpt</span>
        <textarea
          name="excerptEn"
          value={excerptEn}
          onChange={(e) => setExcerptEn(e.target.value)}
          rows={3}
          className="admin-input"
          placeholder="Optional — auto-generated from the body if empty"
        />
      </label>
      <div>
        <span className="admin-label">Body</span>
        <RichTextEditor name="bodyEn" defaultValue={bodyEn} onChange={setBodyEn} lang="en" placeholder="Write the post…" />
      </div>
    </section>
  );

  const jaColumn = (
    <section key="ja" lang="ja" className="min-w-0 space-y-4 rounded-lg bg-white p-4 ring-1 ring-black/5">
      <h2 className="flex items-center gap-2 text-[15px] font-semibold">
        <span className="rounded bg-[#eef6fc] px-1.5 py-0.5 text-[11px] font-bold text-primary">JP</span>
        日本語
        {!translateOnly && <span className="text-[12px] font-normal text-[#999]">— leave blank to show English on the JP site</span>}
      </h2>
      <label className="block">
        <span className="admin-label">タイトル (Title)</span>
        <input name="titleJa" value={titleJa} onChange={(e) => setTitleJa(e.target.value)} className="admin-input text-[16px]" />
      </label>
      <label className="block">
        <span className="admin-label">抜粋 (Excerpt)</span>
        <textarea
          name="excerptJa"
          value={excerptJa}
          onChange={(e) => setExcerptJa(e.target.value)}
          rows={3}
          className="admin-input"
          placeholder="Optional — auto-generated from the body if empty"
        />
      </label>
      <div>
        <span className="admin-label">本文 (Body)</span>
        <RichTextEditor name="bodyJa" defaultValue={bodyJa} onChange={setBodyJa} lang="ja" placeholder="本文を入力…" />
      </div>
    </section>
  );

  return (
    <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
      {values.id && <input type="hidden" name="id" value={values.id} />}

      {(translateOnly ? stateJa : tab === "en" ? stateEn : stateJa)?.error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-2.5 text-[13px] text-red-700 ring-1 ring-red-200">
          {(translateOnly ? stateJa : tab === "en" ? stateEn : stateJa)?.error}
        </p>
      )}

      {translateOnly && (
        <p className="rounded-md bg-amber-50 px-4 py-2.5 text-[13px] text-amber-800 ring-1 ring-amber-200">
          You are editing the <strong>Japanese</strong> version only. Saving updates the JP page on the website.
        </p>
      )}

      <div className={`grid gap-4 ${translateOnly ? "" : "min-[1101px]:grid-cols-[1fr_300px]"}`}>
        <div className="min-w-0 space-y-3">
          {translateOnly ? (
            <>
              <div className="flex rounded-md bg-white p-1 ring-1 ring-black/5 min-[1101px]:hidden">
                {(["en", "ja"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setTab(l)}
                    className={`flex-1 rounded px-3 py-1.5 text-[13px] font-semibold ${tab === l ? "bg-primary text-white" : "text-[#555]"}`}
                  >
                    {l === "en" ? "English" : "日本語"}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 min-[1101px]:grid-cols-2">
                <div className={tab === "en" ? "" : "max-[1100px]:hidden"}>
                  <section lang="en" className="min-w-0 space-y-4 rounded-lg bg-white p-4 ring-1 ring-black/5">
                    <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                      <span className="rounded bg-[#eef6fc] px-1.5 py-0.5 text-[11px] font-bold text-primary">EN</span>
                      English <span className="text-[12px] font-normal text-[#999]">— reference (read-only)</span>
                    </h2>
                    <ReadOnlyEnglish values={values} />
                  </section>
                </div>
                <div className={tab === "ja" ? "" : "max-[1100px]:hidden"}>{jaColumn}</div>
              </div>
            </>
          ) : (
            <>
              <div className="flex rounded-md bg-white p-1 ring-1 ring-black/5">
                {(["en", "ja"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    disabled={l === "ja" && !canTabToJa}
                    title={l === "ja" && !canTabToJa ? "Save English first to create the post" : undefined}
                    onClick={() => setTab(l)}
                    className={`flex-1 rounded px-3 py-1.5 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                      tab === l ? "bg-primary text-white" : "text-[#555]"
                    }`}
                  >
                    {l === "en" ? "English" : "日本語"}
                  </button>
                ))}
              </div>
              {tab === "en" ? enColumn : jaColumn}
            </>
          )}
        </div>

        {translateOnly ? (
          <div className="flex justify-end">
            <button type="submit" disabled={pendingJa} className="admin-btn min-w-[200px]">
              {pendingJa ? "Saving…" : "Save Japanese"}
            </button>
          </div>
        ) : (
          <aside className="space-y-4">
            <div className="space-y-4 rounded-lg bg-white p-4 ring-1 ring-black/5">
              <PublishControls published={values.published} publishedAt={values.publishedAt} error={stateEn?.fieldErrors?.publishedAt} />
              <label className="block">
                <span className="admin-label">Category</span>
                <select name="categoryId" defaultValue={values.categoryId ?? ""} className="admin-input">
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="admin-label">URL slug</span>
                <input
                  name="slug"
                  defaultValue={values.slug}
                  placeholder="auto from English title"
                  pattern="[a-z0-9\-]*"
                  aria-invalid={!!stateEn?.fieldErrors?.slug}
                  className="admin-input font-mono text-[13px]"
                />
                <span className="mt-1 block text-[12px] text-[#999]">seats-inc.com/{values.slug || "…"}/</span>
                <Err state={stateEn} field="slug" />
              </label>
              {tab === "en" ? (
                <button type="submit" disabled={pendingEn} className="admin-btn w-full">
                  {pendingEn ? "Saving…" : values.id ? "Save English" : "Create post"}
                </button>
              ) : (
                <button type="submit" disabled={pendingJa} className="admin-btn w-full">
                  {pendingJa ? "Saving…" : "Save Japanese"}
                </button>
              )}
            </div>

            <div className="rounded-lg bg-white p-4 ring-1 ring-black/5">
              <span className="admin-label">Featured image</span>
              <ImageField name="imageUrl" defaultValue={values.imageUrl} />
              <Err state={stateEn} field="imageUrl" />
            </div>
          </aside>
        )}
      </div>
    </form>
  );
}
