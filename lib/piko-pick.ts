import { formatDistance } from "@/lib/geo";
import { averageRating, publishedReviews } from "@/lib/reviews";
import type { SearchResult } from "@/lib/types";

export type PikoPick = {
  shop: SearchResult;
  reasons: string[];
  personalized: boolean;
};

type PikoPreferences = {
  query: string;
  selectedLabels: string[];
  hasLocation: boolean;
};

export function getPikoPick(results: SearchResult[], preferences: PikoPreferences): PikoPick | undefined {
  if (results.length === 0) {
    return undefined;
  }

  const query = preferences.query.trim().toLowerCase();
  const ranked = [...results].sort((a, b) => pickScore(b, preferences) - pickScore(a, preferences));
  const shop = ranked[0];
  const reviews = publishedReviews(shop.reviews);
  const rating = averageRating(reviews);
  const reasons: string[] = [];

  if (query) {
    const matchingMenuItem = shop.menu.find((item) =>
      [item.name, item.description, item.category, ...item.tags].some((value) => value.toLowerCase().includes(query))
    );

    if (matchingMenuItem) {
      reasons.push(`Serves ${matchingMenuItem.name}`);
    } else {
      reasons.push(`Matches “${preferences.query.trim()}”`);
    }
  }

  const matchingLabels = preferences.selectedLabels.filter((label) => shop.labels.some((item) => item.label === label));
  if (matchingLabels.length > 0) {
    reasons.push(matchingLabels.slice(0, 2).join(" + "));
  }

  if (preferences.hasLocation && shop.distanceKm !== undefined) {
    reasons.push(`${formatDistance(shop.distanceKm)} away`);
  }

  if (rating !== undefined) {
    reasons.push(`${rating.toFixed(1)} rated by ${reviews.length} ${reviews.length === 1 ? "guest" : "guests"}`);
  }

  if (reasons.length < 3 && shop.labels.length > 0) {
    reasons.push(shop.labels[0].label);
  }

  if (reasons.length < 3) {
    const availableCount = shop.menu.filter((item) => item.isAvailable).length;
    reasons.push(`${availableCount} ${availableCount === 1 ? "drink" : "drinks"} available`);
  }

  return {
    shop,
    reasons: reasons.slice(0, 3),
    personalized: Boolean(query || preferences.selectedLabels.length > 0 || preferences.hasLocation)
  };
}

function pickScore(shop: SearchResult, preferences: PikoPreferences) {
  const rating = averageRating(publishedReviews(shop.reviews)) ?? 0;
  const reviewConfidence = Math.min(publishedReviews(shop.reviews).length, 10);
  const labelMatches = preferences.selectedLabels.filter((label) => shop.labels.some((item) => item.label === label)).length;
  const queryRelevance = preferences.query.trim() ? shop.matchingDrinkCount * 12 : 0;
  const proximity = preferences.hasLocation && shop.distanceKm !== undefined ? Math.max(0, 12 - shop.distanceKm) : 0;

  return queryRelevance + labelMatches * 30 + proximity + rating * 4 + reviewConfidence * 2;
}
