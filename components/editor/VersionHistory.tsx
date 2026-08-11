"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, X } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { PageVersion } from "@/lib/types";

interface VersionHistoryProps {
  pageId: string;
  editToken: string;
  onRestore: (content: string) => void;
  onClose: () => void;
}

export default function VersionHistory({
  pageId,
  editToken,
  onRestore,
  onClose,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pages/${pageId}/versions`, { headers: { "X-Edit-Token": editToken } })
      .then((r) => r.json())
      .then((d) => setVersions(d.versions ?? []))
      .finally(() => setLoading(false));
  }, [pageId, editToken]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(28,28,28,0.35)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm h-full flex flex-col paper-plain animate-slide-in"
        style={{ borderLeft: "1.8px solid var(--ink)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ borderBottom: "1.5px solid rgba(28,28,28,0.16)" }}
        >
          <h2 className="text-[1.25rem]" style={{ fontFamily: "var(--font-sketch), serif" }}>
            Earlier drafts
          </h2>
          <button onClick={onClose} className="btn-ghost !px-2" aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12" style={{ color: "var(--ink-3)" }}>
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-[0.92rem] text-center py-12" style={{ color: "var(--ink-3)" }}>
              Nothing here yet. Drafts are kept each time you edit this page.
            </p>
          ) : (
            versions.map((v, i) => (
              <article key={v.id} className="sk" style={{ transform: `rotate(${i % 2 ? "0.4deg" : "-0.4deg"})` }}>
                <div className="sk-b" style={{ borderWidth: "1.2px" }} />
                <div className="sk-i p-3.5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[0.78rem]" style={{ color: "var(--ink-3)" }}>
                      {formatDateTime(v.created_at)}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm("Put this draft back? Your current text is saved to history first.")) {
                          onRestore(v.content);
                          onClose();
                        }
                      }}
                      className="btn-ghost !px-1.5 !py-0.5 text-[0.82rem] shrink-0"
                      style={{ color: "var(--red)" }}
                    >
                      <RotateCcw size={11} /> Restore
                    </button>
                  </div>
                  <p
                    className="text-[0.8rem] leading-relaxed line-clamp-4 whitespace-pre-wrap"
                    style={{ color: "var(--ink-2)", fontFamily: "ui-monospace, monospace" }}
                  >
                    {v.content.slice(0, 220) || "(empty)"}
                    {v.content.length > 220 ? "…" : ""}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
