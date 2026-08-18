import { AlertTriangle, Blocks, Eye, ShieldCheck, Store } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { updateShopStatusAction } from "@/app/admin/actions";
import { getCurrentUserRole } from "@/lib/supabase/profile";
import { getAdminShops } from "@/lib/supabase/admin-queries";

type Props = {
  searchParams: {
    saved?: string;
  };
};

export default async function AdminPage({ searchParams }: Props) {
  const role = await getCurrentUserRole();

  if (role !== "admin") {
    redirect("/");
  }

  const shops = await getAdminShops();
  const publishedShops = shops.filter((shop) => shop.status === "published");
  const suspendedShops = shops.filter((shop) => shop.status === "suspended");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-clay">Platform overview</p>
        <h1 className="mt-1 text-3xl font-semibold text-roast">Registered coffee shops</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink/70">
          Shops can register and publish themselves immediately. Admins can still monitor listings and suspend shops when needed.
        </p>
        {searchParams.saved ? <AdminNotice saved={searchParams.saved} /> : null}
        </div>
        <Link href="/admin/modules" className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-midnight px-4 py-2.5 text-sm font-semibold text-white">
          <Blocks className="h-4 w-4" />
          Coming soon modules
        </Link>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <AdminStat icon={<Store className="h-5 w-5" />} label="Published shops" value={String(publishedShops.length)} />
        <AdminStat icon={<Eye className="h-5 w-5" />} label="Visible menus" value={String(publishedShops.reduce((sum, shop) => sum + shop.menu.length, 0))} />
        <AdminStat icon={<ShieldCheck className="h-5 w-5" />} label="Suspended" value={String(suspendedShops.length)} />
      </section>

      <section className="mt-8 rounded-lg border border-roast/10 bg-white shadow-panel">
        <div className="border-b border-roast/10 p-5">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-roast">
            <Store className="h-5 w-5 text-clay" />
            Shop directory
          </h2>
        </div>
        <div className="divide-y divide-roast/10">
          {shops.map((shop) => (
            <article key={shop.id} className="grid gap-4 p-5 lg:grid-cols-[180px_1fr_220px]">
              <img src={shop.coverImageUrl} alt="" className="h-32 w-full rounded-md object-cover" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-roast">{shop.name}</h3>
                  <span className={`rounded-md px-2 py-1 text-xs font-medium ${shop.status === "published" ? "bg-sage/15 text-sage" : "bg-clay/10 text-clay"}`}>
                    {shop.status}
                  </span>
                </div>
                <p className="mt-2 leading-6 text-ink/70">{shop.description}</p>
                <p className="mt-2 text-sm text-ink/60">
                  {shop.address}, {shop.city} / {shop.menu.length} menu items
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={`/shops/${shop.id}`}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-roast px-4 py-2.5 font-medium text-white"
                >
                  <Eye className="h-4 w-4" />
                  View listing
                </a>
                <form action={updateShopStatusAction}>
                  <input type="hidden" name="shopId" value={shop.id} />
                  <input type="hidden" name="status" value={shop.status === "suspended" ? "published" : "suspended"} />
                  <button className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-crema px-4 py-2.5 font-medium text-roast">
                  <AlertTriangle className="h-4 w-4" />
                    {shop.status === "suspended" ? "Restore" : "Suspend"}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function AdminNotice({ saved }: { saved: string }) {
  const messages: Record<string, string> = {
    demo: "Demo mode: connect Supabase to persist admin changes.",
    published: "Shop restored.",
    suspended: "Shop suspended."
  };

  return <div className="mt-4 rounded-md bg-sage/15 p-3 text-sm font-medium text-sage">{messages[saved] ?? "Saved."}</div>;
}

function AdminStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-lg border border-roast/10 bg-white p-4 shadow-sm">
      <div className="mb-3 inline-flex rounded-md bg-clay/10 p-2 text-clay">{icon}</div>
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-roast">{value}</p>
    </article>
  );
}
