import { describe, expect, it } from "vitest";
import { averageRating, publishedReviews, ratingLabel, reviewSchema, reviewTrustSummary } from "@/lib/reviews";
import type { Review } from "@/lib/types";

const reviews: Review[] = [
  {
    id: "review-1",
    shopId: "shop-1",
    reviewerName: "Ana",
    rating: 5,
    comment: "Excellent coffee and friendly service.",
    visitTags: ["Great coffee", "Friendly staff"],
    isVerifiedVisit: true,
    isPublished: true,
    createdAt: "2026-05-07T00:00:00Z"
  },
  {
    id: "review-2",
    shopId: "shop-1",
    reviewerName: "Ben",
    rating: 3,
    comment: "Good but busy.",
    isPublished: false,
    createdAt: "2026-05-07T00:00:00Z"
  }
];

describe("review helpers", () => {
  it("averages and labels published reviews", () => {
    expect(publishedReviews(reviews)).toHaveLength(1);
    expect(publishedReviews(reviews)[0].id).toBe("review-1");
    expect(averageRating(reviews)).toBe(4);
    expect(ratingLabel(4)).toBe("4.0 / 5");
    expect(ratingLabel()).toBe("No reviews yet");
  });
});

describe("reviewSchema", () => {
  it("validates review payloads", () => {
    const parsed = reviewSchema.parse({
      shopId: "shop-1",
      reviewerName: "Ana",
      rating: "5",
      comment: "Excellent coffee and friendly service.",
      visitTags: ["Great coffee"],
      photoUrl: ""
    });

    expect(parsed.rating).toBe(5);
  });

  it("builds a transparent community trust summary", () => {
    const summary = reviewTrustSummary(reviews);

    expect(summary.verifiedCount).toBe(1);
    expect(summary.topTags).toEqual(["Friendly staff", "Great coffee"]);
    expect(summary.text).toContain("verified visit");
  });
});
