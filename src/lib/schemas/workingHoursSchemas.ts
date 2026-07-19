import { z } from "zod";

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Gebruik het formaat UU:MM.");

export const saveWorkingHoursSchema = z
  .object({
    days: z
      .array(
        z.object({
          weekday: z.number().int().min(0).max(6),
          enabled: z.boolean(),
          startTime: timeString,
          endTime: timeString,
        })
      )
      .length(7),
  })
  .superRefine((data, ctx) => {
    data.days.forEach((day, index) => {
      if (day.enabled && day.startTime >= day.endTime) {
        ctx.addIssue({
          code: "custom",
          message: "De eindtijd moet na de starttijd liggen.",
          path: ["days", index, "endTime"],
        });
      }
    });
  });

export type SaveWorkingHoursInput = z.infer<typeof saveWorkingHoursSchema>;
