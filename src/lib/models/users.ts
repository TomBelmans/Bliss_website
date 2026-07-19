import type { Session, User } from "@/generated/prisma/client";

/** De gebruiker zonder het wachtwoord-hash veld — veilig om overal door te geven. */
export type Profile = Omit<User, "password">;

/** Een sessie met de bijhorende (publieke) gebruiker erin samengevoegd. */
export type SessionWithProfile = Session & { user: Profile };
