import { demoFeedPosts, emptyReactionCounts } from "@/lib/feed";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import type { FeedComment, FeedPost, FeedReactionType } from "@/lib/types";

type ProfileRelation = { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null;

type FeedPostRow = {
  id: string;
  title: string;
  body: string;
  topic: string | null;
  created_at: string;
  profiles: ProfileRelation;
  feed_comments: Array<{
    id: string;
    body: string;
    created_at: string;
    profiles: ProfileRelation;
  }>;
  feed_reactions: Array<{
    user_id: string;
    reaction_type: FeedReactionType;
  }>;
};

export async function getFeedPosts(): Promise<FeedPost[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return demoFeedPosts;
  }

  const [user, { data, error }] = await Promise.all([getCurrentUser(), supabase
    .from("feed_posts")
    .select(
      "id, title, body, topic, created_at, profiles(full_name, email), feed_comments(id, body, created_at, profiles(full_name, email)), feed_reactions(user_id, reaction_type)"
    )
    .order("created_at", { ascending: false })
    .order("created_at", { referencedTable: "feed_comments", ascending: true })]);

  if (error || !data) {
    return demoFeedPosts;
  }

  return (data as unknown as FeedPostRow[]).map((row) => mapFeedPost(row, user?.id));
}

function mapFeedPost(row: FeedPostRow, userId?: string): FeedPost {
  const reactionCounts = emptyReactionCounts();

  for (const reaction of row.feed_reactions) {
    reactionCounts[reaction.reaction_type] += 1;
  }

  return {
    id: row.id,
    authorName: profileName(row.profiles),
    title: row.title,
    body: row.body,
    topic: row.topic ?? "General",
    createdAt: row.created_at,
    comments: row.feed_comments.map((comment) => mapFeedComment(comment, row.id)),
    reactionCounts,
    viewerReaction: row.feed_reactions.find((reaction) => reaction.user_id === userId)?.reaction_type
  };
}

function mapFeedComment(row: FeedPostRow["feed_comments"][number], postId: string): FeedComment {
  return {
    id: row.id,
    postId,
    authorName: profileName(row.profiles),
    body: row.body,
    createdAt: row.created_at
  };
}

function profileName(profile: ProfileRelation) {
  const value = Array.isArray(profile) ? profile[0] : profile;
  return value?.full_name?.trim() || value?.email?.split("@")[0] || "Coffee fan";
}
