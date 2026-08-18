import { z } from "zod";

export const menuDraftSchema = z.object({
  name: z.string().trim().min(1),
  price: z.coerce.number().min(0),
  description: z.string().trim().optional()
});

export const shopRegistrationSchema = z.object({
  ownerName: z.string().trim().min(2, "Enter the owner's name."),
  ownerEmail: z.string().trim().email("Enter a valid email."),
  shopName: z.string().trim().min(2, "Enter the coffee shop name."),
  description: z.string().trim().min(10, "Add a short description."),
  phone: z.string().trim().min(5, "Enter a phone number."),
  website: z.string().trim().url().optional().or(z.literal("")),
  facebookUrl: z.string().trim().url().optional().or(z.literal("")),
  instagramUrl: z.string().trim().url().optional().or(z.literal("")),
  coverImageUrl: z.string().trim().url().optional().or(z.literal("")),
  address: z.string().trim().min(5, "Enter the shop address."),
  city: z.string().trim().min(2, "Enter the city."),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  menuItemsJson: z.string().trim().optional()
});

export type ShopRegistration = z.infer<typeof shopRegistrationSchema>;

export function parseMenuDrafts(menuItemsJson?: string) {
  if (!menuItemsJson) {
    return [];
  }

  const parsed = JSON.parse(menuItemsJson) as unknown;
  const rows = z
    .array(
      z.object({
        name: z.string().trim(),
        price: z.coerce.number().min(0),
        description: z.string().trim().optional()
      })
    )
    .parse(parsed)
    .filter((item) => item.name.trim().length > 0);

  return z.array(menuDraftSchema).parse(rows);
}

export function normalizeOptionalUrl(value?: string) {
  return value && value.length > 0 ? value : null;
}
