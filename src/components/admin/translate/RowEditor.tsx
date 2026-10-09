"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { useEffect, useRef } from "react";

const PLACEHOLDER = "日本語訳を入力…";

/** "<p>a</p><p>b</p>" → "a<br>b": a row is always one block; the block type comes from the English. */
function inner(html: string) {
  const parts = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
  const joined = (parts.length ? parts : [html]).join("<br>");
  return joined.replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/g, "").trim();
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  /** Ctrl/⌘+Enter: save and jump to the next row that needs work */
  onNext: () => void;
  autoFocus?: boolean;
  id: string;
};

/** One-paragraph rich editor: bold, italic and links only. Enter adds a line break. */
export function HtmlRowEditor({ value, onChange, onNext, id }: Props) {
  const last = useRef(value);
  const next = useRef(onNext);
  useEffect(() => {
    next.current = onNext;
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        code: false,
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({ placeholder: PLACEHOLDER }),
    ],
    content: `<p>${value}</p>`,
    editorProps: {
      attributes: { lang: "ja", id, class: "admin-row-editor", "aria-label": "Japanese translation" },
      handleKeyDown: (view, e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          next.current();
          return true;
        }
        if (e.key === "Enter") {
          const br = view.state.schema.nodes.hardBreak;
          view.dispatch(view.state.tr.replaceSelectionWith(br.create()).scrollIntoView());
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const v = editor.isEmpty ? "" : inner(editor.getHTML());
      last.current = v;
      onChange(v);
    },
  });

  // Value changed from outside (Copy English, Use suggestion): load it without echoing back
  useEffect(() => {
    if (!editor || value === last.current) return;
    last.current = value;
    editor.commands.setContent(`<p>${value}</p>`, { emitUpdate: false });
  }, [editor, value]);

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => (e ? { bold: e.isActive("bold"), italic: e.isActive("italic"), link: e.isActive("link") } : null),
  });

  const btn = (active: boolean | undefined) =>
    `flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-[12px] font-semibold ${active ? "bg-primary/15 text-primary" : "text-[#555] hover:bg-black/5"}`;

  return (
    <div className="group/ed rounded-md border border-black/15 bg-white focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgb(0_129_204/0.15)]">
      {editor && s && (
        <div className="hidden items-center gap-0.5 border-b border-black/5 px-1 py-0.5 group-focus-within/ed:flex">
          <button type="button" title="Bold" aria-label="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} className={btn(s.bold)}>
            B
          </button>
          <button type="button" title="Italic" aria-label="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(s.italic)}>
            <em>I</em>
          </button>
          <button
            type="button"
            title={s.link ? "Remove link" : "Link"}
            aria-label={s.link ? "Remove link" : "Link"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (s.link) return void editor.chain().focus().unsetLink().run();
              const url = window.prompt("Link URL (https://…)");
              if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            }}
            className={btn(s.link)}
          >
            🔗
          </button>
          <span className="ml-auto pr-1 text-[11px] text-[#aaa]">Enter = new line · Ctrl+Enter = next</span>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

/** Plain-text row (titles, settings). */
export function TextRowEditor({ value, onChange, onNext, id, multiline }: Props & { multiline?: boolean }) {
  return (
    <textarea
      id={id}
      lang="ja"
      value={value}
      rows={multiline ? 3 : 1}
      placeholder={PLACEHOLDER}
      aria-label="Japanese translation"
      onChange={(e) => onChange(multiline ? e.target.value : e.target.value.replace(/\n/g, " "))}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          onNext();
        } else if (e.key === "Enter" && !multiline) e.preventDefault();
      }}
      className="admin-input resize-none [field-sizing:content]"
    />
  );
}
