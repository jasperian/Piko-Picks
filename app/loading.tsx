export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Loading content">
      <p role="status" className="mb-6 font-semibold text-roast">Finding your next coffee stop…</p>
      <div className="h-64 rounded-lg bg-roast/10 motion-safe:animate-pulse" />
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((item) => <div key={item} className="h-72 rounded-lg bg-roast/5 motion-safe:animate-pulse" />)}
      </div>
    </main>
  );
}
