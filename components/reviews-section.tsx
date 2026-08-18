import { BadgeCheck, Camera, Star } from "lucide-react";
import Link from "next/link";
import { createReviewAction } from "@/app/shops/[id]/review-actions";
import { ImageUrlUpload } from "@/components/image-url-upload";
import { ReviewTagsField } from "@/components/review-tags-field";
import { averageRating, publishedReviews, ratingLabel, reviewTrustSummary } from "@/lib/reviews";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/types";

type Props = {
  shopId: string;
  reviews: Review[];
};

export async function ReviewsSection({ shopId, reviews }: Props) {
  const visibleReviews = publishedReviews(reviews);
  const average = averageRating(visibleReviews);
  const trustSummary = reviewTrustSummary(visibleReviews);
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: profile } = user && supabase ? await supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle() : { data: null };
  const reviewerName = profile?.full_name?.trim() || user?.user_metadata.full_name || user?.email?.split("@")[0];
  const existingReview = user ? visibleReviews.find((review) => review.reviewerId === user.id) : undefined;

  return (
    <section className="mt-6 rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-clay">Customer feedback</p>
          <h2 className="text-2xl font-semibold text-midnight">Reviews</h2>
          <p className="mt-1 text-sm text-ink/60">
            {ratingLabel(average)} from {visibleReviews.length} reviews
          </p>
        </div>
        <div className="flex rounded-md bg-gold/15 px-3 py-2 text-gold" aria-label={`${ratingLabel(average)} rating`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className={`h-4 w-4 ${average && index < Math.round(average) ? "fill-current" : ""}`} />
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-lagoon p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Community snapshot</p>
        <p className="mt-2 max-w-3xl text-base font-semibold leading-7">{trustSummary.text}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {trustSummary.verifiedCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/12 px-2.5 py-1 text-xs font-bold"><BadgeCheck className="h-3.5 w-3.5 text-gold" />{trustSummary.verifiedCount} verified</span>
          ) : null}
          {trustSummary.topTags.map((tag) => <span key={tag} className="rounded-md bg-white/12 px-2.5 py-1 text-xs font-bold">{tag}</span>)}
        </div>
      </div>

      {user ? (
        <form action={createReviewAction} className="mt-5 grid gap-3 rounded-lg bg-linen p-4">
          <input type="hidden" name="shopId" value={shopId} />
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <div className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink/70">
              Reviewing as <span className="font-semibold text-midnight">{reviewerName}</span>
            </div>
            <select name="rating" defaultValue={String(existingReview?.rating ?? 5)} className="focus-ring h-10 rounded-md border border-ink/15 px-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} stars
                </option>
              ))}
            </select>
          </div>
          <textarea name="comment" required defaultValue={existingReview?.comment} placeholder="What should another coffee drinker know?" className="focus-ring min-h-24 rounded-md border border-ink/15 p-3" />
          <ReviewTagsField defaultValue={existingReview?.visitTags} />
          <ImageUrlUpload
            label="Add a visit photo (optional)"
            name="photoUrl"
            defaultValue={existingReview?.photoUrl}
            ownerPrefix={user.id}
            uploadKind={`review-${shopId}`}
            placeholder="Paste an image URL or upload a photo"
          />
          <button className="focus-ring rounded-md bg-midnight px-4 py-2.5 font-semibold text-white transition hover:bg-roast">{existingReview ? "Update my review" : "Post review"}</button>
        </form>
      ) : (
        <div className="mt-5 rounded-lg bg-linen p-4">
          <p className="text-sm text-ink/70">Sign in first to post a review. We will use your account name automatically.</p>
          <Link href={`/auth?next=${encodeURIComponent(`/shops/${shopId}`)}`} className="focus-ring mt-3 inline-flex rounded-md bg-midnight px-4 py-2.5 font-semibold text-white">
            Sign in to review
          </Link>
        </div>
      )}

      <div className="mt-5 grid gap-3">
        {visibleReviews.length > 0 ? (
          visibleReviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-ink/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-midnight">{review.reviewerName}</p>
                  {review.isVerifiedVisit ? <span className="inline-flex items-center gap-1 rounded-md bg-lagoon/10 px-2 py-1 text-xs font-bold text-lagoon"><BadgeCheck className="h-3.5 w-3.5" />Verified visit</span> : null}
                </div>
                <span className="rounded-md bg-gold/15 px-2 py-1 text-sm font-semibold text-midnight">{review.rating} / 5</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-ink/70">{review.comment}</p>
              {review.photoUrl ? (
                <figure className="mt-3 overflow-hidden rounded-lg bg-crema">
                  <img src={review.photoUrl} alt={`Visit photo shared by ${review.reviewerName}`} className="h-56 w-full object-cover" />
                  <figcaption className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-ink/55"><Camera className="h-3.5 w-3.5" />Photo from this visit</figcaption>
                </figure>
              ) : null}
              {review.visitTags && review.visitTags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">{review.visitTags.map((tag) => <span key={tag} className="rounded-md bg-crema px-2 py-1 text-xs font-semibold text-roast">{tag}</span>)}</div>
              ) : null}
              <time dateTime={review.createdAt} className="mt-3 block text-xs text-ink/45">{new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(new Date(review.createdAt))}</time>
            </article>
          ))
        ) : (
          <div className="rounded-md bg-crema p-4 text-sm text-ink/65">No reviews yet.</div>
        )}
      </div>
    </section>
  );
}
