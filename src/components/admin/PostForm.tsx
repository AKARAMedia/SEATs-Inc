"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { savePostAction, type FormState } from "@/app/admin/actions";
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
 * Side-by-side EN / JP editing for manual translation.
 * mode="translate" (Translator role): English is read-only and only the JP fields are submitted.
 */
export default function PostForm({ values, categories, mode = "full" }: { values: PostFormValues; categories: Category[]; mode?: "full" | "translate" }) {
  const [state, action, pending] = useActionState(savePostAction, undefined);
  const [tab, setTab] = useState<"en" | "ja">(mode === "translate" ? "ja" : "en"); // only used on narrow screens
  const formRef = useRef<HTMLFormElement>(null);
  useUnsavedChanges(formRef);
  const translateOnly = mode === "translate";

  const col = (lang: "en" | "ja") => {
    const ja = lang === "ja";
    const k = (f: "title" | "excerpt" | "body") => `${f}${ja ? "Ja" : "En"}` as const;
    if (!ja && translateOnly) {
      return (
        <section lang="en" className={`min-w-0 space-y-4 rounded-lg bg-white p-4 ring-1 ring-black/5 ${tab === lang ? "" : "max-[1100px]:hidden"}`}>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold">
            <span className="rounded bg-[#eef6fc] px-1.5 py-0.5 text-[11px] font-bold text-primary">EN</span>
            English <span className="text-[12px] font-normal text-[#999]">— reference (read-only)</span>
          </h2>
          <ReadOnlyEnglish values={values} />
        </section>
      );
    }
    return (
      <section lang={lang} className={`min-w-0 space-y-4 rounded-lg bg-white p-4 ring-1 ring-black/5 ${tab === lang ? "" : "max-[1100px]:hidden"}`}>
        <h2 className="flex items-center gap-2 text-[15px] font-semibold">
          <span className="rounded bg-[#eef6fc] px-1.5 py-0.5 text-[11px] font-bold text-primary">{ja ? "JP" : "EN"}</span>
          {ja ? "日本語" : "English"}
          {ja && <span className="text-[12px] font-normal text-[#999]">— leave blank to show English on the JP site</span>}
        </h2>
        <label className="block">
          <span className="admin-label">
            {ja ? "タイトル (Title)" : "Title"} {!ja && <span className="text-red-600">*</span>}
          </span>
          <input
            name={k("title")}
            defaultValue={values[k("title")]}
            required={!ja}
            aria-invalid={!!state?.fieldErrors?.[k("title")]}
            className="admin-input text-[16px]"
          />
          <Err state={state} field={k("title")} />
        </label>
        <label className="block">
          <span className="admin-label">{ja ? "抜粋 (Excerpt)" : "Excerpt"}</span>
          <textarea
            name={k("excerpt")}
            defaultValue={values[k("excerpt")]}
            rows={3}
            className="admin-input"
            placeholder="Optional — auto-generated from the body if empty"
          />
        </label>
        <div>
          <span className="admin-label">{ja ? "本文 (Body)" : "Body"}</span>
          <RichTextEditor name={k("body")} defaultValue={values[k("body")]} lang={lang} placeholder={ja ? "本文を入力…" : "Write the post…"} />
        </div>
      </section>
    );
  };

  return (
    <form
      ref={formRef}
      className="space-y-4"
      // Submit manually: a plain form action would reset all fields on a validation error
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      {values.id && <input type="hidden" name="id" value={values.id} />}

      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-2.5 text-[13px] text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}

      {translateOnly && (
        <p className="rounded-md bg-amber-50 px-4 py-2.5 text-[13px] text-amber-800 ring-1 ring-amber-200">
          You are editing the <strong>Japanese</strong> version only. Saving updates the JP page on the website.
        </p>
      )}

      <div className={`grid gap-4 ${translateOnly ? "" : "min-[1101px]:grid-cols-[1fr_300px]"}`}>
        <div className="min-w-0 space-y-3">
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
            {col("en")}
            {col("ja")}
          </div>
        </div>

        {translateOnly ? (
          <div className="flex justify-end">
            <button type="submit" disabled={pending} className="admin-btn min-w-[200px]">
              {pending ? "Saving…" : "Save Japanese"}
            </button>
          </div>
        ) : (
          <aside className="space-y-4">
            <div className="space-y-4 rounded-lg bg-white p-4 ring-1 ring-black/5">
              <label className="flex items-center gap-2 text-[14px] font-semibold">
                <input type="checkbox" name="published" defaultChecked={values.published} className="size-4 accent-[var(--color-primary)]" />
                Published
              </label>
              <label className="block">
                <span className="admin-label">Date (Cambodia time)</span>
                <input type="datetime-local" name="publishedAt" defaultValue={values.publishedAt} required className="admin-input" />
                <Err state={state} field="publishedAt" />
              </label>
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
                  aria-invalid={!!state?.fieldErrors?.slug}
                  className="admin-input font-mono text-[13px]"
                />
                <span className="mt-1 block text-[12px] text-[#999]">seats-inc.com/{values.slug || "…"}/</span>
                <Err state={state} field="slug" />
              </label>
              <button type="submit" disabled={pending} className="admin-btn w-full">
                {pending ? "Saving…" : values.id ? "Save changes" : "Create post"}
              </button>
            </div>

            <div className="rounded-lg bg-white p-4 ring-1 ring-black/5">
              <span className="admin-label">Featured image</span>
              <ImageField name="imageUrl" defaultValue={values.imageUrl} />
              <Err state={state} field="imageUrl" />
            </div>
          </aside>
        )}
      </div>
    </form>
  );
}
