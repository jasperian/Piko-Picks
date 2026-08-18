import { z } from "zod";

export const analyticsEventTypes = [
  "shop_view",
  "google_maps_click",
  "waze_click"
] as const;

export type AnalyticsEventType = (typeof analyticsEventTypes)[number];

export const analyticsEventSchema = z.object({
  shopId: z.string().min(1),
  eventType: z.enum(analyticsEventTypes),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export type AnalyticsSummary = {
  shopViews: number;
  directionClicks: number;
};

export type OwnerInsightPoint = {
  label: string;
  views: number;
  actions: number;
};

export type OwnerInsights = {
  current: AnalyticsSummary;
  previous: AnalyticsSummary;
  dailyActivity: OwnerInsightPoint[];
  actionRate: number;
  strongestIntent: "Directions" | "None yet";
};

export const emptyAnalyticsSummary: AnalyticsSummary = {
  shopViews: 0,
  directionClicks: 0
};

export function summarizeAnalytics(events: Array<{ event_type: AnalyticsEventType }>): AnalyticsSummary {
  return {
    shopViews: events.filter((event) => event.event_type === "shop_view").length,
    directionClicks: events.filter((event) => event.event_type === "google_maps_click" || event.event_type === "waze_click").length
  };
}

export function buildOwnerInsights(
  events: Array<{ event_type: AnalyticsEventType; created_at: string }>,
  now = new Date()
): OwnerInsights {
  const currentStart = startOfDay(addDays(now, -29));
  const previousStart = startOfDay(addDays(now, -59));
  const currentEvents = events.filter((event) => new Date(event.created_at) >= currentStart);
  const previousEvents = events.filter((event) => {
    const createdAt = new Date(event.created_at);
    return createdAt >= previousStart && createdAt < currentStart;
  });
  const current = summarizeAnalytics(currentEvents);
  const previous = summarizeAnalytics(previousEvents);
  const totalActions = current.directionClicks;

  return {
    current,
    previous,
    actionRate: current.shopViews > 0 ? Math.round((totalActions / current.shopViews) * 100) : 0,
    strongestIntent: current.directionClicks > 0 ? "Directions" : "None yet",
    dailyActivity: Array.from({ length: 7 }, (_, index) => {
      const day = startOfDay(addDays(now, index - 6));
      const nextDay = startOfDay(addDays(day, 1));
      const dayEvents = currentEvents.filter((event) => {
        const createdAt = new Date(event.created_at);
        return createdAt >= day && createdAt < nextDay;
      });

      return {
        label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(day),
        views: dayEvents.filter((event) => event.event_type === "shop_view").length,
        actions: dayEvents.filter((event) => event.event_type === "google_maps_click" || event.event_type === "waze_click").length
      };
    })
  };
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return Math.round(((current - previous) / previous) * 100);
}

function addDays(value: Date, amount: number) {
  const result = new Date(value);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}

function startOfDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}
