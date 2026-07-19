"use client";

import { useEffect, useRef } from "react";
import {
  dialPrefix,
  flagImageUrl,
  isPhoneEmpty,
  normalizePhoneForCountry,
  resolveCallingInfo,
  retargetPhoneCountry,
} from "@/lib/phone";

type PhoneFieldProps = {
  country: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
};

/**
 * Optioneel telefoonveld met vlag + ISO-landcode en belcode uit het gekozen land.
 * Leidende 0 van het nationale nummer wordt weggefilterd.
 */
export function PhoneField({ country, value, onChange, id }: PhoneFieldProps) {
  const info = resolveCallingInfo(country);
  const prefix = dialPrefix(info.dial);
  const prevDialRef = useRef(info.dial);

  // Draait bij elke render, maar doet alleen iets wanneer de belcode echt
  // wijzigt (landwissel): dan wordt het nationale nummer omgehangen.
  useEffect(() => {
    if (prevDialRef.current === info.dial) return;
    prevDialRef.current = info.dial;
    onChange(retargetPhoneCountry(value, country));
  }, [info.dial, country, value, onChange]);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        Telefoonnummer (optioneel)
      </label>
      <div className="mt-1 flex w-full items-center rounded-md border border-neutral-300 px-3 py-2">
        <span className="mr-2 flex shrink-0 select-none items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- kleine externe vlag-asset */}
          <img
            src={flagImageUrl(info.iso)}
            alt=""
            width={20}
            height={15}
            className="h-[15px] w-5 rounded-[2px] object-cover"
            loading="lazy"
            decoding="async"
          />
        </span>
        <span className="sr-only">
          Land {info.iso}, landnummer {info.dial}
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={value || prefix}
          onChange={(e) => onChange(normalizePhoneForCountry(e.target.value, country))}
          onBlur={() => {
            if (isPhoneEmpty(value, country)) onChange(prefix);
          }}
          placeholder={`${prefix}475 12 34 56`}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 outline-none"
        />
      </div>
    </div>
  );
}
