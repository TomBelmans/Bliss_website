-- CreateTable
CREATE TABLE "WorkingHours" (
    "weekday" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5) NOT NULL,

    CONSTRAINT "WorkingHours_pkey" PRIMARY KEY ("weekday")
);

-- Seed: neem de tot nu toe hardcoded openingsuren over zodat het gedrag
-- ongewijzigd blijft tot de beheerder ze aanpast via /admin/kalender.
INSERT INTO "WorkingHours" ("weekday", "enabled", "startTime", "endTime") VALUES
  (0, false, '09:00', '17:00'), -- zondag: gesloten
  (1, false, '09:00', '17:00'), -- maandag: gesloten
  (2, true,  '09:00', '17:00'), -- dinsdag
  (3, true,  '09:00', '17:00'), -- woensdag
  (4, true,  '09:00', '20:00'), -- donderdag
  (5, true,  '09:00', '17:00'), -- vrijdag
  (6, true,  '09:00', '14:00'); -- zaterdag
