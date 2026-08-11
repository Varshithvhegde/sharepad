"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Link2,
  Lock,
  Layers,
  Code2,
  Zap,
  Share2,
  Clock,
  MessageSquare,
} from "lucide-react";
import { getSavedNotebooks } from "@/lib/local-storage";
import type { SavedNotebook } from "@/lib/types";

const features = [
  { icon: Layers, title: "Multi-page notebooks", desc: "One link, unlimited markdown pages" },
  { icon: Link2, title: "Custom URLs", desc: "Pick your slug: /n/my-project-notes" },
  { icon: Lock, title: "Password lock", desc: "Optional password to protect views" },
  { icon: FileText, title: "Live markdown", desc: "Split editor with GFM preview" },
  { icon: Share2, title: "Separate edit link", desc: "Share read-only, keep edit secret" },
  { icon: Code2, title: "Embed anywhere", desc: "iframe + script tag like PostItUp" },
  { icon: Clock, title: "Auto-expire", desc: "Self-destruct after N days" },
  { icon: MessageSquare, title: "Comments", desc: "Anonymous feedback on pages" },
  { icon: Zap, title: "Zero signup", desc: "Create instantly, token-based ownership" },
];

export default function HomePage() {
  const [saved, setSaved] = useState<SavedNotebook[]>([]);

  useEffect(() => {
    setSaved(getSavedNotebooks());
  }, []);

  return (
    <div className="min-h-screen bg-[var(--shell)] text-[var(--ink)] bg-dot-grid">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav flex items-center justify-between px-6 md:px-10 h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm" style={{ background: "var(--accent)" }}>
            📝
          </div>
          <span className="font-semibold tracking-tight text-sm">SharePad</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/new" className="text-[13px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors">
            New notebook
          </Link>
          <Link
            href="/new"
            className="flex items-center gap-1.5 h-8 px-4 text-[13px] font-medium text-white rounded-md transition-all hover:brightness-110"
            style={{ background: "var(--accent)" }}
          >
            Start free <ArrowRight size={12} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-[120px] pointer-events-none glow-orange" />

        <div className="relative max-w-3xl mx-auto text-center animate-fade-up">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium mb-8"
            style={{ border: "1px solid rgba(249,115,22,0.3)", background: "rgba(249,115,22,0.08)", color: "var(--accent)" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
            No signup · No login · Just share
          </div>

          <h1 className="mb-6 leading-[1.05] tracking-tight" style={{ fontSize: "clamp(40px, 7vw, 72px)" }}>
            Share notes with
            <br />
            <em style={{ fontFamily: "var(--font-instrument), serif", fontStyle: "italic", color: "var(--accent)" }}>
              one link.
            </em>
          </h1>

          <p className="text-[17px] leading-relaxed max-w-xl mx-auto mb-10 text-[var(--ink-2)]">
            Multi-page markdown notebooks you can share instantly.
            Password lock, embed, export — all without creating an account.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/new"
              className="flex items-center gap-2 h-11 px-7 text-[14px] font-semibold text-white rounded-lg transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: "var(--accent)", boxShadow: "0 0 32px var(--accent-glow)" }}
            >
              Create a notebook <ArrowRight size={14} />
            </Link>
          </div>

          <p className="mt-5 text-[12px] text-[var(--ink-3)]">Save your edit link — it&apos;s your only key.</p>
        </div>

        {/* Mockup */}
        <div className="relative max-w-3xl mx-auto mt-16 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)", background: "var(--shell-2)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
          >
            <div className="flex items-center justify-between px-4 h-10 border-b border-[var(--border)] bg-[#0e0e11]">
              <div className="flex items-center gap-1.5">
                {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
                  <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <span className="text-[11px] text-[var(--ink-3)]">sharepad.app/n/project-notes</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ background: "rgba(249,115,22,0.15)", color: "var(--accent)" }}>
                Auto-saved
              </span>
            </div>
            <div className="flex h-[280px]">
              <div className="w-48 border-r border-[var(--border)] p-3 space-y-1">
                {["👋 Welcome", "📋 Todo", "🚀 Launch plan"].map((p, i) => (
                  <div
                    key={p}
                    className="px-2 py-1.5 rounded text-[11px]"
                    style={{
                      background: i === 0 ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.04)",
                      color: i === 0 ? "var(--accent)" : "var(--ink-2)",
                    }}
                  >
                    {p}
                  </div>
                ))}
              </div>
              <div className="flex-1 flex">
                <div className="flex-1 p-4 font-mono text-[11px] text-[var(--ink-2)] leading-relaxed border-r border-[var(--border)]">
                  # Welcome<br />
                  <br />
                  Write **markdown** here.<br />
                  - [ ] Task one<br />
                  - [x] Task two
                </div>
                <div className="flex-1 p-4 text-[11px] text-[var(--ink-2)]">
                  <h3 className="text-[var(--ink)] font-semibold mb-2">Welcome</h3>
                  <p>Write <strong>markdown</strong> here.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2
          className="text-center text-3xl mb-3"
          style={{ fontFamily: "var(--font-instrument), serif", fontStyle: "italic" }}
        >
          Everything you need
        </h2>
        <p className="text-center text-[var(--ink-2)] mb-12 text-sm">No accounts. No friction. Just notes.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="p-5 rounded-xl transition-all hover:scale-[1.02] sketch-card"
              style={{
                background: i % 3 === 0 ? "rgba(254,240,138,0.08)" : i % 3 === 1 ? "rgba(191,219,254,0.08)" : "rgba(251,207,232,0.08)",
                border: "1px solid var(--border)",
              }}
            >
              <Icon size={20} className="mb-3 text-[var(--accent)]" />
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Saved notebooks */}
      {saved.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 pb-20">
          <h2 className="text-lg font-semibold mb-4">Your notebooks</h2>
          <div className="space-y-2">
            {saved.map((nb) => (
              <Link
                key={nb.slug}
                href={`/e/${nb.editToken}`}
                className="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.01]"
                style={{ background: "var(--shell-2)", border: "1px solid var(--border)" }}
              >
                <span className="font-medium text-sm">{nb.title}</span>
                <span className="text-xs text-[var(--ink-2)]">/n/{nb.slug}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-6 text-center text-xs text-[var(--ink-3)]">
        <p>
          Built by{" "}
          <a href="https://github.com/varshithvhegde" className="text-[var(--accent)] hover:underline">
            varshithvhegde
          </a>
          {" · "}
          <a href="https://github.com/varshithvhegde/sharepad" className="hover:text-[var(--ink-2)]">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
