"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Reads a media query as an external store, so it stays correct when the window
 * is resized or a phone is turned, and renders safely on the server.
 *
 * The server has no viewport, so it reports false. Anything using this should
 * therefore treat false as "assume desktop" and let the first client render
 * correct it.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Matches Tailwind's `md` breakpoint, below which two panes cannot fit. */
export function useIsNarrow(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
