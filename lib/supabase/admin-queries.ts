import { demoShops } from "@/lib/demo-data";
import type { CoffeeShop, ShopStatus } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminShopRow = {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  status: ShopStatus;
  plan: CoffeeShop["plan"];
  phone: string | null;
  website: string | null;
  cover_image_url: string | null;
  shop_locations: Array<{
    address_line: string;
    city: string;
    latitude: number;
    longitude: number;
  }>;
  menu_items: Array<{ id: string }>;
};

export async function getAdminShops() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return demoShops;
  }

  const { data, error } = await supabase
    .from("shops")
    .select("id, owner_id, name, description, status, plan, phone, website, cover_image_url, shop_locations(address_line, city, latitude, longitude), menu_items(id)")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return demoShops;
  }

  return (data as unknown as AdminShopRow[]).map((row) => {
    const location = row.shop_locations[0];
    return {
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      description: row.description,
      status: row.status,
      plan: row.plan,
      createdAt: undefined,
      updatedAt: undefined,
      phone: row.phone ?? "",
      website: row.website ?? undefined,
      facebookUrl: undefined,
      instagramUrl: undefined,
      coverImageUrl: row.cover_image_url ?? "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
      address: location?.address_line ?? "No address",
      city: location?.city ?? "No city",
      coordinates: {
        latitude: location?.latitude ?? 0,
        longitude: location?.longitude ?? 0
      },
      openingHours: "",
      weeklyHours: {
        sun: { isClosed: false, open: "08:00", close: "18:00" },
        mon: { isClosed: false, open: "08:00", close: "18:00" },
        tue: { isClosed: false, open: "08:00", close: "18:00" },
        wed: { isClosed: false, open: "08:00", close: "18:00" },
        thu: { isClosed: false, open: "08:00", close: "18:00" },
        fri: { isClosed: false, open: "08:00", close: "18:00" },
        sat: { isClosed: false, open: "08:00", close: "18:00" }
      },
      promos: [],
      reviews: [],
      labels: [],
      photos: [],
      menu: Array.from({ length: row.menu_items.length }, (_, index) => ({
        id: `${row.id}-item-${index}`,
        shopId: row.id,
        category: "Menu",
        name: "Menu item",
        description: "",
        priceCents: 0,
        currency: "PHP",
        tags: [],
        isAvailable: true
      }))
    } satisfies CoffeeShop;
  });
}
