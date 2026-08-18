import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { collectionNameSchema } from "@/lib/collections";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CollectionRequest = {
  action?: "create" | "add" | "remove" | "delete";
  collectionId?: string;
  shopId?: string;
  name?: string;
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const body = (await request.json().catch(() => null)) as CollectionRequest | null;

  if (!supabase) {
    return NextResponse.json({ error: "Connect Supabase to sync collections." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to manage collections." }, { status: 401 });
  }

  if (body?.action === "create") {
    const parsed = collectionNameSchema.safeParse(body.name);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid collection name." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("saved_collections")
      .insert({ user_id: user.id, name: parsed.data, emoji: "☕", is_default: false })
      .select("id, name, emoji, is_default")
      .single();

    if (error) {
      return NextResponse.json({ error: error.code === "23505" ? "You already have a collection with that name." : error.message }, { status: 400 });
    }

    revalidatePath("/saved");
    return NextResponse.json({ collection: { id: data.id, name: data.name, emoji: data.emoji, isDefault: data.is_default, shopIds: [] } });
  }

  if (!body?.collectionId || !["add", "remove", "delete"].includes(body.action ?? "")) {
    return NextResponse.json({ error: "Invalid collection request." }, { status: 400 });
  }

  const { data: collection } = await supabase
    .from("saved_collections")
    .select("id, is_default")
    .eq("id", body.collectionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!collection) {
    return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  }

  if (body.action === "delete") {
    if (collection.is_default) {
      return NextResponse.json({ error: "Starter collections cannot be deleted." }, { status: 400 });
    }

    const { error } = await supabase.from("saved_collections").delete().eq("id", collection.id).eq("user_id", user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    if (!body.shopId) {
      return NextResponse.json({ error: "Missing shop ID." }, { status: 400 });
    }

    if (body.action === "add") {
      const [{ error: itemError }, { error: favoriteError }] = await Promise.all([
        supabase.from("saved_collection_items").upsert({ collection_id: collection.id, shop_id: body.shopId }),
        supabase.from("favorite_shops").upsert({ user_id: user.id, shop_id: body.shopId })
      ]);
      if (itemError || favoriteError) {
        return NextResponse.json({ error: itemError?.message ?? favoriteError?.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase.from("saved_collection_items").delete().eq("collection_id", collection.id).eq("shop_id", body.shopId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  revalidatePath("/saved");
  return NextResponse.json({ ok: true });
}
