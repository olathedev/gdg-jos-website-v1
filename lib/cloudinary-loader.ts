// next/image loader: lets Cloudinary resize and pick the format (AVIF/WebP)
// instead of downloading multi-MB originals through the Next optimizer.

const UPLOAD = "/image/upload/";

// Path segments like "e_upscale" or "c_fill,g_face" are transformations;
// "v1758318012" (version) and the file name are not.
const isTransformation = (seg: string) => /^[a-z]{1,3}_/.test(seg) && !/^v\d+$/.test(seg);

/**
 * Mark a low-resolution Cloudinary image for AI upscaling (x4).
 * Use for small source photos (e.g. the 230px speaker/team portraits)
 * until higher-resolution originals are uploaded.
 */
export function upscaled(src: string) {
  return src.includes(UPLOAD) ? src.replace(UPLOAD, `${UPLOAD}e_upscale/`) : src;
}

/**
 * Sharp transparent cut-out of a portrait: AI-upscale first (the source
 * photos are small), then remove the background. Order matters: upscaling
 * after removal flattens the transparency.
 */
export function cutout(src: string) {
  return src.includes(UPLOAD) ? src.replace(UPLOAD, `${UPLOAD}e_upscale/e_background_removal/`) : src;
}

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (src.includes("res.cloudinary.com") && src.includes(UPLOAD)) {
    const [base, rest] = src.split(UPLOAD);
    const segs = rest.split("/");
    // Keep any existing transformations first (e.g. upscale), then resize.
    let i = 0;
    while (i < segs.length - 1 && isTransformation(segs[i])) i++;
    // AI transforms (upscale / background removal) cost a job per distinct URL,
    // so collapse their sizes into two buckets instead of next/image's ~8.
    const ai = /e_(upscale|background_removal)/.test(rest);
    const w = ai ? (width <= 480 ? 480 : 920) : width;
    const params = `f_auto,c_limit,w_${w},q_${quality ?? "auto"}`;
    return `${base}${UPLOAD}${[...segs.slice(0, i), params, ...segs.slice(i)].join("/")}`;
  }
  // Local assets are served as-is.
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
