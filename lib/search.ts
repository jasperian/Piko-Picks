import { distanceKm } from "@/lib/geo";
import { isShopOpenNow } from "@/lib/hours";
import { hasAllLabels, labelMatchesQuery } from "@/lib/shop-labels";
import type { CoffeeShop, SearchFilters, SearchResult } from "@/lib/types";

export function searchShops(shops: CoffeeShop[], filters: SearchFilters): SearchResult[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const manualArea = filters.manualArea?.trim().toLowerCase();

  return shops
    .filter((shop) => shop.status === "published")
    .map((shop) => {
      const distance = filters.userLocation ? distanceKm(filters.userLocation, shop.coordinates) : undefined;
      const matchingItems = shop.menu.filter((item) => itemMatches(item, normalizedQuery, filters));
      const shopMatches =
        !normalizedQuery ||
        [shop.name, shop.description, shop.city, shop.address].some((value) => value.toLowerCase().includes(normalizedQuery)) ||
        labelMatchesQuery(shop.labels, normalizedQuery);

      return {
        ...shop,
        distanceKm: distance,
        matchingDrinkCount: shopMatches ? matchingItems.length || shop.menu.length : matchingItems.length
      };
    })
    .filter((shop) => {
      if (filters.userLocation && shop.distanceKm !== undefined && shop.distanceKm > filters.radiusKm) {
        return false;
      }

      if (filters.openNow && !isShopOpenNow(shop.weeklyHours)) {
        return false;
      }

      if (manualArea && !`${shop.city} ${shop.address}`.toLowerCase().includes(manualArea)) {
        return false;
      }

      if (!hasAllLabels(shop.labels, filters.selectedLabels)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const shopMatches = [shop.name, shop.description, shop.city, shop.address].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      ) || labelMatchesQuery(shop.labels, normalizedQuery);

      return shopMatches || shop.matchingDrinkCount > 0;
    })
    .sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }

      return a.name.localeCompare(b.name);
    });
}

function itemMatches(
  item: CoffeeShop["menu"][number],
  normalizedQuery: string,
  filters: Pick<SearchFilters, "maxPriceCents" | "onlyAvailable">
) {
  if (filters.onlyAvailable && !item.isAvailable) {
    return false;
  }

  if (filters.maxPriceCents !== undefined && item.priceCents > filters.maxPriceCents) {
    return false;
  }

  if (!normalizedQuery) {
    return true;
  }

  return [item.name, item.description, item.category, ...item.tags].some((value) => value.toLowerCase().includes(normalizedQuery));
}
