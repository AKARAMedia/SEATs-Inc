// Shared by the editor (browser) and the sanitizer (server) - keep free of server-only imports.

/** How an image can be cropped in a post (CSS in globals.css: .prose-seats img[data-shape]). */
export const IMAGE_SHAPES = [
  { value: "16-9", label: "Wide 16:9" },
  { value: "3-2", label: "Landscape 3:2" },
  { value: "1-1", label: "Square 1:1" },
  { value: "3-4", label: "Portrait 3:4" },
  { value: "circle", label: "Circle" },
] as const;

/**
 * How wide an image is in a post (CSS: .prose-seats img[data-size]). "half" and "third" put images next to
 * each other: consecutive images with the same value share a row (2 or 3 per row), like a photo gallery.
 */
export const IMAGE_SIZES = [
  { value: "s", label: "Small" },
  { value: "m", label: "Medium" },
  { value: "l", label: "Large" },
  { value: "half", label: "Half (2 per row)" },
  { value: "third", label: "Third (3 per row)" },
  { value: "quarter", label: "Quarter (4 per row)" },
] as const;

/** Where a single image sits, and whether text wraps around it (CSS: [data-align]). Default = centered. */
export const IMAGE_ALIGNS = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "float-left", label: "Float left (text wraps)" },
  { value: "float-right", label: "Float right (text wraps)" },
] as const;

/** Which part of a cropped photo stays visible (CSS: [data-focus] sets object-position). Default = center. */
export const IMAGE_FOCUS = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
] as const;

/** Corner rounding (CSS: [data-radius]). Default = slightly rounded. */
export const IMAGE_RADIUS = [
  { value: "none", label: "Square corners" },
  { value: "m", label: "Rounded" },
  { value: "l", label: "Very rounded" },
] as const;

/** Border or shadow around the image (CSS: [data-frame]). */
export const IMAGE_FRAMES = [
  { value: "border", label: "Border" },
  { value: "shadow", label: "Shadow" },
] as const;

/** Space between the images of a column layout (CSS: [data-gap], sets --seats-gap). Default = 6px. */
export const IMAGE_GAPS = [
  { value: "none", label: "No gap" },
  { value: "s", label: "Small gap" },
  { value: "m", label: "Medium gap" },
  { value: "l", label: "Large gap" },
] as const;

/**
 * Every look an image can have, stored as data-<key> on the <img>. The same looks are kept identical in the
 * English and Japanese bodies (src/lib/image-mirror.ts) and validated by the sanitizer. A caption
 * (data-caption) and the alt text are language-specific, so they are not part of this list.
 */
export const IMAGE_LOOK_OPTIONS = {
  shape: IMAGE_SHAPES,
  size: IMAGE_SIZES,
  align: IMAGE_ALIGNS,
  focus: IMAGE_FOCUS,
  radius: IMAGE_RADIUS,
  frame: IMAGE_FRAMES,
  gap: IMAGE_GAPS,
} as const;
export type ImageLookKey = keyof typeof IMAGE_LOOK_OPTIONS;
export const IMAGE_LOOK_KEYS = Object.keys(IMAGE_LOOK_OPTIONS) as ImageLookKey[];

/** True when `value` is one of the allowed values for this look. */
export function isLookValue(key: ImageLookKey, value: unknown): value is string {
  return (IMAGE_LOOK_OPTIONS[key] as readonly { value: string }[]).some((o) => o.value === value);
}
