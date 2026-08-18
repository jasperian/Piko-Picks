import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BadgePercent, BarChart3, Building2, Camera, Clock, Coffee, Eye, ExternalLink, Lightbulb, Link2, MapPin, MousePointerClick, Plus, Sparkles, Star, Store, Trash2 } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import {
  createMenuItemAction,
  createPromoAction,
  createShopPhotoAction,
  deleteShopPhotoAction,
  saveOpeningHoursAction,
  saveShopProfileAction
} from "@/app/dashboard/actions";
import { updateReviewVisibilityAction } from "@/app/dashboard/review-actions";
import { CopyShopLinkButton } from "@/components/copy-shop-link-button";
import { ImageUrlUpload } from "@/components/image-url-upload";
import { ShopLabelFields } from "@/components/shop-label-fields";
import { percentChange, type OwnerInsights } from "@/lib/analytics";
import { dayKeys } from "@/lib/hours";
import { getCurrentUserRole } from "@/lib/supabase/profile";
import { getShopDashboardData } from "@/lib/supabase/dashboard";
import type { CoffeeShop } from "@/lib/types";

type Props = {
  searchParams: {
    saved?: string;
    tab?: string;
    shop?: string;
  };
};

type DashboardTab = "overview" | "insights" | "profile" | "menu" | "gallery" | "promos" | "reviews";

const dashboardTabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "insights", label: "Insights" },
  { id: "profile", label: "Profile" },
  { id: "menu", label: "Menu" },
  { id: "gallery", label: "Gallery" },
  { id: "promos", label: "Promos" },
  { id: "reviews", label: "Reviews" }
];

