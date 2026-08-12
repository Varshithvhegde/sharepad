import { SITE_URL } from "@/lib/site";
import { USE_CASES } from "@/lib/use-cases";

/**
 * https://llmstxt.org — a curated map of the site for agents.
 *
 * Deliberately short: the value is in the one-line descriptions that let an
 * agent decide what to fetch, not in listing every URL. The sitemap already
 * does the exhaustive version.
 */
export async function GET() {
  const guides = USE_CASES.map(
    (u) => `- [${u.metaTitle}](${SITE_URL}/${u.slug}): ${u.metaDescription}`
  ).join("\n");

  const body = `# SharePad

> A notebook of markdown pages that lives at one shareable link. No account, no email, no sign-up. Create a notebook, write as many pages as you need, and hand out a read-only link while keeping a secret edit link for yourself.

SharePad is free and open source. Ownership works without accounts: creating a notebook mints a secret edit token, and whoever holds that link owns the notebook. Notebooks expire after ten days by default and are deleted for real by a scheduled job.

## Start here

- [Home](${SITE_URL}/): What SharePad does, and how the two-link model works.
- [Paste and share](${SITE_URL}/quick): Fastest path — paste text, get a link back, title and address chosen automatically.
- [Create a notebook](${SITE_URL}/new): Full setup — choose the address, expiry, paper, typeface and password.
- [Open an existing notebook](${SITE_URL}/recover): Paste a saved edit link to get back in.

## Guides

${guides}

## Key facts

- Price: free, with no paid tier and no adverts.
- Accounts: none. There is no login, and no email is collected.
- Ownership: a secret edit link, created with the notebook. Only its SHA-256 hash is stored.
- Sharing: a read-only view link at /n/{slug}, separate from the edit link at /e/{token}.
- Pages: one notebook holds many markdown pages behind a single link, with an index for readers.
- Markdown: GitHub-flavoured, including tables, fenced code with highlighting, and task lists.
- Expiry: ten days by default; adjustable to one day, a year, or never. Expired notebooks are deleted.
- Privacy: optional password, read-only mode, and burn-after-reading. Notebooks are unlisted unless marked public.
- Export: whole notebook to PDF via a print view in a professional serif, or to a single Markdown file.
- Collaboration: anonymous comments, and optional open editing for anyone holding the link.
- History: the last ten drafts of every page, restorable.

## Project

- [Source code](https://github.com/Varshithvhegde/sharepad): Next.js and Supabase, MIT licensed.
- [Report a bug or request a feature](https://github.com/Varshithvhegde/sharepad/issues/new): Issue tracker.
- [Full text of these pages](${SITE_URL}/llms-full.txt): Every guide concatenated as Markdown.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
