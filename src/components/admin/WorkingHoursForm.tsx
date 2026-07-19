"use client";

import { useState, useTransition } from "react";
import { saveWorkingHours } from "@actions";

export type WorkingHoursDayState = {
  weekday: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

const dayNames: Record<number, string> = {
  1: "Maandag",
  2: "Dinsdag",
  3: "Woensdag",
  4: "Donderdag",
  5: "Vrijdag",
  6: "Zaterdag",
  0: "Zondag",
};

/** "18:00" → "19:00", geklemd op 23:59 zodat het einde binnen dezelfde dag blijft. */
function oneHourLater(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const total = Math.min(hour * 60 + minute + 60, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function WorkingHoursForm({ initialDays }: { initialDays: WorkingHoursDayState[] }) {
  const [days, setDays] = useState(initialDays);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  function updateDay(weekday: number, patch: Partial<WorkingHoursDayState>) {
    setDays((current) =>
      current.map((day) => {
        if (day.weekday !== weekday) return day;

        const updated = { ...day, ...patch };
        // Beginuur op of voorbij het einduur (bv. 18:00 - 17:00)? Dan
        // schuift het einduur automatisch naar beginuur + 1u in plaats van
        // een foutmelding te tonen.
        if (updated.enabled && updated.startTime && updated.endTime && updated.startTime >= updated.endTime) {
          updated.endTime = oneHourLater(updated.startTime);
        }
        return updated;
      })
    );
    setFeedback(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        await saveWorkingHours({ days });
        setFeedback({ type: "success", text: "Werkuren opgeslagen." });
      } catch {
        setFeedback({ type: "error", text: "Opslaan is mislukt. Probeer opnieuw." });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <div className="divide-y divide-rose-100 rounded-lg border border-rose-100">
        {days.map((day) => (
          <div
            key={day.weekday}
            className="flex flex-wrap items-center gap-4 px-4 py-3 text-sm"
          >
            <label className="flex w-36 cursor-pointer items-center gap-3 font-medium text-neutral-900">
              <input
                type="checkbox"
                checked={day.enabled}
                onChange={(e) => updateDay(day.weekday, { enabled: e.target.checked })}
                className="h-4 w-4 accent-rose-700"
              />
              {dayNames[day.weekday]}
            </label>

            {day.enabled ? (
              <div className="flex items-center gap-2 text-neutral-700">
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => updateDay(day.weekday, { startTime: e.target.value })}
                  required
                  className="rounded-md border border-neutral-300 px-2 py-1.5"
                />
                <span className="text-neutral-400">tot</span>
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => updateDay(day.weekday, { endTime: e.target.value })}
                  required
                  className="rounded-md border border-neutral-300 px-2 py-1.5"
                />
              </div>
            ) : (
              <span className="text-neutral-400">Gesloten</span>
            )}
          </div>
        ))}
      </div>

      {feedback && (
        <p
          className={`mt-4 text-sm ${
            feedback.type === "success" ? "text-green-700" : "text-red-600"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-full bg-rose-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
      >
        {pending ? "Bezig..." : "Werkuren opslaan"}
      </button>
    </form>
  );
}
