// Text helpers for the Translation Center, shared by server and browser.

/** Visible text of an HTML fragment, whitespace-collapsed. */
export function htmlText(html: string) {
  return html
    .replace(/<br\s*\/?>|<\/(p|h[1-6]|li|blockquote|figcaption|div|tr)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Visible text of a document with a blank line between paragraphs (for comparing versions). */
export function htmlParagraphs(html: string) {
  return html
    .split(/<\/(?:p|h[1-6]|li|blockquote|figcaption|div|tr)>|<br\s*\/?>/i)
    .map(htmlText)
    .filter(Boolean)
    .join("\n\n");
}

/** Key used for translation memory and change detection (case/space-insensitive). */
export function normalizeForMatch(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function trigrams(s: string) {
  const t = ` ${normalizeForMatch(s)} `;
  const out = new Map<string, number>();
  for (let i = 0; i < t.length - 2; i++) {
    const g = t.slice(i, i + 3);
    out.set(g, (out.get(g) ?? 0) + 1);
  }
  return out;
}

/**
 * Similarity 0–1 between two texts: Dice coefficient over character trigrams. Robust to small
 * edits (a changed word or number) and cheap enough to compare against the whole memory.
 */
export function similarity(a: string, b: string, aGrams = trigrams(a)) {
  const bGrams = trigrams(b);
  let overlap = 0;
  let total = 0;
  for (const n of aGrams.values()) total += n;
  for (const [g, n] of bGrams) {
    total += n;
    overlap += Math.min(n, aGrams.get(g) ?? 0);
  }
  return total ? (2 * overlap) / total : 0;
}
export { trigrams };

export type DiffPart = { text: string; type: "same" | "add" | "del" };

/** Japanese/Chinese text has no spaces between words, so it is compared character by character. */
const tokens = (s: string) => (/[　-鿿＀-￯]/.test(s) ? Array.from(s) : s.split(/(\s+)/).filter(Boolean));

/** Word-level (or, for Japanese, character-level) diff from `before` to `after` (LCS). */
export function wordDiff(before: string, after: string): DiffPart[] {
  const a = tokens(before);
  const b = tokens(after);
  const n = a.length;
  const m = b.length;
  // Long paragraphs: fall back to a whole replacement rather than an O(n·m) table
  if (n * m > 5_000_000) return [{ text: before, type: "del" }, { text: after, type: "add" }];
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffPart[] = [];
  const push = (text: string, type: DiffPart["type"]) => {
    const last = out[out.length - 1];
    if (last?.type === type) last.text += text;
    else out.push({ text, type });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push(a[i], "same");
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) push(a[i++], "del");
    else push(b[j++], "add");
  }
  while (i < n) push(a[i++], "del");
  while (j < m) push(b[j++], "add");
  return out;
}

export type GlossaryTerm = { id: number; termEn: string; termJa: string; note: string };

/** Glossary terms that appear (whole word, any case) in an English text. */
export function termsIn(text: string, glossary: GlossaryTerm[]) {
  return glossary.filter((g) => {
    const escaped = g.termEn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, "iu").test(text);
  });
}

/** URL-safe form of an item key: "post:12" ↔ "post-12", "settings:seo" ↔ "settings-seo". */
export function keyToSlug(key: string) {
  return key.replace(":", "-");
}
export function slugToKey(slug: string) {
  return /^(post|settings)-/.test(slug) ? slug.replace("-", ":") : slug;
}
