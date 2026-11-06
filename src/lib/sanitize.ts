import sanitizeHtml from "sanitize-html";
import { IMAGE_LOOK_KEYS, isLookValue } from "./image-options";

/** Longest image caption kept (characters). */
const CAPTION_MAX = 300;

const IFRAME_HOSTS = ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "www.facebook.com", "www.tiktok.com", "player.vimeo.com"];

/** Sanitize rich-text bodies from the admin editor / WordPress import. */
export function sanitizeBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img", "figure", "figcaption", "iframe", "h1", "h2", "h3", "h4", "h5", "h6", "span", "u", "s", "mark",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "data-caption", ...IMAGE_LOOK_KEYS.map((k) => `data-${k}`)],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title"],
      // TipTap YouTube node wrapper — needed so embeds survive re-editing
      div: ["data-youtube-video"],
      "*": ["class", "style"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^(left|right|center|justify)$/],
        color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/],
        "font-weight": [/^\d+$|^bold$/],
      },
    },
    allowedClasses: { "*": ["wp-block-gallery", "gallery", "aligncenter", "alignleft", "alignright", "has-text-align-center"] },
    allowedIframeHostnames: IFRAME_HOSTS,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tag, attribs) => ({
        tagName: "a",
        attribs: /^https?:\/\//.test(attribs.href ?? "")
          ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
          : attribs,
      }),
      img: (tag, attribs) => {
        // Editor-chosen look of the image (shape, size, align, focus, radius, frame, gap: see
        // IMAGE_LOOK_OPTIONS) and its caption; anything else is dropped
        const rest = { ...attribs };
        const look: Record<string, string> = {};
        for (const key of IMAGE_LOOK_KEYS) {
          const name = `data-${key}`;
          const value = rest[name];
          delete rest[name];
          if (isLookValue(key, value)) look[name] = value;
        }
        const caption = (rest["data-caption"] ?? "").replace(/\s+/g, " ").trim().slice(0, CAPTION_MAX);
        delete rest["data-caption"];
        return {
          tagName: "img",
          attribs: { ...rest, loading: "lazy", ...look, ...(caption && { "data-caption": caption }) },
        };
      },
    },
  });
}

export function stripTags(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
