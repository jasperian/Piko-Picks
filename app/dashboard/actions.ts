"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { dayKeys, defaultWeeklyHours } from "@/lib/hours";
import { normalizeOptionalUrl } from "@/lib/onboarding";
import { normalizeShopLabels } from "@/lib/shop-labels";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WeeklyHours } from "@/lib/types";

const profileSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(10),
  phone: z.string().trim().min(5),
  website: z.string().trim().url().optional().or(z.literal("")),
  facebookUrl: z.string().trim().url().optional().or(z.literal("")),
  instagramUrl: z.string().trim().url().optional().or(z.literal("")),
  coverImageUrl: z.string().trim().url().optional().or(z.literal(""))
});

const menuItemSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  price: z.coerce.number().min(0),
  category: z.string().trim().min(1).default("Menu"),
  tags: z.string().trim().optional()
});

const promoSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().min(5),
  code: z.string().trim().optional(),
  endsAt: z.string().trim().optional(),
  isFeatured: z.coerce.boolean().optional()
});

const photoSchema = z.object({
  imageUrl: z.string().trim().url(),
  caption: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export async function saveShopProfileAction(formData: FormData) {
  const shopId = String(formData.get("shopId") ?? "");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(dashboardPath(shopId, "profile", "demo"));
  }

  const shop = await getOwnedShopOrRedirect(supabase, shopId);
  const payload = profileSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    facebookUrl: formData.get("facebookUrl"),
    instagramUrl: formData.get("instagramUrl"),
    coverImageUrl: formData.get("coverImageUrl")
  });
  const labels = normalizeShopLabels(formData.getAll("labels"));

  const { error } = await supabase
    .from("shops")
    .update({
      name: payload.name,
      description: payload.description,
      phone: payload.phone,
      website: normalizeOptionalUrl(payload.website),
      facebook_url: normalizeOptionalUrl(payload.facebookUrl),
      instagram_url: normalizeOptionalUrl(payload.instagramUrl),
      cover_image_url: normalizeOptionalUrl(payload.coverImageUrl),
      updated_at: new Date().toISOString()
    })
    .eq("id", shop.id);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("shop_labels").delete().eq("shop_id", shop.id);

  if (labels.length > 0) {
    const { error: labelsError } = await supabase
      .from("shop_labels")
      .insert(labels.map((item) => ({ shop_id: shop.id, label: item.label, group_name: item.groupName })));

    if (labelsError) {
      throw new Error(labelsError.message);
    }
  }

  revalidatePath("/dashboard");
  redirect(dashboardPath(shop.id, "profile", "profile"));
}

export async function saveOpeningHoursAction(formData: FormData) {
  const shopId = String(formData.get("shopId") ?? "");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(dashboardPath(shopId, "profile", "demo"));
  }

  const shop = await getOwnedShopOrRedirect(supabase, shopId);
  const openingHours = dayKeys.reduce((hours, day) => {
    hours[day] = {
      isClosed: formData.get(`${day}.isClosed`) === "on",
      open: String(formData.get(`${day}.open`) || defaultWeeklyHours[day].open),
      close: String(formData.get(`${day}.close`) || defaultWeeklyHours[day].close)
    };
    return hours;
  }, {} as WeeklyHours);

  const { error } = await supabase
    .from("shops")
    .update({
      opening_hours: openingHours,
      updated_at: new Date().toISOString()
    })
    .eq("id", shop.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  redirect(dashboardPath(shop.id, "profile", "hours"));
}

export async function createMenuItemAction(formData: FormData) {
  const shopId = String(formData.get("shopId") ?? "");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(dashboardPath(shopId, "menu", "demo"));
  }

  const shop = await getOwnedShopOrRedirect(supabase, shopId);
  const payload = menuItemSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    tags: formData.get("tags")
  });

  const categoryId = await getOrCreateCategoryId(supabase, shop.id, payload.category);
  const { data: item, error } = await supabase
    .from("menu_items")
    .insert({
      shop_id: shop.id,
      category_id: categoryId,
      name: payload.name,
      description: payload.description ?? "",
      price_cents: Math.round(payload.price * 100),
      currency: "PHP",
      is_available: true
    })
    .select("id")
    .single();

  if (error || !item) {
    throw new Error(error?.message ?? "Unable to create menu item.");
  }

  const tags = (payload.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (tags.length > 0) {
    await supabase.from("menu_item_tags").insert(tags.map((tag) => ({ menu_item_id: item.id, tag })));
  }

  revalidatePath("/dashboard");
  redirect(dashboardPath(shop.id, "menu", "menu"));
}

export async function createPromoAction(formData: FormData) {
  const shopId = String(formData.get("shopId") ?? "");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(dashboardPath(shopId, "promos", "demo"));
  }

  const shop = await getOwnedShopOrRedirect(supabase, shopId);
  const payload = promoSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    code: formData.get("code"),
    endsAt: formData.get("endsAt"),
    isFeatured: formData.get("isFeatured") === "on"
  });

  const { error } = await supabase.from("promos").insert({
    shop_id: shop.id,
    title: payload.title,
    description: payload.description,
    code: payload.code || null,
    ends_at: payload.endsAt ? new Date(payload.endsAt).toISOString() : null,
    is_active: true,
    is_featured: Boolean(payload.isFeatured)
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  redirect(dashboardPath(shop.id, "promos", "promo"));
}

export async function createShopPhotoAction(formData: FormData) {
  const shopId = String(formData.get("shopId") ?? "");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(dashboardPath(shopId, "gallery", "demo"));
  }

  const shop = await getOwnedShopOrRedirect(supabase, shopId);
  const payload = photoSchema.parse({
    imageUrl: formData.get("imageUrl"),
    caption: formData.get("caption"),
    sortOrder: formData.get("sortOrder") || 0
  });

  const { error } = await supabase.from("shop_photos").insert({
    shop_id: shop.id,
    image_url: normalizeOptionalUrl(payload.imageUrl),
    caption: payload.caption || null,
    sort_order: payload.sortOrder
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/shops/${shop.id}`);
  redirect(dashboardPath(shop.id, "gallery", "photo"));
}

export async function deleteShopPhotoAction(formData: FormData) {
  const shopId = String(formData.get("shopId") ?? "");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(dashboardPath(shopId, "gallery", "demo"));
  }

  const shop = await getOwnedShopOrRedirect(supabase, shopId);
  const photoId = String(formData.get("photoId") ?? "");

  const { error } = await supabase.from("shop_photos").delete().eq("id", photoId).eq("shop_id", shop.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/shops/${shop.id}`);
  redirect(dashboardPath(shop.id, "gallery", "photo-deleted"));
}

async function getOwnedShopOrRedirect(supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>, requestedShopId: string) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/dashboard");
  }

  const { data: shop, error } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .eq("id", requestedShopId)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (error || !shop) {
    redirect("/register-shop");
  }

  return shop;
}

function dashboardPath(shopId: string, tab: string, saved: string) {
  const params = new URLSearchParams({ tab, saved });
  if (shopId) params.set("shop", shopId);
  return `/dashboard?${params.toString()}`;
}

async function getOrCreateCategoryId(
  supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
  shopId: string,
  name: string
) {
  const { data: existing } = await supabase.from("menu_categories").select("id").eq("shop_id", shopId).eq("name", name).limit(1).maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  const { data: created, error } = await supabase.from("menu_categories").insert({ shop_id: shopId, name }).select("id").single();

  if (error || !created) {
    throw new Error(error?.message ?? "Unable to create menu category.");
  }

  return created.id;
}
