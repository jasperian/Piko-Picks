import { afterEach, describe, expect, it, vi } from "vitest";
import { getEnvStatus, getMissingProductionEnv } from "@/lib/env-status";

describe("environment status", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("marks configured variables", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    const status = getEnvStatus();

    expect(status.find((check) => check.name === "NEXT_PUBLIC_SUPABASE_URL")?.configured).toBe(true);
    expect(status.find((check) => check.name === "NEXT_PUBLIC_SUPABASE_ANON_KEY")?.configured).toBe(true);
  });

  it("lists missing production variables", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

    expect(getMissingProductionEnv().map((check) => check.name)).toContain("NEXT_PUBLIC_SITE_URL");
  });
});
