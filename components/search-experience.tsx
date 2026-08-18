"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Clock3,
  Coffee,
  Crosshair,
  Eye,
  List,
  Map,
  MapPin,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trophy
} from "lucide-react";
import { DirectionButtons } from "@/components/direction-buttons";
import { FavoriteButton } from "@/components/favorite-button";
import { PromoList } from "@/components/promo-list";
import { PikoPet } from "@/components/piko-pet";
import { formatDistance } from "@/lib/geo";
import { formatOpenStatus, isShopOpenNow, todaysHoursLabel } from "@/lib/hours";
import { getPikoPick } from "@/lib/piko-pick";
import { getPikoMoment } from "@/lib/piko-moments";
import { averageRating, publishedReviews, ratingLabel } from "@/lib/reviews";
import { searchShops } from "@/lib/search";
import { menuPriceRange, signatureDrink } from "@/lib/shop-insights";
import { prioritizedLabels, shopLabelGroups } from "@/lib/shop-labels";
import { formatMoney } from "@/lib/format";
import type { CoffeeShop, Coordinates } from "@/lib/types";

type Props = {
  shops: CoffeeShop[];
  mapboxToken: string;
};

const CoffeeShopMap = dynamic(() => import("@/components/coffee-shop-map").then((module) => module.CoffeeShopMap), {
  ssr: false,
  loading: () => <div className="grid min-h-[520px] place-items-center bg-linen text-sm font-semibold text-ink/55">Loading the map…</div>
});

