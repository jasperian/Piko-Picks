import Link from "next/link";

export function BrandLogo() {
  return (
    <Link href="/" aria-label="Piko Picks home" className="focus-ring flex items-center gap-2.5 rounded-md text-midnight">
      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[0.9rem] bg-gold shadow-sm ring-1 ring-roast/10">
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-no-repeat [image-rendering:auto]"
          style={{
            backgroundImage: "url('/piko-pet.webp')",
            backgroundSize: "800% 1100%",
            backgroundPosition: "0% 0%"
          }}
        />
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold tracking-[-0.035em]">Piko Picks</span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink/50">Big eyes. Better coffee.</span>
      </span>
    </Link>
  );
}
