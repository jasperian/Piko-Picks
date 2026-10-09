export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6" aria-label="Loading page">
      <div className="h-8 w-48 rounded-md bg-roast/10" />
      <div className="mt-6 h-48 rounded-lg bg-roast/10" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="h-36 rounded-lg bg-roast/10" />
        <div className="h-36 rounded-lg bg-roast/10" />
        <div className="h-36 rounded-lg bg-roast/10" />
      </div>
    </main>
  );
}
