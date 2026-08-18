import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const supabase = createSupabaseServerClient();

  if (code && supabase) {
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const role = user.user_metadata.role === "customer" ? "customer" : "shop_owner";

      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: String(user.user_metadata.full_name ?? ""),
        email: user.email,
        role
      });

      if (role === "customer" && next !== "/auth/update-password") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
