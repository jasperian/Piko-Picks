"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Blocks, Coffee, Heart, LayoutDashboard, LogIn, LogOut, MessagesSquare, ShieldCheck, Store } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { isNavItemActive } from "@/lib/navigation";
import type { AppRole } from "@/lib/supabase/profile";

type NavItem = {
  href: string;
  label: string;
  mobileLabel?: string;
  icon: typeof Coffee;
};

const navByRole: Record<AppRole, NavItem[]> = {
  guest: [
    { href: "/", label: "Coffee shops", mobileLabel: "Shops", icon: Coffee },
    { href: "/feed", label: "Feed", icon: MessagesSquare },
    { href: "/saved", label: "Saved", icon: Heart },
    { href: "/auth", label: "Sign in", icon: LogIn }
  ],
  customer: [
    { href: "/", label: "Coffee shops", mobileLabel: "Shops", icon: Coffee },
    { href: "/feed", label: "Feed", icon: MessagesSquare },
    { href: "/saved", label: "Saved", icon: Heart }
  ],
  shop_owner: [
    { href: "/", label: "Coffee shops", mobileLabel: "Shops", icon: Coffee },
    { href: "/feed", label: "Feed", icon: MessagesSquare },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/register-shop", label: "Register shop", mobileLabel: "Register", icon: Store }
  ],
  admin: [
    { href: "/", label: "Coffee shops", mobileLabel: "Shops", icon: Coffee },
    { href: "/feed", label: "Feed", icon: MessagesSquare },
    { href: "/admin", label: "Admin", icon: ShieldCheck },
    { href: "/admin/modules", label: "Modules", icon: Blocks },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
  ]
};

export function NavigationLinks({ role, variant }: { role: AppRole; variant: "desktop" | "mobile" }) {
  const pathname = usePathname();
  const items = navByRole[role];

  if (variant === "desktop") {
    return (
      <div className="hidden items-center gap-1 rounded-md bg-crema/80 p-1 text-sm sm:flex">
        {items.map((item) => <NavLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} />)}
        {role !== "guest" ? (
          <form action={signOutAction}>
            <button aria-label="Sign out" className="focus-ring rounded-md px-3 py-2 font-bold text-ink/65 transition hover:bg-white hover:text-midnight">
              Sign out
            </button>
          </form>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-stretch justify-around gap-1">
      {items.map((item) => <NavLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} />)}
      {role !== "guest" ? (
        <form action={signOutAction} className="min-w-0 flex-1">
          <button aria-label="Sign out" className="focus-ring flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 font-bold text-ink/65 transition hover:bg-crema hover:text-midnight">
            <LogOut className="h-5 w-5" />
            <span className="max-w-full truncate text-[10px] leading-none">Sign out</span>
          </button>
        </form>
      ) : null}
    </div>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={`focus-ring flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 font-bold transition sm:min-h-0 sm:flex-none sm:flex-row sm:px-3 sm:py-2 ${
        active
          ? "bg-midnight text-white shadow-sm"
          : "text-ink/65 hover:bg-crema hover:text-midnight sm:hover:bg-white sm:hover:shadow-sm"
      }`}
      href={item.href}
    >
      <Icon className={`h-5 w-5 sm:hidden ${active ? "text-gold" : ""}`} />
      <span className="max-w-full truncate text-[10px] leading-none sm:hidden">{item.mobileLabel ?? item.label}</span>
      <span className="hidden text-sm leading-normal sm:inline">{item.label}</span>
    </Link>
  );
}
