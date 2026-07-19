"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Overzicht",
  diensten: "Diensten",
  producten: "Producten",
  kalender: "Kalender",
  boekingen: "Boekingen",
  klanten: "Klanten",
  bestellingen: "Bestellingen",
  account: "Account",
  nieuw: "Nieuw",
  gast: "Gast",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function labelForSegment(segment: string, parentSegment: string | undefined): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  if (UUID_RE.test(segment)) {
    return parentSegment === "diensten" || parentSegment === "producten" ? "Bewerken" : "Detail";
  }
  if (parentSegment === "gast") {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  }
  return segment;
}

type Crumb = { href: string; label: string };

function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "admin") return [];

  const crumbs: Crumb[] = [{ href: "/admin", label: "Overzicht" }];

  // /admin alleen → enkel Overzicht
  if (parts.length === 1) return crumbs;

  let href = "/admin";
  for (let i = 1; i < parts.length; i++) {
    const segment = parts[i];
    href += `/${segment}`;
    crumbs.push({
      href,
      label: labelForSegment(segment, parts[i - 1]),
    });
  }

  return crumbs;
}

/** Breadcrumb in de admin-header op basis van de huidige URL. */
export function AdminBreadcrumb() {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={crumb.href}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
