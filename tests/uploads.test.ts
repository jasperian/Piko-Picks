import { describe, expect, it, vi } from "vitest";
import { buildShopAssetPath, isSupportedImage } from "@/lib/uploads";

describe("isSupportedImage", () => {
  it("allows common web image formats", () => {
    expect(isSupportedImage(new File([""], "qr.png", { type: "image/png" }))).toBe(true);
    expect(isSupportedImage(new File([""], "doc.pdf", { type: "application/pdf" }))).toBe(false);
  });
});

describe("buildShopAssetPath", () => {
  it("builds stable bucket paths by owner and kind", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("00000000-0000-4000-8000-000000000000");

    expect(buildShopAssetPath("shop-1", new File([""], "Cafe Cover.PNG", { type: "image/png" }), "Cover photo")).toBe(
      "shop-1/cover-photo-00000000-0000-4000-8000-000000000000.png"
    );
  });
});
