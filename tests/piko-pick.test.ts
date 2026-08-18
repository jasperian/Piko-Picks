import { describe, expect, it } from "vitest";
import { demoShops } from "@/lib/demo-data";
import { getPikoPick } from "@/lib/piko-pick";
import { searchShops } from "@/lib/search";

describe("getPikoPick", () => {
  it("explains a drink-based recommendation", () => {
    const results = searchShops(demoShops, {
      query: "cold brew",
      radiusKm: 25,
      onlyAvailable: true,
      openNow: false
    });

    const pick = getPikoPick(results, { query: "cold brew", selectedLabels: [], hasLocation: false });

    expect(pick?.shop.name).toBe("North Star Roasters");
    expect(pick?.reasons).toContain("Serves Citrus Cold Brew");
    expect(pick?.personalized).toBe(true);
  });

  it("uses selected amenities as visible reasons", () => {
    const results = searchShops(demoShops, {
      query: "",
      radiusKm: 25,
      onlyAvailable: true,
      openNow: false,
      selectedLabels: ["Free WiFi", "Work Friendly"]
    });

    const pick = getPikoPick(results, { query: "", selectedLabels: ["Free WiFi", "Work Friendly"], hasLocation: false });

    expect(pick?.shop.name).toBe("Ember Lane Coffee");
    expect(pick?.reasons).toContain("Free WiFi + Work Friendly");
  });

  it("lets a stated mood outweigh general popularity", () => {
    const results = searchShops(demoShops, {
      query: "latte",
      radiusKm: 25,
      onlyAvailable: true,
      openNow: false
    });

    const pick = getPikoPick(results, { query: "latte", selectedLabels: ["Chill"], hasLocation: false });

    expect(pick?.shop.name).toBe("Harbor Cup");
    expect(pick?.reasons).toContain("Chill");
  });

  it("returns no recommendation when filters have no matches", () => {
    expect(getPikoPick([], { query: "tea ceremony", selectedLabels: [], hasLocation: false })).toBeUndefined();
  });
});
