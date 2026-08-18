import { demoShops } from "@/lib/demo-data";
import { parseWeeklyHours, todaysHoursLabel } from "@/lib/hours";
import type { CoffeeShop, MenuItem, Promo, Review, SearchFilters, SearchResult, ShopLabel, ShopPhoto } from "@/lib/types";
import { searchShops } from "@/lib/search";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ShopRow = {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  status: CoffeeShop["status"];
  plan: CoffeeShop["plan"];
  created_at: string | null;
  updated_at: string | null;
  phone: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  cover_image_url: string | null;
  opening_hours: unknown;
  shop_locations: Array<{
    address_line: string;
    city: string;
    latitude: number;
    longitude: number;
  }>;
  shop_labels: Array<{
    label: string;
    group_name: ShopLabel["groupName"];
  }>;
  shop_photos: Array<{
    id: string;
    image_url: string;
    caption: string | null;
    sort_order: number;
  }>;
  menu_items: Array<{
    id: string;
    category_id: string | null;
    name: string;
    description: string;
    price_cents: number;
    currency: string;
    image_url: string | null;
    is_available: boolean;
    menu_categories: { name: string } | { name: string }[] | null;
    menu_item_tags: Array<{ tag: string }>;
  }>;
  promos: Array<{
    id: string;
    title: string;
    description: string;
    code: string | null;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    is_featured: boolean;
  }>;
  reviews: Array<{
    id: string;
    reviewer_id: string | null;
    reviewer_name: string;
    rating: number;
    comment: string;
    visit_tags: string[] | null;
    photo_url: string | null;
    is_verified_visit: boolean | null;
    is_published: boolean;
    created_at: string;
  }>;
};

type PublicShopSearchRow = {
  shop_id: string;
  distance_km: number | null;
  matching_drink_count: number;
};

export async function getPublicShops(): Promise<CoffeeShop[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return demoShops;
  }

  const { data, error } = await supabase
    .from("shops")
    .select(
      "id, owner_id, name, description, status, plan, created_at, updated_at, phone, website, facebook_url, instagram_url, cover_image_url, opening_hours, shop_locations(address_line, city, latitude, longitude), shop_labels(label, group_name), shop_photos(id, image_url, caption, sort_order), promos(id, title, description, code, starts_at, ends_at, is_active, is_featured), reviews(id, reviewer_id, reviewer_name, rating, comment, visit_tags, photo_url, is_verified_visit, is_published, created_at), menu_items(id, category_id, name, description, price_cents, currency, image_url, is_available, menu_categories(name), menu_item_tags(tag))"
    )
    .eq("status", "published");

  if (error || !data) {
    return demoShops;
  }

  return (data as unknown as ShopRow[]).map(mapShopRow).filter(Boolean) as CoffeeShop[];
}

export async function getShopById(id: string) {
  const shops = await getPublicShops();
  return shops.find((shop) => shop.id === id);
}

export async function getSearchResults(filters: SearchFilters): Promise<SearchResult[]> {
  const supabase = createSupabaseServerClient();

  if (supabase && filters.userLocation) {
    const { data, error } = await supabase.rpc("search_public_shops", {
      search_text: filters.query,
      user_lat: filters.userLocation.latitude,
      user_lon: filters.userLocation.longitude,
      radius_km: filters.radiusKm,
      max_price_cents: filters.maxPriceCents ?? null,
      only_available: filters.onlyAvailable
    });

    if (!error && data) {
      const shops = await getPublicShops();
      const byId = new Map(shops.map((shop) => [shop.id, shop]));
      return (data as PublicShopSearchRow[])
        .map((row) => {
          const shop = byId.get(row.shop_id);
          if (!shop) {
            return null;
          }

          return {
            ...shop,
            distanceKm: row.distance_km ?? undefined,
            matchingDrinkCount: Number(row.matching_drink_count)
          };
        })
        .filter(Boolean) as SearchResult[];
    }
  }

  return searchShops(await getPublicShops(), filters);
}

function mapShopRow(row: ShopRow): CoffeeShop | null {
  const location = row.shop_locations[0];

  if (!location) {
    return null;
  }

  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description,
    status: row.status,
    plan: row.plan ?? "free",
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    phone: row.phone ?? "",
    website: row.website ?? undefined,
    facebookUrl: row.facebook_url ?? undefined,
    instagramUrl: row.instagram_url ?? undefined,
    coverImageUrl: row.cover_image_url ?? "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    address: location.address_line,
    city: location.city,
    coordinates: {
      latitude: location.latitude,
      longitude: location.longitude
    },
    openingHours: formatOpeningHours(row.opening_hours),
    weeklyHours: parseWeeklyHours(row.opening_hours),
    labels: row.shop_labels.map((item) => ({ label: item.label, groupName: item.group_name })),
    photos: row.shop_photos.map((photo) => mapShopPhotoRow(photo, row.id)).sort((a, b) => a.sortOrder - b.sortOrder),
    promos: row.promos.map((promo) => mapPromoRow(promo, row.id)),
    reviews: row.reviews.map((review) => mapReviewRow(review, row.id)),
    menu: row.menu_items.map((item) => mapMenuItem(item, row.id))
  };
}

function mapShopPhotoRow(row: ShopRow["shop_photos"][number], shopId: string): ShopPhoto {
  return {
    id: row.id,
    shopId,
    imageUrl: row.image_url,
    caption: row.caption ?? undefined,
    sortOrder: row.sort_order
  };
}

function mapMenuItem(row: ShopRow["menu_items"][number], shopId: string): MenuItem {
  const category = Array.isArray(row.menu_categories) ? row.menu_categories[0] : row.menu_categories;

  return {
    id: row.id,
    shopId,
    category: category?.name ?? "Menu",
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    currency: row.currency,
    imageUrl: row.image_url ?? undefined,
    isAvailable: row.is_available,
    tags: row.menu_item_tags.map((tag) => tag.tag)
  };
}

function formatOpeningHours(value: unknown) {
  return todaysHoursLabel(parseWeeklyHours(value));
}

function mapPromoRow(row: ShopRow["promos"][number], shopId: string): Promo {
  return {
    id: row.id,
    shopId,
    title: row.title,
    description: row.description,
    code: row.code ?? undefined,
    startsAt: row.starts_at ?? undefined,
    endsAt: row.ends_at ?? undefined,
    isActive: row.is_active,
    isFeatured: row.is_featured
  };
}

function mapReviewRow(row: ShopRow["reviews"][number], shopId: string): Review {
  return {
    id: row.id,
    shopId,
    reviewerId: row.reviewer_id ?? undefined,
    reviewerName: row.reviewer_name,
    rating: row.rating,
    comment: row.comment,
    visitTags: row.visit_tags ?? [],
    photoUrl: row.photo_url ?? undefined,
    isVerifiedVisit: Boolean(row.is_verified_visit),
    isPublished: row.is_published,
    createdAt: row.created_at
  };
}
