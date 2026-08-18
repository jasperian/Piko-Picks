import { BrandLogo } from "@/components/brand-logo";
import { NavigationLinks } from "@/components/navigation-links";
import { getCurrentUserRole } from "@/lib/supabase/profile";

export async function AppNavigation() {
  const role = await getCurrentUserRole();

  return (
    <>
      <header className="relative z-30 px-3 pt-3 sm:sticky sm:top-0 sm:px-5">
        <nav className="mx-auto flex max-w-7xl items-center justify-center rounded-[1.25rem] border border-roast/10 bg-white/[0.88] px-3 py-2.5 shadow-panel backdrop-blur-xl sm:justify-between sm:px-4" aria-label="Main navigation">
          <BrandLogo />
          <NavigationLinks role={role} variant="desktop" />
        </nav>
      </header>

      <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 rounded-[1.25rem] border border-roast/10 bg-white/95 p-1.5 text-sm shadow-panel backdrop-blur-xl sm:hidden" aria-label="Mobile navigation">
        <NavigationLinks role={role} variant="mobile" />
      </nav>
    </>
  );
}
