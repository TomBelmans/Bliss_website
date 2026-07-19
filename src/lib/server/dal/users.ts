/**
 * Data Access Layer voor admin-gebruikers (`User`, `Session`).
 * Aangeroepen door: login/wachtwoord actions, session mediators en proxy
 * (beschermde admin-routes).
 */
import "server-only";
import { randomBytes } from "crypto";
import { cache } from "react";
import prismaClient from "./prismaClient";
import { hashPassword, verifyPassword } from "@serverUtils";
import { SESSION_DURATION_MS } from "@/lib/constants";
import type { Session, User } from "@/generated/prisma/client";
import type { Profile, SessionWithProfile } from "@models";

function toProfile(user: User): Profile {
  const { password: _password, ...profile } = user;
  return profile;
}

/**
 * Maakt een admin-gebruiker aan (wachtwoord gehashed). Model: `User`.
 * Typisch via seed/scripts, niet via UI.
 */
export async function createUser(email: string, plainTextPassword: string): Promise<Profile> {
  const user = await prismaClient.user.create({
    data: {
      email,
      password: hashPassword(plainTextPassword),
    },
  });
  return toProfile(user);
}

/** Zoekt admin-gebruiker op e-mail (inclusief wachtwoordhash). Model: `User`. */
export async function getUserByEmail(email: string): Promise<User | null> {
  return prismaClient.user.findUnique({ where: { email } });
}

/**
 * Ruwe admin-gebruiker op id. Model: `User`.
 * Aangeroepen door `changePassword` action.
 */
export async function getUserById(id: string): Promise<User | null> {
  return prismaClient.user.findUnique({ where: { id } });
}

/**
 * Valideert e-mail/wachtwoord en start bij succes een nieuwe sessie.
 * Geeft `null` terug bij een ongeldige combinatie of een gedeactiveerd account.
 */
export async function signIn(
  email: string,
  plainTextPassword: string
): Promise<{ profile: Profile; session: Session } | null> {
  const user = await getUserByEmail(email);
  if (!user || !user.isActive) return null;
  if (!verifyPassword(plainTextPassword, user.password)) return null;

  const session = await startSession(user.id);
  return { profile: toProfile(user), session };
}

/**
 * Start een nieuwe admin-sessie met vaste TTL. Model: `Session`.
 * Aangeroepen door `signIn`.
 */
export async function startSession(userId: string): Promise<Session> {
  const id = randomBytes(32).toString("hex");
  return prismaClient.session.create({
    data: {
      id,
      userId,
      activeFrom: new Date(),
      activeUntil: new Date(Date.now() + SESSION_DURATION_MS),
    },
  });
}

/**
 * Haalt de sessie + bijhorende (publieke) gebruiker op, enkel als de sessie
 * nog niet verlopen is. `cache()` dedupliceert herhaalde aanroepen binnen
 * dezelfde server-render pass (bv. layout + page die allebei de sessie nodig
 * hebben).
 */
export const getSessionProfile = cache(
  async (sessionId: string): Promise<SessionWithProfile | null> => {
    const session = await prismaClient.session.findUnique({
      where: { id: sessionId, activeUntil: { gt: new Date() } },
      include: { user: true },
    });
    if (!session || !session.user.isActive) return null;

    const { user, ...sessionFields } = session;
    return { ...sessionFields, user: toProfile(user) };
  }
);

/**
 * Verlengt de sessie-TTL. Model: `Session`.
 * Aangeroepen door session mediator.
 */
export async function extendSession(id: string): Promise<Session> {
  return prismaClient.session.update({
    where: { id },
    data: { activeUntil: new Date(Date.now() + SESSION_DURATION_MS) },
  });
}

/**
 * Verwijdert een admin-sessie (uitloggen). Model: `Session`.
 * Aangeroepen door `signOut` action.
 */
export async function stopSession(id: string): Promise<void> {
  await prismaClient.session.delete({ where: { id } }).catch(() => {
    // Sessie bestond al niet meer (bv. dubbel uitloggen): niets te doen.
  });
}

/**
 * Activeert/deactiveert een admin-gebruiker. Model: `User`.
 */
export async function updateUserStatus(id: string, isActive: boolean): Promise<Profile> {
  const user = await prismaClient.user.update({ where: { id }, data: { isActive } });
  return toProfile(user);
}

/**
 * Zet een nieuw gehashed wachtwoord. Model: `User`.
 * Aangeroepen door `changePassword` action.
 */
export async function updateUserPassword(id: string, newPlainTextPassword: string): Promise<Profile> {
  const user = await prismaClient.user.update({
    where: { id },
    data: { password: hashPassword(newPlainTextPassword) },
  });
  return toProfile(user);
}
