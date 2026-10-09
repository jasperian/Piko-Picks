import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPublicShops, getShopById } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demoShops } from "@/lib/demo-data";

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));

describe("public shop queries", () => {
  beforeEach(() => vi.resetAllMocks());

  it("filters detail reads by ID and publication status at the database", async () => {
    const query = { select: vi.fn(), eq: vi.fn(), data: [], error: null };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    const from = vi.fn().mockReturnValue(query);
    vi.mocked(createSupabaseServerClient).mockReturnValue({ from } as unknown as ReturnType<typeof createSupabaseServerClient>);
    expect(await getShopById("missing-shop")).toBeUndefined();
    expect(from).toHaveBeenCalledWith("shops");
    expect(query.eq).toHaveBeenCalledWith("status", "published");
    expect(query.eq).toHaveBeenCalledWith("id", "missing-shop");
  });

  it("preserves the demo directory and individual-shop fallback", async () => {
    vi.mocked(createSupabaseServerClient).mockReturnValue(null);
    expect(await getPublicShops()).toEqual(demoShops);
    expect(await getShopById(demoShops[0].id)).toEqual(demoShops[0]);
    expect(await getShopById("missing-shop")).toBeUndefined();
  });
});
