import { Coffee } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { PikoPet } from "@/components/piko-pet";

type Props = {
  searchParams: {
    next?: string;
    error?: string;
    message?: string;
    demo?: string;
  };
};

export default function AuthPage({ searchParams }: Props) {
  const next = searchParams.next ?? "/dashboard";

  return (
    <main className="mx-auto grid max-w-5xl place-items-center px-3 py-5 sm:min-h-[calc(100vh-58px)] sm:px-4 sm:py-10">
      <section className="grid w-full overflow-hidden rounded-lg border border-roast/10 bg-white shadow-panel md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col bg-roast p-5 text-white sm:min-h-[420px] sm:p-8">
          <Coffee className="h-8 w-8 text-clay" />
          <h1 className="mt-5 text-3xl font-semibold sm:mt-8">Shop owner access</h1>
          <p className="mt-3 leading-7 text-white/75">
            Create an account, register your coffee shop, manage your menu, and keep your public listing up to date.
          </p>
          <div className="mt-auto flex items-end justify-center pt-5 sm:gap-2 sm:pt-8 sm:justify-start">
            <PikoPet mode="waving" />
            <div className="relative mb-8 max-w-36 rounded-md bg-white px-3 py-2.5 text-xs font-semibold leading-5 text-midnight shadow-sm sm:max-w-44 sm:px-4 sm:py-3 sm:text-sm">
              <span className="absolute -left-2 bottom-4 h-4 w-4 rotate-45 bg-white" aria-hidden="true" />
              <span className="relative">Welcome back! I saved you a cozy spot.</span>
            </div>
          </div>
        </div>
        <div>
          {searchParams.error ? <Notice tone="error" message={searchParams.error} /> : null}
          {searchParams.message ? <Notice tone="success" message={searchParams.message} /> : null}
          {searchParams.demo ? <Notice tone="info" message="Supabase is not configured locally, so auth is running in demo mode." /> : null}
          <AuthForm next={next} />
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
