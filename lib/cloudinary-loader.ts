// next/image loader: lets Cloudinary resize and pick the format (AVIF/WebP)
// instead of downloading multi-MB originals through the Next optimizer.
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (src.includes("res.cloudinary.com") && src.includes("/image/upload/")) {
    const params = `f_auto,c_limit,w_${width},q_${quality ?? "auto"}`;
    return src.replace("/image/upload/", `/image/upload/${params}/`);
  }
  // Local assets are served as-is.
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
