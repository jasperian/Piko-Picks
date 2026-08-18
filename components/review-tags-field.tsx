"use client";

import { useState } from "react";
import { reviewVisitTags } from "@/lib/reviews";

export function ReviewTagsField({ defaultValue = [] }: { defaultValue?: string[] }) {
  const [selected, setSelected] = useState(defaultValue.slice(0, 3));

  function toggle(tag: string) {
    setSelected((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag);
      }

      return current.length < 3 ? [...current, tag] : current;
    });
  }

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-midnight">What stood out? <span className="font-normal text-ink/50">Choose up to 3</span></legend>
      {selected.map((tag) => <input key={tag} type="hidden" name="visitTags" value={tag} />)}
      <div className="mt-2 flex flex-wrap gap-2">
        {reviewVisitTags.map((tag) => {
          const active = selected.includes(tag);
          const disabled = !active && selected.length >= 3;

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              disabled={disabled}
              aria-pressed={active}
              className={`focus-ring rounded-md px-3 py-2 text-sm font-semibold transition ${active ? "bg-lagoon text-white" : "bg-white text-ink/65 hover:bg-crema disabled:cursor-not-allowed disabled:opacity-40"}`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
