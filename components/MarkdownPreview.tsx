"use client";

import { memo } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { PluggableList } from "unified";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { headingId } from "@/lib/notebooks";
import { markdownSchema } from "@/lib/markdown-schema";

function toText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(toText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return toText((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

/** Anchored headings so the table of contents can link into the page. */
function heading(Tag: "h1" | "h2" | "h3" | "h4") {
  return function Heading({ children, ...props }: ComponentPropsWithoutRef<typeof Tag>) {
    return (
      <Tag id={headingId(toText(children))} {...props}>
        {children}
      </Tag>
    );
  };
}

const COMPONENTS = {
  h1: heading("h1"),
  h2: heading("h2"),
  h3: heading("h3"),
  h4: heading("h4"),
  a: ({ children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a {...props} target="_blank" rel="noopener noreferrer nofollow">
      {children}
    </a>
  ),
  // Incomplete image syntax (e.g. ![]( ) while uploading) must not render an img
  // with an empty src — the browser refetches the whole page for that.
  img: ({ src, alt, ...props }: ComponentPropsWithoutRef<"img">) => {
    const url = typeof src === "string" ? src.trim() : "";
    if (!url) {
      return alt?.trim() ? (
        <span className="text-[var(--ink-3)] italic">{alt}</span>
      ) : null;
    }
    return <img src={url} alt={alt ?? ""} loading="lazy" decoding="async" {...props} />;
  },
};

const REMARK = [remarkGfm, remarkMath];

/*
 * Order matters. Raw HTML is parsed into the tree first, then everything
 * dangerous is stripped, and only then is highlighting applied — so the classes
 * the highlighter adds are not themselves subject to sanitising, and no
 * unsanitised node ever reaches the output. KaTeX runs last: it turns math
 * nodes into trusted markup from the library, not raw author HTML.
 */
const REHYPE: PluggableList = [
  rehypeRaw,
  [rehypeSanitize, markdownSchema],
  rehypeHighlight,
  rehypeKatex,
];

function MarkdownPreview({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  if (!content.trim()) {
    return (
      <p className={`markdown-body ${className}`} style={{ color: "var(--ink-3)" }}>
        This page is empty.
      </p>
    );
  }

  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown remarkPlugins={REMARK} rehypePlugins={REHYPE} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Parsing is the expensive part of typing, so skip it when nothing changed.
export default memo(MarkdownPreview);
