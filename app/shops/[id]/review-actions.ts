"use server";

import { redirect } from "next/navigation";
import { reviewSchema } from "@/lib/reviews";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createReviewAction(formData: FormData) {
  const payload = reviewSchema.parse({
    shopId: formData.get("shopId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
    visitTags: formData.getAll("visitTags"),
    photoUrl: formData.get("photoUrl")
  });
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(`/shops/${payload.shopId}?review=demo`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(`/shops/${payload.shopId}`)}`);
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const reviewerName = profile?.full_name?.trim() || user.user_metadata.full_name || user.email?.split("@")[0] || "Coffee fan";

  const reviewValues = {
    reviewer_id: user.id,
    reviewer_name: reviewerName,
    rating: payload.rating,
    comment: payload.comment,
    visit_tags: payload.visitTags,
    photo_url: payload.photoUrl ?? null,
    is_published: true
  };
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("shop_id", payload.shopId)
    .eq("reviewer_id", user.id)
    .maybeSingle();

  const { error } = existingReview
    ? await supabase.from("reviews").update(reviewValues).eq("id", existingReview.id)
    : await supabase.from("reviews").insert({ shop_id: payload.shopId, ...reviewValues });

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/shops/${payload.shopId}?review=sent`);
}
