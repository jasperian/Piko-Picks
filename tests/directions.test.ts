import { describe, expect, it } from "vitest";
import { googleMapsDirectionsUrl, shopMapLabel, wazeDirectionsUrl } from "@/lib/directions";

describe("directions urls", () => {
  it("builds Google Maps destination links", () => {
    const url = googleMapsDirectionsUrl({ latitude: 14.6335, longitude: 121.0389 }, "Ember Lane");

    expect(url).toContain("https://www.google.com/maps/dir/");
    expect(url).toContain("destination=14.6335%2C121.0389");
  });

  it("builds Waze destination links", () => {
    expect(wazeDirectionsUrl({ latitude: 14.6335, longitude: 121.0389 })).toBe(
      "https://www.waze.com/ul?ll=14.6335,121.0389&navigate=yes"
    );
  });
});

describe("shopMapLabel", () => {
  it("combines shop name and address", () => {
    expect(shopMapLabel({ name: "Ember Lane", address: "72 Scout Rallos Street", city: "Quezon City" })).toBe(
      "Ember Lane, 72 Scout Rallos Street, Quezon City"
    );
  });
});
