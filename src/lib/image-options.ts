// Shared by the editor (browser) and the sanitizer (server) - keep free of server-only imports.

/** How an image can be cropped in a post (CSS in globals.css: .prose-seats img[data-shape]). */
export const IMAGE_SHAPES = [
  { value: "16-9", label: "Wide 16:9" },
  { value: "3-2", label: "Landscape 3:2" },
  { value: "1-1", label: "Square 1:1" },
  { value: "3-4", label: "Portrait 3:4" },
  { value: "circle", label: "Circle" },
] as const;

/** How wide an image is in a post (CSS: .prose-seats img[data-size]). */
export const IMAGE_SIZES = [
  { value: "s", label: "Small" },
  { value: "m", label: "Medium" },
  { value: "l", label: "Large" },
] as const;
