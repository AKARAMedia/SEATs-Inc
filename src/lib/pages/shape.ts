// Shape-driven page content: validate saved edits against the default content's structure,
// and classify each value so the admin editor can render the right control. Shared by server and browser.

export type Path = (string | number)[];
type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

/** {en: string, ja: string} */
export const isPair = (v: unknown): v is { en: string; ja: string } =>
  isObj(v) && Object.keys(v).length === 2 && typeof v.en === "string" && typeof v.ja === "string";
/** {en: string[], ja: string[]} — paragraphs */
export const isParas = (v: unknown): v is { en: string[]; ja: string[] } => isObj(v) && Object.keys(v).length === 2 && isStrArr(v.en) && isStrArr(v.ja);

export const IMAGE_RE = /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i;
export const isImageUrl = (key: string | number, v: unknown) => typeof v === "string" && (IMAGE_RE.test(v) || /^(img|src|image|logo|photo)$/i.test(String(key)));

/** "LOKA.rows.*.images" matches ["LOKA","rows",3,"images"] */
export function matchPath(pattern: string, path: Path) {
  const p = pattern.split(".");
  return p.length === path.length && p.every((seg, i) => seg === "*" ? typeof path[i] === "number" : seg === String(path[i]));
}

/**
 * The shape every list item must have: keys present in all default items are required, keys present
 * in only some are optional (kept only if the saved item has them).
 */
function itemTemplate(items: unknown[]): { template: unknown; optional: Set<string> } {
  if (!items.length) return { template: undefined, optional: new Set() };
  if (!items.every(isObj) || items.some(isPair) || items.some(isParas)) return { template: items[0], optional: new Set() };
  const all = items as Obj[];
  const template: Obj = {};
  const optional = new Set<string>();
  for (const it of all) for (const [k, v] of Object.entries(it)) if (!(k in template)) template[k] = v;
  for (const k of Object.keys(template)) if (!all.every((it) => k in it)) optional.add(k);
  return { template, optional };
}

/**
 * Return `value` reshaped to match `def`: wrong types and missing keys fall back to the default,
 * unknown keys are dropped. Pages therefore always receive data their code can render.
 */
export function conform(def: unknown, value: unknown, fixed: string[] = [], path: Path = []): unknown {
  if (typeof def === "string") return typeof value === "string" ? value : def;
  if (typeof def === "number") return typeof value === "number" && Number.isFinite(value) ? value : def;
  if (typeof def === "boolean") return typeof value === "boolean" ? value : def;
  if (def === null || def === undefined) return value ?? def;
  if (Array.isArray(def)) {
    if (!Array.isArray(value)) return def;
    if (fixed.some((f) => matchPath(f, path)) || isTuple(def)) return def.map((d, i) => conform(d, value[i], fixed, [...path, i]));
    const { template, optional } = itemTemplate(def);
    if (template === undefined) return value.filter((v) => typeof v === "string");
    return value.map((v, i) => conformItem(template, optional, v, fixed, [...path, i]));
  }
  if (isObj(def)) {
    const v = isObj(value) ? value : {};
    return Object.fromEntries(Object.entries(def).map(([k, d]) => [k, conform(d, v[k], fixed, [...path, k])]));
  }
  return def;
}

function conformItem(template: unknown, optional: Set<string>, value: unknown, fixed: string[], path: Path) {
  if (!isObj(template) || isPair(template) || isParas(template)) return conform(template, value ?? blank(template), fixed, path);
  const v = isObj(value) ? value : {};
  const out: Obj = {};
  for (const [k, d] of Object.entries(template)) {
    if (optional.has(k) && !(k in v)) continue;
    // A missing or wrong-typed value becomes empty, not a copy of another item's content
    out[k] = sameKind(d, v[k]) ? conform(d, v[k], fixed, [...path, k]) : blank(d);
  }
  return out;
}

const kind = (v: unknown) => (Array.isArray(v) ? "array" : v === null ? "null" : typeof v);
const sameKind = (a: unknown, b: unknown) => kind(a) === kind(b);

/** Arrays of arrays (e.g. two columns) keep their length */
function isTuple(def: unknown[]) {
  return def.length > 0 && def.every(Array.isArray);
}

/** An empty value of the same shape (for "Add item"). Lists start empty, except fixed-size ones. */
export function blank(def: unknown, fixedLen = false): unknown {
  if (typeof def === "string") return "";
  if (typeof def === "number") return 0;
  if (typeof def === "boolean") return false;
  if (Array.isArray(def)) return fixedLen || isTuple(def) ? def.map((d) => blank(d)) : [];
  if (isParas(def)) return { en: [""], ja: [""] };
  if (isObj(def)) return Object.fromEntries(Object.entries(def).map(([k, d]) => [k, blank(d, Array.isArray(d) && d.length <= 3 && d.every((x) => typeof x === "string"))]));
  return def;
}

/** New item for a list, shaped like the existing ones (required keys only). */
export function newItem(list: unknown[]) {
  const { template, optional } = itemTemplate(list);
  if (template === undefined) return "";
  if (!isObj(template) || isPair(template) || isParas(template)) return blank(template);
  return Object.fromEntries(Object.entries(template).filter(([k]) => !optional.has(k)).map(([k, d]) => [k, blank(d, Array.isArray(d) && (d as unknown[]).every((x) => typeof x === "string") && (d as unknown[]).length <= 3)]));
}

export function getAt(obj: unknown, path: Path): unknown {
  return path.reduce<unknown>((o, k) => (o as Record<string | number, unknown> | undefined)?.[k], obj);
}

export function setAt<T>(obj: T, path: Path, value: unknown): T {
  if (!path.length) return value as T;
  const [k, ...rest] = path;
  const copy = (Array.isArray(obj) ? [...obj] : { ...(obj as Obj) }) as Record<string | number, unknown>;
  copy[k] = setAt(copy[k], rest, value);
  return copy as T;
}

/** Every Japanese-translatable text in a page, in reading order (for the Translation Center). */
export function bilingualFields(value: unknown, path: Path = []): { path: Path; kind: "pair" | "paras"; en: string | string[]; ja: string | string[] }[] {
  if (isPair(value)) return [{ path, kind: "pair", en: value.en, ja: value.ja }];
  if (isParas(value)) return [{ path, kind: "paras", en: value.en, ja: value.ja }];
  if (Array.isArray(value)) return value.flatMap((v, i) => bilingualFields(v, [...path, i]));
  if (isObj(value)) return Object.entries(value).flatMap(([k, v]) => bilingualFields(v, [...path, k]));
  return [];
}

/** "imagesFirst" → "Images first", "OVERVIEW_TITLE" → "Overview title" */
export function humanize(key: string) {
  const words = key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .trim();
  const named: Record<string, string> = { href: "Link", sub: "Subheading", img: "Image", src: "Image", url: "Link", "youtube id": "YouTube video ID" };
  return named[words] ?? words.charAt(0).toUpperCase() + words.slice(1);
}