export default async function DashboardPage({ searchParams }: Props) {
  const role = await getCurrentUserRole();

  if (role === "guest") {
    redirect("/auth?next=/dashboard");
  }

  if (role === "customer") {
    redirect("/saved");
  }

  const { shop, ownedShops, reviews, analytics, insights, isDemo, ownerEmail } = await getShopDashboardData(searchParams.shop);
  const activeTab = parseDashboardTab(searchParams.tab);
  const publicShopPath = `/shops/${shop.id}`;
  const publicShopUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}${publicShopPath}`;
  const checklist = getListingChecklist(shop, reviews.length);
  const completedChecklistItems = checklist.filter((item) => item.complete).length;
  const completionPercent = Math.round((completedChecklistItems / checklist.length) * 100);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-clay">Shop workspace</p>
          <h1 className="mt-1 text-3xl font-semibold text-roast">{shop.name}</h1>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <span className="text-sm text-ink/60">{ownerEmail ?? "Demo workspace"}</span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/register-shop?branch=1"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-clay px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-roast"
            >
              <Plus className="h-4 w-4" />
              Add branch
            </Link>
            <Link
              href={publicShopPath}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-midnight px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-roast"
            >
              <ExternalLink className="h-4 w-4" />
              View public shop
            </Link>
            <CopyShopLinkButton url={publicShopUrl} />
            {isDemo ? (
              <Link href="/auth" className="focus-ring inline-flex items-center justify-center rounded-md bg-roast px-4 py-2.5 text-sm font-semibold text-white">
                Connect auth
              </Link>
            ) : (
              <form action={signOutAction}>
                <button className="focus-ring inline-flex items-center justify-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-roast shadow-sm">
                  Sign out
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <section className="mt-6 rounded-lg border border-roast/10 bg-white p-4 shadow-panel sm:p-5" aria-labelledby="branch-heading">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-clay">
              <Building2 className="h-4 w-4" />
              Branches
            </p>
            <h2 id="branch-heading" className="mt-1 text-xl font-semibold text-midnight">
              {ownedShops.length || 1} {ownedShops.length === 1 ? "location" : "locations"}
            </h2>
          </div>
          <Link href="/register-shop?branch=1" className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-crema px-4 py-2.5 text-sm font-semibold text-roast transition hover:bg-roast/10">
            <Plus className="h-4 w-4" /> Add another branch
          </Link>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Choose a branch">
          {(ownedShops.length ? ownedShops : [{ id: shop.id, name: shop.name, status: shop.status }]).map((branch) => {
            const isActive = branch.id === shop.id;
            return (
              <Link
                key={branch.id}
                href={dashboardHref(activeTab, branch.id)}
                aria-current={isActive ? "page" : undefined}
                className={`focus-ring flex min-w-56 items-center gap-3 rounded-md border px-3 py-3 transition ${
                  isActive ? "border-midnight bg-midnight text-white" : "border-roast/10 bg-linen text-midnight hover:border-clay/30"
                }`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${isActive ? "bg-white/10 text-gold" : "bg-clay/10 text-clay"}`}>
                  <Store className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{branch.name}</span>
                  <span className={`mt-0.5 block text-xs capitalize ${isActive ? "text-white/65" : "text-ink/50"}`}>{branch.status}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <DashboardTabs activeTab={activeTab} shopId={shop.id} />
      <SaveNotice saved={searchParams.saved} />

      {activeTab === "overview" ? (
        <>
      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard icon={<Store className="h-5 w-5" />} label="Listing status" value="Published" />
        <StatCard icon={<Coffee className="h-5 w-5" />} label="Menu items" value={`${shop.menu.length} drinks`} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Open hours" value={shop.openingHours} />
        <StatCard icon={<Camera className="h-5 w-5" />} label="Gallery" value={`${shop.photos.length} photos`} />
      </section>

      <section className="mt-6 rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-clay">Listing completeness</p>
            <h2 className="mt-1 text-2xl font-semibold text-midnight">{completedChecklistItems} of {checklist.length} complete</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
              Strong listings look more trustworthy in search and give customers enough context before they visit.
            </p>
          </div>
          <div className="min-w-40 rounded-lg bg-linen p-4 text-center">
            <p className="text-3xl font-semibold text-midnight">{completionPercent}%</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink/55">profile strength</p>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-crema">
          <div className="h-full rounded-full bg-lagoon" style={{ width: `${completionPercent}%` }} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {checklist.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`focus-ring flex items-start gap-3 rounded-lg border p-3 transition ${
                item.complete ? "border-lagoon/20 bg-lagoon/10" : "border-ink/10 bg-linen hover:bg-crema"
              }`}
            >
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold ${
                item.complete ? "bg-lagoon text-white" : "bg-white text-ink/45"
              }`}>
                {item.complete ? "✓" : ""}
              </span>
              <span>
                <span className="block text-sm font-semibold text-midnight">{item.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-ink/60">{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-clay">Public listing</p>
            <h2 className="mt-1 text-2xl font-semibold text-midnight">Share and preview your shop page</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
              This is the customer-facing page people see from search results, social posts, and shared links.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={publicShopPath}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-midnight px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-roast"
            >
              <ExternalLink className="h-4 w-4" />
              View public shop
            </Link>
            <CopyShopLinkButton url={publicShopUrl} />
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <StatusTile label="Status" value={shop.status === "published" ? "Published" : shop.status} />
          <StatusTile label="Last updated" value={formatDashboardDate(shop.updatedAt)} />
          <StatusTile label="Public URL" value={publicShopUrl} icon={<Link2 className="h-4 w-4" />} />
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-roast">
              <BarChart3 className="h-5 w-5 text-clay" />
              Analytics
            </h2>
            <p className="mt-1 text-sm text-ink/60">Last 30 days</p>
          </div>
          <span className="rounded-md bg-sage/15 px-2 py-1 text-xs font-medium text-sage">Live insights</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Shop views" value={String(analytics.shopViews)} />
          <StatCard icon={<MapPin className="h-5 w-5" />} label="Direction clicks" value={String(analytics.directionClicks)} />
          <StatCard icon={<Star className="h-5 w-5" />} label="Reviews" value={String(reviews.length)} />
        </div>
      </section>
        </>
      ) : null}

      {activeTab === "profile" || activeTab === "menu" ? (
      <section className={`mt-8 grid gap-6 ${activeTab === "profile" ? "max-w-4xl" : "max-w-3xl"}`}>
        {activeTab === "profile" ? (
        <div className="rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-roast">Shop profile</h2>
            <span className="rounded-md bg-sage/15 px-2 py-1 text-xs font-medium text-sage">Live editor</span>
          </div>
          <form action={saveShopProfileAction} className="mt-4 grid gap-4">
            <input type="hidden" name="shopId" value={shop.id} />
            <label className="text-sm font-medium text-ink/75">
              Shop name
              <input name="name" defaultValue={shop.name} className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
            </label>
            <label className="text-sm font-medium text-ink/75">
              Description
              <textarea name="description" defaultValue={shop.description} className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 p-3" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-ink/75">
                Phone
                <input name="phone" defaultValue={shop.phone} className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
              </label>
              <label className="text-sm font-medium text-ink/75">
                Website
                <input name="website" defaultValue={shop.website} className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
              </label>
              <label className="text-sm font-medium text-ink/75">
                Facebook page
                <input name="facebookUrl" defaultValue={shop.facebookUrl} placeholder="https://www.facebook.com/yourshop" className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
              </label>
              <label className="text-sm font-medium text-ink/75">
                Instagram profile
                <input name="instagramUrl" defaultValue={shop.instagramUrl} placeholder="https://www.instagram.com/yourshop" className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
              </label>
            </div>
            <ImageUrlUpload
              label="Cover image"
              name="coverImageUrl"
              defaultValue={shop.coverImageUrl}
              uploadKind="cover"
              ownerPrefix={shop.id}
            />
            <ShopLabelFields selectedLabels={shop.labels} />
            <button className="focus-ring rounded-md bg-clay px-4 py-2.5 font-medium text-white hover:bg-clay/90">
              Save profile
            </button>
          </form>
          <form action={saveOpeningHoursAction} className="mt-4 grid gap-4">
            <input type="hidden" name="shopId" value={shop.id} />
            <fieldset className="rounded-md border border-ink/10 p-4">
              <legend className="px-1 text-sm font-semibold text-roast">Weekly opening hours</legend>
              <div className="mt-2 grid gap-3">
                {dayKeys.map((day) => (
                  <div key={day} className="grid items-center gap-3 rounded-md bg-crema p-3 sm:grid-cols-[72px_1fr_1fr_120px]">
                    <span className="font-medium uppercase text-roast">{day}</span>
                    <input
                      name={`${day}.open`}
                      type="time"
                      defaultValue={shop.weeklyHours[day].open}
                      className="focus-ring h-10 rounded-md border border-ink/15 px-3"
                      aria-label={`${day} opening time`}
                    />
                    <input
                      name={`${day}.close`}
                      type="time"
                      defaultValue={shop.weeklyHours[day].close}
                      className="focus-ring h-10 rounded-md border border-ink/15 px-3"
                      aria-label={`${day} closing time`}
                    />
                    <label className="flex items-center gap-2 text-sm font-medium text-ink/70">
                      <input name={`${day}.isClosed`} type="checkbox" defaultChecked={shop.weeklyHours[day].isClosed} className="h-4 w-4 accent-clay" />
                      Closed
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
            <button className="focus-ring rounded-md bg-clay px-4 py-2.5 font-medium text-white hover:bg-clay/90">
              Save opening hours
            </button>
          </form>
          <div className="mt-4">
            <label className="text-sm font-medium text-ink/75">
              Address and map pin
              <div className="mt-2 grid gap-3 rounded-md border border-dashed border-ink/20 bg-crema p-4">
                <span className="flex items-center gap-2 text-ink/75">
                  <MapPin className="h-4 w-4 text-clay" />
                  {shop.address}, {shop.city}
                </span>
                <div className="h-40 rounded-md bg-[linear-gradient(135deg,#d7e4d8_25%,#f4efe7_25%,#f4efe7_50%,#d7e4d8_50%,#d7e4d8_75%,#f4efe7_75%)] bg-[length:28px_28px]" />
              </div>
            </label>
          </div>
        </div>
        ) : null}

        {activeTab === "menu" ? (
        <div className="rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-roast">Menu manager</h2>
              <p className="mt-1 text-sm text-ink/60">Keep a few visible drinks for search. Full menus can come later.</p>
            </div>
            <span className="rounded-md bg-crema px-3 py-1 text-sm font-semibold text-roast">{shop.menu.length} drinks</span>
          </div>
          <details className="mt-4 rounded-lg border border-ink/10 bg-linen p-3">
            <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-1 py-1 text-sm font-semibold text-midnight">
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4 text-clay" />
                Add a drink
              </span>
              <span className="text-xs font-medium text-ink/55">Optional</span>
            </summary>
            <form action={createMenuItemAction} className="mt-4 grid gap-3">
              <input type="hidden" name="shopId" value={shop.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="name" placeholder="Drink name" className="focus-ring h-10 rounded-md border border-ink/15 px-3" />
                <input name="price" placeholder="Price PHP" type="number" min="0" step="0.01" className="focus-ring h-10 rounded-md border border-ink/15 px-3" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="category" placeholder="Category" defaultValue="Menu" className="focus-ring h-10 rounded-md border border-ink/15 px-3" />
                <input name="tags" placeholder="Tags, comma-separated" className="focus-ring h-10 rounded-md border border-ink/15 px-3" />
              </div>
              <input name="description" placeholder="Short description" className="focus-ring h-10 rounded-md border border-ink/15 px-3" />
              <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-midnight px-3 py-2 text-sm font-semibold text-white">
                <Plus className="h-4 w-4" />
                Save drink
              </button>
            </form>
          </details>
          <div className="mt-4 rounded-lg bg-crema p-3">
            <p className="text-sm font-semibold text-roast">Published drinks</p>
            {shop.menu.length > 0 ? (
              <div className="mt-2 grid gap-2">
                {shop.menu.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm">
                    <span className="truncate font-medium text-ink/75">{item.name}</span>
                    <span className="shrink-0 text-xs font-semibold text-roast">PHP {(item.priceCents / 100).toFixed(0)}</span>
                  </div>
                ))}
                {shop.menu.length > 4 ? <p className="text-xs font-medium text-ink/55">+{shop.menu.length - 4} more drinks</p> : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink/60">No drinks added yet.</p>
            )}
          </div>
        </div>
        ) : null}
      </section>
      ) : null}

      {activeTab === "insights" ? <OwnerInsightsPanel insights={insights} shopId={shop.id} /> : null}

      {activeTab === "gallery" ? (
      <section className="mt-8 rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-roast">
              <Camera className="h-5 w-5 text-clay" />
              Photo gallery
            </h2>
            <p className="mt-1 text-sm text-ink/60">Show the shop interior, drinks, seating, storefront, or menu board.</p>
          </div>
          <span className="rounded-md bg-lagoon/10 px-3 py-1 text-sm font-semibold text-lagoon">{shop.photos.length} photos</span>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <form action={createShopPhotoAction} className="grid gap-4 rounded-lg bg-linen p-4">
            <input type="hidden" name="shopId" value={shop.id} />
            <ImageUrlUpload label="Gallery image" name="imageUrl" uploadKind="gallery" ownerPrefix={shop.id} />
            <label className="text-sm font-medium text-ink/75">
              Caption
              <input name="caption" placeholder="Seating area, signature latte, storefront..." className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
            </label>
            <label className="text-sm font-medium text-ink/75">
              Sort order
              <input name="sortOrder" type="number" min="0" defaultValue={shop.photos.length} className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
            </label>
            <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-midnight px-4 py-2.5 font-semibold text-white transition hover:bg-roast">
              <Plus className="h-4 w-4" />
              Add photo
            </button>
          </form>
          <div className="grid gap-3 sm:grid-cols-2">
            {shop.photos.length > 0 ? (
              shop.photos.map((photo) => (
                <article key={photo.id} className="overflow-hidden rounded-lg border border-ink/10 bg-white">
                  <img src={photo.imageUrl} alt="" className="h-36 w-full object-cover" />
                  <div className="grid gap-3 p-3">
                    <div>
                      <p className="text-sm font-semibold text-midnight">{photo.caption || "Gallery photo"}</p>
                      <p className="text-xs text-ink/55">Sort order {photo.sortOrder}</p>
                    </div>
                    <form action={deleteShopPhotoAction}>
                      <input type="hidden" name="shopId" value={shop.id} />
                      <input type="hidden" name="photoId" value={photo.id} />
                      <button className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-crema px-3 py-2 text-sm font-semibold text-roast hover:bg-roast/10">
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg bg-crema p-4 text-sm text-ink/65 sm:col-span-2">No gallery photos yet.</div>
            )}
          </div>
        </div>
      </section>
      ) : null}

      {activeTab === "promos" ? (
      <section className="mt-8 rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-roast">
            <BadgePercent className="h-5 w-5 text-clay" />
            Promos
          </h2>
          <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-roast px-3 py-2 text-sm font-medium text-white">
            <Plus className="h-4 w-4" />
            Add promo
          </button>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <form action={createPromoAction} className="grid gap-3 rounded-md border border-ink/10 p-4">
            <input type="hidden" name="shopId" value={shop.id} />
            <input name="title" placeholder="Promo title" className="focus-ring h-10 rounded-md border border-ink/15 px-3" />
            <textarea name="description" placeholder="Promo description" className="focus-ring min-h-20 rounded-md border border-ink/15 p-3" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="code" placeholder="Promo code" className="focus-ring h-10 rounded-md border border-ink/15 px-3" />
              <input name="endsAt" type="date" className="focus-ring h-10 rounded-md border border-ink/15 px-3" aria-label="Promo end date" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink/70">
              <input name="isFeatured" type="checkbox" className="h-4 w-4 accent-clay" />
              Featured promo
            </label>
            <button className="focus-ring rounded-md bg-clay px-4 py-2.5 font-medium text-white">
              Save promo
            </button>
          </form>
          <div className="grid gap-3">
            {shop.promos.length > 0 ? (
              shop.promos.map((promo) => (
                <article key={promo.id} className="rounded-md border border-ink/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-roast">{promo.title}</p>
                      <p className="mt-1 text-sm text-ink/65">{promo.description}</p>
                    </div>
                    <span className="rounded-md bg-sage/15 px-2 py-1 text-xs font-medium text-sage">
                      {promo.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-md bg-crema p-4 text-sm text-ink/65">No promos yet.</div>
            )}
          </div>
        </div>
      </section>
      ) : null}

      {activeTab === "reviews" ? (
      <section className="mt-8 rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <h2 className="text-xl font-semibold text-roast">Review moderation</h2>
          {isDemo ? <span className="rounded-md bg-crema px-2 py-1 text-xs font-medium text-ink/65">Demo data</span> : null}
        </div>
        <div className="mt-4 grid gap-3">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <article key={review.id} className="grid gap-4 rounded-md border border-ink/10 p-4 lg:grid-cols-[1fr_180px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-roast">{review.reviewerName}</p>
                    <span className="rounded-md bg-clay/10 px-2 py-1 text-xs font-medium text-clay">{review.rating} / 5</span>
                    <span className="rounded-md bg-crema px-2 py-1 text-xs font-medium text-ink/65">
                      {review.isPublished ? "Published" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/70">{review.comment}</p>
                </div>
                <form action={updateReviewVisibilityAction} className="self-start">
                  <input type="hidden" name="shopId" value={shop.id} />
                  <input type="hidden" name="reviewId" value={review.id} />
                  <input type="hidden" name="isPublished" value={review.isPublished ? "false" : "true"} />
                  <button className="focus-ring w-full rounded-md bg-crema px-3 py-2 text-sm font-medium text-roast">
                    {review.isPublished ? "Hide review" : "Publish review"}
                  </button>
                </form>
              </article>
            ))
          ) : (
            <div className="rounded-md bg-crema p-4 text-sm text-ink/65">No reviews yet.</div>
          )}
        </div>
      </section>
      ) : null}
    </main>
  );
}

function DashboardTabs({ activeTab, shopId }: { activeTab: DashboardTab; shopId: string }) {
  return (
    <nav className="-mx-4 mt-6 overflow-x-auto border-y border-roast/10 bg-white px-4 py-2 shadow-sm sm:mx-0 sm:rounded-lg sm:border" aria-label="Dashboard sections">
      <div className="flex min-w-max gap-1">
        {dashboardTabs.map((tab) => (
          <Link
            key={tab.id}
            href={dashboardHref(tab.id, shopId)}
            className={`focus-ring rounded-md px-3 py-2 text-sm font-semibold transition ${
              activeTab === tab.id ? "bg-midnight text-white shadow-sm" : "text-ink/70 hover:bg-crema hover:text-midnight"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function parseDashboardTab(value?: string): DashboardTab {
  return dashboardTabs.some((tab) => tab.id === value) ? (value as DashboardTab) : "overview";
}

function dashboardHref(tab: DashboardTab, shopId: string) {
  const params = new URLSearchParams({ shop: shopId });
  if (tab !== "overview") params.set("tab", tab);
  return `/dashboard?${params.toString()}`;
}

function getListingChecklist(shop: CoffeeShop, reviewCount: number) {
  return [
    {
      label: "Cover image added",
      description: "Use a real shop, counter, drink, or storefront photo.",
      complete: Boolean(shop.coverImageUrl),
      href: dashboardHref("profile", shop.id)
    },
    {
      label: "Description is helpful",
      description: "Tell customers what makes the shop worth visiting.",
      complete: shop.description.trim().length >= 40,
      href: dashboardHref("profile", shop.id)
    },
    {
      label: "Location is set",
      description: "Address and coordinates help nearby search and directions.",
      complete: Boolean(shop.address && shop.city && shop.coordinates.latitude && shop.coordinates.longitude),
      href: dashboardHref("profile", shop.id)
    },
    {
      label: "Social links added",
      description: "Facebook or Instagram links help customers verify the shop.",
      complete: Boolean(shop.facebookUrl || shop.instagramUrl),
      href: dashboardHref("profile", shop.id)
    },
    {
      label: "Shop labels selected",
      description: "Add at least 3 labels like WiFi, cozy, or work friendly.",
      complete: shop.labels.length >= 3,
      href: dashboardHref("profile", shop.id)
    },
    {
      label: "Gallery has photos",
      description: "Add at least 2 photos of drinks, seating, or the storefront.",
      complete: shop.photos.length >= 2,
      href: dashboardHref("gallery", shop.id)
    },
    {
      label: "Menu or promo added",
      description: "Give customers a reason to choose your shop today.",
      complete: shop.menu.length > 0 || shop.promos.length > 0,
      href: dashboardHref(shop.menu.length > 0 ? "promos" : "menu", shop.id)
    },
    {
      label: "Customer proof started",
      description: "Reviews build trust once customers begin discovering you.",
      complete: reviewCount > 0,
      href: dashboardHref("reviews", shop.id)
    }
  ];
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-lg border border-roast/10 bg-white p-4 shadow-sm">
      <div className="mb-3 inline-flex rounded-md bg-clay/10 p-2 text-clay">{icon}</div>
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-1 font-semibold text-roast">{value}</p>
    </article>
  );
}

function StatusTile({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-lg bg-linen p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink/55">
        {icon}
        {label}
      </div>
      <p className="mt-2 truncate font-semibold text-midnight">{value}</p>
    </div>
  );
}

function OwnerInsightsPanel({ insights, shopId }: { insights: OwnerInsights; shopId: string }) {
  const totalActions = insights.current.directionClicks;
  const previousActions = insights.previous.directionClicks;
  const chartMax = Math.max(1, ...insights.dailyActivity.flatMap((point) => [point.views, point.actions]));
  const intentRows = [{ label: "Directions", value: insights.current.directionClicks, color: "bg-lagoon" }];
  const maxIntent = Math.max(1, ...intentRows.map((item) => item.value));
  const pikoTip = getOwnerTip(insights, shopId);

  return (
    <section className="mt-8 grid gap-5">
      <div className="flex flex-col justify-between gap-4 rounded-lg bg-midnight p-6 text-white shadow-panel lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">Piko owner insights</p>
          <h2 className="mt-2 text-3xl font-semibold">Your café is turning discovery into action.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">A 30-day view of how customers find your listing and what they do next.</p>
        </div>
        <span className="w-fit rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white/75">Updated live</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightMetric icon={<Eye className="h-5 w-5" />} label="Shop views" value={insights.current.shopViews} change={percentChange(insights.current.shopViews, insights.previous.shopViews)} />
        <InsightMetric icon={<MousePointerClick className="h-5 w-5" />} label="Customer actions" value={totalActions} change={percentChange(totalActions, previousActions)} />
        <InsightMetric icon={<BarChart3 className="h-5 w-5" />} label="Action rate" value={`${insights.actionRate}%`} helper="actions per 100 views" />
        <InsightMetric icon={<Sparkles className="h-5 w-5" />} label="Strongest intent" value={insights.strongestIntent} helper="in the last 30 days" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <article className="rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-clay">Last 7 days</p>
              <h3 className="mt-1 text-xl font-semibold text-midnight">Discovery and action trend</h3>
            </div>
            <div className="flex gap-4 text-xs font-semibold text-ink/55">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-lagoon" />Views</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gold" />Actions</span>
            </div>
          </div>
          <div className="mt-7 grid h-52 grid-cols-7 items-end gap-2 sm:gap-4" aria-label="Seven day activity chart">
            {insights.dailyActivity.map((point) => (
              <div key={point.label} className="grid h-full grid-rows-[1fr_auto] gap-2 text-center">
                <div className="flex items-end justify-center gap-1 rounded-md bg-linen px-1 pt-3">
                  <span title={`${point.views} views`} className="w-2.5 rounded-t-full bg-lagoon sm:w-4" style={{ height: `${Math.max(4, (point.views / chartMax) * 100)}%` }} />
                  <span title={`${point.actions} actions`} className="w-2.5 rounded-t-full bg-gold sm:w-4" style={{ height: `${Math.max(4, (point.actions / chartMax) * 100)}%` }} />
                </div>
                <span className="text-xs font-semibold text-ink/55">{point.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-roast/10 bg-white p-5 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-wide text-clay">Customer intent</p>
              <h3 className="mt-1 text-xl font-semibold text-midnight">Visit intent</h3>
          <div className="mt-6 grid gap-5">
            {intentRows.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-ink/70">{item.label}</span>
                  <span className="font-semibold text-midnight">{item.value}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-crema">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.value / maxIntent) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="grid gap-5 rounded-lg border border-gold/40 bg-gold/10 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="grid h-12 w-12 place-items-center rounded-md bg-gold text-midnight"><Lightbulb className="h-6 w-6" /></div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-clay">Piko’s next best move</p>
          <h3 className="mt-1 text-lg font-semibold text-midnight">{pikoTip.title}</h3>
          <p className="mt-1 text-sm leading-6 text-ink/65">{pikoTip.body}</p>
        </div>
        <Link href={pikoTip.href} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-midnight px-4 py-2.5 text-sm font-semibold text-white">
          {pikoTip.action}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </article>
    </section>
  );
}

function InsightMetric({ icon, label, value, change, helper }: { icon: ReactNode; label: string; value: string | number; change?: number | null; helper?: string }) {
  return (
    <article className="rounded-lg border border-roast/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex rounded-md bg-clay/10 p-2 text-clay">{icon}</span>
        {change !== undefined ? <TrendPill value={change} /> : null}
      </div>
      <p className="mt-5 text-sm font-medium text-ink/55">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-midnight">{value}</p>
      {helper ? <p className="mt-1 text-xs text-ink/50">{helper}</p> : null}
    </article>
  );
}

function TrendPill({ value }: { value: number | null }) {
  if (value === null) return <span className="rounded-md bg-gold/15 px-2 py-1 text-xs font-semibold text-clay">New</span>;
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${positive ? "bg-sage/15 text-sage" : "bg-clay/10 text-clay"}`}>
      {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {Math.abs(value)}%
    </span>
  );
}

function getOwnerTip(insights: OwnerInsights, _shopId: string) {
  if (insights.current.shopViews === 0) {
    return { title: "Make the listing easier to discover", body: "Add current photos and three accurate café labels so Piko can match you to more searches.", href: "/dashboard?tab=profile", action: "Improve profile" };
  }
  if (insights.actionRate < 20) {
    return { title: "Give visitors one clear reason to choose you", body: "Feature a signature drink or a timely offer to turn more listing views into café visits.", href: "/dashboard?tab=promos", action: "Create a promo" };
  }
  if (insights.strongestIntent === "Directions") {
    return { title: "Your audience is ready to visit", body: "Keep opening hours accurate and add a small in-store promo for customers already checking directions.", href: "/dashboard?tab=promos", action: "Add visit offer" };
  }
  return { title: "Turn discovery into a café visit", body: "Keep your hours, location, and current offers accurate so customers can visit with confidence.", href: "/dashboard?tab=profile", action: "Review details" };
}

function formatDashboardDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function SaveNotice({ saved }: { saved?: string }) {
  if (!saved) {
    return null;
  }

  const messages: Record<string, string> = {
    demo: "Demo mode: connect Supabase to persist dashboard changes.",
    profile: "Profile saved.",
    hours: "Opening hours saved.",
    menu: "Menu item added.",
    promo: "Promo saved.",
    photo: "Gallery photo added.",
    "photo-deleted": "Gallery photo removed.",
    review: "Review visibility updated."
  };

  return <div className="mt-4 rounded-md bg-sage/15 p-3 text-sm font-medium text-sage">{messages[saved] ?? "Saved."}</div>;
}
