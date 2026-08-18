import { Camera } from "lucide-react";
import type { ShopPhoto } from "@/lib/types";

type Props = {
  photos: ShopPhoto[];
};

export function ShopPhotoGallery({ photos }: Props) {
  if (photos.length === 0) {
    return null;
  }

  const featured = photos[0];
  const remaining = photos.slice(1, 5);

  return (
    <section className="mt-6 rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-clay">Photo gallery</p>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-midnight">
            <Camera className="h-5 w-5 text-clay" />
            See the space
          </h2>
        </div>
        <span className="rounded-md bg-lagoon/10 px-3 py-1 text-sm font-semibold text-lagoon">{photos.length} photos</span>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <figure className="overflow-hidden rounded-lg bg-linen">
          <img src={featured.imageUrl} alt={featured.caption ?? ""} className="h-72 w-full object-cover" />
          {featured.caption ? <figcaption className="p-3 text-sm font-medium text-ink/70">{featured.caption}</figcaption> : null}
        </figure>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {remaining.map((photo) => (
            <figure key={photo.id} className="overflow-hidden rounded-lg bg-linen">
              <img src={photo.imageUrl} alt={photo.caption ?? ""} className="h-32 w-full object-cover" />
              {photo.caption ? <figcaption className="p-2 text-xs font-medium text-ink/65">{photo.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
