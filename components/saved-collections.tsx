"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FolderHeart, MapPin, Plus, Trash2 } from "lucide-react";
import { DirectionButtons } from "@/components/direction-buttons";
import { FavoriteButton } from "@/components/favorite-button";
import { formatOpenStatus, isShopOpenNow } from "@/lib/hours";
import type { SavedCollection } from "@/lib/collections";
import type { CoffeeShop } from "@/lib/types";

type Props = {
  shops: CoffeeShop[];
  signedIn: boolean;
  initialFavoriteShopIds: string[];
  initialCollections: SavedCollection[];
};

export function SavedCollections({ shops, signedIn, initialFavoriteShopIds, initialCollections }: Props) {
  const [favoriteShopIds, setFavoriteShopIds] = useState(initialFavoriteShopIds);
  const [collections, setCollections] = useState(initialCollections);
  const [activeCollectionId, setActiveCollectionId] = useState("all");
  const [newName, setNewName] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!signedIn) {
      setFavoriteShopIds(readLocalFavorites());
    }

    const handleFavorite = (event: Event) => {
      const detail = (event as CustomEvent<{ shopId?: string; favorite?: boolean }>).detail;
      if (!detail?.shopId) {
        return;
      }

      setFavoriteShopIds((current) => detail.favorite ? Array.from(new Set([...current, detail.shopId!])) : current.filter((id) => id !== detail.shopId));
      if (!detail.favorite) {
        setCollections((current) => current.map((collection) => ({ ...collection, shopIds: collection.shopIds.filter((id) => id !== detail.shopId) })));
      }
    };

    window.addEventListener("piko:favorite", handleFavorite);
    return () => window.removeEventListener("piko:favorite", handleFavorite);
  }, [signedIn]);

  const activeCollection = collections.find((collection) => collection.id === activeCollectionId);
  const visibleIds = activeCollection ? activeCollection.shopIds : favoriteShopIds;
  const visibleShops = useMemo(() => shops.filter((shop) => visibleIds.includes(shop.id)), [shops, visibleIds]);

  async function createCollection() {
    if (!newName.trim()) {
      return;
    }

    setStatus("Creating collection…");
    const response = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name: newName })
    });
    const data = (await response.json()) as { collection?: SavedCollection; error?: string };

    if (!response.ok || !data.collection) {
      setStatus(data.error ?? "Could not create that collection.");
      return;
    }

    setCollections((current) => [...current, data.collection!]);
    setActiveCollectionId(data.collection.id);
    setNewName("");
    setStatus("Collection created.");
  }

  async function updateMembership(action: "add" | "remove", collectionId: string, shopId: string) {
    setStatus(action === "add" ? "Adding café…" : "Removing café…");
    const response = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, collectionId, shopId })
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus(data.error ?? "Could not update the collection.");
      return;
    }

    setCollections((current) => current.map((collection) => collection.id === collectionId
      ? { ...collection, shopIds: action === "add" ? Array.from(new Set([...collection.shopIds, shopId])) : collection.shopIds.filter((id) => id !== shopId) }
      : collection));
    setFavoriteShopIds((current) => Array.from(new Set([...current, shopId])));
    setStatus(action === "add" ? "Added to collection." : "Removed from collection.");
  }

  async function deleteCollection(collection: SavedCollection) {
    const response = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", collectionId: collection.id })
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setStatus(data.error ?? "Could not delete the collection.");
      return;
    }

    setCollections((current) => current.filter((item) => item.id !== collection.id));
    setActiveCollectionId("all");
    setStatus("Collection deleted. Your cafés are still saved.");
  }

  return (
    <>
      {signedIn ? (
        <section className="mb-7 rounded-lg border border-roast/10 bg-white p-4 shadow-panel sm:p-5">
          <div className="flex flex-wrap gap-2">
            <CollectionTab active={activeCollectionId === "all"} label="All saved" emoji="♥" count={favoriteShopIds.length} onClick={() => setActiveCollectionId("all")} />
            {collections.map((collection) => (
              <CollectionTab key={collection.id} active={activeCollectionId === collection.id} label={collection.name} emoji={collection.emoji} count={collection.shopIds.length} onClick={() => setActiveCollectionId(collection.id)} />
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t border-roast/10 pt-4 sm:flex-row sm:items-center">
            <label className="flex-1 text-sm font-semibold text-ink/65">
              New collection
              <input value={newName} onChange={(event) => setNewName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void createCollection()} maxLength={40} placeholder="Coffee crawl" className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
            </label>
            <button type="button" onClick={() => void createCollection()} className="focus-ring inline-flex h-11 items-center justify-center gap-2 self-end rounded-md bg-midnight px-4 font-bold text-white hover:bg-roast"><Plus className="h-4 w-4" />Create</button>
            {activeCollection && !activeCollection.isDefault ? (
              <button type="button" onClick={() => void deleteCollection(activeCollection)} className="focus-ring inline-flex h-11 items-center justify-center gap-2 self-end rounded-md bg-clay/10 px-4 font-bold text-clay hover:bg-clay/15"><Trash2 className="h-4 w-4" />Delete</button>
            ) : null}
          </div>
          {status ? <p className="mt-3 text-sm font-medium text-ink/55" aria-live="polite">{status}</p> : null}
        </section>
      ) : (
        <div className="mb-7 rounded-lg bg-gold/15 p-4 text-sm leading-6 text-roast">These are your saves from this device. <Link href="/auth?next=/saved" className="font-bold underline">Sign in</Link> to create collections and sync them everywhere.</div>
      )}

      {visibleShops.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {visibleShops.map((shop) => {
            const memberships = collections.filter((collection) => collection.shopIds.includes(shop.id));
            const openNow = isShopOpenNow(shop.weeklyHours);

            return (
              <article key={shop.id} className="overflow-hidden rounded-lg border border-roast/10 bg-white shadow-sm">
                <img src={shop.coverImageUrl} alt="" className="h-44 w-full object-cover" />
                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><h2 className="text-xl font-extrabold text-roast">{shop.name}</h2><p className={`mt-1 text-sm font-bold ${openNow ? "text-lagoon" : "text-clay"}`}>{formatOpenStatus(shop.weeklyHours)}</p></div>
                    <FavoriteButton shopId={shop.id} compact />
                  </div>
                  <p className="flex items-start gap-2 text-sm text-ink/65"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay" />{shop.address}, {shop.city}</p>
                  {signedIn ? (
                    <div className="rounded-lg bg-crema p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.13em] text-ink/45">Collections</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {memberships.map((collection) => <button key={collection.id} type="button" onClick={() => void updateMembership("remove", collection.id, shop.id)} className="focus-ring rounded-md bg-white px-2 py-1 text-xs font-bold text-lagoon" aria-label={`Remove ${shop.name} from ${collection.name}`}>{collection.emoji} {collection.name} ×</button>)}
                      </div>
                      <select defaultValue="" onChange={(event) => { if (event.target.value) void updateMembership("add", event.target.value, shop.id); event.target.value = ""; }} className="focus-ring mt-3 h-9 w-full rounded-md border border-roast/10 bg-white px-2 text-sm font-semibold text-roast">
                        <option value="">Add to a collection…</option>
                        {collections.filter((collection) => !collection.shopIds.includes(shop.id)).map((collection) => <option key={collection.id} value={collection.id}>{collection.emoji} {collection.name}</option>)}
                      </select>
                    </div>
                  ) : null}
                  <Link href={`/shops/${shop.id}`} className="focus-ring inline-flex w-full justify-center rounded-md bg-clay px-4 py-2.5 font-bold text-white">View café</Link>
                  <DirectionButtons shop={shop} compact />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-roast/10 bg-white p-8 text-center text-ink/70 shadow-panel">
          <FolderHeart className="mx-auto h-8 w-8 text-clay" />
          <p className="mt-3 font-bold text-midnight">{activeCollection ? `${activeCollection.name} is ready for its first café.` : "No saved cafés yet."}</p>
          <Link href="/" className="focus-ring mt-4 inline-flex rounded-md bg-midnight px-4 py-2.5 font-bold text-white">Find a café</Link>
        </div>
      )}
    </>
  );
}

function CollectionTab({ active, label, emoji, count, onClick }: { active: boolean; label: string; emoji: string; count: number; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`focus-ring rounded-md px-3 py-2 text-sm font-bold transition ${active ? "bg-lagoon text-white" : "bg-crema text-roast hover:bg-roast/10"}`}>{emoji} {label} <span className="ml-1 opacity-65">{count}</span></button>;
}

function readLocalFavorites() {
  try {
    const value = localStorage.getItem("piko-picks-favorites") ?? localStorage.getItem("bean-nearby-favorites");
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}
