"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { Placeholder } from "@tiptap/extensions";
import { useImperativeHandle, useState, type Ref } from "react";
import { uploadImage } from "./upload";
import { IMAGE_SHAPES, IMAGE_SIZES } from "@/lib/image-options";
import MediaPicker from "./media/MediaPicker";

type Props = {
  name: string;
  defaultValue: string;
  onChange?: (html: string) => void;
  // Called whenever an image is inserted here, so the other language's body (not mounted while its
  // tab is inactive) can get the same image, at the same place, without a second upload.
  onImageInserted?: (src: string, alt: string, html: string) => void;
  placeholder?: string;
  lang: "en" | "ja";
  /** Lets the page add an image to the end of the body from outside the editor (the "Images in this post" panel). */
  handleRef?: Ref<RichTextHandle>;
};

// Image with an optional crop shape and width, stored as data-shape / data-size on the <img>
const attr = (name: string, data: string) => ({
  default: null as string | null,
  parseHTML: (el: HTMLElement) => el.getAttribute(data),
  renderHTML: (a: Record<string, unknown>) => (a[name] ? { [data]: a[name] } : {}),
});
const ShapedImage = Image.extend({
  addAttributes() {
    return { ...this.parent?.(), shape: attr("shape", "data-shape"), size: attr("size", "data-size") };
  },
});

export type RichTextHandle = { addImage: (src: string, alt: string) => void };

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

function Toolbar({
  editor,
  onImage,
  onReplaceImage,
  uploading,
}: {
  editor: Editor;
  onImage: () => void;
  onReplaceImage: () => void;
  uploading: boolean;
}) {
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
      image: e.isActive("image"),
      shape: (e.getAttributes("image").shape as string | null) ?? "",
      size: (e.getAttributes("image").size as string | null) ?? "",
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
      {s.image && (
        <>
          <Btn label="Replace selected image" onClick={onReplaceImage}>
            🔁
          </Btn>
          <select
            aria-label="Image shape"
            title="Image shape"
            value={s.shape}
            onChange={(e) => chain().updateAttributes("image", { shape: e.target.value || null }).run()}
            className="h-8 rounded border border-black/15 bg-white px-1 text-[12px]"
          >
            <option value="">Original shape</option>
            {IMAGE_SHAPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Image size"
            title="Image size"
            value={s.size}
            onChange={(e) => chain().updateAttributes("image", { size: e.target.value || null }).run()}
            className="h-8 rounded border border-black/15 bg-white px-1 text-[12px]"
          >
            <option value="">Full width</option>
            {IMAGE_SIZES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Btn label="Remove selected image" onClick={() => chain().deleteSelection().run()}>
            🗑
          </Btn>
        </>
      )}
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

export default function RichTextEditor({ name, defaultValue, onChange, onImageInserted, placeholder, lang, handleRef }: Props) {
  const [html, setHtml] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState<"insert" | "replace" | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      ShapedImage.configure({ HTMLAttributes: { loading: "lazy" } }),
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    editorProps: { attributes: { class: "prose-seats", lang } },
    onUpdate: ({ editor }) => {
      const next = editor.isEmpty ? "" : editor.getHTML();
      setHtml(next);
      onChange?.(next);
    },
  });

  useImperativeHandle(
    handleRef,
    () => ({
      addImage(src, alt) {
        if (!editor) return;
        editor.chain().insertContentAt(editor.state.doc.content.size, { type: "image", attrs: { src, alt } }).run();
        onImageInserted?.(src, alt, editor.getHTML());
      },
    }),
    [editor, onImageInserted],
  );

  async function onFiles(files: FileList | null) {
    if (!files?.length || !editor) return;
    setUploading(true);
    setError(null);
    try {
      for (const f of Array.from(files)) {
        const src = await uploadImage(f);
        editor.chain().focus().setImage({ src, alt: "" }).run();
        onImageInserted?.(src, "", editor.getHTML());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="admin-editor overflow-hidden rounded-md border border-black/15 bg-white focus-within:border-primary"
      // Dropping photos onto the editor uploads them (several at once) and inserts them
      onDropCapture={(e) => {
        if (!e.dataTransfer.files?.length) return;
        e.preventDefault();
        e.stopPropagation();
        void onFiles(e.dataTransfer.files);
      }}
    >
      <input type="hidden" name={name} value={html} />
      {editor && <Toolbar editor={editor} onImage={() => setPicking("insert")} onReplaceImage={() => setPicking("replace")} uploading={uploading} />}
      <MediaPicker
        open={picking !== null}
        title={picking === "replace" ? "Replace this image" : "Insert an image"}
        onClose={() => setPicking(null)}
        onPick={(p) => {
          if (picking === "replace") {
            editor?.chain().focus().updateAttributes("image", { src: p.url, alt: p.alt }).run();
          } else {
            editor?.chain().focus().setImage({ src: p.url, alt: p.alt }).run();
            if (editor) onImageInserted?.(p.url, p.alt, editor.getHTML());
          }
        }}
      />
      {error && <p className="bg-red-50 px-3 py-1.5 text-[12px] text-red-700">{error}</p>}
      <div className="max-h-[640px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
