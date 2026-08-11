"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function PasswordGate({ slug, title }: { slug: string; title: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      if (!res.ok) {
        const data = await res.json();
        setError(data.error === "Wrong password" ? "That password doesn't match." : "Could not unlock this notebook.");
        return;
      }
      window.location.reload();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen paper-dot flex items-center justify-center px-5">
      <div className="w-full max-w-sm relative note-enter">
        <span
          className="tape tape-p"
          style={{ top: -9, left: "50%", transform: "translateX(-50%) rotate(-2deg)", width: 60, height: 17 }}
        />
        <form onSubmit={handleSubmit} className="sk">
          <div className="sk-b" />
          <div className="sk-i p-7 pt-9">
            <p className="text-[0.8rem] uppercase tracking-[0.14em] mb-1" style={{ color: "var(--ink-3)" }}>
              Locked notebook
            </p>
            <h1 className="text-[1.6rem] leading-tight mb-1" style={{ fontFamily: "var(--font-sketch), serif" }}>
              {title}
            </h1>
            <p className="text-[0.9rem] mb-5" style={{ color: "var(--ink-2)" }}>
              Enter the password you were given to read this.
            </p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              aria-label="Password"
              autoFocus
              className="field mb-3"
            />

            {error && (
              <p className="text-[0.88rem] mb-3" style={{ color: "var(--red)" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading || !password} className="btn btn-ink w-full">
              {loading ? <Loader2 size={15} className="animate-spin" /> : "Open it"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
