import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Edit links grant write access, so nothing may crawl them. Notebooks decide
 * for themselves through a per-page robots tag, which lets a deliberately
 * public one be indexed while unlisted ones stay out of results.
 */
const BLOCKED = ["/e/", "/api/"];

/**
 * Assistants and their crawlers, listed explicitly. They are already covered by
 * the wildcard rule, but naming them documents the intent and stops a future
 * blanket change from quietly cutting off the surfaces that send traffic here.
 *
 * Note that Google-Extended and Applebot-Extended govern training use rather
 * than search indexing. Remove them to stay out of model training.
 */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "cohere-ai",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: BLOCKED },
      { userAgent: AI_AGENTS, allow: "/", disallow: BLOCKED },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
