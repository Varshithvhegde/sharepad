"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Download, ExternalLink, X } from "lucide-react";
import { expiryLabel } from "@/lib/expiry";
import { track } from "@/lib/analytics";
import type { Notebook } from "@/lib/types";

interface SharePanelProps {
  notebook: Notebook;
  editToken: string;
  onClose: () => void;
}

export default function SharePanel({ notebook, editToken, onClose }: SharePanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const viewUrl = `${origin}/n/${notebook.slug}`;
  const editUrl = `${origin}/e/${editToken}`;

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    track({ name: "notebook_shared", props: { via: "copy_link" } });
  }

  function toggleQr() {
    if (!showQr) track({ name: "notebook_shared", props: { via: "qr_code" } });
    setShowQr((visible) => !visible);
  }

  // Visitors to an openly editable notebook can share it, but they hold no
  // token, so there is no edit link to offer them.
  const links = [
    {
      key: "view",
      label: "View link",
      hint: "Give this to your readers",
      url: viewUrl,
      tint: "var(--sticky-b)",
    },
    ...(editToken
      ? [
          {
            key: "edit",
            label: "Edit link",
            hint: "Your key. Anyone with it can change everything.",
            url: editUrl,
            tint: "var(--sticky-p)",
          },
        ]
      : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 overflow-y-auto"
      style={{ background: "rgba(28,28,28,0.4)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-md relative note-enter my-auto" onClick={(e) => e.stopPropagation()}>
        <span
          className="tape tape-y"
          style={{ top: -9, left: "50%", transform: "translateX(-50%) rotate(-2deg)", width: 62, height: 17 }}
        />
        <div className="sk">
          <div className="sk-b" />
          <div className="sk-i p-6 pt-8">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-[1.5rem] leading-tight" style={{ fontFamily: "var(--font-sketch), serif" }}>
                  Share this notebook
                </h2>
                <p className="text-[0.85rem]" style={{ color: "var(--ink-2)" }}>
                  {notebook.emoji} {notebook.title} · {expiryLabel(notebook.expires_at)}
                </p>
              </div>
              <button onClick={onClose} className="btn-ghost !px-1.5 shrink-0" aria-label="Close">
                <X size={17} />
              </button>
            </div>

            {links.map((link) => (
              <div key={link.key} className="mb-5">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span
                    className="text-[0.88rem] px-2"
                    style={{ background: link.tint, border: "1.2px solid rgba(28,28,28,0.2)" }}
                  >
                    {link.label}
                  </span>
                  <span className="text-[0.78rem]" style={{ color: "var(--ink-3)" }}>
                    {link.hint}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={link.url}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    aria-label={link.label}
                    className="field text-[0.76rem] !py-2"
                    style={{ fontFamily: "ui-monospace, monospace" }}
                  />
                  <button onClick={() => copy(link.url, link.key)} className="btn !px-3 shrink-0" title="Copy">
                    {copied === link.key ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn !px-3 shrink-0"
                    title="Open in a new tab"
                  >
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            ))}

            {!editToken && (
              <p
                className="text-[0.84rem] p-3 mb-5"
                style={{ background: "var(--paper-2)", border: "1.2px solid rgba(28,28,28,0.15)", color: "var(--ink-2)" }}
              >
                You are sharing someone else&apos;s notebook. They kept the edit link, so
                only the address above is yours to pass on.
              </p>
            )}

            <div className="flex items-center gap-3 mb-5">
              <button onClick={toggleQr} className="btn-ghost !px-0 text-[0.88rem]">
                {showQr ? "Hide QR code" : "Show QR code"}
              </button>
            </div>

            {showQr && (
              <div className="flex justify-center mb-5">
                <div style={{ padding: 14, background: "#fff", border: "1.8px solid var(--ink)" }}>
                  <QRCodeSVG value={viewUrl} size={132} level="M" />
                </div>
              </div>
            )}

            <a
              href={`/api/export/${notebook.slug}`}
              download
              onClick={() => track({ name: "export_started", props: { format: "markdown" } })}
              className="btn btn-ink w-full"
            >
              <Download size={15} /> Download every page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
