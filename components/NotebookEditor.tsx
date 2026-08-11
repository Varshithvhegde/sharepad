"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Save,
  Share2,
  Settings,
  Search,
  Eye,
  EyeOff,
  Pin,
  Trash2,
  ChevronLeft,
  Menu,
  X,
  Loader2,
  Check,
} from "lucide-react";
import MarkdownPreview from "@/components/MarkdownPreview";
import TableOfContents from "@/components/TableOfContents";
import SharePanel from "@/components/SharePanel";
import SettingsPanel from "@/components/SettingsPanel";
import { sortPages } from "@/lib/notebooks";
import { saveNotebook } from "@/lib/local-storage";
import type { Notebook, Page } from "@/lib/types";

interface NotebookEditorProps {
  notebook: Notebook;
  pages: Page[];
  editToken: string;
  mode: "edit" | "view";
}

export default function NotebookEditor({
  notebook: initialNotebook,
  pages: initialPages,
  editToken,
  mode,
}: NotebookEditorProps) {
  const [notebook, setNotebook] = useState(initialNotebook);
  const [pages, setPages] = useState(() => sortPages(initialPages));
  const [activePageId, setActivePageId] = useState(pages[0]?.id ?? "");
  const [content, setContent] = useState(pages[0]?.content ?? "");
  const [title, setTitle] = useState(pages[0]?.title ?? "");
  const [showPreview, setShowPreview] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEdit = mode === "edit" && !notebook.read_only;

  const theme = notebook.theme === "paper" ? "paper" : "dark";
  const isPaper = theme === "paper";

  const activePage = pages.find((p) => p.id === activePageId);

  useEffect(() => {
    if (isEdit) {
      saveNotebook({
        slug: notebook.slug,
        title: notebook.title,
        editToken,
        createdAt: notebook.created_at,
      });
    }
  }, [isEdit, notebook.slug, notebook.title, editToken, notebook.created_at]);

  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages;
    const q = search.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }, [pages, search]);

  const selectPage = useCallback(
    (page: Page) => {
      setActivePageId(page.id);
      setContent(page.content);
      setTitle(page.title);
      setMobileSidebar(false);
    },
    []
  );

  const savePage = useCallback(
    async (pageId: string, updates: { content?: string; title?: string }) => {
      if (!isEdit) return;
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/pages/${pageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Edit-Token": editToken,
          },
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (res.ok && data.page) {
          setPages((prev) =>
            sortPages(prev.map((p) => (p.id === pageId ? data.page : p)))
          );
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      } catch {
        setSaveStatus("idle");
      }
    },
    [editToken, isEdit]
  );

  useEffect(() => {
    if (!isEdit || !activePageId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (activePage && (content !== activePage.content || title !== activePage.title)) {
        savePage(activePageId, { content, title });
      }
    }, 2000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content, title, activePageId, activePage, isEdit, savePage]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (activePageId) savePage(activePageId, { content, title });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShowPreview((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePageId, content, title, savePage]);

  async function addPage() {
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Edit-Token": editToken,
      },
      body: JSON.stringify({ notebook_id: notebook.id, title: "New Page" }),
    });
    const data = await res.json();
    if (res.ok && data.page) {
      setPages((prev) => sortPages([...prev, data.page]));
      selectPage(data.page);
    }
  }

  async function deletePage(pageId: string) {
    if (!confirm("Delete this page?")) return;
    const res = await fetch(`/api/pages/${pageId}`, {
      method: "DELETE",
      headers: { "X-Edit-Token": editToken },
    });
    if (res.ok) {
      const remaining = pages.filter((p) => p.id !== pageId);
      setPages(sortPages(remaining));
      if (activePageId === pageId && remaining[0]) selectPage(remaining[0]);
    }
  }

  async function togglePin(page: Page) {
    const res = await fetch(`/api/pages/${page.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Edit-Token": editToken,
      },
      body: JSON.stringify({ pinned: !page.pinned }),
    });
    const data = await res.json();
    if (res.ok) {
      setPages((prev) => sortPages(prev.map((p) => (p.id === page.id ? data.page : p))));
    }
  }

  const shellClass = isPaper
    ? "bg-dot-grid-paper theme-paper text-[var(--paper-ink)]"
    : "bg-[var(--shell)] bg-dot-grid text-[var(--ink)]";

  return (
    <div className={`min-h-screen flex flex-col ${shellClass}`}>
      {/* Top bar */}
      <header
        className={`sticky top-0 z-40 flex items-center gap-3 px-4 h-14 shrink-0 ${
          isPaper ? "bg-white/90 border-b border-[var(--border-paper)] backdrop-blur-sm" : "glass-nav"
        }`}
      >
        <button
          onClick={() => setMobileSidebar(true)}
          className="md:hidden p-2 rounded-lg opacity-70 hover:opacity-100"
        >
          <Menu size={18} />
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm" style={{ background: "var(--accent)" }}>
            📝
          </div>
          <span className={`hidden sm:inline text-sm font-semibold ${isPaper ? "" : "text-[var(--ink)]"}`}>
            SharePad
          </span>
        </Link>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-lg">{notebook.emoji}</span>
          {isEdit ? (
            <input
              value={notebook.title}
              onChange={(e) => setNotebook({ ...notebook, title: e.target.value })}
              onBlur={async () => {
                await fetch(`/api/notebooks/${notebook.id}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Edit-Token": editToken,
                  },
                  body: JSON.stringify({ title: notebook.title }),
                });
              }}
              className={`bg-transparent text-sm font-semibold outline-none truncate max-w-[200px] ${
                isPaper ? "text-[var(--paper-ink)]" : "text-[var(--ink)]"
              }`}
            />
          ) : (
            <span className="text-sm font-semibold truncate">{notebook.title}</span>
          )}
          {notebook.read_only && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[var(--ink-2)]">
              Read-only
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {saveStatus === "saving" && (
            <span className="text-xs flex items-center gap-1 opacity-60">
              <Loader2 size={12} className="animate-spin" /> Saving
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs flex items-center gap-1 text-green-400">
              <Check size={12} /> Saved
            </span>
          )}

          <button
            onClick={() => setShowPreview((v) => !v)}
            className="p-2 rounded-lg opacity-70 hover:opacity-100 hidden sm:flex"
            title="Toggle preview (⌘/)"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          {isEdit && (
            <>
              <button
                onClick={() => setShareOpen(true)}
                className="p-2 rounded-lg opacity-70 hover:opacity-100"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-lg opacity-70 hover:opacity-100"
              >
                <Settings size={16} />
              </button>
            </>
          )}

          {!isEdit && editToken && (
            <Link
              href={`/e/${editToken}`}
              className="text-xs px-3 py-1.5 rounded-md font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              Edit
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            mobileSidebar ? "fixed inset-0 z-50 flex" : "hidden"
          } md:relative md:flex w-72 shrink-0 flex-col border-r ${
            isPaper ? "bg-white border-[var(--border-paper)]" : "bg-[var(--shell-2)] border-[var(--border)]"
          }`}
        >
          {mobileSidebar && (
            <div className="absolute inset-0 bg-black/40 md:hidden" onClick={() => setMobileSidebar(false)} />
          )}
          <div className="relative flex flex-col h-full w-72">
            <div className="p-3 border-b border-inherit flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pages..."
                  className={`w-full h-8 pl-8 pr-3 text-xs rounded-md outline-none ${
                    isPaper
                      ? "bg-[var(--paper-2)] border border-[var(--border-paper)]"
                      : "bg-[var(--shell-3)] border border-[var(--border)]"
                  }`}
                />
              </div>
              <button onClick={() => setMobileSidebar(false)} className="md:hidden p-1">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {filteredPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => selectPage(page)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all group ${
                    page.id === activePageId
                      ? isPaper
                        ? "bg-[var(--sticky-y)]/60 font-medium"
                        : "bg-[var(--accent)]/15 text-[var(--accent)]"
                      : "opacity-70 hover:opacity-100 hover:bg-white/5"
                  }`}
                >
                  <span>{page.icon}</span>
                  <span className="flex-1 truncate">{page.title}</span>
                  {page.pinned && <Pin size={12} className="opacity-50" />}
                  {isEdit && page.id === activePageId && (
                    <span className="hidden group-hover:flex items-center gap-1">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(page);
                        }}
                        className="p-0.5 hover:text-[var(--accent)]"
                      >
                        <Pin size={12} />
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(page.id);
                        }}
                        className="p-0.5 hover:text-red-400"
                      >
                        <Trash2 size={12} />
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {isEdit && (
              <div className="p-3 border-t border-inherit">
                <button
                  onClick={addPage}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-lg text-xs font-medium transition-all hover:brightness-110"
                  style={{
                    background: isPaper ? "var(--sticky-b)" : "rgba(249,115,22,0.15)",
                    color: isPaper ? "var(--paper-ink)" : "var(--accent)",
                  }}
                >
                  <Plus size={14} /> New page
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main editor */}
        <main className="flex-1 flex overflow-hidden">
          {isEdit ? (
            <>
              <div className={`flex-1 flex flex-col overflow-hidden ${showPreview ? "w-1/2" : "w-full"}`}>
                <div className="px-4 py-3 border-b border-inherit flex items-center gap-2">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-transparent text-lg font-semibold outline-none flex-1"
                    placeholder="Page title"
                  />
                  <button
                    onClick={() => activePageId && savePage(activePageId, { content, title })}
                    className="p-2 rounded-lg opacity-60 hover:opacity-100"
                    title="Save (⌘S)"
                  >
                    <Save size={16} />
                  </button>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write markdown here..."
                  className={`flex-1 w-full p-4 resize-none outline-none font-mono text-sm leading-relaxed ${
                    isPaper ? "bg-[var(--paper)]" : "bg-[var(--shell)]"
                  }`}
                  spellCheck={false}
                />
              </div>
              {showPreview && (
                <div
                  className={`flex-1 overflow-y-auto border-l ${
                    isPaper ? "border-[var(--border-paper)] bg-white" : "border-[var(--border)] bg-[var(--shell-2)]"
                  }`}
                >
                  <div className="p-6 max-w-3xl">
                    <h1 className="text-2xl font-bold mb-4">{title}</h1>
                    <MarkdownPreview content={content} />
                    <div className="mt-8 pt-6 border-t border-inherit">
                      <TableOfContents content={content} theme={theme} />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">{activePage?.title}</h1>
                <p className="text-xs opacity-50 mb-6">
                  {notebook.view_count} views · Updated{" "}
                  {activePage?.updated_at
                    ? new Date(activePage.updated_at).toLocaleDateString()
                    : ""}
                </p>
                <MarkdownPreview content={activePage?.content ?? ""} />
                <div className="mt-8">
                  <TableOfContents content={activePage?.content ?? ""} theme={theme} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {shareOpen && (
        <SharePanel
          notebook={notebook}
          editToken={editToken}
          onClose={() => setShareOpen(false)}
          theme={theme}
        />
      )}
      {settingsOpen && (
        <SettingsPanel
          notebook={notebook}
          editToken={editToken}
          onClose={() => setSettingsOpen(false)}
          onUpdate={setNotebook}
          theme={theme}
        />
      )}
    </div>
  );
}
