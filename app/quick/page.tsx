"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Copy, Loader2, Settings2 } from "lucide-react";
import { saveNotebook } from "@/lib/local-storage";
import { deriveTitle } from "@/lib/templates";
import { DEFAULT_EXPIRY_DAYS } from "@/lib/expiry";
import { DEFAULT_PAGE_ICON } from "@/lib/icons";
import { track } from "@/lib/analytics";
import { useTextareaEditing } from "@/lib/use-textarea-editing";

export default function QuickSharePage() {
  const [text, setText] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ viewUrl: string; editUrl: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { handleKeyDown: handleTabIndent } = useTextareaEditing(textareaRef, setText);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const title = deriveTitle(text);

  async function share(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          theme: "plain",
          font: "hand",
          allowPublicEdit: openEdit,
          expiresInDays: DEFAULT_EXPIRY_DAYS,
          pages: [{ title, icon: DEFAULT_PAGE_ICON, content: text }],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create the link");
        return;
      }

      saveNotebook({
        slug: data.notebook.slug,
        title: data.notebook.title,
        editToken: data.editToken,
        createdAt: data.notebook.created_at,
      });

      track({
        name: "notebook_created",
        props: {
          source: "quick",
          page_count: 1,
          has_password: false,
          expiry_days: DEFAULT_EXPIRY_DAYS,
          open_edit: openEdit,
        },
      });

      setResult({ viewUrl: data.viewUrl, editUrl: data.editUrl });

      // Put the shareable link on the clipboard straight away.
      try {
        await navigator.clipboard.writeText(`${window.location.origin}${data.viewUrl}`);
        setCopied("view");
        setTimeout(() => setCopied(null), 2500);
      } catch {
        /* clipboard permission denied — the copy button still works */
      }
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  if (result) {
    return (
      <div className="min-h-screen paper-dot flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-lg relative note-enter">
          <span
            className="tape tape-g"
            style={{ top: -10, left: "50%", transform: "translateX(-50%) rotate(-2deg)", width: 70, height: 18 }}
          />
          <div className="sk">
            <div className="sk-b" />
            <div className="sk-i p-7 pt-9">
              <h1 className="text-[1.7rem] leading-tight mb-1" style={{ fontFamily: "var(--font-sketch), serif" }}>
                Here&apos;s your link
              </h1>
              <p className="text-[0.92rem] mb-6" style={{ color: "var(--ink-2)" }}>
                {copied === "view" ? "Already copied to your clipboard." : "Send this to anyone."}
                {" "}It disappears in {DEFAULT_EXPIRY_DAYS} days.
              </p>

              <div className="flex gap-2 mb-5">
                <input
                  readOnly
                  value={`${origin}${result.viewUrl}`}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  aria-label="Share link"
                  className="field text-[0.82rem]"
                  style={{ fontFamily: "ui-monospace, monospace" }}
                />
                <button onClick={() => copy(`${origin}${result.viewUrl}`, "view")} className="btn !px-3 shrink-0">
                  {copied === "view" ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>

              <div
                className="p-3 mb-6"
                style={{ background: "var(--sticky-p)", border: "1.2px solid rgba(28,28,28,0.2)" }}
              >
                <p className="text-[0.82rem] mb-2">
                  Keep this edit link if you want to change the note later:
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={`${origin}${result.editUrl}`}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    aria-label="Edit link"
                    className="field text-[0.72rem] !py-1.5"
                    style={{ fontFamily: "ui-monospace, monospace" }}
                  />
                  <button
                    onClick={() => copy(`${origin}${result.editUrl}`, "edit")}
                    className="btn !px-2.5 !py-1.5 shrink-0"
                  >
                    {copied === "edit" ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href={result.editUrl} className="btn btn-ink flex-1">
                  Open it <ArrowRight size={15} />
                </Link>
                <button
                  onClick={() => {
                    setResult(null);
                    setText("");
                  }}
                  className="btn"
                >
                  Share another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-dot overflow-x-hidden px-5 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="btn-ghost !px-0 mb-6 text-[0.92rem]">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="relative">
          <span
            className="tape tape-y"
            style={{ top: -10, left: 40, transform: "rotate(-3deg)", width: 66, height: 18 }}
          />
          <form onSubmit={share} className="sk">
            <div className="sk-b" />
            <div className="sk-i p-6 sm:p-8 pt-9">
              <h1 className="text-[1.8rem] leading-tight" style={{ fontFamily: "var(--font-sketch), serif" }}>
                Paste and share
              </h1>
              <p className="text-[0.93rem] mb-5" style={{ color: "var(--ink-2)" }}>
                Drop your text in, press the button, get a link. We&apos;ll name it and pick
                an address for you.
              </p>

              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleTabIndent}
                placeholder={"Paste anything here.\n\nMarkdown works — # headings, **bold**, - lists, `code`."}
                rows={12}
                autoFocus
                aria-label="Note contents"
                className="field resize-y text-[0.9rem] leading-[1.7] mb-3"
                style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}
              />

              {text.trim() && (
                <p className="text-[0.84rem] mb-4" style={{ color: "var(--ink-3)" }}>
                  It&apos;ll be called <span style={{ color: "var(--ink)" }}>“{title}”</span> —
                  you can rename it after.
                </p>
              )}

              <label className="flex items-start gap-2.5 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={openEdit}
                  onChange={(e) => setOpenEdit(e.target.checked)}
                  className="mt-1"
                  style={{ accentColor: "var(--red)" }}
                />
                <span>
                  <span className="text-[0.92rem] block">Let anyone with the link edit it</span>
                  <span className="text-[0.8rem]" style={{ color: "var(--ink-3)" }}>
                    Good for a shared scratchpad. Off means read-only for everyone but you.
                  </span>
                </span>
              </label>

              {error && (
                <p className="text-[0.9rem] mb-4" style={{ color: "var(--red)" }}>
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" disabled={loading || !text.trim()} className="btn btn-ink text-[1.02rem]">
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Get my link <ArrowRight size={15} />
                    </>
                  )}
                </button>
                <Link href="/new" className="btn-ghost text-[0.9rem]">
                  <Settings2 size={14} /> I want to choose the settings
                </Link>
              </div>

              <p className="text-[0.82rem] mt-5" style={{ color: "var(--ink-3)" }}>
                No account is created, and this is not end-to-end encrypted.{" "}
                <Link href="/privacy" className="underline">
                  What happens to what you write
                </Link>
                .
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
