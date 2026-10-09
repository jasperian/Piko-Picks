import { cache } from "react";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "guest" | "customer" | "shop_owner" | "admin";

export const getCurrentUserRole = cache(async (): Promise<AppRole> => {
  const user = await getCurrentUser();

  if (!user) {
    return "guest";
  }

  const supabase = createSupabaseServerClient()!;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role;

  if (role === "admin" || role === "customer" || role === "shop_owner") {
    return role;
  }

  return user.user_metadata.role === "customer" ? "customer" : "shop_owner";
});

export async function hasSupabaseSession() {
  return Boolean(await getCurrentUser());
}
