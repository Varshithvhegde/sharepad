"use client";

import type { ReactNode } from "react";

interface TooltipProps {
  /** What the control does, in the same words used elsewhere. */
  label: string;
  /** Optional shortcut, rendered as a key cap. */
  keys?: string;
  /** Pull the bubble to an edge when the trigger sits near the viewport border. */
  align?: "center" | "start" | "end";
  children: ReactNode;
}

const ALIGNMENT: Record<NonNullable<TooltipProps["align"]>, string> = {
  center: "left-1/2 -translate-x-1/2",
  start: "left-0",
  end: "right-0",
};

/**
 * Hover and focus hint for icon-only controls.
 *
 * Purely visual: the trigger keeps its own accessible name, so screen readers
 * are not told the same thing twice.
 */
export default function Tooltip({ label, keys, align = "center", children }: TooltipProps) {
  return (
    <span className="relative inline-flex group">
      {children}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-full mt-2 z-[60] flex items-center gap-1.5 whitespace-nowrap px-2 py-1 text-[0.78rem] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${ALIGNMENT[align]}`}
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          boxShadow: "2px 2px 0 rgba(28,28,28,0.25)",
        }}
      >
        {label}
        {keys && (
          <kbd
            className="px-1 text-[0.7rem]"
            style={{
              background: "rgba(250,249,246,0.16)",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            {keys}
          </kbd>
        )}
      </span>
    </span>
  );
}
