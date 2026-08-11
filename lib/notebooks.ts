import type { Notebook, Page } from "./types";

export function stripSensitiveNotebook(
  row: Record<string, unknown>
): Notebook {
  const { edit_token_hash: _, password_hash, ...rest } = row;
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

export function extractToc(content: string): { level: number; text: string; id: string }[] {
  const headings: { level: number; text: string; id: string }[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const match = /^(#{1,6})\s+(.+)$/.exec(line.trim());
    if (match) {
      const text = match[2].replace(/[#*`]/g, "").trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, "-");
      headings.push({ level: match[1].length, text, id });
    }
  }
  return headings;
}

export function notebookExpired(notebook: Notebook): boolean {
  if (!notebook.expires_at) return false;
  return new Date(notebook.expires_at) < new Date();
}

export function notebookAccessible(notebook: Notebook): boolean {
  if (notebookExpired(notebook)) return false;
  if (notebook.burn_after_read && notebook.burn_consumed) return false;
  if (notebook.visibility === "private") return false;
  return true;
}
