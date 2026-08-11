"use client";

import { extractToc } from "@/lib/notebooks";

interface TableOfContentsProps {
  content: string;
  theme?: "dark" | "paper";
}

export default function TableOfContents({ content, theme = "dark" }: TableOfContentsProps) {
  const toc = extractToc(content);
  if (toc.length === 0) return null;

  const muted = theme === "paper" ? "text-[var(--paper-ink-2)]" : "text-[var(--ink-2)]";

  return (
    <nav className={`text-sm ${muted}`}>
      <p className="text-xs uppercase tracking-widest mb-2 opacity-60">On this page</p>
      <ul className="space-y-1">
        {toc.map((item, i) => (
          <li key={i} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
            <a
              href={`#${item.id}`}
              className="hover:text-[var(--accent)] transition-colors"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
