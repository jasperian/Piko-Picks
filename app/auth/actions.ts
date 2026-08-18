"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthMode = "sign-in" | "sign-up";

export async function emailAuthAction(formData: FormData) {
  const mode = String(formData.get("mode") ?? "sign-in") as AuthMode;
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const role = String(formData.get("role") ?? "shop_owner");
  const next = String(formData.get("next") ?? "/dashboard");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(`/auth?demo=1&next=${encodeURIComponent(next)}`);
  }

  if (mode === "sign-up") {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=${encodeURIComponent(next)}`
      }
    });

    if (error) {
      redirect(`/auth?error=${encodeURIComponent(error.message)}&mode=sign-up&next=${encodeURIComponent(next)}`);
    }

    redirect(`/auth?message=${encodeURIComponent("Check your email to confirm your account.")}&next=${encodeURIComponent(next)}`);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/auth?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };

  const resolvedRole = profile?.role ?? user?.user_metadata.role;

  if (resolvedRole === "customer") {
    redirect("/");
  }

  if (resolvedRole === "admin" && next === "/dashboard") {
    redirect("/admin");
  }

  redirect(next);
}

export async function signOutAction() {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(`/auth/forgot-password?demo=1`);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`
  });

  if (error) {
    redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/auth/forgot-password?message=${encodeURIComponent("Check your email for a password reset link.")}`);
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(`/auth/update-password?demo=1`);
  }

  if (password.length < 6) {
    redirect(`/auth/update-password?error=${encodeURIComponent("Password must be at least 6 characters.")}`);
  }

  if (password !== confirmPassword) {
    redirect(`/auth/update-password?error=${encodeURIComponent("Passwords do not match.")}`);
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/auth/update-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/auth?message=${encodeURIComponent("Password updated. You can sign in with your new password.")}`);
}
