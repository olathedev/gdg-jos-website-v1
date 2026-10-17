// Browser side of image uploads: read the file (HEIC included), shrink or crop it on a canvas,
// then send it to Cloudinary with a signature from the server. Returns the image URL.

export type SignedUpload = { url: string; fields: Record<string, string> };
type Sign = () => Promise<SignedUpload | { error: string }>;

const HEIC = /^image\/hei[cf](-sequence)?$/i;
const HEIC_EXT = /\.hei[cf]$/i;
const ACCEPTED = /^image\/(jpeg|png|webp)$/i;

export class UploadError extends Error {}

function load(src: Blob) {
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

/** JPEG, PNG, WebP or HEIC (no SVG), decoded and ready to draw. */
export async function readImage(file: File) {
  const heic = HEIC.test(file.type) || HEIC_EXT.test(file.name);
  if (!heic && !ACCEPTED.test(file.type)) throw new UploadError("Use a JPG, PNG, WebP or HEIC image.");
  if (file.size > 20 * 1024 * 1024) throw new UploadError("That image is over 20 MB. Try a smaller one.");
  try {
    return await load(file);
  } catch {
    if (!heic) throw new UploadError("We couldn't read that image.");
    const { heicTo } = await import("heic-to/next");
    return load(await heicTo({ blob: file, type: "image/jpeg", quality: 0.92 }));
  }
}

/** A canvas as WebP (browsers that can't encode WebP give PNG, which is also accepted). */
export async function canvasBlob(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
  if (!blob) throw new UploadError("We couldn't prepare that image.");
  return blob;
}

/** Sends a prepared image to Cloudinary with a fresh signature from the server. */
export async function uploadBlob(blob: Blob, sign: Sign) {
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

/** Whole image, resized to fit `max` px (used for partner logos). */
export async function uploadImage(file: File, sign: Sign, max: number) {
  const img = await readImage(file);
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return uploadBlob(await canvasBlob(canvas), sign);
}
