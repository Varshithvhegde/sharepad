"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";

interface PasswordGateProps {
  slug: string;
  title: string;
  theme?: "dark" | "paper";
}

export default function PasswordGate({ slug, title, theme = "dark" }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isPaper = theme === "paper";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/notebooks/unlock/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Wrong password");
        return;
      }
      window.location.reload();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-6 ${
        isPaper ? "bg-dot-grid-paper theme-paper" : "bg-[var(--shell)] bg-dot-grid"
      }`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-2xl animate-fade-up ${
          isPaper
            ? "bg-white border border-[var(--border-paper)] shadow-lg sketch-card"
            : "bg-[var(--shell-2)] border border-[var(--border)]"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: isPaper ? "var(--sticky-y)" : "rgba(249,115,22,0.15)" }}
          >
            <Lock size={18} className={isPaper ? "text-[var(--paper-ink)]" : "text-[var(--accent)]"} />
          </div>
          <div>
            <p className={`text-xs uppercase tracking-widest ${isPaper ? "text-[var(--paper-ink-2)]" : "text-[var(--ink-2)]"}`}>
              Password protected
            </p>
            <h1 className={`font-semibold ${isPaper ? "text-[var(--paper-ink)]" : "text-[var(--ink)]"}`}>
              {title}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className={`w-full h-11 px-4 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--accent)] ${
              isPaper
                ? "bg-[var(--paper-2)] text-[var(--paper-ink)] border border-[var(--border-paper)]"
                : "bg-[var(--shell-3)] text-[var(--ink)] border border-[var(--border)]"
            }`}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-11 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Unlock notebook"}
          </button>
        </form>
      </div>
    </div>
  );
}
