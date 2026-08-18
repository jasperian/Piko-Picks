import { Heart } from "lucide-react";
import { SavedCollections } from "@/components/saved-collections";
import { getSavedLibraryForCurrentUser } from "@/lib/supabase/favorites";
import { getPublicShops } from "@/lib/supabase/queries";

export default async function SavedShopsPage() {
  const [shops, library] = await Promise.all([getPublicShops(), getSavedLibraryForCurrentUser()]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-clay">Customer account</p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold text-roast">
          <Heart className="h-7 w-7 text-clay" />
          Saved coffee shops
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink/70">
          Keep a quick shortlist, then organize it into collections for workdays, weekends, favorite drinks, or your next coffee crawl.
        </p>
      </section>

      <SavedCollections shops={shops} signedIn={library.signedIn} initialFavoriteShopIds={library.favoriteShopIds} initialCollections={library.collections} />
    </main>
  );
}
