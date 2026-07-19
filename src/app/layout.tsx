import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, Caveat } from "next/font/google";
import "./globals.css";
import { themeAntiFlashScript } from "@/lib/context/themeAntiFlashScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial serif voor titels op de homepage (Header/Footer), geeft het
// premium/apothecary-gevoel bovenop de neutrale Geist-basis.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

// Handschrift voor de tagline "Beauty by Norah" onder de merknaam Bliss.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Bliss — Beauty by Norah",
    template: "%s | Bliss — Beauty by Norah",
  },
  description:
    "Bliss — Beauty by Norah biedt schoonheidsverzorging op afspraak: gelaatsverzorging, manicure en meer. Boek online of bestel producten.",
};

/**
 * Bevat enkel de gedeelde html/body-shell. De publieke Header/Footer/
 * CartProvider zitten in `(public)/layout.tsx` — `/admin` heeft zijn eigen
 * sidebar-shell en mag niet ook de publieke navigatie tonen.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${caveat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeAntiFlashScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-white text-neutral-900">{children}</body>
    </html>
  );
}
