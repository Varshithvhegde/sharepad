"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, ExternalLink, Code2, Download } from "lucide-react";
import type { Notebook } from "@/lib/types";

interface SharePanelProps {
  notebook: Notebook;
  editToken: string;
  onClose: () => void;
  theme?: "dark" | "paper";
}

export default function SharePanel({
  notebook,
  editToken,
  onClose,
  theme = "dark",
}: SharePanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const viewUrl = `${origin}/n/${notebook.slug}`;
  const editUrl = `${origin}/e/${editToken}`;
  const embedUrl = `${origin}/embed/${notebook.slug}`;
  const isPaper = theme === "paper";

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const items = [
    { key: "view", label: "View link", desc: "Anyone with this link can read", url: viewUrl },
    { key: "edit", label: "Edit link", desc: "Keep this secret — full control", url: editUrl, secret: true },
    { key: "embed", label: "Embed URL", desc: "For iframes & widgets", url: embedUrl },
  ];

  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`;
  const scriptCode = `<script src="${origin}/embed.js" data-notebook="${notebook.slug}" data-url="${origin}"></script>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-lg rounded-2xl overflow-hidden animate-fade-up ${
          isPaper
            ? "bg-white border border-[var(--border-paper)]"
            : "bg-[var(--shell-2)] border border-[var(--border)]"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-inherit">
          <h2 className="font-semibold">Share notebook</h2>
          <button onClick={onClose} className="p-1 opacity-60 hover:opacity-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {items.map((item) => (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{item.label}</span>
                {item.secret && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                    Secret
                  </span>
                )}
              </div>
              <p className="text-xs opacity-50 mb-2">{item.desc}</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={item.url}
                  className={`flex-1 text-xs px-3 py-2 rounded-lg outline-none ${
                    isPaper
                      ? "bg-[var(--paper-2)] border border-[var(--border-paper)]"
                      : "bg-[var(--shell-3)] border border-[var(--border)]"
                  }`}
                />
                <button
                  onClick={() => copy(item.url, item.key)}
                  className="p-2 rounded-lg opacity-70 hover:opacity-100"
                >
                  {copied === item.key ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg opacity-70 hover:opacity-100"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}

          <div className="flex justify-center py-2">
            <div className="p-3 bg-white rounded-xl">
              <QRCodeSVG value={viewUrl} size={120} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code2 size={14} />
              <span className="text-sm font-medium">Embed code</span>
            </div>
            <pre
              className={`text-[11px] p-3 rounded-lg overflow-x-auto ${
                isPaper ? "bg-[var(--paper-2)]" : "bg-[var(--shell-3)]"
              }`}
            >
              {iframeCode}
            </pre>
            <button
              onClick={() => copy(iframeCode, "iframe")}
              className="mt-2 text-xs flex items-center gap-1 opacity-70 hover:opacity-100"
            >
              {copied === "iframe" ? <Check size={12} /> : <Copy size={12} />}
              Copy iframe
            </button>
          </div>

          <div>
            <pre
              className={`text-[11px] p-3 rounded-lg overflow-x-auto ${
                isPaper ? "bg-[var(--paper-2)]" : "bg-[var(--shell-3)]"
              }`}
            >
              {scriptCode}
            </pre>
            <button
              onClick={() => copy(scriptCode, "script")}
              className="mt-2 text-xs flex items-center gap-1 opacity-70 hover:opacity-100"
            >
              {copied === "script" ? <Check size={12} /> : <Copy size={12} />}
              Copy script tag
            </button>
          </div>

          <a
            href={`/api/export/${notebook.slug}`}
            download
            className="flex items-center justify-center gap-2 w-full h-10 rounded-lg text-sm font-medium transition-all hover:brightness-110"
            style={{ background: "var(--accent)", color: "white" }}
          >
            <Download size={16} /> Export all as Markdown
          </a>
        </div>
      </div>
    </div>
  );
}
