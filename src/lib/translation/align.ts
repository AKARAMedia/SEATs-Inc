// Matching a saved translation draft to the current English, paragraph by paragraph.

export type StoredRow = { group: string; src: string; srcHash: string; target: string; auto?: boolean };
export type SourceSeg = { group: string; src: string; srcHash: string };
export type RowState = "ok" | "empty" | "auto" | "outdated";
export type AlignedRow = SourceSeg & { target: string; state: RowState; oldSrc?: string; oldSrcHash?: string };

/** Longest common subsequence of two hash lists → matched index pairs. */
function lcsPairs(a: string[], b: string[]) {
  const n = a.length;
  const m = b.length;
  // Same O(n·m) table as wordDiff (lib/translation/text.ts) — mirror its bailout so a pathologically
  // large document can't allocate an oversized table here either. No matches just means alignRows
  // treats every paragraph in the group as changed, instead of skipped alignment.
  if (n * m > 5_000_000) return [];
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const pairs: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      pairs.push([i++, j++]);
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

/**
 * Align saved rows to the current English segments, group by group.
 * - Unchanged paragraphs (same text hash, matched in order) keep their translation.
 * - Between two unchanged paragraphs, old and new paragraphs are paired in order: those are
 *   edited paragraphs → the translation is kept but marked "outdated" with the old English for a diff.
 * - New paragraphs with no partner start empty; deleted paragraphs are dropped.
 */
export function alignRows(current: SourceSeg[], stored: StoredRow[]): AlignedRow[] {
  const out: AlignedRow[] = [];
  const groups = [...new Set(current.map((c) => c.group))];
  for (const group of groups) {
    const cur = current.filter((c) => c.group === group);
    const old = stored.filter((s) => s.group === group);
    const pairs = lcsPairs(
      old.map((o) => o.srcHash),
      cur.map((c) => c.srcHash),
    );
    let oi = 0;
    let ci = 0;
    const take = (o: StoredRow | undefined, c: SourceSeg, changed: boolean) => {
      if (!o || !o.target) return out.push({ ...c, target: "", state: "empty" });
      if (changed) return out.push({ ...c, target: o.target, state: "outdated", oldSrc: o.src, oldSrcHash: o.srcHash });
      out.push({ ...c, target: o.target, state: o.auto ? "auto" : "ok" });
    };
    for (const [po, pc] of [...pairs, [old.length, cur.length] as [number, number]]) {
      // Gap before this match: pair edited paragraphs in order
      const gapOld = old.slice(oi, po);
      for (let k = 0; ci < pc; k++, ci++) take(gapOld[k], cur[ci], true);
      if (pc < cur.length) take(old[po], cur[pc], false);
      oi = po + 1;
      ci = pc + 1;
    }
  }
  return out;
}

export function rowCounts(rows: { state: RowState }[]) {
  const c = { total: rows.length, ok: 0, empty: 0, auto: 0, outdated: 0 };
  for (const r of rows) c[r.state]++;
  return c;
}

export type ItemStatus = "not_started" | "in_progress" | "needs_update" | "done";

export function itemStatus(rows: { state: RowState; target: string }[], dirty: boolean): ItemStatus {
  const c = rowCounts(rows);
  if (c.outdated) return "needs_update";
  if (!rows.some((r) => r.target)) return "not_started";
  if (c.empty || c.auto || dirty) return "in_progress";
  return "done";
}
