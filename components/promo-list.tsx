import { BadgePercent, Sparkles } from "lucide-react";
import { activePromos, promoDateLabel } from "@/lib/promos";
import type { Promo } from "@/lib/types";

type Props = {
  promos: Promo[];
  compact?: boolean;
};

export function PromoList({ promos, compact = false }: Props) {
  const active = activePromos(promos);

  if (active.length === 0) {
    return null;
  }

  return (
    <div className={compact ? "space-y-2" : "grid gap-3 md:grid-cols-2"}>
      {active.map((promo) => (
        <article key={promo.id} className="rounded-lg border border-clay/20 bg-clay/10 p-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="flex items-center gap-2 font-semibold text-roast">
              <BadgePercent className="h-4 w-4 text-clay" />
              {promo.title}
            </h3>
            {promo.isFeatured ? <Sparkles className="h-4 w-4 shrink-0 text-clay" /> : null}
          </div>
          {!compact ? <p className="mt-2 text-sm leading-6 text-ink/70">{promo.description}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
            {promo.code ? <span className="rounded-md bg-white px-2 py-1 text-roast">Code: {promo.code}</span> : null}
            <span className="rounded-md bg-white px-2 py-1 text-ink/65">{promoDateLabel(promo)}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
