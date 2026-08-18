"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { CoffeeShop } from "@/lib/types";

type MappedShop = CoffeeShop & { distanceKm?: number };

type Props = {
  shops: MappedShop[];
  selectedShopId?: string;
  accessToken: string;
  onSelect: (shopId: string) => void;
};

const defaultCenter: [number, number] = [121.0244, 14.5995];

export function CoffeeShopMap({ shops, selectedShopId, accessToken, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>();
  const markersRef = useRef(new Map<string, mapboxgl.Marker>());
  const onSelectRef = useRef(onSelect);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !accessToken) return;
    const markers = markersRef.current;

    try {
      const map = new mapboxgl.Map({
        accessToken,
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: defaultCenter,
        zoom: 10.5,
        attributionControl: true
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
          showAccuracyCircle: true,
          showUserLocation: true
        }),
        "bottom-right"
      );
      map.on("load", () => setMapReady(true));
      map.on("error", (event) => {
        if (event.error) setMapError("The map could not load. Check the Mapbox token and its allowed URLs.");
      });
      mapRef.current = map;
    } catch {
      setMapError("This browser could not start the interactive map.");
    }

    return () => {
      markers.forEach((marker) => marker.remove());
      markers.clear();
      mapRef.current?.remove();
      mapRef.current = undefined;
    };
  }, [accessToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    shops.forEach((shop, index) => {
      const markerButton = document.createElement("button");
      markerButton.type = "button";
      markerButton.className = "piko-map-marker";
      markerButton.dataset.active = "false";
      markerButton.textContent = String(index + 1);
      markerButton.setAttribute("aria-label", `Select ${shop.name}`);
      markerButton.setAttribute("aria-pressed", "false");
      markerButton.addEventListener("click", () => onSelectRef.current(shop.id));

      const popupContent = document.createElement("div");
      const popupTitle = document.createElement("strong");
      const popupLocation = document.createElement("span");
      popupTitle.textContent = shop.name;
      popupLocation.textContent = `${shop.address}, ${shop.city}`;
      popupContent.className = "piko-map-popup";
      popupContent.append(popupTitle, popupLocation);

      const marker = new mapboxgl.Marker({ element: markerButton, anchor: "bottom" })
        .setLngLat([shop.coordinates.longitude, shop.coordinates.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 22, closeButton: false }).setDOMContent(popupContent))
        .addTo(map);

      markersRef.current.set(shop.id, marker);
    });

    if (shops.length === 0) {
      map.easeTo({ center: defaultCenter, zoom: 10.5, duration: 500 });
    } else if (shops.length === 1) {
      map.easeTo({ center: [shops[0].coordinates.longitude, shops[0].coordinates.latitude], zoom: 14, duration: 600 });
    } else {
      const bounds = new mapboxgl.LngLatBounds();
      shops.forEach((shop) => bounds.extend([shop.coordinates.longitude, shop.coordinates.latitude]));
      map.fitBounds(bounds, { padding: 70, maxZoom: 14, duration: 650 });
    }
  }, [mapReady, shops]);

  useEffect(() => {
    markersRef.current.forEach((marker, shopId) => {
      const element = marker.getElement();
      const active = shopId === selectedShopId;
      element.dataset.active = String(active);
      element.setAttribute("aria-pressed", String(active));
    });

    if (!selectedShopId) return;
    const shop = shops.find((item) => item.id === selectedShopId);
    if (!shop || !mapRef.current) return;
    mapRef.current.easeTo({
      center: [shop.coordinates.longitude, shop.coordinates.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 13),
      duration: 500
    });
  }, [selectedShopId, shops]);

  if (!accessToken) {
    return (
      <div className="grid min-h-[520px] place-items-center p-6 text-center">
        <div>
          <p className="font-bold text-midnight">Mapbox token needed</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-ink/60">Add MAPBOX_PUBLIC_TOKEN to the local environment and restart the app.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="absolute inset-0" aria-label="Interactive map of coffee shops" />
      {mapError ? (
        <div className="absolute inset-x-4 bottom-4 z-10 rounded-md bg-clay px-4 py-3 text-sm font-semibold text-white shadow-panel" role="alert">
          {mapError}
        </div>
      ) : null}
    </>
  );
}
