"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  FileCode,
  FileText,
  Files,
  History,
  Loader2,
  Menu,
  Pencil,
  Pin,
  Printer,
  Search,
  Settings as SettingsIcon,
  Share2,
  SquareSplitHorizontal,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import MarkdownPreview from "@/components/MarkdownPreview";
import TableOfContents from "@/components/TableOfContents";
import SharePanel from "@/components/SharePanel";
import SettingsPanel from "@/components/SettingsPanel";
import MarkdownToolbar, { insertMarkdown } from "@/components/editor/MarkdownToolbar";
import CommentsPanel from "@/components/editor/CommentsPanel";
import VersionHistory from "@/components/editor/VersionHistory";
import FormattingHelp from "@/components/editor/FormattingHelp";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import Tooltip from "@/components/ui/Tooltip";
import { sortPages } from "@/lib/notebooks";
import { saveNotebook, useStoredFlag } from "@/lib/local-storage";
import { PAGE_TEMPLATES } from "@/lib/templates";
import { ItemIcon, PAGE_ICON_IDS, iconLabel } from "@/lib/icons";
import { expiryLabel, expiringSoon } from "@/lib/expiry";
import { useIsNarrow } from "@/lib/use-media-query";
import { fontClass } from "@/lib/fonts";
import { formatDate } from "@/lib/format";
import { buildAnchors, mapScroll, type Anchor } from "@/lib/scroll-sync";
import { track } from "@/lib/analytics";
import type { Notebook, Page } from "@/lib/types";

type ViewMode = "write" | "split" | "read";

const TAB_TINTS = ["sn-y", "sn-b", "sn-p", "sn-g", "sn-o"];

const TEXTURE_CLASS: Record<string, string> = {
  ruled: "paper-ruled",
  grid: "paper-grid",
  dot: "paper-dot",
  plain: "paper-plain",
};

interface NotebookEditorProps {
  notebook: Notebook;
  pages: Page[];
  editToken: string;
  mode: "edit" | "view";
}

