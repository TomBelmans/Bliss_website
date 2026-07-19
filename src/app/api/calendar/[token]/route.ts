import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { listBookingsForCalendar } from "@dal";
import { generateIcsFeed } from "@/lib/ics";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

function isValidToken(token: string): boolean {
  const secret = env.calendarFeedSecret();
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(_request: Request, { params }: Props) {
  const { token } = await params;
  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Ongeldige of ontbrekende toegangssleutel." }, { status: 403 });
  }

  const from = new Date(Date.now() - 7 * 24 * 60 * 60_000);
  const to = new Date(Date.now() + 365 * 24 * 60 * 60_000);

  const bookings = await listBookingsForCalendar(from, to);
  const ics = generateIcsFeed(bookings);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="bliss-afspraken.ics"',
      "Cache-Control": "no-store",
    },
  });
}
