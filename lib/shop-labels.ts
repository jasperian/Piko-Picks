import type { ShopLabel, ShopLabelGroupName } from "@/lib/types";

export const shopLabelGroups: Array<{ groupName: ShopLabelGroupName; labels: string[] }> = [
  {
    groupName: "Shop Type",
    labels: ["Specialty Coffee", "Neighborhood Cafe", "Coffee Cart", "Roastery", "Bakery Cafe", "Dessert Cafe", "Drive-Thru", "Kiosk"]
  },
  {
    groupName: "Amenities",
    labels: ["Free WiFi", "Charging Ports", "Air-Conditioned", "Outdoor Seating", "Parking", "Restroom", "Pet Friendly"]
  },
  {
    groupName: "Best For",
    labels: ["Work Friendly", "Study Spot", "Meetings", "Quiet", "Groups", "Date Spot", "Takeout", "Late Night"]
  },
  {
    groupName: "Vibe",
    labels: ["Cozy", "Chill", "Minimalist", "Aesthetic", "Rustic", "Bright", "Hidden Gem", "Community"]
  }
];

export const priorityShopLabels = ["Pet Friendly", "Free WiFi", "Charging Ports", "Work Friendly", "Cozy", "Chill"];

const labelsByName = new Map(shopLabelGroups.flatMap((group) => group.labels.map((label) => [label, group.groupName] as const)));

export function normalizeShopLabels(values: FormDataEntryValue[] | string[] | undefined): ShopLabel[] {
  const labels = Array.from(new Set((values ?? []).map(String).filter((label) => labelsByName.has(label))));

  return labels.map((label) => ({
    label,
    groupName: labelsByName.get(label) ?? "Vibe"
  }));
}

export function labelMatchesQuery(labels: ShopLabel[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return false;
  }

  return labels.some((item) => item.label.toLowerCase().includes(normalizedQuery) || item.groupName.toLowerCase().includes(normalizedQuery));
}

export function hasAllLabels(shopLabels: ShopLabel[], selectedLabels: string[] = []) {
  if (selectedLabels.length === 0) {
    return true;
  }

  const available = new Set(shopLabels.map((item) => item.label));
  return selectedLabels.every((label) => available.has(label));
}

export function prioritizedLabels(labels: ShopLabel[], limit = 6) {
  return [...labels]
    .sort((a, b) => {
      const aIndex = priorityShopLabels.indexOf(a.label);
      const bIndex = priorityShopLabels.indexOf(b.label);
      const aPriority = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const bPriority = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return a.label.localeCompare(b.label);
    })
    .slice(0, limit);
}
