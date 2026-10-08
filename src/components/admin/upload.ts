// Client-side helpers: downscale photos before upload so phone pictures stay under the 4 MB limit.

const MAX_EDGE = 2000;

async function downscale(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.85));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, type === "image/png" ? ".png" : ".jpg"), { type });
}

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", await downscale(file));
  const res = await fetch("/api/admin/upload/", { method: "POST", body });
  const json = await res.json().catch(() => ({ error: "Upload failed" }));
  if (!res.ok) throw new Error(json.error ?? "Upload failed");
  return json.url as string;
}
