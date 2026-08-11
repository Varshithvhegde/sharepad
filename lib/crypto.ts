import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";

export function generateEditToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashEditToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyEditToken(token: string, hash: string): boolean {
  return hashEditToken(token) === hash;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
