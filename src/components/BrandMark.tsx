import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  nameClassName?: string;
  taglineClassName?: string;
  /** Optionele toevoeging naast Bliss, bv. "beheer". */
  suffix?: string;
};

/**
 * Merknaam-lockup: BLISS (drukletters) gecentreerd boven "Beauty by Norah" in handschrift.
 */
export function BrandMark({
  className,
  nameClassName,
  taglineClassName,
  suffix,
}: BrandMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex flex-col items-center rounded-md border border-charcoal px-3 py-1.5 text-center leading-none",
        className
      )}
    >
      <span
        className={cn(
          "font-serif text-charcoal uppercase tracking-[0.2em]",
          nameClassName
        )}
      >
        Bliss
        {suffix ? (
          <span className="font-sans normal-case tracking-normal"> {suffix}</span>
        ) : null}
      </span>
      <span
        className={cn(
          "mt-0.5 font-handwriting text-[0.95em] leading-none text-gold normal-case tracking-normal",
          taglineClassName
        )}
      >
        Beauty by Norah
      </span>
    </span>
  );
}
