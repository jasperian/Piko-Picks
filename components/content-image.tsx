import Image from "next/image";

// Owners may supply external image URLs. Optimize trusted hosts while preserving
// support for other sources without expanding the image proxy allowlist.
function canOptimize(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" &&
      (url.hostname === "images.unsplash.com" || url.hostname.endsWith(".supabase.co"));
  } catch {
    return false;
  }
}

export function ContentImage({ src, alt, className, sizes, priority = false }: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority}
    unoptimized={!canOptimize(src)} className={className} />;
}
