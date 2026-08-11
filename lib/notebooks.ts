import type { Notebook, Page } from "./types";

export function stripSensitiveNotebook(row: Record<string, unknown>): Notebook {
  const { edit_token_hash: _token, password_hash, ...rest } = row;
  void _token;
  return {
    ...(rest as Omit<Notebook, "has_password">),
    has_password: Boolean(password_hash),
  };
}

export function sortPages(pages: Page[]): Page[] {
  return [...pages].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
}

/** Slugifies heading text so preview anchors and the contents list agree. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractToc(content: string): { level: number; text: string; id: string }[] {
  const headings: { level: number; text: string; id: string }[] = [];
  let inFence = false;

  for (const line of content.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,4})\s+(.+)$/.exec(line.trim());
    if (match) {
      const text = match[2].replace(/[#*`_]/g, "").trim();
      headings.push({ level: match[1].length, text, id: headingId(text) });
    }
  }
  return headings;
}

export function notebookExpired(notebook: Notebook): boolean {
  return notebook.expires_at ? new Date(notebook.expires_at) < new Date() : false;
}

export function notebookAccessible(notebook: Notebook): boolean {
  if (notebookExpired(notebook)) return false;
  if (notebook.burn_after_read && notebook.burn_consumed) return false;
  if (notebook.visibility === "private") return false;
  return true;
}
