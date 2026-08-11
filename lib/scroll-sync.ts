import { headingId } from "./notebooks";

/** A matched pair of vertical offsets: where a heading sits in each pane. */
export type Anchor = [source: number, preview: number];

interface SourceHeading {
  id: string;
  /** Character index where the heading line starts. */
  offset: number;
}

/**
 * Headings in the markdown source, with the character offset of each.
 * Fenced code is skipped so a `# comment` inside a snippet isn't mistaken
 * for a heading.
 */
function sourceHeadings(content: string): SourceHeading[] {
  const found: SourceHeading[] = [];
  let offset = 0;
  let inFence = false;

  for (const line of content.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
    } else if (!inFence) {
      const match = /^(#{1,4})\s+(.+)$/.exec(line.trim());
      if (match) {
        const text = match[2].replace(/[#*`_]/g, "").trim();
        found.push({ id: headingId(text), offset });
      }
    }
    offset += line.length + 1;
  }
  return found;
}

/**
 * An offscreen clone of the textarea. A textarea gives no way to ask where a
 * given character sits once the text wraps, so we lay the same string out in a
 * div with identical metrics and measure it there.
 */
function measuringClone(textarea: HTMLTextAreaElement): HTMLDivElement {
  const id = "sp-scroll-measure";
  let clone = document.getElementById(id) as HTMLDivElement | null;
  if (!clone) {
    clone = document.createElement("div");
    clone.id = id;
    clone.setAttribute("aria-hidden", "true");
    document.body.appendChild(clone);
  }

  const style = getComputedStyle(textarea);
  Object.assign(clone.style, {
    position: "absolute",
    top: "0",
    left: "-99999px",
    visibility: "hidden",
    pointerEvents: "none",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    boxSizing: "border-box",
    width: `${textarea.clientWidth}px`,
    padding: style.padding,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    tabSize: style.tabSize,
  } satisfies Partial<CSSStyleDeclaration>);

  return clone;
}

/**
 * Pairs each heading's offset in the editor with the same heading's offset in
 * the rendered preview, so scrolling can be interpolated between real landmarks
 * instead of assuming both panes grow at the same rate.
 */
export function buildAnchors(
  textarea: HTMLTextAreaElement,
  preview: HTMLElement,
  content: string
): Anchor[] {
  const headings = sourceHeadings(content);
  if (headings.length === 0) return [];

  const clone = measuringClone(textarea);
  clone.textContent = content;

  const textNode = clone.firstChild;
  if (!textNode) return [];

  const cloneTop = clone.getBoundingClientRect().top;
  const previewTop = preview.getBoundingClientRect().top - preview.scrollTop;
  const range = document.createRange();
  const anchors: Anchor[] = [];

  for (const heading of headings) {
    // Attribute selector rather than #id: generated ids may start with a digit.
    const rendered = preview.querySelector(`[id="${CSS.escape(heading.id)}"]`);
    if (!rendered) continue;

    try {
      range.setStart(textNode, heading.offset);
      range.setEnd(textNode, Math.min(heading.offset + 1, content.length));
    } catch {
      continue;
    }

    const sourceY = range.getBoundingClientRect().top - cloneTop;
    const previewY = rendered.getBoundingClientRect().top - previewTop;

    // Keep the list strictly increasing so interpolation stays stable.
    const last = anchors[anchors.length - 1];
    if (!last || (sourceY > last[0] && previewY > last[1])) {
      anchors.push([sourceY, previewY]);
    }
  }

  return anchors;
}

/**
 * Converts a scroll position in one pane to the matching position in the other,
 * interpolating between the nearest anchors and falling back to a proportional
 * mapping when there are none.
 */
export function mapScroll(
  value: number,
  anchors: Anchor[],
  sourceRange: number,
  targetRange: number,
  direction: "toPreview" | "toSource"
): number {
  if (sourceRange <= 0 || targetRange <= 0) return 0;

  const proportional = (value / sourceRange) * targetRange;
  if (anchors.length === 0) return proportional;

  const from = (a: Anchor) => (direction === "toPreview" ? a[0] : a[1]);
  const to = (a: Anchor) => (direction === "toPreview" ? a[1] : a[0]);

  const points: Anchor[] = [
    [0, 0],
    ...anchors.map((a): Anchor => [from(a), to(a)]),
    [sourceRange, targetRange],
  ];

  for (let i = 0; i < points.length - 1; i++) {
    const [aFrom, aTo] = points[i];
    const [bFrom, bTo] = points[i + 1];
    if (value >= aFrom && value <= bFrom) {
      const span = bFrom - aFrom;
      const ratio = span <= 0 ? 0 : (value - aFrom) / span;
      return aTo + ratio * (bTo - aTo);
    }
  }

  return proportional;
}
