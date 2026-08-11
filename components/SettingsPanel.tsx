"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, X } from "lucide-react";
import { removeSavedNotebook } from "@/lib/local-storage";
import { EXPIRY_OPTIONS, daysUntil, expiryLabel } from "@/lib/expiry";
import { FONT_OPTIONS } from "@/lib/fonts";
import type { Notebook, NotebookFont, NotebookVisibility, PaperTexture } from "@/lib/types";

interface SettingsPanelProps {
  notebook: Notebook;
  editToken: string;
  onClose: () => void;
  onUpdate: (n: Notebook) => void;
}

const TEXTURES: { id: PaperTexture; label: string }[] = [
  { id: "ruled", label: "Ruled" },
  { id: "grid", label: "Grid" },
  { id: "dot", label: "Dotted" },
  { id: "plain", label: "Plain" },
];

const VISIBILITIES: { id: NotebookVisibility; label: string; hint: string }[] = [
  { id: "unlisted", label: "Anyone with the link", hint: "Not listed anywhere public" },
  { id: "public", label: "Public", hint: "Fine to be indexed and found" },
  { id: "private", label: "Only me", hint: "The view link stops working" },
];

export default function SettingsPanel({
  notebook,
  editToken,
  onClose,
  onUpdate,
}: SettingsPanelProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [description, setDescription] = useState(notebook.description ?? "");
  const [texture, setTexture] = useState<PaperTexture>(notebook.theme);
  const [font, setFont] = useState<NotebookFont>(notebook.font);
  const [visibility, setVisibility] = useState<NotebookVisibility>(notebook.visibility);
  const [readOnly, setReadOnly] = useState(notebook.read_only);
  const [publicEdit, setPublicEdit] = useState(notebook.allow_public_edit);
  const [allowComments, setAllowComments] = useState(notebook.allow_comments);
  const [burnAfterRead, setBurnAfterRead] = useState(notebook.burn_after_read);
  const [password, setPassword] = useState("");
  const [clearPassword, setClearPassword] = useState(false);
  const [expiryDays, setExpiryDays] = useState<number | null | undefined>(undefined);

  async function save() {
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        description,
        theme: texture,
        font,
        visibility,
        read_only: readOnly,
        allow_public_edit: publicEdit,
        allow_comments: allowComments,
        burn_after_read: burnAfterRead,
      };
      if (clearPassword) body.password = null;
      else if (password.trim()) body.password = password.trim();
      if (expiryDays !== undefined) body.expiresInDays = expiryDays;

      const res = await fetch(`/api/notebooks/${notebook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Edit-Token": editToken },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Those settings didn't save");
        return;
      }
      onUpdate(data.notebook);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function deleteNotebook() {
    if (!confirm(`Delete "${notebook.title}" and every page in it? This cannot be undone.`)) return;
    setSaving(true);
    const res = await fetch(`/api/notebooks/${notebook.id}`, {
      method: "DELETE",
      headers: { "X-Edit-Token": editToken },
    });
    if (res.ok) {
      removeSavedNotebook(notebook.slug, editToken);
      router.push("/");
    } else {
      setSaving(false);
      setError("Could not delete the notebook");
    }
  }

  const currentExpiry = daysUntil(notebook.expires_at);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 overflow-y-auto"
      style={{ background: "rgba(28,28,28,0.4)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-md relative note-enter my-auto" onClick={(e) => e.stopPropagation()}>
        <span
          className="tape tape-g"
          style={{ top: -9, left: "50%", transform: "translateX(-50%) rotate(2deg)", width: 62, height: 17 }}
        />
        <div className="sk">
          <div className="sk-b" />
          <div className="sk-i">
            <div
              className="flex items-center justify-between px-6 py-4 pt-7"
              style={{ borderBottom: "1.5px solid rgba(28,28,28,0.14)" }}
            >
              <h2 className="text-[1.5rem]" style={{ fontFamily: "var(--font-sketch), serif" }}>
                Settings
              </h2>
              <button onClick={onClose} className="btn-ghost !px-1.5" aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6 max-h-[62vh] overflow-y-auto">
              <div>
                <label className="label" htmlFor="desc">
                  Description
                </label>
                <textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Shows up when the link is previewed"
                  className="field resize-none text-[0.92rem]"
                />
              </div>

              <div>
                <label className="label">Paper</label>
                <div className="flex flex-wrap gap-2">
                  {TEXTURES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="chip"
                      data-on={texture === t.id}
                      onClick={() => setTexture(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Typeface</label>
                <div className="space-y-1.5">
                  {FONT_OPTIONS.map((f) => (
                    <label key={f.id} className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="font"
                        checked={font === f.id}
                        onChange={() => setFont(f.id)}
                        className="mt-1"
                        style={{ accentColor: "var(--red)" }}
                      />
                      <span>
                        <span className={`text-[0.95rem] block ${f.className}`} style={{ fontFamily: "var(--nb-body)" }}>
                          {f.label}
                        </span>
                        <span className="text-[0.8rem]" style={{ color: "var(--ink-3)" }}>
                          {f.hint}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Expiry — currently {expiryLabel(notebook.expires_at).toLowerCase()}</label>
                <div className="flex flex-wrap gap-2">
                  {EXPIRY_OPTIONS.map((opt) => (
                    <button
                      key={String(opt.days)}
                      type="button"
                      className="chip"
                      data-on={
                        expiryDays === undefined
                          ? opt.days === null
                            ? currentExpiry === null
                            : currentExpiry === opt.days
                          : expiryDays === opt.days
                      }
                      onClick={() => setExpiryDays(opt.days)}
                    >
                      {opt.days === null ? "Never" : `${opt.label} from now`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Who can open the view link</label>
                <div className="space-y-1.5">
                  {VISIBILITIES.map((v) => (
                    <label key={v.id} className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={visibility === v.id}
                        onChange={() => setVisibility(v.id)}
                        className="mt-1"
                        style={{ accentColor: "var(--red)" }}
                      />
                      <span>
                        <span className="text-[0.92rem] block">{v.label}</span>
                        <span className="text-[0.8rem]" style={{ color: "var(--ink-3)" }}>
                          {v.hint}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="pw">
                  {notebook.has_password ? "Change the password" : "Add a password"}
                </label>
                <input
                  id="pw"
                  type="password"
                  value={password}
                  disabled={clearPassword}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={notebook.has_password ? "Leave blank to keep the current one" : "Readers will be asked for this"}
                  className="field text-[0.92rem]"
                />
                {notebook.has_password && (
                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-[0.85rem]">
                    <input
                      type="checkbox"
                      checked={clearPassword}
                      onChange={(e) => setClearPassword(e.target.checked)}
                      style={{ accentColor: "var(--red)" }}
                    />
                    Remove the password
                  </label>
                )}
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    label: "Anyone with the link can edit",
                    hint: "Turns the notebook into a shared scratchpad. Settings stay yours.",
                    value: publicEdit,
                    set: setPublicEdit,
                  },
                  {
                    label: "Read-only",
                    hint: "Freeze the notebook so nobody can change it, including you",
                    value: readOnly,
                    set: setReadOnly,
                  },
                  {
                    label: "Let readers comment",
                    hint: "Anyone viewing can leave notes on a page",
                    value: allowComments,
                    set: setAllowComments,
                  },
                  {
                    label: "Delete after the first read",
                    hint: "The view link works exactly once",
                    value: burnAfterRead,
                    set: setBurnAfterRead,
                  },
                ].map((t) => (
                  <label key={t.label} className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.value}
                      onChange={(e) => t.set(e.target.checked)}
                      className="mt-1"
                      style={{ accentColor: "var(--red)" }}
                    />
                    <span>
                      <span className="text-[0.92rem] block">{t.label}</span>
                      <span className="text-[0.8rem]" style={{ color: "var(--ink-3)" }}>
                        {t.hint}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              {error && (
                <p className="text-[0.9rem]" style={{ color: "var(--red)" }}>
                  {error}
                </p>
              )}
            </div>

            <div
              className="flex gap-3 px-6 py-4"
              style={{ borderTop: "1.5px solid rgba(28,28,28,0.14)" }}
            >
              <button onClick={save} disabled={saving} className="btn btn-ink flex-1">
                {saving ? <Loader2 size={15} className="animate-spin" /> : "Save settings"}
              </button>
              <button
                onClick={deleteNotebook}
                disabled={saving}
                className="btn !px-3"
                style={{ color: "var(--red)" }}
                title="Delete this notebook"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
