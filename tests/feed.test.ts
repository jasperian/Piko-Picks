import { describe, expect, it } from "vitest";
import { demoFeedPosts, filterFeedPosts, getFeedTopicCounts } from "@/lib/feed";

describe("feed discovery", () => {
  it("searches discussion titles, bodies, topics, authors, and comments", () => {
    expect(filterFeedPosts(demoFeedPosts, "quiet").map((post) => post.id)).toEqual(["feed-1"]);
    expect(filterFeedPosts(demoFeedPosts, "north star").map((post) => post.id)).toEqual(["feed-2"]);
    expect(filterFeedPosts(demoFeedPosts, "ember lane").map((post) => post.id)).toEqual(["feed-1"]);
  });

  it("combines topic and text filters case-insensitively", () => {
    expect(filterFeedPosts(demoFeedPosts, "wifi", "recommendations").map((post) => post.id)).toEqual(["feed-1"]);
    expect(filterFeedPosts(demoFeedPosts, "wifi", "shop update")).toEqual([]);
  });

  it("counts and sorts available topics", () => {
    expect(getFeedTopicCounts(demoFeedPosts)).toEqual([
      { topic: "Recommendations", count: 1 },
      { topic: "Shop update", count: 1 }
    ]);
  });
});
