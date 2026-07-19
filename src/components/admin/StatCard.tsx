/** Kleine statistiektegel voor klant-detailpagina's (label boven, waarde eronder). */
export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-rose-100 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
