import "server-only";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export function hashPassword(plainTextPassword: string): string {
  return bcrypt.hashSync(plainTextPassword, SALT_ROUNDS);
}

export function verifyPassword(plainTextPassword: string, hash: string): boolean {
  return bcrypt.compareSync(plainTextPassword, hash);
}
