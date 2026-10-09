import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Share the verified user lookup across Server Components in one request.
export const getCurrentUser = cache(async () => {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
});
