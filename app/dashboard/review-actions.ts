"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const reviewModerationSchema = z.object({
  reviewId: z.string().min(1),
  shopId: z.string().min(1),
  isPublished: z.coerce.boolean()
});

export async function updateReviewVisibilityAction(formData: FormData) {
  const payload = reviewModerationSchema.parse({
    reviewId: formData.get("reviewId"),
    shopId: formData.get("shopId"),
    isPublished: formData.get("isPublished") === "true"
  });
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(`/dashboard?shop=${encodeURIComponent(payload.shopId)}&tab=reviews&saved=demo`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/dashboard");
  }

  const { error } = await supabase
    .from("reviews")
    .update({ is_published: payload.isPublished })
    .eq("id", payload.reviewId)
    .eq("shop_id", payload.shopId)
    .in(
      "shop_id",
      (await supabase.from("shops").select("id").eq("owner_id", user.id)).data?.map((shop) => shop.id) ?? []
    );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard?shop=${encodeURIComponent(payload.shopId)}&tab=reviews&saved=review`);
}
