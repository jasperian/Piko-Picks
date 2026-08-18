import { describe, expect, it } from "vitest";
import { getPikoMoment } from "@/lib/piko-moments";

const calmState = { firstVisit: false, isSearching: false, isReviewing: false, locationStatus: "Use current location", resultCount: 3, savedCafe: false };

describe("getPikoMoment", () => {
  it("celebrates a saved café before other states", () => {
    expect(getPikoMoment({ ...calmState, savedCafe: true, resultCount: 0 }).mode).toBe("jumping");
  });

  it("uses the failed pose for an empty result set", () => {
    expect(getPikoMoment({ ...calmState, resultCount: 0 }).title).toBe("No exact match yet.");
  });

  it("uses the waiting pose while requesting location", () => {
    expect(getPikoMoment({ ...calmState, locationStatus: "Locating..." }).mode).toBe("waiting");
  });

  it("uses the working pose while search inputs change", () => {
    expect(getPikoMoment({ ...calmState, isSearching: true }).mode).toBe("running");
  });

  it("welcomes a first-time visitor with a wave", () => {
    expect(getPikoMoment({ ...calmState, firstVisit: true }).mode).toBe("waving");
  });
});
