export interface PageTemplate {
  id: string;
  name: string;
  icon: string;
  title: string;
  content: string;
}

const today = () =>
  new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "blank",
    name: "Blank page",
    icon: "📄",
    title: "Untitled",
    content: "",
  },
  {
    id: "meeting",
    name: "Meeting notes",
    icon: "📋",
    title: "Meeting notes",
    content: `## Attendees


## Agenda
1.
2.

## Notes


## Next steps
- [ ]
`,
  },
  {
    id: "todo",
    name: "Task list",
    icon: "✅",
    title: "Tasks",
    content: `## Today
- [ ]
- [ ]

## Later
- [ ]
`,
  },
  {
    id: "readme",
    name: "Project readme",
    icon: "📖",
    title: "Readme",
    content: `## What this is


## Getting started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Notes
-
`,
  },
  {
    id: "journal",
    name: "Journal entry",
    icon: "📔",
    title: today(),
    content: `## What happened


## What I learned


## Tomorrow
-
`,
  },
];

export const PAGE_ICONS = [
  "📄", "📝", "📋", "✅", "💡", "🔖", "📖", "📔",
  "🎯", "⭐", "🔥", "💬", "🗂️", "📌", "🎨", "🔬",
];

export const NOTEBOOK_ICONS = [
  "📝", "📓", "📚", "🗒️", "🚀", "💼", "🎓", "🧪",
  "🎨", "🌱", "🗺️", "🔧", "🍜", "🎬", "🏠", "🌍",
];

/**
 * Picks a title out of pasted text: the first heading if there is one,
 * otherwise the first meaningful line.
 */
export function deriveTitle(text: string): string {
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const heading = /^#{1,6}\s+(.+)$/.exec(line);
    const candidate = (heading ? heading[1] : line)
      .replace(/[*_`>#\-[\]]/g, "")
      .trim();
    if (candidate) return candidate.slice(0, 60);
  }
  return "Untitled note";
}

export const WELCOME_PAGE = (title: string) => `Everything you write here is markdown, and it renders as you type.

## A few things to try
- Hit **New page** in the sidebar to add more pages — as many as you want
- Select some text and press **⌘B** to bold it
- Drop a checklist in with \`- [ ]\`

> Keep your edit link somewhere safe. It is the only key to *${title}*.
`;
