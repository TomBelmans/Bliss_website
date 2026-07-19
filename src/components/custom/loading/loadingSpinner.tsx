import type { FunctionComponent } from "react";

/**
 * Generieke laad-indicator, gebruikt als `<Suspense>`-fallback op zowel de
 * publieke site als in `/admin`. Neutraal gestyled zodat hij in beide
 * kleurenschema's past.
 */
const LoadingSpinner: FunctionComponent<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center py-16 ${className ?? ""}`}>
      <div
        aria-label="Bezig met laden…"
        role="status"
        className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"
      />
    </div>
  );
};

export default LoadingSpinner;
