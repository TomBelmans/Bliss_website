/**
 * Data Access Layer voor openingsuren (`WorkingHours`).
 * Aangeroepen door: availability API, admin kalender/boekingen-pagina's
 * en `saveWorkingHours` action.
 */
import "server-only";
import prismaClient from "./prismaClient";
import type { WorkingHours } from "@/generated/prisma/client";

/**
 * Alle weekdagen (0–6), gesorteerd. Model: `WorkingHours`.
 * Aangeroepen door admin kalender en boekingen-overzicht.
 */
export async function listWorkingHours(): Promise<WorkingHours[]> {
  return prismaClient.workingHours.findMany({ orderBy: { weekday: "asc" } });
}

/**
 * Openingsuren voor één weekdag. Model: `WorkingHours`.
 * Aangeroepen door `/api/availability`.
 */
export async function getWorkingHoursForWeekday(weekday: number): Promise<WorkingHours | null> {
  return prismaClient.workingHours.findUnique({ where: { weekday } });
}

export type UpsertWorkingHoursDay = Pick<
  WorkingHours,
  "weekday" | "enabled" | "startTime" | "endTime"
>;

/**
 * Slaat alle 7 weekdagen in één transactie op (upsert: rijen bestaan via seed).
 * Model: `WorkingHours`. Aangeroepen door `saveWorkingHours` action.
 */
export async function upsertWorkingHours(days: UpsertWorkingHoursDay[]): Promise<void> {
  await prismaClient.$transaction(
    days.map((day) =>
      prismaClient.workingHours.upsert({
        where: { weekday: day.weekday },
        create: day,
        update: { enabled: day.enabled, startTime: day.startTime, endTime: day.endTime },
      })
    )
  );
}