function readingStats(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { words, minutes: Math.max(1, Math.round(words / 220)) };
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
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [templateMenu, setTemplateMenu] = useState(false);
  const [iconMenu, setIconMenu] = useState(false);
  const [downloadMenu, setDownloadMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [dismissedExpiry, setDismissedExpiry] = useState(false);

  const [syncScroll, setSyncScroll] = useStoredFlag("sharepad_sync_scroll", true);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Which pane started the current scroll, so the echo back doesn't fight it.
  const scrollLead = useRef<"editor" | "preview" | null>(null);
  const scrollRelease = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorCache = useRef<{ key: string; anchors: Anchor[] } | null>(null);
  const { toasts, show: toast, dismiss } = useToast();
  const { ask, dialog: confirmDialog } = useConfirm();

  /*
   * Re-parsing a long document on every keystroke blocks the keypress itself,
   * which reads as the preview freezing. Deferring lets typing stay ahead and
   * the preview catch up a beat later.
   */
  const previewContent = useDeferredValue(content);

  const isOwner = mode === "edit";
  // Visitors can edit too when the owner has opened the notebook up.
  const isEdit = (isOwner || notebook.allow_public_edit) && !notebook.read_only;

  /*
   * Two panes side by side need room there isn't on a phone, so split collapses
   * to writing. The stored preference is left alone, so turning a tablet back to
   * landscape restores the split without the reader having to ask for it again.
   */
  const isNarrow = useIsNarrow();
  const activeMode: ViewMode = isNarrow && viewMode === "split" ? "write" : viewMode;
  const activePage = pages.find((p) => p.id === activePageId);
  const stats = readingStats(isEdit ? content : activePage?.content ?? "");
  const paperClass = TEXTURE_CLASS[notebook.theme] ?? "paper-plain";
  const typeClass = fontClass(notebook.font);

  // Requests carry the token only when we actually have one.
  const authHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (editToken) headers["X-Edit-Token"] = editToken;
    return headers;
  }, [editToken]);

  useEffect(() => {
    if (mode === "edit" && editToken) {
      saveNotebook({
        slug: notebook.slug,
        title: notebook.title,
        editToken,
        createdAt: notebook.created_at,
      });
    }
  }, [mode, editToken, notebook.slug, notebook.title, notebook.created_at]);

  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages;
    const q = search.toLowerCase();
    return pages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
    );
  }, [pages, search]);

  const selectPage = useCallback((page: Page) => {
    setActivePageId(page.id);
    setContent(page.content);
    setTitle(page.title);
    setSidebarOpen(false);
    // Start a new page at the top rather than wherever the last one was left.
    scrollLead.current = null;
    if (textareaRef.current) textareaRef.current.scrollTop = 0;
    if (previewRef.current) previewRef.current.scrollTop = 0;
  }, []);

  const mirrorScroll = useCallback(
    (from: "editor" | "preview") => {
      if (!syncScroll || activeMode !== "split") return;
      // Ignore the scroll event our own mirroring just caused.
      if (scrollLead.current && scrollLead.current !== from) return;

      const editor = textareaRef.current;
      const preview = previewRef.current;
      if (!editor || !preview) return;

      const source = from === "editor" ? editor : preview;
      const target = from === "editor" ? preview : editor;

      const sourceRange = source.scrollHeight - source.clientHeight;
      const targetRange = target.scrollHeight - target.clientHeight;
      if (sourceRange <= 0 || targetRange <= 0) return;

      // Measuring every heading is costly, so hold onto it until something moves.
      const key = `${content.length}:${editor.clientWidth}:${preview.clientWidth}:${preview.scrollHeight}`;
      if (anchorCache.current?.key !== key) {
        anchorCache.current = { key, anchors: buildAnchors(editor, preview, content) };
      }

      scrollLead.current = from;
      target.scrollTop = mapScroll(
        source.scrollTop,
        anchorCache.current.anchors,
        sourceRange,
        targetRange,
        from === "editor" ? "toPreview" : "toSource"
      );

      if (scrollRelease.current) clearTimeout(scrollRelease.current);
      scrollRelease.current = setTimeout(() => {
        scrollLead.current = null;
      }, 120);
    },
    [syncScroll, activeMode, content]
  );

  const savePage = useCallback(
    async (pageId: string, updates: Partial<Pick<Page, "content" | "title" | "icon">>) => {
      if (!isEdit) return false;
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/pages/${pageId}`, {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (res.ok && data.page) {
          setPages((prev) => sortPages(prev.map((p) => (p.id === pageId ? data.page : p))));
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 1800);
          return true;
        }
        toast("That change didn't save. Check your connection.", "error");
      } catch {
        toast("That change didn't save. Check your connection.", "error");
      }
      setSaveStatus("idle");
      return false;
    },
    [authHeaders, isEdit, toast]
  );

  useEffect(() => {
    if (!isEdit || !activePageId || !activePage) return;
    if (content === activePage.content && title === activePage.title) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      savePage(activePageId, { content, title });
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content, title, activePageId, activePage, isEdit, savePage]);

  const applyFormat = useCallback(
    (before: string, after = "", placeholder = "") => {
      const ta = textareaRef.current;
      if (!ta) return;
      const { updated, cursorStart, cursorEnd } = insertMarkdown(
        content,
        ta.selectionStart,
        ta.selectionEnd,
        before,
        after,
        placeholder
      );
      setContent(updated);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(cursorStart, cursorEnd);
      });
    },
    [content]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      const typing = ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName);

      if (mod && e.key === "s") {
        e.preventDefault();
        if (activePageId) savePage(activePageId, { content, title });
      } else if (mod && e.key === "b") {
        e.preventDefault();
        applyFormat("**", "**", "bold");
      } else if (mod && e.key === "i") {
        e.preventDefault();
        applyFormat("*", "*", "italic");
      } else if (mod && e.key === "/") {
        e.preventDefault();
        setViewMode((v) => (v === "split" ? "read" : v === "read" ? "write" : "split"));
      } else if (e.key === "?" && !typing) {
        e.preventDefault();
        setShortcutsOpen(true);
      } else if (e.key === "Escape") {
        setShortcutsOpen(false);
        setTemplateMenu(false);
        setIconMenu(false);
        setDownloadMenu(false);
      }
      // The formatting sheet closes itself, so it is not listed here.
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePageId, content, title, savePage, applyFormat]);

  async function addPage(templateId: string) {
    const tpl = PAGE_TEMPLATES.find((t) => t.id === templateId) ?? PAGE_TEMPLATES[0];
    setTemplateMenu(false);
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        notebook_id: notebook.id,
        title: tpl.title,
        content: tpl.content,
        icon: tpl.icon,
      }),
    });
    const data = await res.json();
    if (res.ok && data.page) {
      setPages((prev) => sortPages([...prev, data.page]));
      selectPage(data.page);
      track({ name: "page_added", props: { template: tpl.id } });
      toast("Page added", "success");
    } else {
      toast(data.error ?? "Could not add the page", "error");
    }
  }

  async function duplicatePage(page: Page) {
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        notebook_id: notebook.id,
        title: `${page.title} copy`,
        content: page.content,
        icon: page.icon,
      }),
    });
    const data = await res.json();
    if (res.ok && data.page) {
      setPages((prev) => sortPages([...prev, data.page]));
      selectPage(data.page);
      track({ name: "page_duplicated", props: {} });
      toast("Page duplicated", "success");
    }
  }

  async function deletePage(page: Page) {
    if (pages.length <= 1) {
      toast("A notebook needs at least one page", "error");
      return;
    }

    const ok = await ask({
      title: `Delete “${page.title}”?`,
      message:
        "The page and its earlier drafts go with it. Everything else in the notebook stays.",
      confirmLabel: "Delete page",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/pages/${page.id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (res.ok) {
      const remaining = pages.filter((p) => p.id !== page.id);
      setPages(sortPages(remaining));
      track({ name: "page_deleted", props: {} });
      if (activePageId === page.id && remaining[0]) selectPage(remaining[0]);
      toast("Page deleted", "success");
    }
  }

  async function movePage(page: Page, direction: -1 | 1) {
    const index = pages.findIndex((p) => p.id === page.id);
    const target = index + direction;
    if (target < 0 || target >= pages.length) return;
    const other = pages[target];

    setPages((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((p, i) => ({ ...p, sort_order: i }));
    });

    await Promise.all([
      fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ sort_order: other.sort_order }),
      }),
      fetch(`/api/pages/${other.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ sort_order: page.sort_order }),
      }),
    ]);
  }

  async function togglePin(page: Page) {
    const res = await fetch(`/api/pages/${page.id}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ pinned: !page.pinned }),
    });
    const data = await res.json();
    if (res.ok) {
      setPages((prev) => sortPages(prev.map((p) => (p.id === page.id ? data.page : p))));
    }
  }

  function importMarkdown(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setContent((ev.target?.result as string) ?? "");
      toast(`Loaded ${file.name}`, "success");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const showExpiryWarning = expiringSoon(notebook.expires_at) && !dismissedExpiry;

  return (
    // Pinned to the viewport so the panes scroll rather than the whole document.
    <div className="h-dvh flex flex-col overflow-hidden paper-dot">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* ── Header ── */}
      <header
        className="relative z-40 flex items-center gap-2 px-3 sm:px-4 h-14 shrink-0 no-print"
        style={{
          borderBottom: "1.5px solid rgba(28,28,28,0.16)",
          background: "rgba(250,249,246,0.94)",
          backdropFilter: "blur(6px)",
        }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="btn-ghost lg:hidden !px-2"
          aria-label="Show pages"
        >
          <Menu size={18} />
        </button>

        <Link href="/" className="hidden sm:block shrink-0 text-[1.15rem]" style={{ fontFamily: "var(--font-sketch), serif" }}>
          SharePad
        </Link>

        <span className="hidden sm:block h-5 w-px shrink-0" style={{ background: "rgba(28,28,28,0.18)" }} />

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <ItemIcon name={notebook.emoji} size={18} className="shrink-0" />
          {isEdit ? (
            <input
              value={notebook.title}
              onChange={(e) => setNotebook({ ...notebook, title: e.target.value })}
              onBlur={() =>
                fetch(`/api/notebooks/${notebook.id}`, {
                  method: "PATCH",
                  headers: authHeaders,
                  body: JSON.stringify({ title: notebook.title }),
                })
              }
              aria-label="Notebook title"
              className="bg-transparent outline-none truncate min-w-0 flex-1 text-[1rem]"
            />
          ) : (
            <span className="truncate text-[1rem]">{notebook.title}</span>
          )}

          {notebook.read_only && <span className="stamp hidden sm:inline-flex">Read only</span>}
          {notebook.has_password && <span className="stamp hidden sm:inline-flex">🔒</span>}
        </div>

        {isEdit && (
          <div className="flex items-center shrink-0" style={{ border: "1.5px solid rgba(28,28,28,0.25)" }}>
            {(
              [
                { id: "write", label: "Write", Icon: Pencil },
                // Split needs two panes' worth of width, so it is offered only
                // where it can actually be honoured.
                ...(isNarrow
                  ? []
                  : [{ id: "split", label: "Split", Icon: SquareSplitHorizontal } as const]),
                { id: "read", label: "Read", Icon: Eye },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                aria-pressed={activeMode === id}
                aria-label={label}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[0.85rem] transition-colors"
                style={{
                  background: activeMode === id ? "var(--ink)" : "transparent",
                  color: activeMode === id ? "var(--paper)" : "var(--ink-2)",
                }}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <span className="hidden sm:flex items-center text-[0.8rem] w-16 justify-end" style={{ color: "var(--ink-3)" }}>
            {saveStatus === "saving" && (
              <>
                <Loader2 size={11} className="animate-spin mr-1" /> Saving
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check size={11} className="mr-1" /> Saved
              </>
            )}
          </span>

          <div className="relative">
            <Tooltip label="Download" align="end">
              <button
                onClick={() => setDownloadMenu((v) => !v)}
                className="btn-ghost"
                aria-label="Download"
                aria-expanded={downloadMenu}
                aria-haspopup="menu"
              >
                <Download size={16} />
              </button>
            </Tooltip>
            {downloadMenu && (
              // .sk is position:relative, so the offset lives on a wrapper.
              <div className="absolute top-full right-0 mt-1 z-30 w-52">
                <div className="sk" style={{ background: "#fff" }}>
                  <div className="sk-b" />
                  <div className="sk-i py-1">
                  <a
                    href={`/n/${notebook.slug}/print`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      track({ name: "export_started", props: { format: "pdf" } });
                      setDownloadMenu(false);
                    }}
                    className="flex items-start gap-2.5 px-3 py-2 hover:bg-[var(--paper-2)]"
                  >
                    <FileText size={14} className="mt-0.5 shrink-0" />
                    <span>
                      <span className="block text-[0.9rem]">PDF</span>
                      <span className="block text-[0.76rem]" style={{ color: "var(--ink-3)" }}>
                        Every page, formatted for print
                      </span>
                    </span>
                  </a>
                  <a
                    href={`/api/export/${notebook.slug}`}
                    download
                    onClick={() => {
                      track({ name: "export_started", props: { format: "markdown" } });
                      setDownloadMenu(false);
                    }}
                    className="flex items-start gap-2.5 px-3 py-2 hover:bg-[var(--paper-2)]"
                  >
                    <FileCode size={14} className="mt-0.5 shrink-0" />
                    <span>
                      <span className="block text-[0.9rem]">Markdown</span>
                      <span className="block text-[0.76rem]" style={{ color: "var(--ink-3)" }}>
                        One .md file
                      </span>
                    </span>
                  </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isEdit && (
            <Tooltip label="Share" align="end">
              <button onClick={() => setShareOpen(true)} className="btn-ghost" aria-label="Share">
                <Share2 size={16} />
              </button>
            </Tooltip>
          )}
          {isOwner && (
            <Tooltip label="Settings" align="end">
              <button
                onClick={() => setSettingsOpen(true)}
                className="btn-ghost"
                aria-label="Settings"
              >
                <SettingsIcon size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      </header>

      {/* Visitors need to know why they can type in someone else's notebook. */}
      {!isOwner && isEdit && (
        <div
          className="flex items-center gap-2 px-4 py-2 text-[0.86rem] shrink-0 no-print"
          style={{ background: "var(--sticky-b)", borderBottom: "1.5px solid rgba(28,28,28,0.16)" }}
        >
          <Users size={14} className="shrink-0" />
          <span>The owner left this notebook open — anything you write is saved for everyone.</span>
        </div>
      )}

      {/* ── Expiry warning ── */}
      {showExpiryWarning && (
        <div
          className="flex items-center gap-3 px-4 py-2 text-[0.88rem] shrink-0 no-print"
          style={{ background: "var(--sticky-o)", borderBottom: "1.5px solid rgba(28,28,28,0.16)" }}
        >
          <span>
            This notebook deletes itself in {expiryLabel(notebook.expires_at).replace(" left", "")}.
          </span>
          {isEdit && (
            <button onClick={() => setSettingsOpen(true)} className="underline shrink-0">
              Give it longer
            </button>
          )}
          <button
            onClick={() => setDismissedExpiry(true)}
            className="ml-auto btn-ghost !px-1 !py-0.5"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* ── Page index ── */}
        <aside
          className={`${
            sidebarOpen ? "fixed inset-0 z-50 flex" : "hidden"
          } lg:relative lg:flex lg:z-auto shrink-0 no-print`}
        >
          {sidebarOpen && (
            <div className="absolute inset-0 lg:hidden" style={{ background: "rgba(28,28,28,0.35)" }} onClick={() => setSidebarOpen(false)} />
          )}

          <div
            className="relative flex flex-col h-full w-[min(18rem,82vw)] lg:w-72 paper-plain"
            style={{ borderRight: "1.5px solid rgba(28,28,28,0.16)" }}
          >
            <div className="p-3 flex items-center gap-2" style={{ borderBottom: "1.5px solid rgba(28,28,28,0.12)" }}>
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-3)" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a page"
                  aria-label="Search pages"
                  className="field !py-1.5 !pl-8 text-[0.86rem]"
                />
              </div>
              <button onClick={() => setSidebarOpen(false)} className="btn-ghost lg:hidden !px-2" aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {filteredPages.length === 0 && (
                <p className="text-[0.85rem] px-2 py-6 text-center" style={{ color: "var(--ink-3)" }}>
                  Nothing matches “{search}”.
                </p>
              )}

              {filteredPages.map((page, i) => {
                const active = page.id === activePageId;
                return (
                  <div
                    key={page.id}
                    className={`sk group ${active ? TAB_TINTS[i % TAB_TINTS.length] : ""}`}
                    style={{
                      transform: active ? "rotate(0deg)" : `rotate(${i % 2 ? "0.5deg" : "-0.5deg"})`,
                      boxShadow: active
                        ? "4px 4px 0 rgba(28,28,28,0.18)"
                        : "2px 2px 0 rgba(28,28,28,0.08)",
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                  >
                    <div className="sk-b" style={{ borderWidth: active ? "1.8px" : "1.2px", opacity: active ? 1 : 0.45 }} />
                    <div className="sk-i">
                      <button
                        onClick={() => selectPage(page)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[0.92rem]"
                      >
                        <ItemIcon name={page.icon} size={14} className="shrink-0" />
                        <span className="truncate flex-1">{page.title}</span>
                        {page.pinned && <Pin size={11} style={{ color: "var(--red)" }} />}
                      </button>

                      {isEdit && (
                        // Touch has no hover, so the page you are on always shows
                        // its actions; the rest reveal on hover as before.
                        <div
                          className={`${active ? "flex" : "hidden"} group-hover:flex items-center gap-0.5 px-2 pb-1.5`}
                          style={{ borderTop: "1px dashed rgba(28,28,28,0.15)", paddingTop: 4 }}
                        >
                          <button onClick={() => movePage(page, -1)} className="btn-ghost !px-1 !py-0.5" title="Move up">
                            <ChevronUp size={12} />
                          </button>
                          <button onClick={() => movePage(page, 1)} className="btn-ghost !px-1 !py-0.5" title="Move down">
                            <ChevronDown size={12} />
                          </button>
                          <button onClick={() => togglePin(page)} className="btn-ghost !px-1 !py-0.5" title={page.pinned ? "Unpin" : "Pin to top"}>
                            <Pin size={12} />
                          </button>
                          <button onClick={() => duplicatePage(page)} className="btn-ghost !px-1 !py-0.5" title="Duplicate">
                            <Files size={12} />
                          </button>
                          <button
                            onClick={() => deletePage(page)}
                            className="btn-ghost !px-1 !py-0.5 ml-auto"
                            title="Delete"
                            style={{ color: "var(--red)" }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {isEdit && (
              <div className="p-3 relative" style={{ borderTop: "1.5px solid rgba(28,28,28,0.12)" }}>
                {templateMenu && (
                  <div
                    className="absolute bottom-full left-3 right-3 mb-2 z-10"
                  >
                    <div className="sk" style={{ background: "#fff" }}>
                      <div className="sk-b" />
                      <div className="sk-i py-1">
                        {PAGE_TEMPLATES.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => addPage(t.id)}
                            className="w-full text-left px-3 py-2 text-[0.9rem] hover:bg-[var(--paper-2)] flex items-center gap-2"
                          >
                            <ItemIcon name={t.icon} size={14} /> {t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setTemplateMenu((v) => !v)}
                  className="btn btn-y w-full text-[0.95rem] !py-2"
                  aria-expanded={templateMenu}
                >
                  New page
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── Page ── */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div
            // No overflow here: a non-visible overflow-x forces overflow-y to
            // auto, which clips the icon menu that opens below this row.
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 shrink-0 no-print"
            style={{ borderBottom: "1.5px solid rgba(28,28,28,0.12)" }}
          >
            {isEdit && activePage && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIconMenu((v) => !v)}
                  className="btn-ghost !px-1.5"
                  aria-label="Change page icon"
                  aria-expanded={iconMenu}
                >
                  <ItemIcon name={activePage.icon} size={17} />
                </button>
                {iconMenu && (
                  <div className="absolute top-full left-0 mt-1 z-30">
                    <div className="sk" style={{ background: "#fff" }}>
                      <div className="sk-b" />
                      <div className="sk-i grid grid-cols-8 gap-0.5 p-2 w-[17rem]">
                        {PAGE_ICON_IDS.map((id) => (
                          <button
                            key={id}
                            onClick={async () => {
                              await savePage(activePage.id, { icon: id });
                              setIconMenu(false);
                            }}
                            aria-label={iconLabel(id)}
                            title={iconLabel(id)}
                            className="p-2 flex items-center justify-center hover:bg-[var(--paper-2)]"
                            style={
                              activePage.icon === id
                                ? { background: "var(--sticky-y)" }
                                : undefined
                            }
                          >
                            <ItemIcon name={id} size={16} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isEdit ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page title"
                aria-label="Page title"
                className="bg-transparent outline-none flex-1 min-w-0 text-[1.3rem]"
                style={{ fontFamily: "var(--font-sketch), serif" }}
              />
            ) : (
              <h1
                className="flex-1 truncate text-[1.3rem] flex items-center gap-2"
                style={{ fontFamily: "var(--font-sketch), serif" }}
              >
                <ItemIcon name={activePage?.icon} size={17} className="shrink-0" />
                <span className="truncate">{activePage?.title}</span>
              </h1>
            )}

            <span className="hidden md:inline text-[0.78rem] shrink-0" style={{ color: "var(--ink-3)" }}>
              {stats.words} words · {stats.minutes} min read
            </span>

            <div className="flex items-center gap-0.5 shrink-0">
              {isEdit && activeMode === "split" && (
                <Tooltip label={syncScroll ? "Scrolling is linked" : "Scrolling is independent"}>
                  <button
                    onClick={() => setSyncScroll(!syncScroll)}
                    aria-pressed={syncScroll}
                    aria-label="Link scrolling between the panes"
                    className="btn-ghost !px-1.5 hidden sm:flex"
                    style={
                      syncScroll
                        ? { background: "var(--sticky-y)", borderColor: "rgba(28,28,28,0.25)" }
                        : undefined
                    }
                  >
                    <ArrowDownUp size={14} />
                  </button>
                </Tooltip>
              )}

              {isEdit && activePage && (
                <>
                  <Tooltip label="Import a .md file">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-ghost !px-1.5"
                      aria-label="Import a markdown file"
                    >
                      <Upload size={14} />
                    </button>
                  </Tooltip>
                  <Tooltip label="Earlier drafts">
                    <button
                      onClick={() => setHistoryOpen(true)}
                      className="btn-ghost !px-1.5"
                      aria-label="Earlier drafts"
                    >
                      <History size={14} />
                    </button>
                  </Tooltip>
                </>
              )}
              <Tooltip label="Copy markdown">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(isEdit ? content : activePage?.content ?? "");
                    toast("Markdown copied", "success");
                  }}
                  className="btn-ghost !px-1.5"
                  aria-label="Copy markdown"
                >
                  <Copy size={14} />
                </button>
              </Tooltip>
              <Tooltip label="Print or save as PDF" align="end">
                <a
                  href={`/n/${notebook.slug}/print`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost !px-1.5"
                  aria-label="Print or save as PDF"
                >
                  <Printer size={14} />
                </a>
              </Tooltip>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
            className="hidden"
            onChange={importMarkdown}
          />

          <div className="flex flex-1 overflow-hidden">
            {isEdit && (activeMode === "write" || activeMode === "split") && (
              <div
                className={`flex flex-col overflow-hidden ${activeMode === "split" ? "w-1/2" : "w-full"}`}
                style={activeMode === "split" ? { borderRight: "1.5px solid rgba(28,28,28,0.12)" } : undefined}
              >
                <MarkdownToolbar onInsert={applyFormat} onShowHelp={() => setHelpOpen(true)} />
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing…"
                  aria-label="Markdown source"
                  spellCheck
                  onScroll={() => mirrorScroll("editor")}
                  className={`flex-1 w-full p-5 resize-none outline-none text-[0.92rem] leading-[1.8] ${paperClass}`}
                  style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}
                />
              </div>
            )}

            {(!isEdit || activeMode === "split" || activeMode === "read") && (
              <div
                ref={previewRef}
                onScroll={() => mirrorScroll("preview")}
                className={`flex-1 overflow-y-auto ${paperClass} ${typeClass}`}
              >
                {/* The rule belongs to the text column, so it stays beside the words. */}
                <div className="margin-rule min-h-full mx-auto w-full max-w-3xl">
                  <div className="pl-12 pr-5 sm:pl-16 sm:pr-10 py-8">

                    {!isOwner && (
                      <p className="text-[0.8rem] mb-6" style={{ color: "var(--ink-3)" }}>
                        {notebook.view_count} {notebook.view_count === 1 ? "view" : "views"}
                        {activePage?.updated_at && ` · updated ${formatDate(activePage.updated_at)}`}
                        {notebook.expires_at && ` · ${expiryLabel(notebook.expires_at)}`}
                      </p>
                    )}

                    <MarkdownPreview content={isEdit ? previewContent : activePage?.content ?? ""} />

                    <div className="mt-12 pt-6 space-y-10" style={{ borderTop: "1.5px dashed var(--rule)" }}>
                      <TableOfContents content={isEdit ? previewContent : activePage?.content ?? ""} />
                      {notebook.allow_comments && activePageId && (
                        <CommentsPanel pageId={activePageId} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {shareOpen && (
        <SharePanel notebook={notebook} editToken={editToken} onClose={() => setShareOpen(false)} />
      )}
      {settingsOpen && (
        <SettingsPanel
          notebook={notebook}
          editToken={editToken}
          onClose={() => setSettingsOpen(false)}
          onUpdate={setNotebook}
        />
      )}
      {historyOpen && activePageId && (
        <VersionHistory
          pageId={activePageId}
          editToken={editToken}
          onClose={() => setHistoryOpen(false)}
          onRestore={(restored) => {
            setContent(restored);
            savePage(activePageId, { content: restored });
            toast("Draft restored", "success");
          }}
        />
      )}
      {shortcutsOpen && <ShortcutSheet onClose={() => setShortcutsOpen(false)} />}
      {helpOpen && <FormattingHelp onClose={() => setHelpOpen(false)} />}
      {confirmDialog}
    </div>
  );
}

function ShortcutSheet({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    ["⌘S", "Save now"],
    ["⌘B", "Bold"],
    ["⌘I", "Italic"],
    ["⌘/", "Cycle write / split / read"],
    ["?", "Open this list"],
    ["Esc", "Close anything open"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(28,28,28,0.4)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-sm relative note-enter" onClick={(e) => e.stopPropagation()}>
        <span
          className="tape tape-b"
          style={{ top: -9, left: "50%", transform: "translateX(-50%) rotate(-2deg)", width: 58, height: 16 }}
        />
        <div className="sk">
          <div className="sk-b" />
          <div className="sk-i p-6 pt-8">
            <h2 className="text-[1.4rem] mb-4" style={{ fontFamily: "var(--font-sketch), serif" }}>
              Shortcuts
            </h2>
            <dl className="space-y-2.5">
              {rows.map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <dt className="text-[0.92rem]" style={{ color: "var(--ink-2)" }}>
                    {desc}
                  </dt>
                  <dd
                    className="text-[0.78rem] px-2 py-0.5 shrink-0"
                    style={{
                      background: "var(--paper-2)",
                      border: "1.2px solid rgba(28,28,28,0.2)",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    {key}
                  </dd>
                </div>
              ))}
            </dl>
            <button onClick={onClose} className="btn btn-ink w-full mt-6">
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
