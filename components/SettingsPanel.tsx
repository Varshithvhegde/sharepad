"use client";

import { useState } from "react";
import { X, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { removeSavedNotebook } from "@/lib/local-storage";
import type { Notebook, NotebookTheme, NotebookVisibility } from "@/lib/types";

interface SettingsPanelProps {
  notebook: Notebook;
  editToken: string;
  onClose: () => void;
  onUpdate: (n: Notebook) => void;
  theme?: "dark" | "paper";
}

export default function SettingsPanel({
  notebook,
  editToken,
  onClose,
  onUpdate,
  theme = "dark",
}: SettingsPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(notebook.description ?? "");
  const [emoji, setEmoji] = useState(notebook.emoji);
  const [notebookTheme, setNotebookTheme] = useState<NotebookTheme>(notebook.theme);
  const [visibility, setVisibility] = useState<NotebookVisibility>(notebook.visibility);
  const [readOnly, setReadOnly] = useState(notebook.read_only);
  const [allowComments, setAllowComments] = useState(notebook.allow_comments);
  const [burnAfterRead, setBurnAfterRead] = useState(notebook.burn_after_read);
  const [password, setPassword] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number | "">("");
  const isPaper = theme === "paper";

  async function save() {
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        description,
        emoji,
        theme: notebookTheme,
        visibility,
        read_only: readOnly,
        allow_comments: allowComments,
        burn_after_read: burnAfterRead,
      };
      if (password.trim()) body.password = password.trim();
      if (expiresInDays !== "") body.expiresInDays = Number(expiresInDays);

      const res = await fetch(`/api/notebooks/${notebook.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Edit-Token": editToken,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.notebook);
        onClose();
        if (data.notebook.theme !== notebook.theme) {
          window.location.reload();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function deleteNotebook() {
    if (!confirm("Delete this notebook permanently? This cannot be undone.")) return;
    setLoading(true);
    const res = await fetch(`/api/notebooks/${notebook.id}`, {
      method: "DELETE",
      headers: { "X-Edit-Token": editToken },
    });
    if (res.ok) {
      removeSavedNotebook(notebook.slug);
      router.push("/");
    }
    setLoading(false);
  }

  const inputClass = `w-full h-9 px-3 text-sm rounded-lg outline-none ${
    isPaper
      ? "bg-[var(--paper-2)] border border-[var(--border-paper)]"
      : "bg-[var(--shell-3)] border border-[var(--border)]"
  }`;

  const labelClass = "text-xs font-medium opacity-70 mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl overflow-hidden animate-fade-up ${
          isPaper
            ? "bg-white border border-[var(--border-paper)]"
            : "bg-[var(--shell-2)] border border-[var(--border)]"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-inherit">
          <h2 className="font-semibold">Notebook settings</h2>
          <button onClick={onClose} className="p-1 opacity-60 hover:opacity-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className={labelClass}>Emoji</label>
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className={inputClass} maxLength={4} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`${inputClass} h-auto py-2 resize-none`}
            />
          </div>
          <div>
            <label className={labelClass}>Theme</label>
            <select
              value={notebookTheme}
              onChange={(e) => setNotebookTheme(e.target.value as NotebookTheme)}
              className={inputClass}
            >
              <option value="dark">Dark (BillForge)</option>
              <option value="paper">Paper (PostItUp)</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as NotebookVisibility)}
              className={inputClass}
            >
              <option value="unlisted">Unlisted (link only)</option>
              <option value="public">Public</option>
              <option value="private">Private (edit link only)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Password (optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={notebook.has_password ? "Set new password" : "Add password"}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Expires in (days)</label>
            <input
              type="number"
              min={1}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : "")}
              placeholder="Never"
              className={inputClass}
            />
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: "Read-only mode", value: readOnly, set: setReadOnly },
              { label: "Allow comments", value: allowComments, set: setAllowComments },
              { label: "Burn after first read", value: burnAfterRead, set: setBurnAfterRead },
            ].map((toggle) => (
              <label key={toggle.label} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">{toggle.label}</span>
                <input
                  type="checkbox"
                  checked={toggle.value}
                  onChange={(e) => toggle.set(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-inherit flex gap-3">
          <button
            onClick={save}
            disabled={loading}
            className="flex-1 h-10 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: "var(--accent)" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Save settings"}
          </button>
          <button
            onClick={deleteNotebook}
            disabled={loading}
            className="h-10 px-4 rounded-lg text-sm text-red-400 border border-red-400/30 flex items-center gap-2 hover:bg-red-400/10"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
