import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { sortPages, stripSensitiveNotebook, notebookAccessible, extractToc } from "@/lib/notebooks";
import { formatDate } from "@/lib/format";
import MarkdownPreview from "@/components/MarkdownPreview";
import PrintControls from "@/components/PrintControls";
import type { Notebook, Page } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PrintNotebookPage({ params }: Props) {
  const { slug } = await params;

  const admin = createAdminClient();
  const { data: raw } = await admin.from("notebooks").select("*").eq("slug", slug).single();
  if (!raw) notFound();

  const notebook = stripSensitiveNotebook(raw) as Notebook;
  if (!notebookAccessible(notebook)) notFound();

  // Honour the same password gate as the reading view.
  if (notebook.has_password) {
    const cookieStore = await cookies();
    if (cookieStore.get(`sp_unlock_${slug}`)?.value !== "1") notFound();
  }

  const { data: pageRows } = await admin
    .from("pages")
    .select("*")
    .eq("notebook_id", notebook.id)
    .order("sort_order");

  const pages = sortPages((pageRows ?? []) as Page[]);
  const showContents = pages.length > 1;

  return (
    <div className="print-document min-h-screen">
      <PrintControls title={notebook.title} />

      <div className="mx-auto" style={{ maxWidth: "46rem", padding: "2.5rem 1.5rem 4rem" }}>
        {/* Title sheet */}
        <header
          className="print-sheet"
          style={{ paddingBottom: "1.5rem", borderBottom: "2px solid #222", marginBottom: "2rem" }}
        >
          <h1 style={{ fontSize: "1.9rem", fontWeight: 600, margin: 0, lineHeight: 1.25 }}>
            {notebook.title}
          </h1>
          {notebook.description && (
            <p style={{ margin: "0.5rem 0 0", color: "#555" }}>{notebook.description}</p>
          )}
          <p style={{ margin: "0.9rem 0 0", fontSize: "0.85rem", color: "#666" }}>
            {pages.length} {pages.length === 1 ? "page" : "pages"} · Updated{" "}
            {formatDate(notebook.updated_at)}
          </p>

          {showContents && (
            <nav style={{ marginTop: "1.6rem" }}>
              <h2 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#666", margin: "0 0 0.6rem" }}>
                Contents
              </h2>
              <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.92rem" }}>
                {pages.map((p) => {
                  const sections = extractToc(p.content).filter((h) => h.level <= 2);
                  return (
                    <li key={p.id} style={{ marginBottom: "0.3rem" }}>
                      {p.title}
                      {sections.length > 0 && (
                        <span style={{ color: "#777" }}>
                          {" — "}
                          {sections.slice(0, 4).map((s) => s.text).join(" · ")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
        </header>

        {/* One sheet per page, each starting on a fresh sheet of paper */}
        {pages.map((page, i) => (
          <section key={page.id} className="print-sheet" style={{ paddingTop: i === 0 ? 0 : "1rem" }}>
            <h1
              style={{
                fontSize: "1.45rem",
                fontWeight: 600,
                margin: "0 0 1.1rem",
                paddingBottom: "0.4rem",
                borderBottom: "1px solid #ddd",
              }}
            >
              {page.title}
            </h1>
            <MarkdownPreview content={page.content} />
          </section>
        ))}

        <footer
          style={{
            marginTop: "3rem",
            paddingTop: "0.8rem",
            borderTop: "1px solid #ddd",
            fontSize: "0.78rem",
            color: "#777",
          }}
        >
          {notebook.title} · Printed {formatDate(new Date().toISOString())}
        </footer>
      </div>
    </div>
  );
}
