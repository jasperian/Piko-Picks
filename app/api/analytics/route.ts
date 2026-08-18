import { NextResponse } from "next/server";
import { analyticsEventSchema } from "@/lib/analytics";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = analyticsEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ tracked: false, demo: true });
  }

  const { error } = await supabase.from("analytics_events").insert({
    shop_id: parsed.data.shopId,
    event_type: parsed.data.eventType,
    metadata: parsed.data.metadata ?? {}
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tracked: true });
}
