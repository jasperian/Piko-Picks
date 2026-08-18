"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

const storageKey = "piko-picks-favorites";
const legacyStorageKey = "bean-nearby-favorites";

type Props = {
  shopId: string;
  compact?: boolean;
};

export function FavoriteButton({ shopId, compact = false }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(readFavorites().includes(shopId));
    fetch("/api/favorites")
      .then((response) => response.json())
      .then((data: { favorites?: string[] }) => {
        if (data.favorites?.includes(shopId)) {
          setIsFavorite(true);
        }
      })
      .catch(() => undefined);
  }, [shopId]);

  async function toggleFavorite() {
    const favorites = readFavorites();
    const next = favorites.includes(shopId) ? favorites.filter((id) => id !== shopId) : [...favorites, shopId];
    localStorage.setItem(storageKey, JSON.stringify(next));
    const favorite = next.includes(shopId);
    setIsFavorite(favorite);
    window.dispatchEvent(new CustomEvent("piko:favorite", { detail: { shopId, favorite } }));
    await fetch("/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        shopId,
        favorite
      })
    }).catch(() => undefined);
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-md ${
        compact ? "px-2.5 py-2 text-xs" : "px-4 py-2.5"
      } ${isFavorite ? "bg-clay text-white" : "bg-crema text-roast hover:bg-roast/10"}`}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      {compact ? (isFavorite ? "Saved" : "Save") : isFavorite ? "Saved favorite" : "Save favorite"}
    </button>
  );
}

function readFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = localStorage.getItem(storageKey) ?? localStorage.getItem(legacyStorageKey);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}
