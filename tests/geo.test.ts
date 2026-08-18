import { describe, expect, it } from "vitest";
import { distanceKm, formatDistance } from "@/lib/geo";

describe("distanceKm", () => {
  it("calculates nearby city distance", () => {
    const manila = { latitude: 14.5995, longitude: 120.9842 };
    const makati = { latitude: 14.5547, longitude: 121.0244 };

    expect(distanceKm(manila, makati)).toBeGreaterThan(6);
    expect(distanceKm(manila, makati)).toBeLessThan(8);
  });
});

describe("formatDistance", () => {
  it("formats meters and kilometers", () => {
    expect(formatDistance(0.4)).toBe("400 m");
    expect(formatDistance(2.345)).toBe("2.3 km");
    expect(formatDistance()).toBe("Distance unknown");
  });
});
