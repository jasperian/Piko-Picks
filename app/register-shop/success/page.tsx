import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type Props = {
  searchParams: {
    shop?: string;
    shopId?: string;
    demo?: string;
    branch?: string;
  };
};

export default function RegisterShopSuccessPage({ searchParams }: Props) {
  const shopName = searchParams.shop ?? "Your coffee shop";
  const isDemo = searchParams.demo === "1";
  const isBranch = searchParams.branch === "1";
  const dashboardHref = searchParams.shopId ? `/dashboard?shop=${encodeURIComponent(searchParams.shopId)}` : "/dashboard";

  return (
    <main className="mx-auto grid min-h-[calc(100vh-58px)] max-w-3xl place-items-center px-4 py-10 text-center">
      <section className="rounded-lg border border-roast/10 bg-white p-8 shadow-panel">
        <CheckCircle2 className="mx-auto h-12 w-12 text-sage" />
        <h1 className="mt-5 text-3xl font-semibold text-roast">{shopName} is ready</h1>
        <p className="mt-3 leading-7 text-ink/70">
          {isDemo
            ? "Supabase is not configured in this local demo, so the form was validated and routed here without saving."
            : `The ${isBranch ? "branch" : "shop"} was created and published. Customers can now discover it in search.`}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="focus-ring rounded-md bg-clay px-4 py-2.5 font-medium text-white">
            View discovery
          </Link>
          <Link href={dashboardHref} className="focus-ring rounded-md bg-crema px-4 py-2.5 font-medium text-roast">
            Manage {isBranch ? "branch" : "shop"}
          </Link>
        </div>
      </section>
    </main>
  );
}
