"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { Placeholder } from "@tiptap/extensions";
import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { uploadImage } from "./upload";
import { GRID_SIZE, insertImageGrid, moveImage, updateImageGroup, type GridCols } from "@/lib/image-group";
import {
  IMAGE_ALIGNS,
  IMAGE_FOCUS,
  IMAGE_FRAMES,
  IMAGE_GAPS,
  IMAGE_LOOK_KEYS,
  IMAGE_RADIUS,
  IMAGE_SHAPES,
  IMAGE_SIZES,
} from "@/lib/image-options";
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

// Image with its looks (shape, size, align, focus, radius, frame, gap: see IMAGE_LOOK_OPTIONS) and a caption,
// each stored as a data-* attribute on the <img>. The alt text is the image's normal alt attribute.
const attr = (name: string, data: string) => ({
  default: null as string | null,
  parseHTML: (el: HTMLElement) => el.getAttribute(data),
  renderHTML: (a: Record<string, unknown>) => (a[name] ? { [data]: a[name] } : {}),
});
const ShapedImage = Image.extend({
  addAttributes() {
    const looks = Object.fromEntries(IMAGE_LOOK_KEYS.map((k) => [k, attr(k, `data-${k}`)]));
    return { ...this.parent?.(), ...looks, caption: attr("caption", "data-caption") };
  },
});

const imageAttrs = (e: Editor) => e.getAttributes("image") as Record<string, string | null | undefined>;

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

const COLUMN_CHOICES: GridCols[] = [1, 2, 3, 4];
const ROW_CHOICES = [1, 2, 3, 4, 5, 6, 8, 10];

