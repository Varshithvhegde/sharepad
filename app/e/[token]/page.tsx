import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getNotebookByEditToken } from "@/lib/api-auth";
import { stripSensitiveNotebook, sortPages } from "@/lib/notebooks";
import NotebookEditor from "@/components/NotebookEditor";
import type { Notebook, Page } from "@/lib/types";

type Props = { params: Promise<{ token: string }> };

export default async function EditNotebookPage({ params }: Props) {
  const { token } = await params;
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

  return (
    <NotebookEditor
      notebook={stripSensitiveNotebook(notebook) as Notebook}
      pages={sortPages((pages ?? []) as Page[])}
      editToken={token}
      mode="edit"
    />
  );
}
