import type { Editor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";

/**
 * Moves the selected image one place earlier (-1) or later (+1) in the body: past the block next to it, which
 * is another image of its grid or a paragraph/heading. The image stays selected, so pressing again keeps
 * moving it. Returns false (and changes nothing) when no image is selected or it is already first/last.
 */
export function moveImage(editor: Editor, direction: -1 | 1) {
  return editor
    .chain()
    .focus()
    .command(({ tr, state }) => {
      const kids: { pos: number; size: number; type: string }[] = [];
      state.doc.forEach((node, offset) => kids.push({ pos: offset, size: node.nodeSize, type: node.type.name }));
      const at = state.selection.from;
      const i = kids.findIndex((k, n) => at >= k.pos && (n === kids.length - 1 || at < kids[n + 1].pos));
      const j = i + direction;
      if (i < 0 || kids[i].type !== "image" || j < 0 || j >= kids.length) return false;
      const node = state.doc.nodeAt(kids[i].pos);
      if (!node) return false;
      let newPos: number;
      if (direction < 0) {
        tr.delete(kids[i].pos, kids[i].pos + kids[i].size);
        tr.insert(kids[j].pos, node);
        newPos = kids[j].pos;
      } else {
        const after = kids[j].pos + kids[j].size;
        tr.insert(after, node);
        tr.delete(kids[i].pos, kids[i].pos + kids[i].size);
        newPos = after - kids[i].size;
      }
      tr.setSelection(NodeSelection.create(tr.doc, newPos));
      return true;
    })
    .run();
}

/** Columns -> the image size that gives that layout (see IMAGE_SIZES in image-options.ts). 1 = full width. */
export const GRID_SIZE = { 1: null, 2: "half", 3: "third", 4: "quarter" } as const;
export type GridCols = keyof typeof GRID_SIZE;

/**
 * Inserts uploaded images as one grid: all in the same column layout (and shape, so the tiles have equal
 * height), after the block the cursor is in, followed by an empty paragraph that keeps the grid a group of
 * its own. Rows follow from the number of images (columns x rows images fill the grid exactly).
 */
export function insertImageGrid(editor: Editor, srcs: string[], opts: { cols: GridCols; shape?: string | null }) {
  const size = GRID_SIZE[opts.cols];
  const { doc, selection } = editor.state;
  let pos = selection.$to.depth === 0 ? selection.$to.pos : selection.$to.after(1);
  // With an image selected, go past the whole group it belongs to: a new grid must not land in the middle of it
  if (editor.isActive("image")) {
    for (let next = doc.resolve(pos).nodeAfter; next?.type.name === "image"; next = doc.resolve(pos).nodeAfter) pos += next.nodeSize;
  }
  // Images that follow one another form one group, so keep this grid apart from a group right before it
  const separator = doc.resolve(pos).nodeBefore?.type.name === "image" ? [{ type: "paragraph" }] : [];
  const images = srcs.map((src) => ({ type: "image", attrs: { src, alt: "", size, shape: opts.shape || null } }));
  return editor
    .chain()
    .focus()
    .insertContentAt(pos, [...separator, ...images, { type: "paragraph" }])
    .run();
}

/**
 * Sets attributes on the whole group of images that follow one another around the selected image (a group
 * ends at the first paragraph, heading, ...). Used for the column layout: put 6 images in a row, pick "2
 * columns" once, and you get 3 rows of 2. Returns false (and changes nothing) when no image is selected.
 */
export function updateImageGroup(editor: Editor, patch: Record<string, string | null>) {
  return editor
    .chain()
    .focus()
    .command(({ tr, state }) => {
      const kids: { pos: number; type: string; attrs: Record<string, unknown> }[] = [];
      state.doc.forEach((node, offset) => kids.push({ pos: offset, type: node.type.name, attrs: node.attrs }));
      const at = state.selection.from;
      const i = kids.findIndex((k, n) => at >= k.pos && (n === kids.length - 1 || at < kids[n + 1].pos));
      if (i < 0 || kids[i].type !== "image") return false;
      let start = i;
      let end = i;
      while (start > 0 && kids[start - 1].type === "image") start--;
      while (end < kids.length - 1 && kids[end + 1].type === "image") end++;
      for (let n = start; n <= end; n++) tr.setNodeMarkup(kids[n].pos, undefined, { ...kids[n].attrs, ...patch });
      return true;
    })
    .run();
}
