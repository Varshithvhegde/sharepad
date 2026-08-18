"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { SavedNotebook } from "./types";

const KEY = "sharepad_notebooks";
const CHANGED = "sharepad:notebooks-changed";

/** Hard cap — localStorage is not meant to hold a library of hundreds. */
export const MAX_SAVED_NOTEBOOKS = 50;

/** How many cards the home page shows before "Show more". */
export const SAVED_NOTEBOOKS_PAGE_SIZE = 6;

function sortSavedNotebooks(notebooks: SavedNotebook[]): SavedNotebook[] {
  return [...notebooks].sort((a, b) => {
    const aPin = Boolean(a.pinned);
    const bPin = Boolean(b.pinned);
    if (aPin !== bPin) return aPin ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/*
 * localStorage is an external store, so it is read through useSyncExternalStore
 * rather than copied into state inside an effect. Besides satisfying the rules
 * of React, this means the list updates itself when a notebook is added or
 * removed — including from another tab.
 */

let cachedRaw: string | null = null;
let cached: SavedNotebook[] = [];

function readStore(): SavedNotebook[] {
  const raw = localStorage.getItem(KEY);
  // getSnapshot must return a stable reference or React re-renders forever.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cached = raw ? sortSavedNotebooks(JSON.parse(raw) as SavedNotebook[]) : [];
    } catch {
      cached = [];
    }
  }
  return cached;
}

function writeStore(notebooks: SavedNotebook[]): void {
  localStorage.setItem(KEY, JSON.stringify(notebooks));
  window.dispatchEvent(new Event(CHANGED));
}

function subscribe(onChange: () => void): () => void {
  // `storage` fires in other tabs; the custom event covers this one.
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGED, onChange);
  };
}

const EMPTY: SavedNotebook[] = [];

/** Nothing is known about the browser's storage while rendering on the server. */
function serverSnapshot(): SavedNotebook[] {
  return EMPTY;
}

export function useSavedNotebooks(): SavedNotebook[] {
  return useSyncExternalStore(subscribe, readStore, serverSnapshot);
}

export function getSavedNotebooks(): SavedNotebook[] {
  if (typeof window === "undefined") return EMPTY;
  return readStore();
}

export function saveNotebook(entry: SavedNotebook): void {
  if (typeof window === "undefined") return;
  const existing = getSavedNotebooks().find((n) => n.editToken === entry.editToken);
  const merged: SavedNotebook = {
    ...entry,
    pinned: entry.pinned ?? existing?.pinned ?? false,
  };
  const rest = getSavedNotebooks().filter((n) => n.editToken !== entry.editToken);
  writeStore(sortSavedNotebooks([merged, ...rest]).slice(0, MAX_SAVED_NOTEBOOKS));
}

export function togglePinSavedNotebook(editToken: string): void {
  if (typeof window === "undefined") return;
  writeStore(
    getSavedNotebooks().map((n) =>
      n.editToken === editToken ? { ...n, pinned: !n.pinned } : n
    )
  );
}

export function removeSavedNotebook(slug: string, editToken?: string): void {
  if (typeof window === "undefined") return;
  writeStore(
    getSavedNotebooks().filter((n) =>
      editToken ? n.editToken !== editToken : n.slug !== slug
    )
  );
}

export function getEditToken(slug: string): string | null {
  return getSavedNotebooks().find((n) => n.slug === slug)?.editToken ?? null;
}

/* ── A single stored preference, e.g. whether the panes scroll together ── */

function flagSubscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGED, onChange);
  };
}

export function useStoredFlag(
  key: string,
  fallback: boolean
): [boolean, (next: boolean) => void] {
  const getValue = useCallback(() => {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : stored === "on";
  }, [key, fallback]);

  const getServerValue = useCallback(() => fallback, [fallback]);

  const value = useSyncExternalStore(flagSubscribe, getValue, getServerValue);

  const setValue = useCallback(
    (next: boolean) => {
      localStorage.setItem(key, next ? "on" : "off");
      window.dispatchEvent(new Event(CHANGED));
    },
    [key]
  );

  return [value, setValue];
}
