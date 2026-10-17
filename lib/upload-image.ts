// Browser side of image uploads: read the file (HEIC included), shrink it on a canvas,
// then send it to Cloudinary with a signature from the server. Returns the image URL.

export type SignedUpload = { url: string; fields: Record<string, string> };

const HEIC = /^image\/hei[cf](-sequence)?$/i;
const HEIC_EXT = /\.hei[cf]$/i;
const ACCEPTED = /^image\/(jpeg|png|webp)$/i;

export class UploadError extends Error {}

function loadImage(src: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(src);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

/** JPEG, PNG, WebP or HEIC (no SVG), resized to fit `max` px and saved as WebP. */
export async function uploadImage(file: File, sign: () => Promise<SignedUpload | { error: string }>, max: number) {
  const heic = HEIC.test(file.type) || HEIC_EXT.test(file.name);
  if (!heic && !ACCEPTED.test(file.type)) throw new UploadError("Use a JPG, PNG, WebP or HEIC image.");
  if (file.size > 20 * 1024 * 1024) throw new UploadError("That image is over 20 MB. Try a smaller one.");

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    if (!heic) throw new UploadError("We couldn't read that image.");
    const { heicTo } = await import("heic-to/next");
    img = await loadImage(await heicTo({ blob: file, type: "image/jpeg", quality: 0.92 }));
  }

  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
  if (!blob) throw new UploadError("We couldn't prepare that image.");

  const signed = await sign();
  if ("error" in signed) throw new UploadError(signed.error);
  const body = new FormData();
  for (const [k, v] of Object.entries(signed.fields)) body.append(k, v);
  body.append("file", blob, "image.webp");
  const res = await fetch(signed.url, { method: "POST", body });
  const json = (await res.json().catch(() => null)) as { secure_url?: string; error?: { message?: string } } | null;
  if (!res.ok || !json?.secure_url) throw new UploadError(json?.error?.message ? `Upload failed: ${json.error.message}` : "Upload failed. Try again.");
  return json.secure_url;
}
