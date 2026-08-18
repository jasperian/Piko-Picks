import Link from "next/link";
import { Coffee, Mail } from "lucide-react";
import { requestPasswordResetAction } from "@/app/auth/actions";

type Props = {
  searchParams: {
    error?: string;
    message?: string;
    demo?: string;
  };
};

export default function ForgotPasswordPage({ searchParams }: Props) {
  return (
    <main className="mx-auto grid max-w-5xl place-items-center px-3 py-5 sm:min-h-[calc(100vh-58px)] sm:px-4 sm:py-10">
      <section className="grid w-full overflow-hidden rounded-lg border border-roast/10 bg-white shadow-panel md:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-roast p-5 text-white sm:p-8">
          <Coffee className="h-8 w-8 text-clay" />
          <h1 className="mt-5 text-3xl font-semibold sm:mt-8">Reset your password</h1>
          <p className="mt-3 leading-7 text-white/75">Enter your account email and we will send you a secure link to choose a new password.</p>
        </div>
        <div>
          {searchParams.error ? <Notice tone="error" message={searchParams.error} /> : null}
          {searchParams.message ? <Notice tone="success" message={searchParams.message} /> : null}
          {searchParams.demo ? <Notice tone="info" message="Supabase is not configured locally, so reset emails cannot be sent yet." /> : null}
          <form action={requestPasswordResetAction} className="space-y-4 p-6 md:p-8">
            <label className="block text-sm font-medium text-ink/75">
              Email
              <input name="email" type="email" required className="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3" />
            </label>
            <button className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-clay px-4 py-2.5 font-medium text-white hover:bg-clay/90">
              <Mail className="h-4 w-4" />
              Send reset link
            </button>
            <Link href="/auth" className="focus-ring inline-flex rounded-md text-sm font-semibold text-clay hover:text-roast">
              Back to sign in
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}

function Notice({ message, tone }: { message: string; tone: "error" | "success" | "info" }) {
  const styles = {
    error: "bg-clay/10 text-clay",
    success: "bg-sage/15 text-sage",
    info: "bg-crema text-ink/70"
  };

  return <div className={`mx-6 mt-6 rounded-md p-3 text-sm font-medium md:mx-8 ${styles[tone]}`}>{message}</div>;
}
