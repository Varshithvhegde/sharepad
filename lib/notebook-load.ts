import { createAdminClient } from "@/lib/supabase/admin";
import { findPageBySlug, notebookAccessible, sortPages, stripSensitiveNotebook } from "@/lib/notebooks";
import type { Notebook, Page } from "@/lib/types";

export { findPageBySlug } from "@/lib/notebooks";

export async function loadNotebookForView(slug: string) {
  const admin = createAdminClient();
  const { data: raw } = await admin.from("notebooks").select("*").eq("slug", slug).single();
  if (!raw) return null;

  const notebook = stripSensitiveNotebook(raw) as Notebook;
  if (!notebookAccessible(notebook)) return null;

  const { data: pages } = await admin
    .from("pages")
    .select("*")
    .eq("notebook_id", notebook.id)
    .order("sort_order");

  return { notebook, pages: sortPages((pages ?? []) as Page[]) };
}
