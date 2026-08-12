export interface UseCaseFaq {
  q: string;
  a: string;
}

export interface UseCase {
  slug: string;
  /** Page title; also the H1. */
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  steps: { heading: string; body: string }[];
  points: { heading: string; body: string }[];
  faqs: UseCaseFaq[];
  cta: { href: string; label: string };
}

export const USE_CASES: UseCase[] = [
  {
    slug: "share-markdown-without-signup",
    title: "Share markdown without signing up",
    metaTitle: "Share Markdown Without Signing Up",
    metaDescription:
      "Paste markdown, get a link, send it. Tables, code blocks and task lists render properly. No account, no email, free.",
    intro:
      "You have markdown in front of you — a readme, some meeting notes, a snippet of documentation — and you want to put it somewhere a colleague can read it. Not commit it to a repo, not paste it into a chat window where the formatting collapses. Just a link.",
    steps: [
      {
        heading: "Paste it",
        body: "Drop your markdown into the box. The title is taken from your first heading, and the address is generated, so there is nothing to fill in.",
      },
      {
        heading: "Take the link",
        body: "It lands on your clipboard the moment it is created. A second, secret link comes with it, and that one is how you edit the note later.",
      },
      {
        heading: "Add pages if you need them",
        body: "One link can hold a whole notebook. Add pages, name them, reorder them — readers get an index down the side.",
      },
    ],
    points: [
      {
        heading: "GitHub-flavoured markdown, rendered properly",
        body: "Tables keep their columns, fenced code keeps its syntax highlighting, and task lists render as real checkboxes rather than literal brackets.",
      },
      {
        heading: "Editable after the fact",
        body: "Most paste tools are write-once. Keep the edit link and you can fix a typo an hour later without the URL you shared changing.",
      },
      {
        heading: "It cleans up after itself",
        body: "Notes expire after ten days by default. Push that out to a year, or turn expiry off entirely if it is something you want to keep.",
      },
    ],
    faqs: [
      {
        q: "Do I need an account to share markdown?",
        a: "No. There is no sign-up, no email and no password to create. Paste your markdown and you get a link straight away.",
      },
      {
        q: "Does it support tables and code blocks?",
        a: "Yes. GitHub-flavoured markdown is supported, which covers tables, fenced code blocks with syntax highlighting, task lists, strikethrough and footnotes.",
      },
      {
        q: "Can I edit the markdown after sharing it?",
        a: "Yes. When you create a note you get a second, secret edit link. Anyone with the view link sees your changes without the address changing.",
      },
      {
        q: "Can I put more than one page behind a single link?",
        a: "Yes. A notebook can hold many pages, and readers navigate them from an index beside the text. This is the main thing that separates it from a plain markdown pastebin.",
      },
    ],
    cta: { href: "/quick", label: "Paste your markdown" },
  },
  {
    slug: "online-notepad-no-login",
    title: "An online notepad that never asks you to log in",
    metaTitle: "Online Notepad, No Login",
    metaDescription:
      "Open a page, start typing, keep the link. A free online notepad with no account, no email and no download.",
    intro:
      "Most online notepads want an email address before they will let you write a sentence. This one opens straight into a blank page. You type, it saves as you go, and the link in your address bar is how you come back to it.",
    steps: [
      {
        heading: "Open a blank page",
        body: "Nothing to install and nothing to agree to. The page is ready to type into the moment it loads.",
      },
      {
        heading: "Write",
        body: "Everything is saved automatically about a second after you stop typing, so there is no save button to forget.",
      },
      {
        heading: "Keep the link",
        body: "Your browser remembers the notebooks you make, so they are listed on the home page when you come back. Copy the link somewhere safe if you plan to switch devices.",
      },
    ],
    points: [
      {
        heading: "Plain typing or full markdown",
        body: "Write ordinary prose and it stays ordinary prose. Reach for headings, lists or a table and markdown is there when you want it.",
      },
      {
        heading: "More than one page",
        body: "A notepad that only holds one page stops being useful quickly. Add as many as you like and they all live behind the same address.",
      },
      {
        heading: "Nothing to lose",
        body: "Every page keeps its last ten drafts, so an accidental delete or a bad paste can be undone from the history panel.",
      },
    ],
    faqs: [
      {
        q: "Is this online notepad really free?",
        a: "Yes, and there is no paid tier holding features back. Passwords, expiry dates, PDF export and multiple pages are all included.",
      },
      {
        q: "Do I need to create an account or log in?",
        a: "No. There is no login at all. Ownership works through a secret link that is created with your notebook, which means there is no password to forget and no email to hand over.",
      },
      {
        q: "What happens if I lose the link to my notes?",
        a: "Your browser keeps a list of notebooks you have made, so check the home page on the same device first. If you have lost the edit link entirely there is no way to recover it, which is the trade-off for not asking who you are.",
      },
      {
        q: "Can other people see what I write?",
        a: "Only if you give them the address. Notebooks are unlisted and not indexed by search engines unless you deliberately mark one public. You can also add a password.",
      },
    ],
    cta: { href: "/quick", label: "Open a blank page" },
  },
  {
    slug: "share-notes-without-account",
    title: "Send someone your notes without either of you making an account",
    metaTitle: "Share Notes Without an Account",
    metaDescription:
      "Send notes as a link. Nobody signs up — not you, not the person reading. Optional password, expiry date and comments.",
    intro:
      "The awkward part of sharing notes is rarely the writing. It is that the tool wants you to have an account, and then wants the person reading to have one too. Here the reader clicks a link and reads. That is the whole flow.",
    steps: [
      {
        heading: "Write the notes",
        body: "Paste something you already have, or start from a template for meeting notes, a task list or a readme.",
      },
      {
        heading: "Send the view link",
        body: "The person on the other end needs nothing. No account, no app, no extension — it opens in whatever browser they already have.",
      },
      {
        heading: "Keep the edit link",
        body: "The two links do different jobs. The one you share is read-only; the one you keep is the only way to change or delete the notebook.",
      },
    ],
    points: [
      {
        heading: "Let them write back",
        body: "Readers can leave comments on a page without signing up. If you would rather they edit directly, one switch opens the notebook to anyone holding the link.",
      },
      {
        heading: "Lock it when it matters",
        body: "Add a password to the view link, freeze the notebook read-only, or set it to delete itself the first time it is opened.",
      },
      {
        heading: "Set a deadline",
        body: "Notes disappear after ten days unless you say otherwise, so a link you sent about last month's meeting does not sit around forever.",
      },
    ],
    faqs: [
      {
        q: "Does the person receiving my notes need an account?",
        a: "No. They open the link and read. There is nothing to install and no sign-up prompt at any point.",
      },
      {
        q: "Can I stop people editing what I send?",
        a: "That is the default. The link you share is read-only. Editing requires the separate secret link that only you hold, unless you deliberately open the notebook up to everyone.",
      },
      {
        q: "Can I password-protect notes I share?",
        a: "Yes. Add a password when you create the notebook or later from settings, and readers are asked for it before they see anything.",
      },
      {
        q: "Can I take a shared note back?",
        a: "Yes. Delete the notebook from settings and the link stops working immediately. You can also set it to expire on a date, or to delete itself after a single read.",
      },
    ],
    cta: { href: "/new", label: "Write something to send" },
  },
  {
    slug: "markdown-to-pdf",
    title: "Turn markdown into a PDF you would be happy to send",
    metaTitle: "Markdown to PDF",
    metaDescription:
      "Convert markdown to a clean PDF in the browser. Serif type, a contents page and proper page breaks. Free, no upload, no account.",
    intro:
      "Markdown is for writing; a PDF is for handing over. The conversion usually costs you something — a watermark, an upload to a service you have never heard of, or output that looks like a web page someone printed by accident.",
    steps: [
      {
        heading: "Write or paste your markdown",
        body: "One page or a whole notebook of them. Nothing is uploaded anywhere separate — it is the same document you were already editing.",
      },
      {
        heading: "Open the print view",
        body: "Every page in the notebook is laid out as a single document with a title sheet and a contents list built from your headings.",
      },
      {
        heading: "Save as PDF",
        body: "Your browser's own print dialog does the conversion, so nothing is sent to a third-party converter and there is no watermark.",
      },
    ],
    points: [
      {
        heading: "It reads like a document, not a screenshot",
        body: "The printed version drops the notebook styling entirely: Source Serif on plain white, no paper texture and no handwriting, whichever typeface you chose on screen.",
      },
      {
        heading: "Page breaks in sensible places",
        body: "Each notebook page starts on a fresh sheet, and tables, code blocks and images are kept from splitting across a break.",
      },
      {
        heading: "Formatting survives",
        body: "Tables keep their borders, code blocks keep their monospace and their background, and links stay clickable in the exported file.",
      },
    ],
    faqs: [
      {
        q: "How do I convert markdown to PDF for free?",
        a: "Paste your markdown, open the print view and choose Save as PDF in your browser's print dialog. There is no account, no watermark and no file upload to a converter.",
      },
      {
        q: "Does the PDF use the handwritten font?",
        a: "No. Printed output always uses a professional serif on plain white, even when the notebook is set to the handwritten style on screen, so it is suitable for sending to a client or a colleague.",
      },
      {
        q: "Can I export several pages as one PDF?",
        a: "Yes. The print view collects every page in the notebook into a single document, adds a title sheet and builds a contents list from your headings.",
      },
      {
        q: "Are tables and code blocks preserved?",
        a: "Yes. Tables keep their borders and header shading, and fenced code keeps its monospace type. Both are prevented from breaking across pages where possible.",
      },
    ],
    cta: { href: "/quick", label: "Paste markdown to export" },
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}
