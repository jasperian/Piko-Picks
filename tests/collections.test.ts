import { describe, expect, it } from "vitest";
import { collectionNameSchema, defaultSavedCollections } from "@/lib/collections";

describe("saved collections", () => {
  it("ships the four useful starter collections", () => {
    expect(defaultSavedCollections.map((collection) => collection.name)).toEqual(["Work cafés", "Weekend dates", "Best matcha", "Want to try"]);
  });

  it("normalizes valid custom names", () => {
    expect(collectionNameSchema.parse("  Coffee crawl  ")).toBe("Coffee crawl");
  });

  it("rejects empty and oversized collection names", () => {
    expect(() => collectionNameSchema.parse("   ")).toThrow();
    expect(() => collectionNameSchema.parse("x".repeat(41))).toThrow();
  });
});
