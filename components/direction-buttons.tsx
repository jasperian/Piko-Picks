"use client";

import { Map, Navigation } from "lucide-react";
import { trackAnalyticsEvent } from "@/components/analytics-tracker";
import { googleMapsDirectionsUrl, shopMapLabel, wazeDirectionsUrl } from "@/lib/directions";
import type { CoffeeShop } from "@/lib/types";

type Props = {
  shop: Pick<CoffeeShop, "id" | "name" | "address" | "city" | "coordinates">;
  compact?: boolean;
  inline?: boolean;
};

export function DirectionButtons({ shop, compact = false, inline = false }: Props) {
  const googleUrl = googleMapsDirectionsUrl(shop.coordinates, shopMapLabel(shop));
  const wazeUrl = wazeDirectionsUrl(shop.coordinates);
  const className = compact
    ? "focus-ring inline-flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-md bg-crema px-2 py-2 text-[11px] font-medium text-roast hover:bg-roast/10 sm:text-xs"
    : "focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-crema px-4 py-2.5 font-medium text-roast hover:bg-roast/10";

  return (
    <div className={inline ? "contents" : `flex ${compact ? "gap-2" : "flex-col gap-3 sm:flex-row"}`}>
      <a
        href={googleUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => void trackAnalyticsEvent(shop.id, "google_maps_click", { destination: shopMapLabel(shop) })}
        className={className}
      >
        <Map className="h-4 w-4 shrink-0" />
        Google Maps
      </a>
      <a
        href={wazeUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => void trackAnalyticsEvent(shop.id, "waze_click", { destination: shopMapLabel(shop) })}
        className={className}
      >
        <Navigation className="h-4 w-4 shrink-0" />
        Waze
      </a>
    </div>
  );
}
