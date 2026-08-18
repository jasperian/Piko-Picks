import { describe, expect, it } from "vitest";
import { demoShops } from "@/lib/demo-data";
import { searchShops } from "@/lib/search";

describe("searchShops", () => {
  it("matches drinks by tag and name", () => {
    const results = searchShops(demoShops, {
      query: "cold brew",
      radiusKm: 25,
      onlyAvailable: true,
      openNow: false
    });

    expect(results.map((shop) => shop.name)).toContain("North Star Roasters");
  });

  it("filters by manual area", () => {
    const results = searchShops(demoShops, {
      query: "",
      manualArea: "Makati",
      radiusKm: 25,
      onlyAvailable: true,
      openNow: false
    });

    expect(results).toHaveLength(1);
    expect(results[0].city).toBe("Makati");
  });

  it("filters by radius when user location is provided", () => {
    const results = searchShops(demoShops, {
      query: "",
      radiusKm: 3,
      onlyAvailable: true,
      openNow: false,
      userLocation: { latitude: 14.5607, longitude: 121.0297 }
    });

    expect(results.map((shop) => shop.name)).toEqual(["North Star Roasters"]);
  });

  it("uses a stable alphabetical fallback when relevance is otherwise broad", () => {
    const results = searchShops(demoShops, {
      query: "",
      radiusKm: 25,
      onlyAvailable: true,
      openNow: false
    });

    expect(results.map((shop) => shop.name)).toEqual(["Ember Lane Coffee", "Harbor Cup", "North Star Roasters"]);
  });

  it("matches shops by label text", () => {
    const results = searchShops(demoShops, {
      query: "pet friendly",
      radiusKm: 25,
      onlyAvailable: true,
      openNow: false
    });

    expect(results.map((shop) => shop.name)).toContain("Harbor Cup");
  });

  it("filters by selected shop labels", () => {
    const results = searchShops(demoShops, {
      query: "",
      radiusKm: 25,
      onlyAvailable: true,
      openNow: false,
      selectedLabels: ["Free WiFi", "Work Friendly"]
    });

    expect(results.map((shop) => shop.name)).toEqual(["Ember Lane Coffee"]);
  });
});
