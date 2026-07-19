/** Eén term/waarde-rij binnen een <dl> op een admin-detailpagina. */
export function DetailRow({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-neutral-500">{term}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  );
}
