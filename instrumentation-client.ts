import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;

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
if (token) {
  posthog.init(token, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    defaults: "2026-05-30",
    autocapture: false,
    disable_session_recording: true,
    persistence: "memory",
    person_profiles: "never",
    capture_pageview: true,
    capture_pageleave: true,
  });
}
