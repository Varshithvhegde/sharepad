import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { USE_CASES } from "@/lib/use-cases";

/**
 * Only the public entry points. Notebooks themselves are unlisted — listing
 * them would defeat the point of an unguessable link.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date();

  return [
    { url: SITE_URL, lastModified: updated, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/quick`, lastModified: updated, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/new`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    ...USE_CASES.map((useCase) => ({
      url: `${SITE_URL}/${useCase.slug}`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/recover`, lastModified: updated, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: updated, changeFrequency: "yearly", priority: 0.3 },
  ];
}
