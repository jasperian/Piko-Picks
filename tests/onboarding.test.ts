import { describe, expect, it } from "vitest";
import { normalizeOptionalUrl, parseMenuDrafts, shopRegistrationSchema } from "@/lib/onboarding";

describe("shopRegistrationSchema", () => {
  it("accepts a complete registration payload", () => {
    const parsed = shopRegistrationSchema.parse({
      ownerName: "Mika Reyes",
      ownerEmail: "mika@example.com",
      shopName: "Morning Pour",
      description: "A compact coffee bar for espresso and signature drinks.",
      phone: "+63 917 100 2000",
      website: "",
      coverImageUrl: "",
      address: "10 Sunrise Street",
      city: "Makati",
      latitude: "14.55",
      longitude: "121.02",
      menuItemsJson: "[]"
    });

    expect(parsed.shopName).toBe("Morning Pour");
    expect(parsed.latitude).toBe(14.55);
  });
});

describe("parseMenuDrafts", () => {
  it("parses menu drafts and removes empty rows", () => {
    const drafts = parseMenuDrafts(
      JSON.stringify([
        { name: "Latte", price: 180, description: "Hot or iced." },
        { name: "", price: 0, description: "" }
      ])
    );

    expect(drafts).toEqual([{ name: "Latte", price: 180, description: "Hot or iced." }]);
  });
});

describe("normalizeOptionalUrl", () => {
  it("converts blank strings to null", () => {
    expect(normalizeOptionalUrl("")).toBeNull();
    expect(normalizeOptionalUrl("https://example.com")).toBe("https://example.com");
  });
});
