import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ favorites: [], demo: true });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ favorites: [], signedIn: false });
  }

  const { data, error } = await supabase.from("favorite_shops").select("shop_id").eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorites: data.map((row) => row.shop_id), signedIn: true });
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const body = (await request.json().catch(() => null)) as { shopId?: string; favorite?: boolean } | null;

  if (!body?.shopId) {
    return NextResponse.json({ error: "Missing shop ID." }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ synced: false, demo: true });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ synced: false, signedIn: false });
  }

  if (body.favorite) {
    const { error } = await supabase.from("favorite_shops").upsert({ user_id: user.id, shop_id: body.shopId });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from("favorite_shops").delete().eq("user_id", user.id).eq("shop_id", body.shopId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: collections, error: collectionsError } = await supabase
      .from("saved_collections")
      .select("id")
      .eq("user_id", user.id);

    if (collectionsError) {
      return NextResponse.json({ error: collectionsError.message }, { status: 500 });
    }

    const collectionIds = (collections ?? []).map((collection) => collection.id);
    if (collectionIds.length > 0) {
      const { error: itemsError } = await supabase
        .from("saved_collection_items")
        .delete()
        .in("collection_id", collectionIds)
        .eq("shop_id", body.shopId);

      if (itemsError) {
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ synced: true, signedIn: true });
}
