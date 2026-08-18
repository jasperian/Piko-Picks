"use server";

import { redirect } from "next/navigation";
import { defaultWeeklyHours } from "@/lib/hours";
import { parseMenuDrafts, normalizeOptionalUrl, shopRegistrationSchema } from "@/lib/onboarding";
import { normalizeShopLabels } from "@/lib/shop-labels";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function registerShopAction(formData: FormData) {
  const isBranch = formData.get("registrationType") === "branch";
  const payload = shopRegistrationSchema.parse({
    ownerName: formData.get("ownerName"),
    ownerEmail: formData.get("ownerEmail"),
    shopName: formData.get("shopName"),
    description: formData.get("description"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    facebookUrl: formData.get("facebookUrl"),
    instagramUrl: formData.get("instagramUrl"),
    coverImageUrl: formData.get("coverImageUrl"),
    address: formData.get("address"),
    city: formData.get("city"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    menuItemsJson: formData.get("menuItemsJson")
  });

  const menuItems = parseMenuDrafts(payload.menuItemsJson);
  const labels = normalizeShopLabels(formData.getAll("labels"));
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(`/register-shop/success?demo=1&shop=${encodeURIComponent(payload.shopName)}${isBranch ? "&branch=1" : ""}`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(isBranch ? "/register-shop?branch=1" : "/register-shop")}`);
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    full_name: payload.ownerName,
    email: user.email,
    role: "shop_owner"
  });

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .insert({
      owner_id: user.id,
      name: payload.shopName,
      description: payload.description,
      phone: payload.phone,
      website: normalizeOptionalUrl(payload.website),
      facebook_url: normalizeOptionalUrl(payload.facebookUrl),
      instagram_url: normalizeOptionalUrl(payload.instagramUrl),
      cover_image_url: normalizeOptionalUrl(payload.coverImageUrl),
      status: "published",
      plan: "free",
      opening_hours: defaultWeeklyHours
    })
    .select("id")
    .single();

  if (shopError || !shop) {
    throw new Error(shopError?.message ?? "Unable to create shop.");
  }

  await supabase.from("shop_locations").insert({
    shop_id: shop.id,
    address_line: payload.address,
    city: payload.city,
    latitude: payload.latitude,
    longitude: payload.longitude
  });

  if (labels.length > 0) {
    await supabase.from("shop_labels").insert(labels.map((item) => ({ shop_id: shop.id, label: item.label, group_name: item.groupName })));
  }

  if (menuItems.length > 0) {
    const { data: category, error: categoryError } = await supabase
      .from("menu_categories")
      .insert({
        shop_id: shop.id,
        name: "Menu",
        sort_order: 0
      })
      .select("id")
      .single();

    if (categoryError || !category) {
      throw new Error(categoryError?.message ?? "Unable to create menu category.");
    }

    await supabase.from("menu_items").insert(
      menuItems.map((item, index) => ({
        shop_id: shop.id,
        category_id: category.id,
        name: item.name,
        description: item.description ?? "",
        price_cents: Math.round(item.price * 100),
        currency: "PHP",
        sort_order: index,
        is_available: true
      }))
    );
  }

  redirect(`/register-shop/success?shop=${encodeURIComponent(payload.shopName)}&shopId=${shop.id}${isBranch ? "&branch=1" : ""}`);
}
