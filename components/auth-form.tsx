"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { emailAuthAction } from "@/app/auth/actions";

type Props = {
  next: string;
};

export function AuthForm({ next }: Props) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <form action={emailAuthAction} className="space-y-4 p-6 md:p-8">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="next" value={next} />
      <div className="grid grid-cols-2 rounded-md bg-crema p-1">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={`focus-ring rounded px-3 py-2 text-sm font-medium ${mode === "sign-in" ? "bg-white text-roast shadow-sm" : "text-ink/65"}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={`focus-ring rounded px-3 py-2 text-sm font-medium ${mode === "sign-up" ? "bg-white text-roast shadow-sm" : "text-ink/65"}`}
        >
          Sign up
        </button>
      </div>

      {mode === "sign-up" ? (
        <>
          <label className="block text-sm font-medium text-ink/75">
            Full name
            <input name="fullName" required className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
          </label>
          <label className="block text-sm font-medium text-ink/75">
            Account type
            <select name="role" defaultValue="shop_owner" className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3">
              <option value="shop_owner">Coffee shop owner</option>
              <option value="customer">Customer</option>
            </select>
          </label>
        </>
      ) : null}

      <label className="block text-sm font-medium text-ink/75">
        Email
        <input name="email" type="email" required className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
      </label>
      <label className="block text-sm font-medium text-ink/75">
        Password
        <input name="password" type="password" required minLength={6} className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
      </label>
      {mode === "sign-in" ? (
        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="focus-ring rounded-md text-sm font-semibold text-clay hover:text-roast">
            Forgot password?
          </Link>
        </div>
      ) : null}
      <button className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-clay px-4 py-2.5 font-medium text-white hover:bg-clay/90">
        {mode === "sign-up" ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
        {mode === "sign-up" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
