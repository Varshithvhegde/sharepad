"use client";

import {
  Bold,
  CheckSquare,
  CircleQuestionMark,
  Code,
  Heading1,
  Heading2,
  ImagePlus,
  Loader2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Table,
} from "lucide-react";

interface MarkdownToolbarProps {
  onInsert: (before: string, after?: string, placeholder?: string) => void;
  onShowHelp: () => void;
  onPickImage: () => void;
  uploading: boolean;
}

const TOOLS = [
  { Icon: Bold, title: "Bold  ⌘B", args: ["**", "**", "bold"] },
  { Icon: Italic, title: "Italic  ⌘I", args: ["*", "*", "italic"] },
  { Icon: Heading1, title: "Big heading", args: ["\n# ", "", "Heading"] },
  { Icon: Heading2, title: "Heading", args: ["\n## ", "", "Heading"] },
  { Icon: List, title: "Bullet list", args: ["\n- ", "", "item"] },
  { Icon: ListOrdered, title: "Numbered list", args: ["\n1. ", "", "item"] },
  { Icon: CheckSquare, title: "Checklist", args: ["\n- [ ] ", "", "to do"] },
  { Icon: Quote, title: "Quote", args: ["\n> ", "", "quote"] },
  { Icon: Code, title: "Code block", args: ["\n```\n", "\n```\n", "code"] },
  { Icon: LinkIcon, title: "Link", args: ["[", "](https://)", "text"] },
  { Icon: Table, title: "Table", args: ["\n| A | B |\n| --- | --- |\n| ", " |  |\n", "cell"] },
  { Icon: Minus, title: "Divider", args: ["\n\n---\n\n", ""] },
] as const;

export default function MarkdownToolbar({
  onInsert,
  onShowHelp,
  onPickImage,
  uploading,
}: MarkdownToolbarProps) {
  return (
    <div
      className="flex items-center gap-0.5 px-2 py-1.5 shrink-0"
      style={{
        borderBottom: "1.5px solid rgba(28,28,28,0.12)",
        background: "var(--paper-2)",
      }}
    >
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {TOOLS.map(({ Icon, title, args }) => (
          <button
            key={title}
            type="button"
            title={title}
            aria-label={title}
            onClick={() => onInsert(args[0], args[1], args[2])}
            className="btn-ghost !px-2 !py-1.5 shrink-0"
          >
            <Icon size={15} />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onPickImage}
        disabled={uploading}
        title={uploading ? "Uploading…" : "Add an image, or just paste one"}
        aria-label="Add an image"
        className="btn-ghost !px-2 !py-1.5 shrink-0"
      >
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
      </button>

      {/* Nothing else advertises that tables, checklists or details blocks exist. */}
      <button
        type="button"
        onClick={onShowHelp}
        title="What you can write"
        aria-label="What you can write"
        className="btn-ghost !px-2 !py-1.5 shrink-0 ml-auto"
      >
        <CircleQuestionMark size={15} />
      </button>
    </div>
  );
}

