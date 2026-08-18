import { Facebook, Instagram } from "lucide-react";
import type { CoffeeShop } from "@/lib/types";

type Props = {
  shop: Pick<CoffeeShop, "facebookUrl" | "instagramUrl">;
};

export function SocialLinks({ shop }: Props) {
  const links = [
    { label: "Facebook", href: shop.facebookUrl, icon: Facebook },
    { label: "Instagram", href: shop.instagramUrl, icon: Instagram }
  ].filter((link) => link.href);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-crema px-4 py-2.5 font-medium text-roast hover:bg-roast/10"
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </a>
        );
      })}
    </div>
  );
}
