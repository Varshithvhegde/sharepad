import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { sortPages, stripSensitiveNotebook, notebookAccessible } from "@/lib/notebooks";
import PasswordGate from "@/components/PasswordGate";
import NotebookEditor from "@/components/NotebookEditor";
import type { Notebook, Page } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type Props = { params: Promise<{ slug: string }> };

async function loadNotebook(slug: string) {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("notebooks")
      .select("title, description, emoji")
      .eq("slug", slug)
      .single();

    if (!data) return { title: "Not found — SharePad" };

    return {
      title: `${data.emoji} ${data.title} — SharePad`,
      description: data.description || `A shared notebook: ${data.title}`,
      openGraph: {
        title: `${data.emoji} ${data.title}`,
        description: data.description || undefined,
        url: `${SITE_URL}/n/${slug}`,
      },
    };
  } catch {
    return { title: "SharePad" };
  }
}

export default async function ViewNotebookPage({ params }: Props) {
  const { slug } = await params;

  const data = await loadNotebook(slug).catch(() => null);
  if (!data) notFound();

  const { notebook, pages } = data;

  const cookieStore = await cookies();
  const unlocked = cookieStore.get(`sp_unlock_${slug}`)?.value === "1";

  if (notebook.has_password && !unlocked) {
    return <PasswordGate slug={slug} title={notebook.title} />;
  }

  // View counting is best-effort; a failure here should never block reading.
  try {
    const admin = createAdminClient();
    await admin.rpc("increment_notebook_views", { notebook_slug: slug });
    if (notebook.burn_after_read && !notebook.burn_consumed) {
      await admin.rpc("consume_burn_link", { notebook_slug: slug });
    }
  } catch {
    // ignored
  }

  return <NotebookEditor notebook={notebook} pages={pages} editToken="" mode="view" />;
}
