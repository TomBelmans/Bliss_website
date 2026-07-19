"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { BrandMark } from "@/components/BrandMark";

const navLinks = [
  { href: "/diensten", label: "Behandelingen" },
  { href: "/winkel", label: "Verzorgingsproducten" },
  { href: "/#over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

export function Header({ customerName = null }: { customerName?: string | null }) {
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" aria-label="Bliss — Beauty by Norah" className="text-charcoal">
          <BrandMark nameClassName="text-xl" taglineClassName="text-base" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal-soft transition hover:text-charcoal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/account"
            aria-label={customerName ? `Mijn account — ${customerName}` : "Mijn account"}
            className="flex items-center gap-2 p-2 text-charcoal-soft transition hover:text-charcoal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
            </svg>
            {customerName ? (
              <span className="hidden max-w-[12rem] truncate text-sm font-medium normal-case tracking-normal text-charcoal sm:inline">
                Welkom {customerName}
              </span>
            ) : null}
          </Link>

          <Link
            href="/winkelwagen"
            aria-label="Winkelwagen"
            className="relative p-2 text-charcoal-soft transition hover:text-charcoal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                d="M6 7h15l-1.5 9.5a2 2 0 0 1-2 1.7H8.7a2 2 0 0 1-2-1.7L5 4H2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9.5" cy="20.5" r="1" fill="currentColor" stroke="none" />
              <circle cx="17.5" cy="20.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-cream">
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            href="/boeken"
            className="hidden rounded-full bg-charcoal px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-cream transition hover:bg-gold-dark sm:inline-block"
          >
            Boek een afspraak
          </Link>

          <button
            type="button"
            className="rounded-md p-2 text-charcoal md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-charcoal/10 bg-cream px-5 py-4 md:hidden">
          {customerName ? (
            <p className="px-2 pb-2 text-sm font-medium text-charcoal">Welkom {customerName}</p>
          ) : null}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium uppercase tracking-[0.1em] text-charcoal-soft hover:text-charcoal"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/boeken"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-charcoal px-5 py-2.5 text-center text-xs font-medium uppercase tracking-[0.15em] text-cream"
          >
            Boek een afspraak
          </Link>
        </nav>
      )}
    </header>
  );
}