export function SearchExperience({ shops, mapboxToken }: Props) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [query, setQuery] = useState("");
  const [manualArea, setManualArea] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [openNow, setOpenNow] = useState(false);
  const [showLabelFilters, setShowLabelFilters] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>();
  const [location, setLocation] = useState<Coordinates>();
  const [locationStatus, setLocationStatus] = useState("Use current location");
  const [radiusKm, setRadiusKm] = useState(25);
  const [preferenceStep, setPreferenceStep] = useState(0);
  const [preferredDrink, setPreferredDrink] = useState("");
  const [preferredMood, setPreferredMood] = useState("");
  const [firstVisit, setFirstVisit] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [savedCafe, setSavedCafe] = useState(false);
  const searchHasMounted = useRef(false);

  const results = useMemo(
    () =>
      searchShops(shops, {
        query,
        manualArea,
        radiusKm,
        onlyAvailable,
        openNow,
        selectedLabels,
        userLocation: location
      }),
    [manualArea, onlyAvailable, openNow, query, radiusKm, selectedLabels, shops, location]
  );
  const selectedShop = results.find((shop) => shop.id === selectedShopId) ?? results[0];
  const highlights = useMemo(() => getDirectoryHighlights(shops), [shops]);
  const pikoPick = useMemo(
    () =>
      getPikoPick(results, {
        query,
        selectedLabels: [...selectedLabels, ...(preferredMood ? [preferredMood] : [])],
        hasLocation: Boolean(location)
      }),
    [location, preferredMood, query, results, selectedLabels]
  );
  const pikoMoment = getPikoMoment({ firstVisit, isSearching, isReviewing, locationStatus, resultCount: results.length, savedCafe });

  useEffect(() => {
    if (localStorage.getItem("piko-picks-welcomed")) {
      return;
    }

    localStorage.setItem("piko-picks-welcomed", "true");
    setFirstVisit(true);
    const timer = window.setTimeout(() => setFirstVisit(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!searchHasMounted.current) {
      searchHasMounted.current = true;
      return;
    }

    setIsSearching(true);
    setIsReviewing(false);
    const searchTimer = window.setTimeout(() => {
      setIsSearching(false);
      setIsReviewing(true);
    }, 450);
    const reviewTimer = window.setTimeout(() => setIsReviewing(false), 1100);
    return () => {
      window.clearTimeout(searchTimer);
      window.clearTimeout(reviewTimer);
    };
  }, [manualArea, onlyAvailable, openNow, query, radiusKm, selectedLabels]);

  useEffect(() => {
    let celebrationTimer: number | undefined;
    const celebrateSave = (event: Event) => {
      const detail = (event as CustomEvent<{ favorite?: boolean }>).detail;
      if (!detail?.favorite) {
        return;
      }

      setSavedCafe(true);
      window.clearTimeout(celebrationTimer);
      celebrationTimer = window.setTimeout(() => setSavedCafe(false), 2400);
    };

    window.addEventListener("piko:favorite", celebrateSave);
    return () => {
      window.removeEventListener("piko:favorite", celebrateSave);
      window.clearTimeout(celebrationTimer);
    };
  }, []);

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Location unavailable");
      return;
    }

    setLocationStatus("Locating...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationStatus("Using your location");
      },
      () => setLocationStatus("Permission needed")
    );
  }

  function toggleLabel(label: string) {
    setSelectedLabels((current) => (current.includes(label) ? current.filter((item) => item !== label) : [...current, label]));
  }

  function chooseDrink(value: string) {
    setPreferredDrink(value);
    setPreferenceStep(1);
  }

  function chooseMood(value: string) {
    setPreferredMood(value);
    setPreferenceStep(2);
  }

  function chooseDistance(value: number) {
    setRadiusKm(value);
    setQuery(preferredDrink);
    setOnlyAvailable(true);
    setPreferenceStep(3);

    if (!location) {
      requestLocation();
    }
  }

  function resetPreferences() {
    setPreferenceStep(0);
    setPreferredDrink("");
    setPreferredMood("");
    setQuery("");
    setRadiusKm(25);
  }

  function selectMapShop(shopId: string, bringIntoView = false) {
    setSelectedShopId(shopId);

    if (bringIntoView) {
      window.requestAnimationFrame(() => {
        document.getElementById(`map-result-${shopId}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }

  return (
    <main>
      <section className="relative mx-3 mt-4 overflow-hidden rounded-lg bg-midnight shadow-panel sm:mx-5">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1800&q=85"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(29,29,26,0.97),rgba(29,29,26,0.84)_52%,rgba(53,39,32,0.38))]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-6 p-5 sm:p-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:p-10 xl:p-12">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
              <Coffee className="h-4 w-4 text-gold" />
              Nearby menus, reviews, and cafe details
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">Big eyes. Better coffee.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/[0.78] sm:text-lg">
              Let Piko pick your next cafe by drink, neighborhood, mood, and amenities. The useful details, all in one place.
            </p>
            <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
              <HeroStat value={String(shops.length)} label="shops" />
              <HeroStat value="24/7" label="discovery" />
              <HeroStat value="Live" label="shop details" />
            </div>
            <div className="mt-5 flex max-w-xl items-center gap-4 overflow-hidden rounded-lg border border-white/15 bg-white/10 px-4 backdrop-blur">
              <PikoPet mode={pikoMoment.mode} />
              <div className="py-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{pikoMoment.eyebrow}</p>
                <p className="mt-1 font-bold text-white" aria-live="polite">{pikoMoment.title}</p>
                <p className="mt-1 text-sm leading-5 text-white/65">{pikoMoment.message}</p>
              </div>
            </div>
          </div>

          <div className="surface rounded-lg p-5 backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">Search cafes</p>
                <h2 className="text-2xl font-extrabold tracking-tight text-midnight">What sounds good?</h2>
              </div>
              <span className="hidden rounded-md bg-lagoon/10 px-3 py-1 text-sm font-semibold text-lagoon sm:inline-flex">Live results</span>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_230px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search latte, cold brew, roasters, wifi, cozy, or pet friendly"
                className="focus-ring h-12 w-full rounded-md border border-ink/15 bg-white pl-10 pr-4 shadow-sm"
              />
            </label>
            <button
              type="button"
              onClick={requestLocation}
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-md bg-midnight px-4 font-semibold text-white shadow-sm transition hover:bg-roast"
            >
              <Crosshair className="h-4 w-4" />
              {locationStatus}
            </button>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="text-sm font-medium text-ink/75">
              Area
              <input
                value={manualArea}
                onChange={(event) => setManualArea(event.target.value)}
                placeholder="City or street"
                className="focus-ring mt-2 h-10 w-full rounded-md border border-ink/15 px-3 shadow-sm"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <label className="flex h-10 items-center gap-2 rounded-md bg-crema px-3 text-sm font-semibold text-ink/75">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(event) => setOnlyAvailable(event.target.checked)}
                  className="h-4 w-4 accent-clay"
                />
                Available drinks
              </label>
              <label className="flex h-10 items-center gap-2 rounded-md bg-crema px-3 text-sm font-semibold text-ink/75">
                <input
                  type="checkbox"
                  checked={openNow}
                  onChange={(event) => setOpenNow(event.target.checked)}
                  className="h-4 w-4 accent-clay"
                />
                Open now
              </label>
            </div>
          </div>

          <div className="mt-5 border-t border-roast/10 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowLabelFilters((value) => !value)}
                className="focus-ring inline-flex items-center gap-2 rounded-md bg-crema px-3 py-2 text-sm font-semibold text-roast hover:bg-roast/10"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showLabelFilters ? "Hide shop labels" : "Show shop labels"}
                {selectedLabels.length > 0 ? <span className="rounded-md bg-clay px-1.5 py-0.5 text-xs text-white">{selectedLabels.length}</span> : null}
              </button>
              {selectedLabels.length > 0 ? (
                <button type="button" onClick={() => setSelectedLabels([])} className="focus-ring rounded-md px-2 py-1 text-sm font-medium text-clay">
                  Clear labels
                </button>
              ) : null}
            </div>
            {showLabelFilters ? (
              <div className="mt-4 grid gap-4 rounded-lg bg-linen p-4 lg:grid-cols-4">
                {shopLabelGroups.map((group) => (
                  <div key={group.groupName}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{group.groupName}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.labels.map((label) => {
                        const active = selectedLabels.includes(label);

                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => toggleLabel(label)}
                            className={`focus-ring rounded-md px-2.5 py-1.5 text-sm font-medium ${
                              active ? "bg-lagoon text-white shadow-sm" : "bg-white text-ink/75 shadow-sm hover:bg-crema"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <section className="mb-6 overflow-hidden rounded-lg border border-roast/10 bg-white shadow-panel" aria-labelledby="piko-preferences-title">
          <div className="grid lg:grid-cols-[0.42fr_1fr]">
            <div className="relative overflow-hidden bg-gold p-6 text-midnight sm:p-8">
              <div className="relative z-10 max-w-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-roast/65">A quick coffee check</p>
                <h2 id="piko-preferences-title" className="mt-2 text-3xl font-extrabold tracking-[-0.035em]">Tell Piko what feels right.</h2>
                <p className="mt-3 text-sm leading-6 text-roast/70">Three taps turn the full directory into a useful shortlist.</p>
              </div>
              <img src="/piko-tarsier.png" alt="" className="pointer-events-none absolute -bottom-10 -right-5 w-40 opacity-35 sm:w-48 lg:opacity-70" />
            </div>

            <div className="p-6 sm:p-8">
              {preferenceStep < 3 ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">Question {preferenceStep + 1} of 3</p>
                    <div className="flex gap-1.5" aria-label={`${preferenceStep + 1} of 3 questions`}>
                      {[0, 1, 2].map((step) => (
                        <span key={step} className={`h-1.5 w-8 rounded-full ${step <= preferenceStep ? "bg-clay" : "bg-roast/10"}`} />
                      ))}
                    </div>
                  </div>

                  {preferenceStep === 0 ? (
                    <PreferenceQuestion
                      legend="What are you drinking?"
                      options={[
                        { label: "A latte", value: "latte", detail: "Creamy or signature" },
                        { label: "Cold brew", value: "cold brew", detail: "Cool and bold" },
                        { label: "Filter coffee", value: "filter", detail: "Bright and thoughtful" },
                        { label: "Surprise me", value: "", detail: "Keep every option open" }
                      ]}
                      onChoose={chooseDrink}
                    />
                  ) : null}

                  {preferenceStep === 1 ? (
                    <PreferenceQuestion
                      legend="What kind of mood?"
                      options={[
                        { label: "Get work done", value: "Work Friendly", detail: "Wi-Fi and focus" },
                        { label: "Quiet corner", value: "Quiet", detail: "Slow and peaceful" },
                        { label: "Cozy catch-up", value: "Cozy", detail: "Warm and social" },
                        { label: "Take it easy", value: "Chill", detail: "Relaxed neighborhood energy" }
                      ]}
                      onChoose={chooseMood}
                    />
                  ) : null}

                  {preferenceStep === 2 ? (
                    <PreferenceQuestion
                      legend="How far would you go?"
                      options={[
                        { label: "Stay nearby", value: "3", detail: "Within 3 km" },
                        { label: "A short ride", value: "10", detail: "Within 10 km" },
                        { label: "Worth the trip", value: "25", detail: "Within 25 km" }
                      ]}
                      onChoose={(value) => chooseDistance(Number(value))}
                    />
                  ) : null}

                  {preferenceStep > 0 ? (
                    <button type="button" onClick={() => setPreferenceStep((current) => Math.max(0, current - 1))} className="focus-ring mt-5 rounded-md px-2 py-1 text-sm font-semibold text-ink/55 hover:text-midnight">
                      Back
                    </button>
                  ) : null}
                </>
              ) : (
                <div className="flex h-full flex-col justify-center">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-lagoon">Your Piko profile is ready</p>
                  <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-midnight">Piko found {results.length} {results.length === 1 ? "match" : "matches"}.</h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <PreferenceSummary label={preferredDrink || "Any drink"} />
                    <PreferenceSummary label={preferredMood} />
                    <PreferenceSummary label={`Within ${radiusKm} km`} />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href="#piko-pick" className="focus-ring inline-flex rounded-md bg-midnight px-5 py-3 font-bold text-white transition hover:bg-roast">See Piko’s pick</a>
                    <button type="button" onClick={resetPreferences} className="focus-ring rounded-md bg-crema px-5 py-3 font-bold text-roast hover:bg-roast/10">Start over</button>
                  </div>
                  {!location ? <p className="mt-4 text-sm text-ink/55">Enable location above to apply your travel distance. Your other choices are already active.</p> : null}
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="piko-pick" className="mb-10 scroll-mt-28 overflow-hidden rounded-lg bg-lagoon text-white shadow-panel">
          {pikoPick ? (
            <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
              <div className="relative z-10 p-6 sm:p-8 lg:p-10">
                <div className="flex items-center gap-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1rem] bg-gold shadow-sm ring-1 ring-white/20">
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-no-repeat"
                      style={{ backgroundImage: "url('/piko-pet.webp')", backgroundSize: "800% 1100%", backgroundPosition: "0% 0%" }}
                    />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Piko’s Pick</p>
                    <p className="mt-1 text-sm font-semibold text-white/65">
                      {pikoPick.personalized ? "Picked from your current search" : "A standout place to start"}
                    </p>
                  </div>
                </div>
                <p className="mt-7 text-sm font-semibold text-gold">“I’d start here.”</p>
                <h2 className="mt-1 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">{pikoPick.shop.name}</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-white/72">{pikoPick.shop.description}</p>
                <div className="mt-5 flex flex-wrap gap-2" aria-label="Why Piko picked this cafe">
                  {pikoPick.reasons.map((reason) => (
                    <span key={reason} className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                      {reason}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/shops/${pikoPick.shop.id}`}
                  className="focus-ring mt-7 inline-flex items-center justify-center rounded-md bg-gold px-5 py-3 font-bold text-midnight transition hover:bg-white"
                >
                  See why it fits
                </Link>
              </div>
              <div className="relative min-h-64 lg:min-h-full">
                <img src={pikoPick.shop.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,102,82,0.12),rgba(47,102,82,0.7))] lg:bg-[linear-gradient(90deg,#2F6652_0%,rgba(47,102,82,0.08)_32%)]" />
                <div className="absolute bottom-5 right-5 rounded-md bg-midnight/75 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
                  {pikoPick.shop.city}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-6 sm:p-8">
              <PikoPet mode="failed" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Piko’s Pick</p>
                <h2 className="mt-2 text-2xl font-extrabold">No exact match—yet.</h2>
                <p className="mt-2 text-white/70">Try removing a filter and Piko will look again.</p>
              </div>
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">Directory highlights</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-midnight">Worth a detour</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-ink/60">Quick picks from public listings, reviews, ratings, labels, and listing activity.</p>
          </div>
          <div className="mt-5 grid auto-rows-fr gap-4 md:grid-cols-6">
            {highlights.map((highlight, index) => (
              <HighlightCard key={highlight.label} {...highlight} index={index} />
            ))}
          </div>
        </section>

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">Explore nearby</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-midnight">{results.length} coffee shops found</h2>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="grid grid-cols-2 rounded-md bg-white p-1 text-sm font-semibold shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`focus-ring inline-flex items-center justify-center gap-2 rounded px-3 py-2 ${
                  viewMode === "list" ? "bg-midnight text-white" : "text-ink/65 hover:bg-crema"
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`focus-ring inline-flex items-center justify-center gap-2 rounded px-3 py-2 ${
                  viewMode === "map" ? "bg-midnight text-white" : "text-ink/65 hover:bg-crema"
                }`}
              >
                <Map className="h-4 w-4" />
                Map
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-ink/60 shadow-sm">
              <SlidersHorizontal className="h-4 w-4" />
              Sorted by distance when location is enabled
            </div>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-roast/10 bg-linen shadow-panel">
              <CoffeeShopMap
                shops={results}
                selectedShopId={selectedShopId}
                accessToken={mapboxToken}
                onSelect={(shopId) => selectMapShop(shopId, true)}
              />
              <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[calc(100%-5rem)] rounded-md bg-white/92 px-3 py-2 text-sm shadow-sm backdrop-blur">
                <p className="font-bold text-midnight">{selectedShop ? selectedShop.name : "Explore the map"}</p>
                <p className="mt-0.5 text-xs font-medium text-ink/55">Tap a café marker to match it with the list.</p>
              </div>
            </div>
            <div className="self-start overflow-hidden rounded-lg border border-roast/10 bg-white shadow-panel">
              <div className="border-b border-roast/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-clay">Map results</p>
                <p className="mt-1 text-sm text-ink/55" aria-live="polite">{selectedShop ? `${selectedShop.name} selected` : `${results.length} cafés`}</p>
              </div>
              <div className="grid max-h-[456px] gap-2 overflow-y-auto p-3">
                {results.length > 0 ? results.map((shop, index) => (
                  <MapResultRow
                    key={shop.id}
                    shop={shop}
                    index={index}
                    active={selectedShop?.id === shop.id}
                    isPikoPick={pikoPick?.shop.id === shop.id}
                    onSelect={() => selectMapShop(shop.id)}
                  />
                )) : <p className="p-3 text-sm text-ink/60">No cafés match your current filters.</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {results.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                query={query}
                isPikoPick={pikoPick?.shop.id === shop.id}
                pikoReasons={pikoPick?.shop.id === shop.id ? pikoPick.reasons : []}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function MapResultRow({
  shop,
  index,
  active,
  isPikoPick,
  onSelect
}: {
  shop: CoffeeShop & { distanceKm?: number };
  index: number;
  active: boolean;
  isPikoPick: boolean;
  onSelect: () => void;
}) {
  const rating = averageRating(publishedReviews(shop.reviews));
  const openNow = isShopOpenNow(shop.weeklyHours);

  return (
    <div
      id={`map-result-${shop.id}`}
      className={`rounded-lg border transition ${active ? "border-gold bg-gold/10 shadow-sm" : "border-transparent bg-linen hover:border-roast/10"}`}
    >
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={onSelect}
        onFocus={onSelect}
        aria-pressed={active}
        className="focus-ring grid w-full grid-cols-[64px_1fr_auto] items-center gap-3 rounded-lg p-2 text-left"
      >
        <span className="relative h-16 w-16 overflow-hidden rounded-md">
          <img src={shop.coverImageUrl} alt="" className="h-full w-full object-cover" />
          <span className={`absolute left-1 top-1 grid h-5 w-5 place-items-center rounded-full text-[10px] font-extrabold ${active ? "bg-gold text-midnight" : "bg-midnight text-white"}`}>{index + 1}</span>
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-extrabold text-midnight">{shop.name}</span>
            {isPikoPick ? <Sparkles className="h-3.5 w-3.5 shrink-0 text-clay" aria-label="Piko’s Pick" /> : null}
          </span>
          <span className="mt-1 block text-xs font-medium text-ink/55"><span className={openNow ? "font-bold text-lagoon" : "text-clay"}>{formatOpenStatus(shop.weeklyHours)}</span> · {formatDistance(shop.distanceKm)}</span>
          <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-roast"><Star className="h-3 w-3 fill-gold text-gold" />{ratingLabel(rating)}</span>
        </span>
        <MapPin className={`h-5 w-5 ${active ? "text-clay" : "text-ink/25"}`} />
      </button>
      {active ? (
        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,.72fr)] gap-2 px-2 pb-2">
          <Link href={`/shops/${shop.id}`} className="focus-ring inline-flex min-w-0 items-center justify-center whitespace-nowrap rounded-md bg-midnight px-3 py-2 text-sm font-bold text-white hover:bg-roast">View café</Link>
          <DirectionButtons shop={shop} compact inline />
        </div>
      ) : null}
    </div>
  );
}

function ShopCard({ shop, query, isPikoPick = false, pikoReasons = [] }: { shop: CoffeeShop & { distanceKm?: number }; query: string; isPikoPick?: boolean; pikoReasons?: string[] }) {
  const featuredDrink = signatureDrink(shop, query);
  const reviewCount = publishedReviews(shop.reviews).length;
  const rating = averageRating(publishedReviews(shop.reviews));
  const openNow = isShopOpenNow(shop.weeklyHours);

  return (
    <article className={`interactive-lift overflow-hidden rounded-lg bg-white shadow-panel ${isPikoPick ? "border-2 border-gold" : "border border-roast/10"}`}>
      <div className="relative">
        <img src={shop.coverImageUrl} alt="" className="h-52 w-full object-cover" />
        <div className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur ${openNow ? "bg-lagoon/95" : "bg-clay/95"}`}>
          {formatOpenStatus(shop.weeklyHours)}
        </div>
        {isPikoPick ? (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-gold px-2.5 py-1 text-xs font-bold text-midnight shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Piko’s Pick
          </div>
        ) : null}
      </div>
      <div className="space-y-5 p-5">
        <div>
          <div className="grid grid-cols-[1fr_auto] items-start gap-3">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-midnight">{shop.name}</h3>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-ink/55"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay" />{shop.city}</p>
            </div>
            <div className="shrink-0">
              <FavoriteButton shopId={shop.id} compact />
            </div>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-gold/15 px-2 py-1 text-sm font-semibold text-midnight">
            <Star className="h-4 w-4 fill-gold text-gold" />
            {ratingLabel(rating)} · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/70">{shop.description}</p>
        </div>

        <dl className="grid gap-2 sm:grid-cols-3">
          <DecisionFact label="Today" value={todaysHoursLabel(shop.weeklyHours)} />
          <DecisionFact label="Distance" value={formatDistance(shop.distanceKm)} />
          <DecisionFact label="Menu" value={menuPriceRange(shop)} />
        </dl>

        {featuredDrink ? (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-crema p-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-clay">Try this</p>
              <p className="mt-1 truncate font-bold text-midnight">{featuredDrink.name}</p>
            </div>
            <span className="shrink-0 rounded-md bg-white px-2.5 py-1 text-sm font-bold text-roast shadow-sm">{formatMoney(featuredDrink.priceCents, featuredDrink.currency)}</span>
          </div>
        ) : null}

        <div>
          {shop.labels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {prioritizedLabels(shop.labels, 4).map((item) => (
                <span key={item.label} className="rounded-md bg-lagoon/10 px-2 py-1 text-xs font-semibold text-lagoon">
                  {item.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {isPikoPick && pikoReasons.length > 0 ? (
          <div className="rounded-lg border border-gold/35 bg-gold/10 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-roast"><Sparkles className="h-4 w-4 text-clay" />Why Piko picked it</p>
            <ul className="mt-2 space-y-1 text-sm font-medium text-ink/70">
              {pikoReasons.map((reason) => <li key={reason}>• {reason}</li>)}
            </ul>
          </div>
        ) : null}

        <p className="flex items-start gap-2 text-sm text-ink/65">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
          {shop.address}, {shop.city}
        </p>
        <div className="space-y-2">
          <PromoList promos={shop.promos} compact />
        </div>
        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,.72fr)] gap-2">
          <Link
            href={`/shops/${shop.id}`}
            className="focus-ring inline-flex min-w-0 items-center justify-center whitespace-nowrap rounded-md bg-midnight px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-roast"
          >
            View Shop
          </Link>
          <DirectionButtons shop={shop} compact inline />
        </div>
      </div>
    </article>
  );
}

function DecisionFact({ label, value }: { label: string; value: string }) {
  const Icon = label === "Today" ? Clock3 : label === "Distance" ? MapPin : Coffee;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border border-roast/8 bg-linen p-3 sm:flex-col sm:justify-center sm:gap-2 sm:text-center">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-clay shadow-sm" aria-hidden="true">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 sm:w-full">
        <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/45">{label}</dt>
        <dd className="mt-0.5 hyphens-none whitespace-normal text-sm font-bold leading-5 text-midnight [overflow-wrap:normal] [word-break:normal]">{value}</dd>
      </div>
    </div>
  );
}

type Highlight = {
  label: string;
  value: string;
  description: string;
  shop?: CoffeeShop;
  icon: typeof Coffee;
};

function HighlightCard({ label, value, description, shop, icon: Icon, index }: Highlight & { index: number }) {
  const spanClass = index < 2 ? "md:col-span-3" : "md:col-span-2";

  if (!shop) {
    return (
      <div className={`${spanClass} rounded-lg border border-roast/10 bg-white p-5 shadow-sm`}>
        <div className="mb-3 inline-flex rounded-md bg-crema p-2 text-clay">
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm font-semibold text-midnight">{label}</p>
        <p className="mt-1 text-sm text-ink/55">No shop data yet.</p>
      </div>
    );
  }

  return (
    <Link href={`/shops/${shop.id}`} className={`${spanClass} interactive-lift rounded-lg border border-roast/10 bg-white p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex rounded-md bg-crema p-2 text-clay">
          <Icon className="h-4 w-4" />
        </div>
        <span className="rounded-md bg-lagoon/10 px-2 py-1 text-xs font-semibold text-lagoon">{value}</span>
      </div>
      <p className="mt-4 text-sm font-semibold text-midnight">{label}</p>
      <h3 className="mt-1 line-clamp-1 text-xl font-extrabold tracking-tight text-roast">{shop.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-5 text-ink/60">{description}</p>
    </Link>
  );
}

function getDirectoryHighlights(shops: CoffeeShop[]): Highlight[] {
  const recentlyAdded = [...shops].sort((a, b) => timestamp(b.createdAt ?? b.updatedAt) - timestamp(a.createdAt ?? a.updatedAt))[0];
  const mostViewed = [...shops].sort((a, b) => trendingScore(b) - trendingScore(a))[0];
  const highestRated = [...shops].sort((a, b) => ratingScore(b) - ratingScore(a))[0];
  const mostReviewed = [...shops].sort((a, b) => publishedReviews(b.reviews).length - publishedReviews(a.reviews).length)[0];
  const workFriendly = shops.find((shop) => shop.labels.some((item) => item.label === "Work Friendly")) ?? shops.find((shop) => shop.labels.some((item) => item.label === "Free WiFi"));

  return [
    {
      label: "Recently added",
      value: formatRelativeDate(recentlyAdded?.createdAt),
      description: recentlyAdded ? `${recentlyAdded.city} listing added to the directory.` : "",
      shop: recentlyAdded,
      icon: Sparkles
    },
    {
      label: "Most viewed",
      value: "Trending",
      description: mostViewed ? "Featured pick based on listing strength until public view counts are enabled." : "",
      shop: mostViewed,
      icon: Eye
    },
    {
      label: "Highest rated",
      value: ratingLabel(averageRating(publishedReviews(highestRated?.reviews ?? []))),
      description: highestRated ? `${publishedReviews(highestRated.reviews).length} public reviews.` : "",
      shop: highestRated,
      icon: Trophy
    },
    {
      label: "Most reviewed",
      value: `${publishedReviews(mostReviewed?.reviews ?? []).length} reviews`,
      description: mostReviewed ? "Most customer feedback in the current directory." : "",
      shop: mostReviewed,
      icon: MessageSquare
    },
    {
      label: "Work friendly",
      value: "WiFi / focus",
      description: workFriendly ? "A useful pick for working, studying, or quiet cafe time." : "",
      shop: workFriendly,
      icon: Coffee
    }
  ];
}

function trendingScore(shop: CoffeeShop) {
  return publishedReviews(shop.reviews).length * 8 + shop.photos.length * 3 + shop.labels.length;
}

function ratingScore(shop: CoffeeShop) {
  return averageRating(publishedReviews(shop.reviews)) ?? 0;
}

function timestamp(value?: string) {
  return value ? new Date(value).getTime() : 0;
}

function formatRelativeDate(value?: string) {
  if (!value) {
    return "New";
  }

  const days = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000)));

  if (days === 0) {
    return "Today";
  }

  if (days === 1) {
    return "Yesterday";
  }

  return `${days}d ago`;
}

type PreferenceOption = {
  label: string;
  value: string;
  detail: string;
};

function PreferenceQuestion({ legend, options, onChoose }: { legend: string; options: PreferenceOption[]; onChoose: (value: string) => void }) {
  return (
    <fieldset className="mt-5">
      <legend className="text-2xl font-extrabold tracking-tight text-midnight">{legend}</legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={`${option.label}-${option.value}`}
            type="button"
            onClick={() => onChoose(option.value)}
            className="focus-ring group rounded-lg border border-roast/10 bg-linen p-4 text-left transition hover:-translate-y-0.5 hover:border-clay/35 hover:bg-crema hover:shadow-sm"
          >
            <span className="block font-bold text-midnight group-hover:text-clay">{option.label}</span>
            <span className="mt-1 block text-sm text-ink/55">{option.detail}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function PreferenceSummary({ label }: { label: string }) {
  return <span className="rounded-md bg-lagoon/10 px-3 py-1.5 text-sm font-semibold text-lagoon">{label}</span>;
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur">
      <p className="text-2xl font-extrabold leading-none text-white">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/62">{label}</p>
    </div>
  );
}
