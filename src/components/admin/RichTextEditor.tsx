"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { Placeholder } from "@tiptap/extensions";
import { useRef, useState } from "react";
import { uploadImage } from "./upload";

type Props = { name: string; defaultValue: string; placeholder?: string; lang: "en" | "ja" };

function Btn({ onClick, active, label, children }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center rounded px-1.5 text-[13px] font-semibold ${
        active ? "bg-primary/15 text-primary" : "text-[#444] hover:bg-black/5"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage, uploading }: { editor: Editor; onImage: () => void; uploading: boolean }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      ul: e.isActive("bulletList"),
      ol: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      center: e.isActive({ textAlign: "center" }),
    }),
  })!;
  const chain = () => editor.chain().focus();
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-black/10 bg-[#fafafa] px-1.5 py-1">
      <Btn label="Bold" active={s.bold} onClick={() => chain().toggleBold().run()}>B</Btn>
      <Btn label="Italic" active={s.italic} onClick={() => chain().toggleItalic().run()}><em>I</em></Btn>
      <Btn label="Underline" active={s.underline} onClick={() => chain().toggleUnderline().run()}><u>U</u></Btn>
      <span className="mx-1 h-5 w-px bg-black/10" />
      <Btn label="Heading" active={s.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>H2</Btn>
      <Btn label="Subheading" active={s.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>H3</Btn>
      <Btn label="Bullet list" active={s.ul} onClick={() => chain().toggleBulletList().run()}>• List</Btn>
      <Btn label="Numbered list" active={s.ol} onClick={() => chain().toggleOrderedList().run()}>1. List</Btn>
      <Btn label="Quote" active={s.quote} onClick={() => chain().toggleBlockquote().run()}>❝</Btn>
      <Btn label="Center" active={s.center} onClick={() => (s.center ? chain().unsetTextAlign().run() : chain().setTextAlign("center").run())}>≡</Btn>
      <span className="mx-1 h-5 w-px bg-black/10" />
      <Btn
        label="Link"
        active={s.link}
        onClick={() => {
          if (s.link) return void chain().unsetLink().run();
          const url = window.prompt("Link URL (https://…)");
          if (url) chain().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >
        🔗
      </Btn>
      <Btn label="Insert image" onClick={onImage}>{uploading ? "…" : "🖼"}</Btn>
      <Btn
        label="Embed YouTube video"
        onClick={() => {
          const src = window.prompt("YouTube URL");
          if (src) chain().setYoutubeVideo({ src }).run();
        }}
      >
        ▶
      </Btn>
      <span className="mx-1 h-5 w-px bg-black/10" />
      <Btn label="Undo" onClick={() => chain().undo().run()}>↶</Btn>
      <Btn label="Redo" onClick={() => chain().redo().run()}>↷</Btn>
    </div>
  );
}

export default function RichTextEditor({ name, defaultValue, placeholder, lang }: Props) {
  const [html, setHtml] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    editorProps: { attributes: { class: "prose-seats", lang } },
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
  });

  async function onFiles(files: FileList | null) {
    if (!files?.length || !editor) return;
    setUploading(true);
    setError(null);
    try {
      for (const f of Array.from(files)) {
        const src = await uploadImage(f);
        editor.chain().focus().setImage({ src, alt: "" }).run();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="admin-editor overflow-hidden rounded-md border border-black/15 bg-white focus-within:border-primary">
      <input type="hidden" name={name} value={html} />
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      {editor && <Toolbar editor={editor} onImage={() => fileRef.current?.click()} uploading={uploading} />}
      {error && <p className="bg-red-50 px-3 py-1.5 text-[12px] text-red-700">{error}</p>}
      <div className="max-h-[640px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
