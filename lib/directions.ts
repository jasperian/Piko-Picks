import type { CoffeeShop, Coordinates } from "@/lib/types";

export function googleMapsDirectionsUrl(destination: Coordinates, label?: string) {
  const query = encodeURIComponent(`${destination.latitude},${destination.longitude}${label ? ` (${label})` : ""}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}

export function wazeDirectionsUrl(destination: Coordinates) {
  return `https://www.waze.com/ul?ll=${destination.latitude},${destination.longitude}&navigate=yes`;
}

export function shopMapLabel(shop: Pick<CoffeeShop, "name" | "address" | "city">) {
  return `${shop.name}, ${shop.address}, ${shop.city}`;
}
