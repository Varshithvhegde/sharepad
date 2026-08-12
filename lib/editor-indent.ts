/** Two spaces, which is what nested markdown lists expect. */
export const INDENT = "  ";

/** Adds one level of indentation to every line given. */
export function indentBlock(block: string): string {
  return block
    .split("\n")
    .map((line) => INDENT + line)
    .join("\n");
}

/**
 * Removes one level of indentation, tolerating a single space or a tab so a
 * document that mixes them still outdents sensibly.
 */
export function outdentBlock(block: string): string {
  return block
    .split("\n")
    .map((line) => line.replace(/^(?: {1,2}|\t)/, ""))
    .join("\n");
}

/** The full lines covered by a selection, since indenting works line by line. */
export function lineRange(
  value: string,
  selectionStart: number,
  selectionEnd: number
): { from: number; to: number } {
  const from = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const nextBreak = value.indexOf("\n", selectionEnd);
  return { from, to: nextBreak === -1 ? value.length : nextBreak };
}
