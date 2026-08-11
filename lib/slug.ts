import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

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
  if (base.length >= 3) return `${base}-${nanoid()}`;
  return `note-${nanoid()}`;
}

export function generatePageSlug(title?: string): string {
  const base = title ? slugify(title) : "";
  if (base.length >= 2) return base;
  return `page-${nanoid()}`;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$|^[a-z0-9]{1,2}$/.test(slug);
}
