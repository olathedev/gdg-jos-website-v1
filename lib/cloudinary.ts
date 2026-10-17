import "server-only";
import { createHash } from "node:crypto";

// Image uploads go straight from the browser to Cloudinary with a signature made here,
// so the API secret never leaves the server. Each upload has a fixed public id (one per
// player or partner) and overwrites the previous one.
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// Without all three, upload buttons are hidden and nothing else changes.

const env = () => ({
  cloud: process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "",
  key: process.env.CLOUDINARY_API_KEY?.trim() ?? "",
  secret: process.env.CLOUDINARY_API_SECRET?.trim() ?? "",
});

export const cloudinaryEnabled = () => {
  const e = env();
  return Boolean(e.cloud && e.key && e.secret);
};

const ROOT = "devfest-quest";
export type UploadKind = "avatars" | "partners";

export type SignedUpload = { url: string; fields: Record<string, string> };

/** Everything the browser needs to upload one image to its fixed slot. */
export function signUpload(kind: UploadKind, id: string): SignedUpload {
  const { cloud, key, secret } = env();
  const params: Record<string, string> = {
    allowed_formats: "jpg,png,webp",
    invalidate: "true",
    overwrite: "true",
    public_id: `${ROOT}/${kind}/${id}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
    // Stored no larger than this, whatever the browser sends.
    transformation: "c_limit,w_1024,h_1024",
  };
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const signature = createHash("sha1").update(toSign + secret).digest("hex");
  return { url: `https://api.cloudinary.com/v1_1/${cloud}/image/upload`, fields: { ...params, api_key: key, signature } };
}

/** True only for an image in that slot of our own Cloudinary account (as returned by the upload). */
export function isOwnUpload(url: string, kind: UploadKind, id: string) {
  const { cloud } = env();
  if (!cloud) return false;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^https://res\\.cloudinary\\.com/${esc(cloud)}/image/upload/v\\d+/${ROOT}/${kind}/${esc(id)}\\.(jpg|png|webp)$`).test(url);
}
