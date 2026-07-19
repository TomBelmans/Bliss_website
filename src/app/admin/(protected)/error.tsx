"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h2 className="font-semibold text-red-900">Er ging iets mis</h2>
      <p className="mt-2 text-sm text-red-800">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
      >
        Opnieuw proberen
      </button>
    </div>
  );
}
