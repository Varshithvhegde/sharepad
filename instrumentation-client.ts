import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

/*
 * Analytics is optional: without a token the app runs exactly as before, so a
 * fork or a local checkout never phones home.
 *
 * Two deliberate restrictions, because people write private notes here:
 *
 *   autocapture           off — it records the text of elements people click,
 *                              which on a notebook page is their own writing.
 *   session recording     off at startup, and only ever switched on for the
 *                              marketing pages by AnalyticsRouteGuard. A replay
 *                              of the editor would be a recording of somebody
 *                              typing a private note.
 *
 * Persistence is memory-only, so no cookie is set and no consent banner is
 * needed. The cost is that a returning visitor counts as a new one, which is a
 * fair trade for a product whose pitch is that it does not track you.
 */
if (!token && process.env.NODE_ENV === "development") {
  // Not an error. Running without analytics is a supported way to work on this.
  console.info("SharePad: no PostHog token set, so analytics is off.");
}

if (token) {
  posthog.init(token, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    defaults: "2026-05-30",
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    autocapture: false,
    disable_session_recording: true,
    persistence: "memory",
    person_profiles: "never",
    capture_pageview: true,
    capture_pageleave: true,
  });
}
