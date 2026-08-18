export const SHOP_ASSETS_BUCKET = "shop-assets";

export function buildShopAssetPath(ownerPrefix: string, file: File, kind: string) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeKind = kind.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  return `${ownerPrefix}/${safeKind}-${crypto.randomUUID()}.${extension}`;
}

export function isSupportedImage(file: File) {
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type);
}
