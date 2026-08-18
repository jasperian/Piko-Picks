import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "guest" | "customer" | "shop_owner" | "admin";

export async function getCurrentUserRole(): Promise<AppRole> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return "guest";
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return "guest";
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role;

  if (role === "admin" || role === "customer" || role === "shop_owner") {
    return role;
  }

  return user.user_metadata.role === "customer" ? "customer" : "shop_owner";
}

export async function hasSupabaseSession() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return false;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return Boolean(user);
}
