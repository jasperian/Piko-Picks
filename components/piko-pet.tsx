"use client";

import { useEffect, useState } from "react";

export type PetMode = "idle" | "waving" | "jumping" | "failed" | "waiting" | "running" | "review";

const animations: Record<PetMode, { row: number; frames: number; interval: number }> = {
  idle: { row: 0, frames: 6, interval: 320 },
  waving: { row: 3, frames: 4, interval: 190 },
  jumping: { row: 4, frames: 5, interval: 150 },
  failed: { row: 5, frames: 8, interval: 240 },
  waiting: { row: 6, frames: 6, interval: 280 },
  running: { row: 7, frames: 6, interval: 190 },
  review: { row: 8, frames: 6, interval: 240 }
};

export function PikoPet({ mode = "idle" }: { mode?: PetMode }) {
  const [interactionMode, setInteractionMode] = useState<PetMode>();
  const [frame, setFrame] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const activeMode = interactionMode ?? mode;
  const animation = animations[activeMode];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => setFrame(0), [activeMode]);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setFrame((current) => {
        const next = current + 1;

        if (next < animation.frames) {
          return next;
        }

        if (interactionMode === "jumping") {
          setInteractionMode(undefined);
        }

        return 0;
      });
    }, animation.interval);

    return () => window.clearInterval(timer);
  }, [animation.frames, animation.interval, interactionMode, reduceMotion]);

  function start(nextMode: PetMode) {
    setFrame(0);
    setInteractionMode(nextMode);
  }

  return (
    <button
      type="button"
      aria-label={`Piko the tarsier is ${activeMode === "idle" ? "resting" : activeMode}. Hover to make him wave or press to make him jump.`}
      className="group relative h-[130px] w-[120px] shrink-0 self-end overflow-visible rounded-md bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-linen sm:h-[156px] sm:w-[144px]"
      onMouseEnter={() => interactionMode !== "jumping" && start("waving")}
      onMouseLeave={() => interactionMode !== "jumping" && setInteractionMode(undefined)}
      onFocus={() => interactionMode !== "jumping" && start("waving")}
      onBlur={() => interactionMode !== "jumping" && setInteractionMode(undefined)}
      onClick={() => start("jumping")}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-no-repeat [image-rendering:auto] transition-transform duration-200 group-hover:scale-[1.03]"
        style={{
          backgroundImage: "url('/piko-pet.webp')",
          backgroundSize: "800% 1100%",
          backgroundPosition: `${(frame / 7) * 100}% ${(animation.row / 10) * 100}%`
        }}
      />
    </button>
  );
}
