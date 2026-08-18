import { describe, expect, it } from "vitest";
import { activePromos, isPromoActive, promoDateLabel } from "@/lib/promos";
import type { Promo } from "@/lib/types";

const basePromo: Promo = {
  id: "promo-1",
  shopId: "shop-1",
  title: "Free pastry",
  description: "Morning bundle.",
  isActive: true,
  isFeatured: false
};

describe("isPromoActive", () => {
  it("filters inactive, future, and expired promos", () => {
    const now = new Date("2026-05-07T10:00:00Z");

    expect(isPromoActive(basePromo, now)).toBe(true);
    expect(isPromoActive({ ...basePromo, isActive: false }, now)).toBe(false);
    expect(isPromoActive({ ...basePromo, startsAt: "2026-05-08T10:00:00Z" }, now)).toBe(false);
    expect(isPromoActive({ ...basePromo, endsAt: "2026-05-06T10:00:00Z" }, now)).toBe(false);
  });
});

describe("activePromos", () => {
  it("puts featured promos first", () => {
    const now = new Date("2026-05-07T10:00:00Z");
    const promos = activePromos(
      [
        { ...basePromo, id: "regular", title: "Regular" },
        { ...basePromo, id: "featured", title: "Featured", isFeatured: true }
      ],
      now
    );

    expect(promos[0].id).toBe("featured");
  });
});

describe("promoDateLabel", () => {
  it("formats promo end dates", () => {
    expect(promoDateLabel({ ...basePromo, endsAt: "2026-05-20T00:00:00Z" })).toContain("May");
    expect(promoDateLabel(basePromo)).toBe("Limited time");
  });
});
