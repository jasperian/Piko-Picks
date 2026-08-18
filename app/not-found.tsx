import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-semibold text-roast">That page is not available</h1>
      <p className="mt-3 text-ink/70">The shop may be unpublished, suspended, or not created yet.</p>
      <Link className="focus-ring mt-6 inline-flex rounded-md bg-clay px-4 py-2.5 font-medium text-white" href="/">
        Back to discovery
      </Link>
    </main>
  );
}
