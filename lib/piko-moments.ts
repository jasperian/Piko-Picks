export type PikoMoment = {
  mode: "idle" | "waving" | "jumping" | "failed" | "waiting" | "running" | "review";
  eyebrow: string;
  title: string;
  message: string;
};

type MomentState = {
  firstVisit: boolean;
  isSearching: boolean;
  isReviewing: boolean;
  locationStatus: string;
  resultCount: number;
  savedCafe: boolean;
};

export function getPikoMoment(state: MomentState): PikoMoment {
  if (state.savedCafe) {
    return {
      mode: "jumping",
      eyebrow: "Saved with Piko",
      title: "Nice pick!",
      message: "I’ll keep that café close for your next coffee run."
    };
  }

  if (state.resultCount === 0) {
    return {
      mode: "failed",
      eyebrow: "Piko checked every branch",
      title: "No exact match yet.",
      message: "Try a broader area or remove one filter and I’ll look again."
    };
  }

  if (state.locationStatus === "Locating...") {
    return {
      mode: "waiting",
      eyebrow: "Piko is getting his bearings",
      title: "Finding cafés near you…",
      message: "Your precise location stays in this search and is used only to calculate distance."
    };
  }

  if (state.locationStatus === "Permission needed" || state.locationStatus === "Location unavailable") {
    return {
      mode: "failed",
      eyebrow: "Location is optional",
      title: "Piko can still help.",
      message: "Enter a city or street in the area box and I’ll search there instead."
    };
  }

  if (state.isSearching) {
    return {
      mode: "running",
      eyebrow: "Piko is on the trail",
      title: "Searching cafés…",
      message: "I’m gathering the strongest matches before checking the finer details."
    };
  }

  if (state.isReviewing) {
    return {
      mode: "review",
      eyebrow: "Piko is checking the details",
      title: "Looking for your best match…",
      message: "I’m comparing drinks, ratings, distance, and the café details that matter."
    };
  }

  if (state.firstVisit) {
    return {
      mode: "waving",
      eyebrow: "Hi, I’m Piko",
      title: "Your curious café-finding sidekick.",
      message: "Tell me what sounds good and I’ll help you spot a neighborhood gem."
    };
  }

  return {
    mode: "idle",
    eyebrow: "Meet Piko",
    title: "Your curious café-finding sidekick.",
    message: "Big eyes for spotting small neighborhood gems. Hover to say hi, or tap to jump."
  };
}
