import { SearchExperience } from "@/components/search-experience";
import { getPublicShops } from "@/lib/supabase/queries";

export default async function HomePage() {
  const shops = await getPublicShops();
  const mapboxToken = process.env.MAPBOX_PUBLIC_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  return <SearchExperience shops={shops} mapboxToken={mapboxToken} />;
}
