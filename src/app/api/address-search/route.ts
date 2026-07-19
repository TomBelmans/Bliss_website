import { NextResponse } from "next/server";
import type { AddressSuggestion } from "@/lib/address";

export const dynamic = "force-dynamic";

type PhotonFeature = {
  properties?: {
    osm_id?: number;
    osm_type?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    district?: string;
    locality?: string;
    country?: string;
    countrycode?: string;
    type?: string;
  };
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

/**
 * Adresautocomplete via Photon (open-source, OpenStreetMap-data).
 * Publieke Photon-instantie van Komoot — zie https://photon.komoot.io/
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 3) {
    return NextResponse.json({ suggestions: [] as AddressSuggestion[] });
  }

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  // Photon ondersteunt alleen: default, de, en, fr (niet nl).
  url.searchParams.set("lang", "en");
  url.searchParams.set("limit", "7");
  // Bias naar België (rond Mol); resultaten buiten BE blijven mogelijk.
  url.searchParams.set("lat", "51.184");
  url.searchParams.set("lon", "5.116");

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "BlissBeautyByNorah/1.0 (address autocomplete)",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ suggestions: [] as AddressSuggestion[] }, { status: 502 });
    }

    const data = (await res.json()) as PhotonResponse;
    const suggestions = (data.features ?? [])
      .map((feature, index) => toSuggestion(feature, index))
      .filter((s): s is AddressSuggestion => s !== null);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] as AddressSuggestion[] }, { status: 502 });
  }
}

function toSuggestion(feature: PhotonFeature, index: number): AddressSuggestion | null {
  const p = feature.properties;
  if (!p) return null;

  const street = p.street?.trim() || p.name?.trim() || "";
  const houseNumber = p.housenumber?.trim() || "";
  const postalCode = p.postcode?.trim() || "";
  const city =
    p.city?.trim() ||
    p.town?.trim() ||
    p.village?.trim() ||
    p.municipality?.trim() ||
    p.locality?.trim() ||
    p.district?.trim() ||
    "";
  const country = normalizeCountry(p.country, p.countrycode);

  // Zonder straat of gemeente is het voorstel te vaag voor ons formulier.
  if (!street && !city) return null;

  const label = [street && houseNumber ? `${street} ${houseNumber}` : street || houseNumber, postalCode, city, country]
    .filter(Boolean)
    .join(", ");

  return {
    id: `${p.osm_type ?? "x"}-${p.osm_id ?? index}`,
    label,
    street: street || p.name?.trim() || "",
    houseNumber,
    postalCode,
    city,
    country,
  };
}

function normalizeCountry(country?: string, countrycode?: string): string {
  const code = countrycode?.toUpperCase();
  if (code === "BE" || country?.toLowerCase() === "belgium" || country?.toLowerCase() === "belgië") {
    return "België";
  }
  if (code === "NL" || country?.toLowerCase() === "netherlands" || country?.toLowerCase() === "nederland") {
    return "Nederland";
  }
  return country?.trim() || "België";
}
