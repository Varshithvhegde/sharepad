import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripSensitiveNotebook, sortPages, notebookAccessible } from "@/lib/notebooks";
import MarkdownPreview from "@/components/MarkdownPreview";
import type { Page } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export default async function EmbedPage({ params }: Props) {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: raw } = await admin.from("notebooks").select("*").eq("slug", slug).single();
  if (!raw) notFound();

  const notebook = stripSensitiveNotebook(raw);
  if (!notebookAccessible(notebook)) notFound();

  const { data: pages } = await admin
    .from("pages")
    .select("*")
    .eq("notebook_id", notebook.id)
    .order("sort_order");

  const sorted = sortPages((pages ?? []) as Page[]);
  const firstPage = sorted[0];

  const isPaper = notebook.theme === "paper";

  return (
    <div
      className={`min-h-screen p-6 ${isPaper ? "bg-[var(--paper)] text-[var(--paper-ink)] theme-paper" : "bg-[var(--shell-2)] text-[var(--ink)]"}`}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span>{notebook.emoji}</span>
          <h1 className="font-semibold text-lg">{notebook.title}</h1>
        </div>
        {firstPage && (
          <>
            <h2 className="text-xl font-bold mb-4">{firstPage.title}</h2>
            <MarkdownPreview content={firstPage.content} />
          </>
        )}
        <p className="mt-8 text-xs opacity-40">
          Powered by{" "}
          <a href="/" target="_blank" rel="noopener noreferrer" className="underline">
            SharePad
          </a>
        </p>
      </div>
    </div>
  );
}
