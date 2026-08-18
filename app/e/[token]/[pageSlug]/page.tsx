import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getNotebookByEditToken } from "@/lib/api-auth";
import { findPageBySlug } from "@/lib/notebook-load";
import { stripSensitiveNotebook, sortPages } from "@/lib/notebooks";
import NotebookEditor from "@/components/NotebookEditor";
import type { Notebook, Page } from "@/lib/types";

type Props = { params: Promise<{ token: string; pageSlug: string }> };

export default async function EditNotebookPagePage({ params }: Props) {
  const { token, pageSlug } = await params;

  let notebook;
  try {
    notebook = await getNotebookByEditToken(token);
  } catch {
    notFound();
  }
  if (!notebook) notFound();

  const admin = createAdminClient();
  const { data: pages } = await admin
    .from("pages")
    .select("*")
    .eq("notebook_id", notebook.id)
    .order("sort_order");

  const sorted = sortPages((pages ?? []) as Page[]);
  if (!findPageBySlug(sorted, pageSlug)) notFound();

  return (
    <NotebookEditor
      notebook={stripSensitiveNotebook(notebook) as Notebook}
      pages={sorted}
      editToken={token}
      mode="edit"
      initialPageSlug={pageSlug}
    />
  );
}
