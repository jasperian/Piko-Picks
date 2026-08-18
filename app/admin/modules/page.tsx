import Link from "next/link";
import { BarChart3, Bell, Blocks, CreditCard, Mail, ShieldCheck, ShoppingBag } from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { PikoPet } from "@/components/piko-pet";
import { getCurrentUserRole } from "@/lib/supabase/profile";

const modules: Array<{
  name: string;
  category: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    name: "Plans and subscriptions",
    category: "Monetization",
    description: "Paid tiers, billing, premium placement, and plan-based feature controls.",
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    name: "Ordering and pickup",
    category: "Commerce",
    description: "Direct café requests, order status, preparation timing, and customer confirmations.",
    icon: <ShoppingBag className="h-5 w-5" />
  },
  {
    name: "Owner notifications",
    category: "Operations",
    description: "Email and in-app alerts for important shop activity and customer feedback.",
    icon: <Bell className="h-5 w-5" />
  },
  {
    name: "Weekly Piko digest",
    category: "Retention",
    description: "A concise weekly recap of café discovery trends and recommended next actions.",
    icon: <Mail className="h-5 w-5" />
  },
  {
    name: "Shop verification",
    category: "Trust",
    description: "Owner identity checks, verified listing badges, and a structured review process.",
    icon: <ShieldCheck className="h-5 w-5" />
  },
  {
    name: "Advanced recommendations",
    category: "Discovery",
    description: "Deeper personalization using visit patterns, saved collections, and café preferences.",
    icon: <BarChart3 className="h-5 w-5" />
  }
];

export default async function AdminModulesPage() {
  const role = await getCurrentUserRole();

  if (role !== "admin") {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
      <section className="overflow-hidden rounded-lg bg-midnight text-white shadow-panel">
        <div className="grid gap-6 p-5 md:grid-cols-[1fr_320px] md:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">Admin roadmap</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">Coming soon modules</h1>
            <p className="mt-4 max-w-2xl leading-7 text-white/70">
              Future ideas live here until they are ready for the public product. Nothing on this page is active or customer-facing.
            </p>
            <Link href="/admin" className="focus-ring mt-6 inline-flex rounded-md bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15">
              Back to shop administration
            </Link>
          </div>
          <div className="flex items-end justify-center rounded-lg bg-white/8 p-3 sm:p-4">
            <PikoPet mode="waiting" />
            <div className="relative mb-8 max-w-32 rounded-md bg-white px-3 py-2.5 text-xs font-semibold leading-5 text-midnight sm:max-w-40 sm:text-sm">
              <span className="absolute -left-2 bottom-4 h-4 w-4 rotate-45 bg-white" aria-hidden="true" />
              <span className="relative">Good ideas can wait until they’re ready.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <article key={module.name} className="rounded-lg border border-roast/10 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex rounded-md bg-clay/10 p-2.5 text-clay">{module.icon}</span>
              <span className="rounded-md bg-gold/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-roast">Coming soon</span>
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-clay">{module.category}</p>
            <h2 className="mt-1 text-xl font-semibold text-midnight">{module.name}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">{module.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 flex items-center gap-3 rounded-lg border border-lagoon/20 bg-lagoon/10 p-5 text-sm text-ink/70">
        <Blocks className="h-5 w-5 shrink-0 text-lagoon" />
        <p><span className="font-semibold text-midnight">Current focus:</span> café discovery, saved collections, trustworthy reviews, accurate listings, and owner insights.</p>
      </section>
    </main>
  );
}
