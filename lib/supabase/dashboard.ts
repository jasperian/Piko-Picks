import { demoShops } from "@/lib/demo-data";
import { buildOwnerInsights, emptyAnalyticsSummary, type AnalyticsEventType, type AnalyticsSummary, type OwnerInsights } from "@/lib/analytics";
import type { CoffeeShop, Review } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getPublicShops } from "@/lib/supabase/queries";

export type DashboardData = {
  shop: CoffeeShop;
  ownedShops: Array<{ id: string; name: string; status: CoffeeShop["status"] }>;
  reviews: Review[];
  analytics: AnalyticsSummary;
  insights: OwnerInsights;
  isDemo: boolean;
  ownerEmail?: string;
};

export async function getShopDashboardData(selectedShopId?: string): Promise<DashboardData> {
  const demoInsights = createDemoInsights();
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      shop: demoShops[0],
      ownedShops: [{ id: demoShops[0].id, name: demoShops[0].name, status: demoShops[0].status }],
      reviews: demoShops[0].reviews,
      analytics: demoInsights.current,
      insights: demoInsights,
      isDemo: true
    };
  }

  const user = await getCurrentUser();

  if (!user) {
    return {
      shop: demoShops[0],
      ownedShops: [{ id: demoShops[0].id, name: demoShops[0].name, status: demoShops[0].status }],
      reviews: demoShops[0].reviews,
      analytics: demoInsights.current,
      insights: demoInsights,
      isDemo: true
    };
  }

  const { data: ownedShopRows } = await supabase
    .from("shops")
    .select("id, name, status")
    .eq("owner_id", user.id)
    .order("created_at");
  const ownedShops = (ownedShopRows ?? []) as Array<{ id: string; name: string; status: CoffeeShop["status"] }>;
  const ownedShop = ownedShops.find((item) => item.id === selectedShopId) ?? ownedShops[0];

  if (!ownedShop) {
    return {
      shop: demoShops[0],
      ownedShops: [],
      reviews: [],
      analytics: emptyAnalyticsSummary,
      insights: buildOwnerInsights([]),
      isDemo: true,
      ownerEmail: user.email
    };
  }

  const shops = await getPublicShops();
  const shop = shops.find((item) => item.id === ownedShop.id) ?? demoShops[0];
  const { data: analyticsRows } = await supabase
    .from("analytics_events")
    .select("event_type, created_at")
    .eq("shop_id", ownedShop.id)
    .gte("created_at", daysAgo(60));

  const insights = buildOwnerInsights((analyticsRows ?? []) as Array<{ event_type: AnalyticsEventType; created_at: string }>);

  return {
    shop,
    ownedShops,
    reviews: shop.reviews,
    analytics: insights.current,
    insights,
    isDemo: false,
    ownerEmail: user.email
  };
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function createDemoInsights() {
  const now = new Date();
  const rows: Array<{ event_type: AnalyticsEventType; created_at: string }> = [];
  const pattern = [8, 12, 9, 15, 18, 22, 17];

  pattern.forEach((views, dayIndex) => {
    const createdAt = new Date(now);
    createdAt.setUTCDate(createdAt.getUTCDate() + dayIndex - 6);
    for (let index = 0; index < views; index += 1) rows.push({ event_type: "shop_view", created_at: createdAt.toISOString() });
    for (let index = 0; index < Math.round(views * 0.3); index += 1) rows.push({ event_type: "google_maps_click", created_at: createdAt.toISOString() });
  });

  return buildOwnerInsights(rows, now);
}
