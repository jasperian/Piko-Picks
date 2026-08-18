import { NextResponse } from "next/server";
import { getEnvStatus, getMissingProductionEnv } from "@/lib/env-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = getEnvStatus();
  const missing = getMissingProductionEnv();
  const database = await checkDatabase();

  return NextResponse.json({
    ok: missing.length === 0 && database.ok,
    app: "piko-picks",
    checks,
    database,
    missing: missing.map((check) => check.name)
  });
}

async function checkDatabase() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      reason: "Supabase URL or anon key is not configured."
    };
  }

  const { data, error } = await supabase
    .from("shops")
    .select("id, name, facebook_url, instagram_url, shop_labels(label, group_name)")
    .eq("status", "published")
    .limit(1);

  if (error) {
    return {
      ok: false,
      reason: error.message,
      hint: "Run the latest supabase/schema.sql in Supabase SQL Editor, then restart the dev server."
    };
  }

  return {
    ok: true,
    publishedShopCountVisibleToAnon: data?.length ?? 0
  };
}
