"use client";

import { extractToc } from "@/lib/notebooks";

export default function TableOfContents({ content }: { content: string }) {
  const toc = extractToc(content);
  if (toc.length < 2) return null;

  return (
    <nav aria-label="On this page">
      <h2
        className="text-[1.05rem] mb-2"
        style={{ fontFamily: "var(--font-sketch), serif" }}
      >
        On this page
      </h2>
      <ul className="space-y-1">
        {toc.map((item, i) => (
          <li key={`${item.id}-${i}`} style={{ paddingLeft: (item.level - 1) * 14 }}>
            <a
              href={`#${item.id}`}
              className="text-[0.9rem] hover:underline"
              style={{ color: "var(--ink-2)" }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
