import { describe, expect, it } from "vitest";
import { formatOpenStatus, isShopOpenNow, todaysHoursLabel } from "@/lib/hours";
import type { WeeklyHours } from "@/lib/types";

const hours: WeeklyHours = {
  sun: { isClosed: true, open: "08:00", close: "18:00" },
  mon: { isClosed: false, open: "07:00", close: "21:00" },
  tue: { isClosed: false, open: "07:00", close: "21:00" },
  wed: { isClosed: false, open: "07:00", close: "21:00" },
  thu: { isClosed: false, open: "07:00", close: "21:00" },
  fri: { isClosed: false, open: "07:00", close: "21:00" },
  sat: { isClosed: false, open: "22:00", close: "02:00" }
};

describe("isShopOpenNow", () => {
  it("detects normal same-day hours", () => {
    expect(isShopOpenNow(hours, new Date(2026, 4, 4, 10, 0))).toBe(true);
    expect(isShopOpenNow(hours, new Date(2026, 4, 4, 22, 0))).toBe(false);
  });

  it("detects overnight hours", () => {
    expect(isShopOpenNow(hours, new Date(2026, 4, 9, 23, 0))).toBe(true);
  });

  it("detects closed days", () => {
    expect(isShopOpenNow(hours, new Date(2026, 4, 10, 10, 0))).toBe(false);
  });
});

describe("hours labels", () => {
  it("formats current status and today's hours", () => {
    const monday = new Date(2026, 4, 4, 10, 0);

    expect(formatOpenStatus(hours, monday)).toBe("Open now");
    expect(todaysHoursLabel(hours, monday)).toContain("7:00");
  });
});
