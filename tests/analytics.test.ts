import { describe, expect, it } from "vitest";
import { buildOwnerInsights, percentChange, summarizeAnalytics } from "@/lib/analytics";

describe("summarizeAnalytics", () => {
  it("counts analytics events by business category", () => {
    expect(
      summarizeAnalytics([
        { event_type: "shop_view" },
        { event_type: "shop_view" },
        { event_type: "google_maps_click" },
        { event_type: "waze_click" }
      ])
    ).toEqual({
      shopViews: 2,
      directionClicks: 2
    });
  });
});

describe("owner insights", () => {
  it("separates current and previous periods and finds strongest intent", () => {
    const insights = buildOwnerInsights(
      [
        { event_type: "shop_view", created_at: "2026-08-14T10:00:00.000Z" },
        { event_type: "google_maps_click", created_at: "2026-08-14T10:01:00.000Z" },
        { event_type: "google_maps_click", created_at: "2026-08-14T10:02:00.000Z" },
        { event_type: "shop_view", created_at: "2026-07-10T10:00:00.000Z" }
      ],
      new Date("2026-08-15T12:00:00.000Z")
    );

    expect(insights.current.shopViews).toBe(1);
    expect(insights.previous.shopViews).toBe(1);
    expect(insights.strongestIntent).toBe("Directions");
    expect(insights.actionRate).toBe(200);
  });

  it("handles percent changes from a zero baseline", () => {
    expect(percentChange(8, 4)).toBe(100);
    expect(percentChange(2, 0)).toBeNull();
    expect(percentChange(0, 0)).toBe(0);
  });
});
