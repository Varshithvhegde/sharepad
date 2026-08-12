import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Edit links grant write access, so they must never be crawled. Notebooks
        // decide for themselves through a per-page robots tag, which lets a
        // deliberately public one still be indexed.
        disallow: ["/e/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
