import type { FeedPost, FeedReactionType } from "@/lib/types";

export const feedReactionTypes: FeedReactionType[] = ["like", "love", "helpful"];

export const demoFeedPosts: FeedPost[] = [
  {
    id: "feed-1",
    authorName: "Maya",
    title: "Best quiet cafe for laptop work in QC?",
    body: "Looking for a place with outlets, steady WiFi, and coffee that is still good after lunch. Any favorites?",
    topic: "Recommendations",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    reactionCounts: { like: 8, love: 2, helpful: 5 },
    comments: [
      {
        id: "comment-1",
        postId: "feed-1",
        authorName: "Ari",
        body: "Ember Lane is solid in the morning. It gets busier around 4 PM.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "feed-2",
    authorName: "North Star Roasters",
    title: "New Ethiopia natural on batch brew this weekend",
    body: "We are serving a fruit-forward Ethiopia natural on batch brew from Saturday morning while supplies last.",
    topic: "Shop update",
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    reactionCounts: { like: 13, love: 6, helpful: 1 },
    comments: []
  }
];

export function emptyReactionCounts(): Record<FeedReactionType, number> {
  return { like: 0, love: 0, helpful: 0 };
}

export function getFeedTopicCounts(posts: FeedPost[]) {
  const counts = new Map<string, number>();
  for (const post of posts) counts.set(post.topic, (counts.get(post.topic) ?? 0) + 1);

  return Array.from(counts, ([topic, count]) => ({ topic, count })).sort(
    (a, b) => b.count - a.count || a.topic.localeCompare(b.topic)
  );
}

export function filterFeedPosts(posts: FeedPost[], query = "", selectedTopic = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedTopic = selectedTopic.trim().toLowerCase();

  return posts.filter((post) => {
    if (normalizedTopic && post.topic.toLowerCase() !== normalizedTopic) return false;
    if (!normalizedQuery) return true;

    const searchableText = [
      post.title,
      post.body,
      post.topic,
      post.authorName,
      ...post.comments.map((comment) => `${comment.authorName} ${comment.body}`)
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