function Toolbar({
  editor,
  onImage,
  onReplaceImage,
  onGrid,
  uploading,
}: {
  editor: Editor;
  onImage: () => void;
  onReplaceImage: () => void;
  /** Uploads the chosen photos and inserts them as one grid. */
  onGrid: (files: File[], layout: { cols: GridCols; shape: string }) => void;
  uploading: boolean;
}) {
  // The "Grid" panel: pick columns and rows, then upload the photos straight into that layout
  const [gridOpen, setGridOpen] = useState(false);
  const [gridCols, setGridCols] = useState<GridCols>(2);
  const [gridRows, setGridRows] = useState(3);
  const [gridShape, setGridShape] = useState("3-2");
  const gridFiles = useRef<HTMLInputElement>(null);
  const gridCount = gridCols * gridRows;
  // The "Image settings" panel for the selected image: caption, alt text, alignment, focal point, corners, frame, gap
  const [settingsOpen, setSettingsOpen] = useState(false);
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
      shape: imageAttrs(e).shape ?? "",
      size: imageAttrs(e).size ?? "",
      align: imageAttrs(e).align ?? "",
      focus: imageAttrs(e).focus ?? "",
      radius: imageAttrs(e).radius ?? "",
      frame: imageAttrs(e).frame ?? "",
      gap: imageAttrs(e).gap ?? "",
      caption: imageAttrs(e).caption ?? "",
      alt: imageAttrs(e).alt ?? "",
    }),
  })!;
  const chain = () => editor.chain().focus();
  // Without focus(): the panel's text boxes keep the cursor while you type (the image stays selected)
  const setImageAttr = (patch: Record<string, string | null>) => editor.chain().updateAttributes("image", patch).run();
  // "half" / "third" / "quarter" are the column layouts (2, 3 or 4 images per row); every other size is a single image
  const columns = s.size === "half" ? "2" : s.size === "third" ? "3" : s.size === "quarter" ? "4" : "1";
  return (
    <>
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
      <Btn label="Image grid: choose columns and rows, then upload the photos" active={gridOpen} onClick={() => setGridOpen((o) => !o)}>▦</Btn>
      {s.image && (
        <>
          <Btn label="Replace selected image" onClick={onReplaceImage}>
            🔁
          </Btn>
          <Btn label="Move image earlier (left / up)" onClick={() => moveImage(editor, -1)}>
            ◀
          </Btn>
          <Btn label="Move image later (right / down)" onClick={() => moveImage(editor, 1)}>
            ▶
          </Btn>
          <Btn label="Image settings: caption, alt text, alignment, focal point, corners, border, gap" active={settingsOpen} onClick={() => setSettingsOpen((o) => !o)}>
            ⚙
          </Btn>
          <select
            aria-label="Image shape"
            title="Image shape"
            value={s.shape}
            // Only the selected image changes shape (Columns is the control that works on the whole group)
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
            title={columns === "1" ? "Image size" : "The width is set by Columns"}
            value={columns === "1" ? s.size : ""}
            disabled={columns !== "1"}
            onChange={(e) => chain().updateAttributes("image", { size: e.target.value || null }).run()}
            className="h-8 rounded border border-black/15 bg-white px-1 text-[12px] disabled:opacity-50"
          >
            <option value="">Full width</option>
            {IMAGE_SIZES.filter((o) => o.value !== "half" && o.value !== "third" && o.value !== "quarter").map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Columns"
            title="Columns: how many images share a row. Applies to all the images that follow one another here."
            value={columns}
            onChange={(e) => updateImageGroup(editor, { size: GRID_SIZE[Number(e.target.value) as GridCols] })}
            className="h-8 rounded border border-black/15 bg-white px-1 text-[12px]"
          >
            <option value="1">1 column</option>
            <option value="2">2 columns</option>
            <option value="3">3 columns</option>
            <option value="4">4 columns</option>
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
    {settingsOpen && s.image && (
      <div className="flex flex-wrap items-center gap-2 border-b border-black/10 bg-white px-3 py-2 text-[12px] text-[#444]">
        <strong>Image settings</strong>
        <label className="flex items-center gap-1">
          Caption
          <input
            type="text"
            maxLength={300}
            value={s.caption}
            placeholder="Shown under the image"
            onChange={(e) => setImageAttr({ caption: e.target.value || null })}
            className="h-8 rounded border border-black/15 px-1 text-[12px]"
            style={{ width: 240 }}
          />
        </label>
        <label className="flex items-center gap-1">
          Alt text
          <input
            type="text"
            maxLength={300}
            value={s.alt}
            placeholder="Describes the image"
            onChange={(e) => setImageAttr({ alt: e.target.value })}
            className="h-8 rounded border border-black/15 px-1 text-[12px]"
            style={{ width: 200 }}
          />
        </label>
        <label className="flex items-center gap-1">
          Align
          <select
            aria-label="Image alignment"
            title={columns === "1" ? "Where the image sits; floating lets the text wrap around it" : "Not used in a column layout"}
            value={columns === "1" ? s.align : ""}
            disabled={columns !== "1"}
            onChange={(e) => setImageAttr({ align: e.target.value || null })}
            className="h-8 rounded border border-black/15 bg-white px-1 text-[12px] disabled:opacity-50"
          >
            <option value="">Center</option>
            {IMAGE_ALIGNS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          Focus
          <select
            aria-label="Image focal point"
            title={s.shape ? "Which part of the photo stays visible when it is cropped" : "Choose a shape first: the focal point matters when the photo is cropped"}
            value={s.focus}
            disabled={!s.shape}
            onChange={(e) => setImageAttr({ focus: e.target.value || null })}
            className="h-8 rounded border border-black/15 bg-white px-1 text-[12px] disabled:opacity-50"
          >
            <option value="">Center</option>
            {IMAGE_FOCUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          Corners
          <select
            aria-label="Image corners"
            value={s.radius}
            onChange={(e) => setImageAttr({ radius: e.target.value || null })}
            className="h-8 rounded border border-black/15 bg-white px-1 text-[12px]"
          >
            <option value="">Default</option>
            {IMAGE_RADIUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          Frame
          <select
            aria-label="Image frame"
            value={s.frame}
            onChange={(e) => setImageAttr({ frame: e.target.value || null })}
            className="h-8 rounded border border-black/15 bg-white px-1 text-[12px]"
          >
            <option value="">None</option>
            {IMAGE_FRAMES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          Gap
          <select
            aria-label="Gap between images"
            title={columns === "1" ? "Only used when images share a row (see Columns)" : "Space between the images of this group"}
            value={columns === "1" ? "" : s.gap}
            disabled={columns === "1"}
            onChange={(e) => updateImageGroup(editor, { gap: e.target.value || null })}
            className="h-8 rounded border border-black/15 bg-white px-1 text-[12px] disabled:opacity-50"
          >
            <option value="">Default</option>
            {IMAGE_GAPS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {columns !== "1" && (
          <button type="button" className="admin-btn-secondary" onClick={() => updateImageGroup(editor, { radius: s.radius || null, frame: s.frame || null })}>
            Apply corners &amp; frame to the whole group
          </button>
        )}
        <span className="text-[#888]">The caption and alt text belong to this language only; the look is shared with the other language.</span>
      </div>
    )}
    {gridOpen && (
      <div className="flex flex-wrap items-center gap-2 border-b border-black/10 bg-white px-3 py-2 text-[12px] text-[#444]">
        <strong>Image grid</strong>
        <label className="flex items-center gap-1">
          Columns
          <select
            aria-label="Grid columns"
            value={gridCols}
            onChange={(e) => setGridCols(Number(e.target.value) as GridCols)}
            className="h-8 rounded border border-black/15 bg-white px-1 text-[12px]"
          >
            {COLUMN_CHOICES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          Rows
          <select
            aria-label="Grid rows"
            value={gridRows}
            onChange={(e) => setGridRows(Number(e.target.value))}
            className="h-8 rounded border border-black/15 bg-white px-1 text-[12px]"
          >
            {ROW_CHOICES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          Shape
          <select
            aria-label="Grid image shape"
            value={gridShape}
            onChange={(e) => setGridShape(e.target.value)}
            className="h-8 rounded border border-black/15 bg-white px-1 text-[12px]"
          >
            <option value="">Original shape</option>
            {IMAGE_SHAPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="admin-btn-secondary" disabled={uploading} onClick={() => gridFiles.current?.click()}>
          {uploading ? "Uploading…" : `Upload ${gridCount} images…`}
        </button>
        <span className="text-[#888]">
          {gridCols} × {gridRows} = {gridCount} photos. Choose more or fewer and the rows follow.
        </span>
        <input
          ref={gridFiles}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (!files.length) return;
            onGrid(files, { cols: gridCols, shape: gridShape });
            setGridOpen(false);
          }}
        />
      </div>
    )}
    </>
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

  // The "Grid" panel: upload several photos and insert them as one grid (columns/shape chosen in the panel)
  async function onGrid(files: File[], layout: { cols: GridCols; shape: string }) {
    if (!editor || !files.length) return;
    setUploading(true);
    setError(null);
    try {
      const srcs: string[] = [];
      for (const f of files) srcs.push(await uploadImage(f));
      insertImageGrid(editor, srcs, { cols: layout.cols, shape: layout.shape || null });
      for (const src of srcs) onImageInserted?.(src, "", editor.getHTML());
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
      {editor && <Toolbar editor={editor} onImage={() => setPicking("insert")} onReplaceImage={() => setPicking("replace")} onGrid={onGrid} uploading={uploading} />}
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
