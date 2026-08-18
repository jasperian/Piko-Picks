import { z } from "zod";

export const defaultSavedCollections = [
  { name: "Work cafés", emoji: "💻" },
  { name: "Weekend dates", emoji: "💛" },
  { name: "Best matcha", emoji: "🍵" },
  { name: "Want to try", emoji: "🔖" }
] as const;

export const collectionNameSchema = z.string().trim().min(1, "Name your collection.").max(40, "Keep the name under 40 characters.");

export type SavedCollection = {
  id: string;
  name: string;
  emoji: string;
  isDefault: boolean;
  shopIds: string[];
};
