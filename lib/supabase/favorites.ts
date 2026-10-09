import { defaultSavedCollections, type SavedCollection } from "@/lib/collections";
import { getPublicShops } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";

export async function getSavedLibraryForCurrentUser(): Promise<{ signedIn: boolean; favoriteShopIds: string[]; collections: SavedCollection[] }> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { signedIn: false, favoriteShopIds: [], collections: [] };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { signedIn: false, favoriteShopIds: [], collections: [] };
  }

  await supabase.from("saved_collections").upsert(
    defaultSavedCollections.map((collection) => ({ user_id: user.id, name: collection.name, emoji: collection.emoji, is_default: true })),
    { onConflict: "user_id,name", ignoreDuplicates: true }
  );

  const [{ data: favorites }, { data: collections }] = await Promise.all([
    supabase.from("favorite_shops").select("shop_id").eq("user_id", user.id),
    supabase.from("saved_collections").select("id, name, emoji, is_default, saved_collection_items(shop_id)").eq("user_id", user.id).order("created_at")
  ]);

  return {
    signedIn: true,
    favoriteShopIds: (favorites ?? []).map((row) => row.shop_id),
    collections: (collections ?? []).map((collection) => ({
      id: collection.id,
      name: collection.name,
      emoji: collection.emoji,
      isDefault: collection.is_default,
      shopIds: (collection.saved_collection_items ?? []).map((item: { shop_id: string }) => item.shop_id)
    }))
  };
}

export async function getFavoriteShopsForCurrentUser() {
  const library = await getSavedLibraryForCurrentUser();

  if (!library.signedIn) {
    return [];
  }

  const ids = new Set(library.favoriteShopIds);
  const shops = await getPublicShops();
  return shops.filter((shop) => ids.has(shop.id));
}
