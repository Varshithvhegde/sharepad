"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface Entry {
  syntax: string;
  does: string;
}

const SECTIONS: { title: string; note?: string; entries: Entry[] }[] = [
  {
    title: "Text",
    entries: [
      { syntax: "**bold**", does: "Bold" },
      { syntax: "*italic*", does: "Italic" },
      { syntax: "~~struck~~", does: "Struck through" },
      { syntax: "`code`", does: "Inline code" },
      { syntax: "[text](https://…)", does: "A link" },
      { syntax: "![alt](image-url)", does: "An image" },
    ],
  },
  {
    title: "Structure",
    entries: [
      { syntax: "# Heading", does: "Biggest heading. Also builds the contents list" },
      { syntax: "## Smaller", does: "Second level, and so on down to ####" },
      { syntax: "- item", does: "Bullet list" },
      { syntax: "1. item", does: "Numbered list" },
      { syntax: "- [ ] task", does: "Checkbox. Use [x] for a done one" },
      { syntax: "> quoted", does: "Quote block" },
      { syntax: "---", does: "Divider line" },
    ],
  },
  {
    title: "Blocks",
    entries: [
      { syntax: "```js\ncode here\n```", does: "Code block, coloured for the language you name" },
      { syntax: "| A | B |\n| --- | --- |\n| 1 | 2 |", does: "Table" },
    ],
  },
  {
    title: "HTML",
    note: "Handy tags markdown has no shorthand for. Scripts, styles, iframes and forms are removed before anyone sees the page.",
    entries: [
      {
        syntax: "<details><summary>Title</summary>\nHidden until clicked\n</details>",
        does: "A section that folds away",
      },
      { syntax: "<kbd>Cmd</kbd>", does: "A keyboard key" },
      { syntax: "H<sub>2</sub>O · x<sup>2</sup>", does: "Below and above the line" },
      { syntax: "<mark>highlighted</mark>", does: "Highlighter pen" },
      { syntax: '<abbr title="…">HTML</abbr>', does: "Explains itself on hover" },
      { syntax: '<div align="center">…</div>', does: "Centres a block" },
    ],
  },
];

export default function FormattingHelp({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-5 overflow-y-auto"
      style={{ background: "rgba(28,28,28,0.4)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg relative note-enter my-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="formatting-help-title"
      >
        <span
          className="tape tape-b"
          style={{ top: -9, left: "50%", transform: "translateX(-50%) rotate(-2deg)", width: 64, height: 17 }}
        />
        <div className="sk">
          <div className="sk-b" />
          <div className="sk-i">
            <div
              className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 pt-7"
              style={{ borderBottom: "1.5px solid rgba(28,28,28,0.14)" }}
            >
              <div>
                <h2
                  id="formatting-help-title"
                  className="text-[1.45rem] leading-tight"
                  style={{ fontFamily: "var(--font-sketch), serif" }}
                >
                  What you can write
                </h2>
                <p className="text-[0.85rem]" style={{ color: "var(--ink-2)" }}>
                  Type it on the left, get the thing on the right.
                </p>
              </div>
              <button onClick={onClose} className="btn-ghost !px-1.5 shrink-0" aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-5 space-y-7 max-h-[65vh] overflow-y-auto">
              {SECTIONS.map((section) => (
                <section key={section.title}>
                  <h3
                    className="text-[1.05rem] mb-1"
                    style={{ fontFamily: "var(--font-sketch), serif" }}
                  >
                    {section.title}
                  </h3>
                  {section.note && (
                    <p className="text-[0.82rem] mb-3" style={{ color: "var(--ink-3)" }}>
                      {section.note}
                    </p>
                  )}

                  <dl className="space-y-2">
                    {section.entries.map((entry) => (
                      <div
                        key={entry.syntax}
                        className="grid sm:grid-cols-[1fr_1fr] gap-1 sm:gap-3 items-start"
                      >
                        <dt>
                          <code
                            className="block px-2 py-1.5 text-[0.76rem] whitespace-pre-wrap"
                            style={{
                              background: "var(--paper-2)",
                              border: "1.2px solid rgba(28,28,28,0.14)",
                              fontFamily: "ui-monospace, monospace",
                            }}
                          >
                            {entry.syntax}
                          </code>
                        </dt>
                        <dd
                          className="text-[0.88rem] sm:pt-1.5"
                          style={{ color: "var(--ink-2)" }}
                        >
                          {entry.does}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>

            <div className="px-5 sm:px-6 py-4" style={{ borderTop: "1.5px solid rgba(28,28,28,0.14)" }}>
              <button onClick={onClose} className="btn btn-ink w-full">
                Back to writing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
