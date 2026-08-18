import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { findPageBySlug, loadNotebookForView } from "@/lib/notebook-load";
import { SITE_URL } from "@/lib/site";
import PasswordGate from "@/components/PasswordGate";
import NotebookEditor from "@/components/NotebookEditor";

type Props = { params: Promise<{ slug: string; pageSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  try {
    const data = await loadNotebookForView(slug);
    if (!data) return { title: "Not found" };

    const page = findPageBySlug(data.pages, pageSlug);
    const title = page ? `${page.title} · ${data.notebook.title}` : data.notebook.title;
    const description =
      data.notebook.description ||
      (page ? `“${page.title}” in ${data.notebook.title}` : `A shared notebook: ${data.notebook.title}`);
    const indexable = data.notebook.visibility === "public";

    return {
      title,
      description,
      alternates: { canonical: `/n/${slug}/${pageSlug}` },
      robots: { index: indexable, follow: indexable },
      openGraph: {
        type: "article",
        title,
        description,
        url: `${SITE_URL}/n/${slug}/${pageSlug}`,
      },
      twitter: { card: "summary_large_image", title, description },
    };
  } catch {
    return { title: "Notebook" };
  }
}

export default async function ViewNotebookPagePage({ params }: Props) {
  const { slug, pageSlug } = await params;

  const data = await loadNotebookForView(slug).catch(() => null);
  if (!data) notFound();

  const page = findPageBySlug(data.pages, pageSlug);
  if (!page) notFound();

  const { notebook, pages } = data;

  const cookieStore = await cookies();
  const unlocked = cookieStore.get(`sp_unlock_${slug}`)?.value === "1";

  if (notebook.has_password && !unlocked) {
    return <PasswordGate slug={slug} title={notebook.title} />;
  }

  try {
    const admin = createAdminClient();
    await admin.rpc("increment_notebook_views", { notebook_slug: slug });
    if (notebook.burn_after_read && !notebook.burn_consumed) {
      await admin.rpc("consume_burn_link", { notebook_slug: slug });
    }
  } catch {
    // ignored
  }

  return (
    <NotebookEditor
      notebook={notebook}
      pages={pages}
      editToken=""
      mode="view"
      initialPageSlug={pageSlug}
    />
  );
}
