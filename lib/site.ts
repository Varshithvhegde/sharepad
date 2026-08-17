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

export const PRODUCT_HUNT = {
  url: "https://www.producthunt.com/products/sharepad-2",
  badgeUrl:
    "https://www.producthunt.com/products/sharepad-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-sharepad-2",
  embedUrl:
    "https://www.producthunt.com/products/sharepad-2?embed=true&utm_source=embed&utm_medium=post_embed",
  badgeImage:
    "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1225104&theme=light",
  icon: "https://ph-files.imgix.net/23b065fa-4a09-4adb-8a82-29311792b2cd.png?auto=compress,format&codec=mozjpeg&cs=strip&fit=crop&h=80&w=80",
  tagline: "Share markdown notebooks with one link. No signup.",
} as const;
