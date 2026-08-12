"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Loader2,
  Lock,
  X,
} from "lucide-react";
import { saveNotebook } from "@/lib/local-storage";
import { slugify } from "@/lib/slug";
import { NOTEBOOK_ICONS } from "@/lib/templates";
import { DEFAULT_EXPIRY_DAYS, EXPIRY_OPTIONS } from "@/lib/expiry";
import { FONT_OPTIONS } from "@/lib/fonts";
import { track } from "@/lib/analytics";
import type { NotebookFont, PaperTexture } from "@/lib/types";

type SlugState = "idle" | "checking" | "free" | "taken" | "invalid";

const TEXTURES: { id: PaperTexture; label: string; className: string }[] = [
  { id: "plain", label: "Plain", className: "paper-plain" },
  { id: "ruled", label: "Ruled", className: "paper-ruled" },
  { id: "grid", label: "Grid", className: "paper-grid" },
  { id: "dot", label: "Dotted", className: "paper-dot" },
];

export default function NewNotebookPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("📝");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [expiryDays, setExpiryDays] = useState<number | null>(DEFAULT_EXPIRY_DAYS);
  const [texture, setTexture] = useState<PaperTexture>("plain");
  const [font, setFont] = useState<NotebookFont>("hand");
  const [openEdit, setOpenEdit] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ editUrl: string; viewUrl: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const effectiveSlug = slugTouched ? slug : slugify(title);

  /*
   * Availability is derived rather than stored: the result is kept alongside the
   * address it describes, so a reply that arrives after the field has moved on
   * cannot be shown against the wrong address.
   */
  const [checked, setChecked] = useState<{ slug: string; state: SlugState } | null>(null);
  const slugState: SlugState = !effectiveSlug
    ? "idle"
    : checked?.slug === effectiveSlug
      ? checked.state
      : "checking";

  // Debounced so we are not calling the API on every keystroke.
  useEffect(() => {
    if (!effectiveSlug) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slug-check?slug=${encodeURIComponent(effectiveSlug)}`);
        const data = (await res.json()) as { available: boolean; reason: string };
        setChecked({
          slug: effectiveSlug,
          state: data.available ? "free" : data.reason === "taken" ? "taken" : "invalid",
        });
      } catch {
        setChecked({ slug: effectiveSlug, state: "idle" });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [effectiveSlug]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || slugState === "taken") return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: effectiveSlug || undefined,
          emoji: icon,
          theme: texture,
          font,
          allowPublicEdit: openEdit,
          password: password.trim() || undefined,
          expiresInDays: expiryDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create the notebook");
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
          source: "new",
          page_count: 1,
          has_password: Boolean(password.trim()),
          expiry_days: expiryDays,
          open_edit: openEdit,
          font,
          paper: texture,
          custom_slug: slugTouched,
        },
      });

      setCreated({ editUrl: data.editUrl, viewUrl: data.viewUrl });
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  /* ── Created ── */
  if (created) {
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
              <h1 className="text-[1.7rem] mb-1" style={{ fontFamily: "var(--font-sketch), serif" }}>
                Your notebook is ready
              </h1>
              <p className="text-[0.95rem] mb-7" style={{ color: "var(--ink-2)" }}>
                Save the edit link before you close this tab — it is the only way back in.
              </p>

              {[
                {
                  key: "edit",
                  label: "Edit link",
                  hint: "Keep this one to yourself",
                  url: `${origin}${created.editUrl}`,
                  color: "var(--sticky-p)",
                },
                {
                  key: "view",
                  label: "View link",
                  hint: "This is the one you share",
                  url: `${origin}${created.viewUrl}`,
                  color: "var(--sticky-b)",
                },
              ].map((item) => (
                <div key={item.key} className="mb-5">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span
                      className="text-[0.9rem] px-2"
                      style={{ background: item.color, border: "1.2px solid rgba(28,28,28,0.2)" }}
                    >
                      {item.label}
                    </span>
                    <span className="text-[0.8rem]" style={{ color: "var(--ink-3)" }}>
                      {item.hint}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={item.url}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="field text-[0.78rem]"
                      style={{ fontFamily: "ui-monospace, monospace" }}
                    />
                    <button
                      type="button"
                      onClick={() => copy(item.url, item.key)}
                      className="btn !px-3 shrink-0"
                      title="Copy"
                    >
                      {copied === item.key ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => router.push(created.editUrl)}
                className="btn btn-ink w-full mt-2 text-[1.02rem]"
              >
                Open the notebook <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="min-h-screen paper-dot overflow-x-hidden px-5 py-10">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="btn-ghost !px-0 mb-7 text-[0.92rem]">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="relative">
          <span
            className="tape tape-y"
            style={{ top: -10, left: 36, transform: "rotate(-3deg)", width: 64, height: 18 }}
          />

          <form onSubmit={handleCreate} className="sk">
            <div className="sk-b" />
            <div className="sk-i p-6 sm:p-8 pt-9">
              <h1 className="text-[1.8rem] leading-tight" style={{ fontFamily: "var(--font-sketch), serif" }}>
                Start a notebook
              </h1>
              <p className="text-[0.93rem] mb-2" style={{ color: "var(--ink-2)" }}>
                One field is required. Everything else has a sensible answer already.
              </p>
              <p className="text-[0.86rem] mb-7">
                <Link href="/quick" className="underline" style={{ color: "var(--red)" }}>
                  In a hurry? Paste and share instead.
                </Link>
              </p>

              {/* Title + icon */}
              <label className="label" htmlFor="title">
                What are you writing about?
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Iceland, March"
                  autoFocus
                  className="field text-[1.05rem]"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mb-7">
                {NOTEBOOK_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    aria-pressed={icon === emoji}
                    className="w-9 h-9 text-[1.05rem] transition-transform"
                    style={{
                      border: icon === emoji ? "1.8px solid var(--ink)" : "1.5px solid transparent",
                      background: icon === emoji ? "var(--sticky-y)" : "transparent",
                      boxShadow: icon === emoji ? "2px 2px 0 rgba(28,28,28,0.18)" : "none",
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Slug */}
              <label className="label" htmlFor="slug">
                Its address
              </label>
              <div className="flex items-stretch mb-1.5">
                <span
                  className="flex items-center px-3 text-[0.82rem] shrink-0"
                  style={{
                    border: "1.8px solid var(--ink)",
                    borderRight: "none",
                    background: "var(--paper-2)",
                    color: "var(--ink-2)",
                    fontFamily: "ui-monospace, monospace",
                  }}
                >
                  /n/
                </span>
                <input
                  id="slug"
                  value={effectiveSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="iceland-march"
                  className="field text-[0.9rem]"
                  style={{ fontFamily: "ui-monospace, monospace" }}
                />
              </div>
              <p className="text-[0.82rem] mb-7 h-5">
                {slugState === "checking" && <span style={{ color: "var(--ink-3)" }}>Checking…</span>}
                {slugState === "free" && <span style={{ color: "#3f7d46" }}>✓ That address is free</span>}
                {slugState === "taken" && (
                  <span style={{ color: "var(--red)" }}>Someone already has that one — try another</span>
                )}
                {slugState === "invalid" && (
                  <span style={{ color: "var(--red)" }}>Letters, numbers and hyphens only</span>
                )}
                {slugState === "idle" && (
                  <span style={{ color: "var(--ink-3)" }}>We&apos;ll pick one for you if you leave it blank</span>
                )}
              </p>

              {/* Expiry */}
              <label className="label">How long should it stay up?</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {EXPIRY_OPTIONS.map((opt) => (
                  <button
                    key={String(opt.days)}
                    type="button"
                    className="chip"
                    data-on={expiryDays === opt.days}
                    onClick={() => setExpiryDays(opt.days)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[0.82rem] mb-7" style={{ color: "var(--ink-3)" }}>
                {expiryDays === null
                  ? "It will stay until you delete it yourself."
                  : `It deletes itself ${expiryDays} day${expiryDays === 1 ? "" : "s"} from now. You can change this later.`}
              </p>

              {/* Paper */}
              <label className="label">Paper</label>
              <div className="grid grid-cols-4 gap-2 mb-7">
                {TEXTURES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTexture(t.id)}
                    aria-pressed={texture === t.id}
                    className="text-[0.8rem]"
                    style={{
                      border: texture === t.id ? "1.8px solid var(--ink)" : "1.5px solid rgba(28,28,28,0.2)",
                      boxShadow: texture === t.id ? "2px 2px 0 rgba(28,28,28,0.18)" : "none",
                    }}
                  >
                    <span className={`${t.className} block h-9`} />
                    <span
                      className="block py-1"
                      style={{ borderTop: "1.2px solid rgba(28,28,28,0.15)" }}
                    >
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Typeface */}
              <label className="label">Typeface</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`chip ${f.className}`}
                    data-on={font === f.id}
                    onClick={() => setFont(f.id)}
                    style={{ fontFamily: "var(--nb-body)" }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <p className="text-[0.82rem] mb-7" style={{ color: "var(--ink-3)" }}>
                {FONT_OPTIONS.find((f) => f.id === font)?.hint}
                {font === "hand" && " — printed copies always use a professional serif."}
              </p>

              {/* Open editing */}
              <label className="flex items-start gap-2.5 cursor-pointer mb-7">
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
                    They can write and add pages. Only you can change these settings.
                  </span>
                </span>
              </label>

              {/* Password */}
              {showPassword ? (
                <div className="mb-7">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label !mb-0" htmlFor="password">
                      Password to read it
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPassword(false);
                        setPassword("");
                      }}
                      className="btn-ghost !px-1 !py-0.5 text-[0.8rem]"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Anyone opening the view link needs this"
                    className="field text-[0.95rem]"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPassword(true)}
                  className="btn-ghost !px-0 mb-7 text-[0.9rem]"
                >
                  <Lock size={13} /> Add a password
                </button>
              )}

              {error && (
                <p className="text-[0.92rem] mb-4" style={{ color: "var(--red)" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !title.trim() || slugState === "taken"}
                className="btn btn-ink w-full text-[1.05rem]"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Create it <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
