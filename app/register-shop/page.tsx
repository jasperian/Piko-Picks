import { ShopRegistrationForm } from "@/components/shop-registration-form";
import { PikoPet } from "@/components/piko-pet";

type Props = {
  searchParams: {
    branch?: string;
  };
};

export default function RegisterShopPage({ searchParams }: Props) {
  const isBranch = searchParams.branch === "1";

  return (
    <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
      <section className="mb-8 overflow-hidden rounded-lg bg-midnight text-white shadow-panel">
        <div className="grid gap-6 p-5 md:grid-cols-[1fr_320px] md:gap-8 md:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">{isBranch ? "Branch setup" : "Guided shop onboarding"}</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
              {isBranch ? "Add another branch to your workspace." : "Register your coffee shop with a listing preview."}
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-white/72">
              {isBranch
                ? "Give this location its own profile, address, opening hours, photos, and starter menu. You can switch between branches from the owner dashboard."
                : "Build the public profile customers will see in search: profile, photos, labels, location, and a starter menu."}
            </p>
          </div>
          <div className="grid content-center gap-4 rounded-lg bg-white/8 p-4">
            <div className="flex items-end justify-center">
              <PikoPet mode="waving" />
              <div className="relative mb-7 max-w-40 rounded-md bg-white px-3 py-2.5 text-sm font-semibold leading-5 text-midnight shadow-sm">
                <span className="absolute -left-2 bottom-4 h-4 w-4 rotate-45 bg-white" aria-hidden="true" />
                <span className="relative">Let’s make your café easy to discover!</span>
              </div>
            </div>
            <div className="grid gap-2 border-t border-white/10 pt-4">
              {["Profile", "Photos and labels", "Location", "Starter menu"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-white/82">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-gold text-xs text-midnight">{index + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <ShopRegistrationForm isBranch={isBranch} />
    </main>
  );
}
