import Link from "next/link";
import { Coffee, KeyRound } from "lucide-react";
import { updatePasswordAction } from "@/app/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  searchParams: {
    error?: string;
    demo?: string;
  };
};

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <main className="mx-auto grid max-w-5xl place-items-center px-3 py-5 sm:min-h-[calc(100vh-58px)] sm:px-4 sm:py-10">
      <section className="grid w-full overflow-hidden rounded-lg border border-roast/10 bg-white shadow-panel md:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-roast p-5 text-white sm:p-8">
          <Coffee className="h-8 w-8 text-clay" />
          <h1 className="mt-5 text-3xl font-semibold sm:mt-8">Choose a new password</h1>
          <p className="mt-3 leading-7 text-white/75">After saving it, you can sign in normally with your updated password.</p>
        </div>
        <div>
          {searchParams.error ? <Notice tone="error" message={searchParams.error} /> : null}
          {searchParams.demo ? <Notice tone="info" message="Supabase is not configured locally, so passwords cannot be updated yet." /> : null}
          {!user ? (
            <div className="space-y-4 p-6 md:p-8">
              <Notice tone="error" message="This reset link is invalid or expired. Please request a new password reset link." inline />
              <Link
                href="/auth/forgot-password"
                className="focus-ring inline-flex w-full items-center justify-center rounded-md bg-clay px-4 py-2.5 font-medium text-white hover:bg-clay/90"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <form action={updatePasswordAction} className="space-y-4 p-6 md:p-8">
              <label className="block text-sm font-medium text-ink/75">
                New password
                <input name="password" type="password" required minLength={6} className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
              </label>
              <label className="block text-sm font-medium text-ink/75">
                Confirm password
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3"
                />
              </label>
              <button className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-clay px-4 py-2.5 font-medium text-white hover:bg-clay/90">
                <KeyRound className="h-4 w-4" />
                Update password
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Notice({ message, tone, inline = false }: { message: string; tone: "error" | "info"; inline?: boolean }) {
  const styles = {
    error: "bg-clay/10 text-clay",
    info: "bg-crema text-ink/70"
  };

  return <div className={`${inline ? "" : "mx-6 mt-6 md:mx-8"} rounded-md p-3 text-sm font-medium ${styles[tone]}`}>{message}</div>;
}
