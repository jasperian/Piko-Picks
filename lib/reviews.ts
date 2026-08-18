import { z } from "zod";
import type { Review } from "@/lib/types";

export const reviewVisitTags = ["Great coffee", "Friendly staff", "Quiet", "Good Wi-Fi", "Worth the price", "Fast service"] as const;

export const reviewSchema = z.object({
  shopId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "Write at least 10 characters."),
  visitTags: z.array(z.enum(reviewVisitTags)).max(3).default([]),
  photoUrl: z
    .string()
    .trim()
    .refine((value) => !value || /^https?:\/\//.test(value), "Use a valid image URL.")
    .transform((value) => value || undefined)
});

export function averageRating(reviews: Review[]) {
  if (reviews.length === 0) {
    return undefined;
  }

  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
}

export function ratingLabel(rating?: number) {
  if (rating === undefined) {
    return "No reviews yet";
  }

  return `${rating.toFixed(1)} / 5`;
}

export function publishedReviews(reviews: Review[]) {
  return reviews.filter((review) => review.isPublished);
}

export function reviewTrustSummary(reviews: Review[]) {
  const visible = publishedReviews(reviews);
  const rating = averageRating(visible);
  const verifiedCount = visible.filter((review) => review.isVerifiedVisit).length;
  const tagCounts = new Map<string, number>();

  visible.flatMap((review) => review.visitTags ?? []).forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1));
  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([tag]) => tag);

  if (visible.length === 0) {
    return { text: "Be the first visitor to share what this café is really like.", verifiedCount, topTags };
  }

  const ratingText = rating === undefined ? "" : `Guests rate it ${rating.toFixed(1)} out of 5.`;
  const tagText = topTags.length > 0 ? ` Visitors most often mention ${joinNatural(topTags)}.` : "";
  const verifiedText = verifiedCount > 0 ? ` ${verifiedCount} ${verifiedCount === 1 ? "review comes" : "reviews come"} from a verified visit.` : "";

  return { text: `${ratingText}${tagText}${verifiedText}`.trim(), verifiedCount, topTags };
}

function joinNatural(values: string[]) {
  if (values.length < 2) {
    return values[0] ?? "";
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}
