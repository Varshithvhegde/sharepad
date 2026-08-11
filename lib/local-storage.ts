import type { SavedNotebook } from "./types";

const KEY = "sharepad_notebooks";

export function getSavedNotebooks(): SavedNotebook[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedNotebook[]) : [];
  } catch {
    return [];
  }
}

export function saveNotebook(entry: SavedNotebook): void {
  if (typeof window === "undefined") return;
  const existing = getSavedNotebooks().filter((n) => n.slug !== entry.slug);
  existing.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(existing.slice(0, 50)));
}

export function removeSavedNotebook(slug: string): void {
  if (typeof window === "undefined") return;
  const filtered = getSavedNotebooks().filter((n) => n.slug !== slug);
  localStorage.setItem(KEY, JSON.stringify(filtered));
}

export function getEditToken(slug: string): string | null {
  return getSavedNotebooks().find((n) => n.slug === slug)?.editToken ?? null;
}
