import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

/** Route segments that must never be claimed as a notebook link. */
export const RESERVED_SLUGS = new Set([
  "new",
  "api",
  "recover",
  "n",
  "e",
  "about",
  "help",
  "terms",
  "privacy",
  "blog",
  "admin",
  "settings",
  "static",
  "public",
]);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function generateSlug(title?: string): string {
  const base = title ? slugify(title) : "";
  if (base.length >= 3 && !RESERVED_SLUGS.has(base)) return `${base}-${nanoid()}`;
  return `note-${nanoid()}`;
}

export function generatePageSlug(title?: string): string {
  const base = title ? slugify(title) : "";
  return base.length >= 2 ? base : `page-${nanoid()}`;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])?$/.test(slug);
}
