"use client";

import { shopLabelGroups } from "@/lib/shop-labels";
import type { ShopLabel } from "@/lib/types";

type Props = {
  selectedLabels?: ShopLabel[];
  onLabelChange?: (label: string, checked: boolean) => void;
};

export function ShopLabelFields({ selectedLabels = [], onLabelChange }: Props) {
  const selected = new Set(selectedLabels.map((item) => item.label));

  return (
    <fieldset className="rounded-md border border-ink/10 p-4">
      <legend className="px-1 text-sm font-semibold text-roast">Shop categories and labels</legend>
      <div className="mt-3 grid gap-4">
        {shopLabelGroups.map((group) => (
          <div key={group.groupName}>
            <p className="text-sm font-semibold text-ink/75">{group.groupName}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.labels.map((label) => (
                <label key={label} className="flex items-center gap-2 rounded-md bg-crema px-3 py-2 text-sm font-medium text-ink/75">
                  <input
                    name="labels"
                    type="checkbox"
                    value={label}
                    defaultChecked={selected.has(label)}
                    onChange={(event) => onLabelChange?.(label, event.target.checked)}
                    className="h-4 w-4 accent-clay"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
