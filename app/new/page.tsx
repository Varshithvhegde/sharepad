"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { saveNotebook } from "@/lib/local-storage";
import { slugify } from "@/lib/slug";

export default function NewNotebookPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState<"dark" | "paper">("dark");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ editUrl: string; editToken: string; viewUrl: string; slug: string } | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: customSlug.trim() || undefined,
          password: password.trim() || undefined,
          theme,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create");
        return;
      }

      saveNotebook({
        slug: data.notebook.slug,
        title: data.notebook.title,
        editToken: data.editToken,
        createdAt: data.notebook.created_at,
      });

      setCreated({
        editUrl: data.editUrl,
        editToken: data.editToken,
        viewUrl: data.viewUrl,
        slug: data.notebook.slug,
      });
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div className="min-h-screen bg-[var(--shell)] bg-dot-grid flex items-center justify-center px-6">
        <div className="w-full max-w-lg p-8 rounded-2xl animate-fade-up bg-[var(--shell-2)] border border-[var(--border)]">
          <div className="text-center mb-6">
            <Sparkles className="mx-auto mb-3 text-[var(--accent)]" size={32} />
            <h1 className="text-xl font-semibold mb-2">Notebook created!</h1>
            <p className="text-sm text-[var(--ink-2)]">
              Save your edit link below — it&apos;s the only way to manage this notebook.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs text-[var(--ink-2)] mb-1 block">Edit link (keep secret)</label>
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}${created.editUrl}`}
                className="w-full text-xs px-3 py-2.5 rounded-lg bg-[var(--shell-3)] border border-[var(--border)] outline-none"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--ink-2)] mb-1 block">View link (share freely)</label>
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}${created.viewUrl}`}
                className="w-full text-xs px-3 py-2.5 rounded-lg bg-[var(--shell-3)] border border-[var(--border)] outline-none"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
          </div>

          <button
            onClick={() => router.push(created.editUrl)}
            className="w-full h-11 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Open editor →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--shell)] bg-dot-grid flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--ink-2)] hover:text-[var(--ink)] mb-8">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="p-8 rounded-2xl bg-[var(--shell-2)] border border-[var(--border)] animate-fade-up">
          <h1 className="text-xl font-semibold mb-1">New notebook</h1>
          <p className="text-sm text-[var(--ink-2)] mb-6">No signup needed. Takes 5 seconds.</p>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs text-[var(--ink-2)] mb-1 block">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Project Notes"
                autoFocus
                className="w-full h-10 px-3 rounded-lg text-sm bg-[var(--shell-3)] border border-[var(--border)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="text-xs text-[var(--ink-2)] mb-1 block">Custom URL (optional)</label>
              <div className="flex items-center gap-0">
                <span className="text-xs text-[var(--ink-3)] px-3 h-10 flex items-center bg-[var(--shell-3)] border border-r-0 border-[var(--border)] rounded-l-lg">
                  /n/
                </span>
                <input
                  value={customSlug}
                  onChange={(e) => setCustomSlug(slugify(e.target.value))}
                  placeholder={title ? slugify(title) : "my-notes"}
                  className="flex-1 h-10 px-3 rounded-r-lg text-sm bg-[var(--shell-3)] border border-[var(--border)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--ink-2)] mb-1 block">Password (optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty for no password"
                className="w-full h-10 px-3 rounded-lg text-sm bg-[var(--shell-3)] border border-[var(--border)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="text-xs text-[var(--ink-2)] mb-1 block">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as "dark" | "paper")}
                className="w-full h-10 px-3 rounded-lg text-sm bg-[var(--shell-3)] border border-[var(--border)] outline-none"
              >
                <option value="dark">Dark (BillForge style)</option>
                <option value="paper">Paper (PostItUp style)</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full h-11 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Create notebook"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
