import { describe, expect, it } from "vitest";
import { demoShops } from "@/lib/demo-data";
import { menuPriceRange, signatureDrink } from "@/lib/shop-insights";

describe("shop card insights", () => {
  it("formats the available menu price range", () => {
    expect(menuPriceRange(demoShops[0])).toBe("₱175–₱210");
  });

  it("prefers a drink matching the active search", () => {
    expect(signatureDrink(demoShops[1], "cold brew")?.name).toBe("Citrus Cold Brew");
  });

  it("uses a signature-category drink by default", () => {
    expect(signatureDrink(demoShops[0])?.name).toBe("Ube Latte");
  });
});
