"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

/** Routes that show somebody's notebook rather than our own marketing. */
const PRIVATE_PREFIXES = ["/n/", "/e/"];

function isPrivate(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Turns session recording on for the marketing pages and off everywhere a
 * notebook is on screen.
 *
 * Recording is disabled at init, so the failure mode of this component not
 * running is "no recording at all" rather than "recording someone's notes".
 */
export default function AnalyticsRouteGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    try {
      if (isPrivate(pathname)) {
        posthog.stopSessionRecording();
      } else {
        posthog.startSessionRecording();
      }
    } catch {
      // Never let analytics take the page down.
    }
  }, [pathname]);

  return null;
}
