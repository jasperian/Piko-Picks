import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { AppNavigation } from "@/components/app-navigation";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

const siteTitle = "Piko Picks — Big eyes. Better coffee.";
const siteDescription = "Let Piko find independent coffee shops by drink, neighborhood, mood, and the details that matter.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F8F3E9"
};

export function generateMetadata(): Metadata {
  const requestHeaders = headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: siteTitle,
    description: siteDescription,
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Piko Picks — Big eyes. Better coffee." }]
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: ["/og.png"]
    }
  };
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppNavigation />
        {children}
        <footer className="px-4 pb-4 pt-9 text-white sm:px-6 sm:pb-5 sm:pt-12">
          <div className="mx-auto grid max-w-7xl gap-6 overflow-hidden rounded-lg bg-midnight p-5 shadow-panel sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">For local coffee businesses</p>
              <h2 className="max-w-3xl text-2xl font-bold leading-tight sm:text-4xl">Your regulars are already looking.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
                Add your cafe profile, labels, social pages, menus, and customer reviews so nearby customers can choose faster.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link className="focus-ring inline-flex justify-center rounded-md bg-gold px-5 py-3 font-bold text-midnight transition hover:bg-white" href="/register-shop">
                Register your shop
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
