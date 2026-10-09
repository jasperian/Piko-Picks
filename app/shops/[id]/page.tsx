import { notFound } from "next/navigation";
import { ContentImage } from "@/components/content-image";
import { BadgeCheck, Compass, MapPin, Phone, Sparkles, Star } from "lucide-react";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { DirectionButtons } from "@/components/direction-buttons";
import { FavoriteButton } from "@/components/favorite-button";
import { PromoList } from "@/components/promo-list";
import { ReviewsSection } from "@/components/reviews-section";
import { ShopPhotoGallery } from "@/components/shop-photo-gallery";
import { SocialLinks } from "@/components/social-links";
import { formatOpenStatus, isShopOpenNow } from "@/lib/hours";
import { averageRating, publishedReviews, ratingLabel } from "@/lib/reviews";
import { shopLabelGroups } from "@/lib/shop-labels";
import { getShopById } from "@/lib/supabase/queries";

type Props = {
  params: {
    id: string;
  };
  searchParams: {
    review?: string;
  };
};

export default async function ShopDetailPage({ params, searchParams }: Props) {
  const shop = await getShopById(params.id);

  if (!shop) {
    notFound();
  }

  const visibleReviews = publishedReviews(shop.reviews);
  const average = averageRating(visibleReviews);
  const openNow = isShopOpenNow(shop.weeklyHours);

  return (
    <main>
      <AnalyticsTracker shopId={shop.id} eventType="shop_view" />
      <section className="relative overflow-hidden">
        <ContentImage src={shop.coverImageUrl} alt="" priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,32,51,0.94),rgba(23,32,51,0.76)_48%,rgba(55,37,31,0.32))]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:items-end lg:py-16">
          <div className="text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-1 text-sm font-semibold backdrop-blur">
                <BadgeCheck className="h-4 w-4 text-gold" />
                Published coffee shop
              </span>
              <span className={`rounded-md px-3 py-1 text-sm font-semibold text-white ${openNow ? "bg-lagoon" : "bg-clay"}`}>{formatOpenStatus(shop.weeklyHours)}</span>
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">{shop.name}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/[0.78] sm:text-lg">{shop.description}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-white/82">
              <span className="inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 backdrop-blur">
                <MapPin className="h-4 w-4 text-gold" />
                {shop.address}, {shop.city}
              </span>
              <span className="inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 backdrop-blur">
                <Phone className="h-4 w-4 text-gold" />
                {shop.phone}
              </span>
              <span className="rounded-md bg-white/12 px-3 py-2 backdrop-blur">{shop.openingHours}</span>
            </div>
          </div>

          <aside className="rounded-lg border border-white/15 bg-white/95 p-5 shadow-panel backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-wide text-clay">Customer actions</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-midnight">{ratingLabel(average)}</p>
                <p className="text-sm text-ink/60">{visibleReviews.length} public reviews</p>
              </div>
              <div className="flex text-gold" aria-label={`${ratingLabel(average)} rating`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className={`h-4 w-4 ${average && index < Math.round(average) ? "fill-current" : ""}`} />
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <FavoriteButton shopId={shop.id} />
              <SocialLinks shop={shop} />
              <DirectionButtons shop={shop} />
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {searchParams.review ? <ReviewNotice state={searchParams.review} /> : null}

        {shop.labels.length > 0 ? (
          <section className="surface rounded-lg p-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-clay">Shop personality</p>
                <h2 className="text-2xl font-semibold text-midnight">Amenities, vibe, and best use</h2>
              </div>
              <Sparkles className="hidden h-6 w-6 text-gold sm:block" />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {shopLabelGroups.map((group) => {
                const labels = shop.labels.filter((item) => item.groupName === group.groupName);

                if (labels.length === 0) {
                  return null;
                }

                return (
                  <div key={group.groupName} className="rounded-lg bg-linen p-4">
                    <p className="text-sm font-semibold text-midnight">{group.groupName}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {labels.map((item) => (
                        <span key={item.label} className="rounded-md bg-lagoon/10 px-2 py-1 text-xs font-semibold text-lagoon">
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <ShopPhotoGallery photos={shop.photos} />

        <section className="mt-6 rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-midnight">
                <Compass className="h-5 w-5 text-clay" />
                Visit this shop
              </h2>
              <p className="mt-2 font-medium text-roast">{shop.address}, {shop.city}</p>
              <p className="mt-1 text-sm text-ink/60">
                {shop.coordinates.latitude.toFixed(5)}, {shop.coordinates.longitude.toFixed(5)}
              </p>
            </div>
            <div className="grid gap-3 sm:min-w-80">
              <DirectionButtons shop={shop} />
            </div>
          </div>
          <div className="mt-5 h-48 rounded-lg bg-[linear-gradient(135deg,#d7e4d8_25%,#fbfaf7_25%,#fbfaf7_50%,#d7e4d8_50%,#d7e4d8_75%,#fbfaf7_75%)] bg-[length:28px_28px]" />
        </section>

        <section className="mt-6 rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-clay">Current offers</p>
            <h2 className="text-2xl font-semibold text-midnight">Promos</h2>
          </div>
          <PromoList promos={shop.promos} />
        </section>

        <ReviewsSection shopId={shop.id} reviews={shop.reviews} />
      </section>
    </main>
  );
}

function ReviewNotice({ state }: { state: string }) {
  const messages: Record<string, string> = {
    sent: "Review posted. Thanks for helping other coffee drinkers.",
    demo: "Demo review confirmed. Connect Supabase to save reviews."
  };

  return <div className="mt-6 rounded-lg bg-sage/15 p-4 font-medium text-sage">{messages[state] ?? messages.sent}</div>;
}
