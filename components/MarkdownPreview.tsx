"use client";

import { memo } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { headingId } from "@/lib/notebooks";

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
};

const REMARK = [remarkGfm];
const REHYPE = [rehypeHighlight];

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
