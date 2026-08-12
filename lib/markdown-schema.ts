import { defaultSchema } from "hast-util-sanitize";
import type { Options as SanitizeOptions } from "rehype-sanitize";

/**
 * What raw HTML is allowed inside a notebook.
 *
 * Sanitising is not optional here. Anyone can write into a notebook that has
 * open editing turned on, and a single injected script would run on the owner's
 * own page — where it could read the edit token out of the /e/{token} URL, or
 * lift every token this browser has saved out of localStorage, handing over
 * control of notebooks that have nothing to do with the attacker.
 *
 * The default schema is GitHub's, which already refuses script, style, iframe,
 * object, embed, form, event-handler attributes and javascript: URLs. This adds
 * a few presentational tags on top and changes nothing about what it blocks.
 */
export const markdownSchema: SanitizeOptions = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "mark",
    "abbr",
    "figure",
    "figcaption",
  ],
  attributes: {
    ...defaultSchema.attributes,
    abbr: [...(defaultSchema.attributes?.abbr ?? []), "title"],
    // Keep the alignment attributes GFM tables rely on.
    td: [...(defaultSchema.attributes?.td ?? []), "align"],
    th: [...(defaultSchema.attributes?.th ?? []), "align"],
  },
};
