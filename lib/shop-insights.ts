import { formatMoney } from "@/lib/format";
import type { CoffeeShop } from "@/lib/types";

export function menuPriceRange(shop: CoffeeShop) {
  const availableItems = shop.menu.filter((item) => item.isAvailable);

  if (availableItems.length === 0) {
    return "Menu unavailable";
  }

  const prices = availableItems.map((item) => item.priceCents);
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  const currency = availableItems[0].currency;

  if (minimum === maximum) {
    return formatMoney(minimum, currency);
  }

  return `${formatMoney(minimum, currency)}–${formatMoney(maximum, currency)}`;
}

export function signatureDrink(shop: CoffeeShop, query = "") {
  const availableItems = shop.menu.filter((item) => item.isAvailable);
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery) {
    const queryMatch = availableItems.find((item) =>
      [item.name, item.description, item.category, ...item.tags].some((value) => value.toLowerCase().includes(normalizedQuery))
    );

    if (queryMatch) {
      return queryMatch;
    }
  }

  return availableItems.find((item) => item.category.toLowerCase().includes("signature")) ?? availableItems[0];
}
