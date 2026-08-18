import type { Promo } from "@/lib/types";

export function activePromos(promos: Promo[], now = new Date()) {
  return promos
    .filter((promo) => isPromoActive(promo, now))
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.title.localeCompare(b.title));
}

export function isPromoActive(promo: Promo, now = new Date()) {
  if (!promo.isActive) {
    return false;
  }

  const startsAt = promo.startsAt ? new Date(promo.startsAt) : null;
  const endsAt = promo.endsAt ? new Date(promo.endsAt) : null;

  if (startsAt && startsAt > now) {
    return false;
  }

  if (endsAt && endsAt < now) {
    return false;
  }

  return true;
}

export function promoDateLabel(promo: Promo) {
  if (!promo.endsAt) {
    return "Limited time";
  }

  return `Until ${new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric" }).format(new Date(promo.endsAt))}`;
}
