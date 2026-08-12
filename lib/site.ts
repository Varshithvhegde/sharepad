/**
 * Falls back to the live domain rather than localhost: if the env var is ever
 * missing in production, wrong-but-real URLs in canonicals and the sitemap are
 * far less damaging than telling search engines the site lives on localhost.
 * Local development sets NEXT_PUBLIC_SITE_URL in .env.local.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://sharepad.in"
).replace(/\/$/, "");

export const SITE_NAME = "SharePad";

export const GITHUB_REPO = "https://github.com/Varshithvhegde/sharepad";
export const KOFI_URL = "https://ko-fi.com/varshithvhegde";
