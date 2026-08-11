import type { NotebookFont } from "./types";

export interface FontOption {
  id: NotebookFont;
  label: string;
  hint: string;
  /** Class applied to the notebook surface; defined in globals.css. */
  className: string;
  /** Suitable for printed output and formal documents. */
  professional: boolean;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "hand",
    label: "Handwritten",
    hint: "Looks like a real notebook",
    className: "font-hand",
    professional: false,
  },
  {
    id: "serif",
    label: "Serif",
    hint: "Reports, essays, anything printed",
    className: "font-serif-doc",
    professional: true,
  },
  {
    id: "sans",
    label: "Sans",
    hint: "Clean and neutral",
    className: "font-sans-doc",
    professional: true,
  },
  {
    id: "mono",
    label: "Monospace",
    hint: "Code and technical notes",
    className: "font-mono-doc",
    professional: true,
  },
];

export function fontClass(font: NotebookFont | undefined): string {
  return FONT_OPTIONS.find((f) => f.id === font)?.className ?? "font-hand";
}
