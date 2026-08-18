"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUserRole } from "@/lib/supabase/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const shopStatusSchema = z.object({
  shopId: z.string().min(1),
  status: z.enum(["published", "suspended"])
});

export async function updateShopStatusAction(formData: FormData) {
  const role = await getCurrentUserRole();

  if (role !== "admin") {
    redirect("/");
  }

  const payload = shopStatusSchema.parse({
    shopId: formData.get("shopId"),
    status: formData.get("status")
  });
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect("/admin?saved=demo");
  }

  const { error } = await supabase.from("shops").update({ status: payload.status, updated_at: new Date().toISOString() }).eq("id", payload.shopId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect(`/admin?saved=${payload.status}`);
}
