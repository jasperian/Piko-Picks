"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { feedReactionTypes } from "@/lib/feed";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FeedReactionType } from "@/lib/types";

const postSchema = z.object({
  title: z.string().trim().min(4).max(140),
  body: z.string().trim().min(8).max(2000),
  topic: z.string().trim().min(2).max(40)
});

const commentSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().trim().min(2).max(800)
});

const reactionSchema = z.object({
  postId: z.string().uuid(),
  reactionType: z.enum(feedReactionTypes as [FeedReactionType, ...FeedReactionType[]])
});

export async function createFeedPostAction(formData: FormData) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect("/feed?notice=demo");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/feed");
  }

  const payload = postSchema.parse({
    title: formData.get("title"),
    body: formData.get("body"),
    topic: formData.get("topic") || "General"
  });

  const { error } = await supabase.from("feed_posts").insert({
    author_id: user.id,
    title: payload.title,
    body: payload.body,
    topic: payload.topic
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/feed");
  redirect("/feed?notice=posted");
}

export async function createFeedCommentAction(formData: FormData) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect("/feed?notice=demo");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/feed");
  }

  const payload = commentSchema.parse({
    postId: formData.get("postId"),
    body: formData.get("body")
  });

  const { error } = await supabase.from("feed_comments").insert({
    post_id: payload.postId,
    author_id: user.id,
    body: payload.body
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/feed");
  redirect("/feed?notice=commented");
}

export async function toggleFeedReactionAction(formData: FormData) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect("/feed?notice=demo");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/feed");
  }

  const payload = reactionSchema.parse({
    postId: formData.get("postId"),
    reactionType: formData.get("reactionType")
  });

  const { data: existing } = await supabase
    .from("feed_reactions")
    .select("reaction_type")
    .eq("post_id", payload.postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.reaction_type === payload.reactionType) {
    const { error } = await supabase.from("feed_reactions").delete().eq("post_id", payload.postId).eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("feed_reactions").upsert({
      post_id: payload.postId,
      user_id: user.id,
      reaction_type: payload.reactionType
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/feed");
  redirect("/feed");
}
