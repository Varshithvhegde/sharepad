/** View URL path for a notebook, optionally opened on one page. */
export function notebookViewPath(notebookSlug: string, pageSlug?: string): string {
  return pageSlug ? `/n/${notebookSlug}/${pageSlug}` : `/n/${notebookSlug}`;
}

/** Edit URL path for a token, optionally opened on one page. */
export function notebookEditPath(editToken: string, pageSlug?: string): string {
  return pageSlug ? `/e/${editToken}/${pageSlug}` : `/e/${editToken}`;
}

export function absolutePageUrl(
  origin: string,
  notebookSlug: string,
  pageSlug: string,
  mode: "view" | "edit",
  editToken?: string
): string {
  const path =
    mode === "edit" && editToken
      ? notebookEditPath(editToken, pageSlug)
      : notebookViewPath(notebookSlug, pageSlug);
  return `${origin.replace(/\/$/, "")}${path}`;
}
