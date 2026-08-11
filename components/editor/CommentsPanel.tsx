"use client";

import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { Comment } from "@/lib/types";

const TINTS = ["sn-y", "sn-b", "sn-p", "sn-g", "sn-o"];

export default function CommentsPanel({ pageId }: { pageId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/pages/${pageId}/comments`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setComments(d.comments ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pageId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_name: name.trim() || "Anonymous", content: text.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setText("");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <section aria-label="Comments">
      <h2 className="text-[1.05rem] mb-3" style={{ fontFamily: "var(--font-sketch), serif" }}>
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {loading ? (
        <div className="py-4" style={{ color: "var(--ink-3)" }}>
          <Loader2 size={16} className="animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-[0.9rem] mb-4" style={{ color: "var(--ink-3)" }}>
          No one has said anything yet. Leave the first note.
        </p>
      ) : (
        <div className="space-y-3 mb-5">
          {comments.map((c, i) => (
            <article
              key={c.id}
              className={`sk ${TINTS[i % TINTS.length]}`}
              style={{ transform: `rotate(${i % 2 ? "0.4deg" : "-0.4deg"})` }}
            >
              <div className="sk-b" style={{ borderWidth: "1.2px" }} />
              <div className="sk-i px-4 py-3">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="text-[0.88rem]">{c.author_name}</span>
                  <span className="text-[0.75rem] shrink-0" style={{ color: "var(--ink-3)" }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[0.92rem] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  {c.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          aria-label="Your name"
          className="field text-[0.9rem] !py-2"
        />
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment"
            aria-label="Comment"
            className="field text-[0.9rem] !py-2"
          />
          <button type="submit" disabled={sending || !text.trim()} className="btn btn-b !px-3 shrink-0">
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </form>
    </section>
  );
}
