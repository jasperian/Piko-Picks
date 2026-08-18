"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BadgeCheck, Camera, Coffee, ExternalLink, MapPin, Plus, Store, Trash2 } from "lucide-react";
import { registerShopAction } from "@/app/register-shop/actions";
import { ImageUrlUpload } from "@/components/image-url-upload";
import { ShopLabelFields } from "@/components/shop-label-fields";

type MenuDraft = {
  id: string;
  name: string;
  price: string;
  description: string;
};

const defaultMenu: MenuDraft[] = [
  { id: "menu-1", name: "Spanish Latte", price: "185", description: "Iced espresso with condensed milk." },
  { id: "menu-2", name: "Flat White", price: "175", description: "Double ristretto with steamed milk." }
];

export function ShopRegistrationForm({ isBranch = false }: { isBranch?: boolean }) {
  const [menuItems, setMenuItems] = useState(defaultMenu);
  const [shopName, setShopName] = useState(isBranch ? "New Corner Coffee — Second Branch" : "New Corner Coffee");
  const [description, setDescription] = useState("A neighborhood coffee stop serving espresso drinks, cold brew, and signature cafe drinks.");
  const [city, setCity] = useState("Quezon City");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [previewLabels, setPreviewLabels] = useState(["Free WiFi", "Work Friendly", "Cozy"]);

  const menuItemsJson = useMemo(
    () =>
      JSON.stringify(
        menuItems
          .filter((item) => item.name.trim().length > 0)
          .map((item) => ({
            name: item.name,
            price: Number(item.price || 0),
            description: item.description
          }))
      ),
    [menuItems]
  );

  function updateMenuItem(id: string, field: keyof MenuDraft, value: string) {
    setMenuItems((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function addMenuItem() {
    setMenuItems((items) => [...items, { id: crypto.randomUUID(), name: "", price: "", description: "" }]);
  }

  function removeMenuItem(id: string) {
    setMenuItems((items) => items.filter((item) => item.id !== id));
  }

  function updatePreviewLabel(label: string, checked: boolean) {
    setPreviewLabels((labels) => (checked ? Array.from(new Set([...labels, label])) : labels.filter((item) => item !== label)));
  }

  return (
    <form action={registerShopAction} className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      <input type="hidden" name="menuItemsJson" value={menuItemsJson} />
      <input type="hidden" name="registrationType" value={isBranch ? "branch" : "shop"} />

      <div className="grid gap-6">
        <OnboardingStep number="1" title={isBranch ? "Branch profile" : "Business profile"} description="Start with the core details customers will see first.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Owner name" name="ownerName" defaultValue="Juan Dela Cruz" required />
            <Field label="Owner email" name="ownerEmail" type="email" defaultValue="owner@example.com" required />
            <Field label="Coffee shop name" name="shopName" value={shopName} onChange={setShopName} required />
            <Field label="Phone" name="phone" defaultValue="+63 917 555 1200" required />
            <label className="block text-sm font-medium text-ink/75 sm:col-span-2">
              Description
              <textarea
                name="description"
                required
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 p-3 shadow-sm"
              />
            </label>
            <Field label="Website" name="website" defaultValue="https://example.com" />
            <Field label="Facebook page" name="facebookUrl" placeholder="https://www.facebook.com/yourshop" />
            <Field label="Instagram profile" name="instagramUrl" placeholder="https://www.instagram.com/yourshop" />
          </div>
        </OnboardingStep>

        <OnboardingStep number="2" title="Photos and shop personality" description="Add a cover image and labels that help customers filter for your space.">
          <div className="grid gap-5">
            <ImageUrlUpload label="Cover image" name="coverImageUrl" uploadKind="cover" ownerPrefix="registration" onValueChange={setCoverImageUrl} />
            <ShopLabelFields
              selectedLabels={[
                { groupName: "Amenities", label: "Free WiFi" },
                { groupName: "Best For", label: "Work Friendly" },
                { groupName: "Vibe", label: "Cozy" }
              ]}
              onLabelChange={updatePreviewLabel}
            />
          </div>
        </OnboardingStep>

        <OnboardingStep number="3" title="Location" description="Add the address and map pin so customers can find the shop nearby.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Street address" name="address" defaultValue="123 Coffee Street" required />
            <Field label="City" name="city" value={city} onChange={setCity} required />
            <Field label="Latitude" name="latitude" type="number" step="any" defaultValue="14.6335" required />
            <Field label="Longitude" name="longitude" type="number" step="any" defaultValue="121.0389" required />
          </div>
        </OnboardingStep>

        <OnboardingStep number="4" title="Starter menu" description="Add a few signature drinks now. You can edit or expand the menu later.">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addMenuItem}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-midnight px-3 py-2 text-sm font-semibold text-white transition hover:bg-roast"
            >
              <Plus className="h-4 w-4" />
              Add drink
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {menuItems.map((item) => (
              <article key={item.id} className="grid gap-3 rounded-md border border-ink/10 bg-linen p-3 md:grid-cols-[1fr_120px_1.3fr_44px]">
                <input
                  aria-label="Drink name"
                  value={item.name}
                  onChange={(event) => updateMenuItem(item.id, "name", event.target.value)}
                  placeholder="Drink name"
                  className="focus-ring h-10 rounded-md border border-ink/15 px-3"
                />
                <input
                  aria-label="Price"
                  value={item.price}
                  onChange={(event) => updateMenuItem(item.id, "price", event.target.value)}
                  placeholder="PHP"
                  type="number"
                  min="0"
                  className="focus-ring h-10 rounded-md border border-ink/15 px-3"
                />
                <input
                  aria-label="Description"
                  value={item.description}
                  onChange={(event) => updateMenuItem(item.id, "description", event.target.value)}
                  placeholder="Short description"
                  className="focus-ring h-10 rounded-md border border-ink/15 px-3"
                />
                <button
                  type="button"
                  onClick={() => removeMenuItem(item.id)}
                  aria-label="Remove drink"
                  className="focus-ring grid h-10 place-items-center rounded-md bg-white text-roast"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </OnboardingStep>

        <section className="rounded-lg bg-midnight p-5 text-white shadow-panel">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">Ready to publish</p>
              <h2 className="mt-1 text-2xl font-semibold">Your {isBranch ? "branch" : "shop"} appears in search immediately.</h2>
            </div>
            <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 font-semibold text-midnight transition hover:bg-white">
              <ExternalLink className="h-4 w-4" />
              Publish {isBranch ? "branch" : "coffee shop"}
            </button>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24">
        <ListingPreview shopName={shopName} description={description} city={city} coverImageUrl={coverImageUrl} labels={previewLabels} menuItems={menuItems} isBranch={isBranch} />
      </aside>
    </form>
  );
}

function OnboardingStep({ number, title, description, children }: { number: string; title: string; description: string; children: ReactNode }) {
  return (
    <section className="surface rounded-lg p-5">
      <div className="mb-5 flex gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-midnight text-sm font-semibold text-white">{number}</span>
        <div>
          <h2 className="text-xl font-semibold text-midnight">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-ink/65">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ListingPreview({
  shopName,
  description,
  city,
  coverImageUrl,
  labels,
  menuItems,
  isBranch
}: {
  shopName: string;
  description: string;
  city: string;
  coverImageUrl: string;
  labels: string[];
  menuItems: MenuDraft[];
  isBranch: boolean;
}) {
  const visibleMenuItems = menuItems.filter((item) => item.name.trim()).slice(0, 3);

  return (
    <section className="overflow-hidden rounded-lg border border-roast/10 bg-white shadow-panel">
      <div className="relative h-48 bg-midnight">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,#172033,#5b372d)] text-white/70">
            <Camera className="h-8 w-8 text-gold" />
            <span className="text-sm font-medium">Cover preview</span>
          </div>
        )}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/92 px-2.5 py-1 text-xs font-semibold text-midnight shadow-sm">
          <BadgeCheck className="h-3.5 w-3.5 text-lagoon" />
          New {isBranch ? "branch" : "listing"}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-clay">Public preview</p>
          <h3 className="mt-1 text-2xl font-semibold text-midnight">{shopName || "Your coffee shop"}</h3>
          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-ink/60">
            <MapPin className="h-4 w-4 text-clay" />
            {city || "City"}
          </p>
        </div>
        <p className="text-sm leading-6 text-ink/70">{description || "Your short shop description will appear here."}</p>
        <div className="flex flex-wrap gap-2">
          {labels.slice(0, 6).map((label) => (
            <span key={label} className="rounded-md bg-lagoon/10 px-2 py-1 text-xs font-semibold text-lagoon">
              {label}
            </span>
          ))}
        </div>
        <div className="rounded-md bg-linen p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-midnight">
            <Coffee className="h-4 w-4 text-clay" />
            Starter drinks
          </p>
          <div className="space-y-2">
            {visibleMenuItems.length > 0 ? (
              visibleMenuItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="font-medium text-ink/75">{item.name}</span>
                  <span className="shrink-0 font-semibold text-midnight">PHP {item.price || "0"}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink/55">Add drinks to preview your starter menu.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  value,
  onChange,
  placeholder,
  step,
  required
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-ink/75">
      {label}
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 shadow-sm"
      />
    </label>
  );
}
