"use client";

import { useCallback, useRef, type KeyboardEvent, type RefObject } from "react";
import { INDENT, indentBlock, lineRange, outdentBlock } from "./editor-indent";

/**
 * Makes Tab indent inside a textarea rather than moving focus, which is what
 * anyone nesting a Markdown list expects.
 *
 * Pressing Escape first restores normal behaviour for one keystroke, so a
 * keyboard user is never stuck in the box — capturing Tab without that would
 * make the textarea the one control they cannot leave.
 *
 * `onFallbackChange` is only used if execCommand is unavailable; see below.
 */
export function useTabIndent(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  onFallbackChange: (value: string) => void
) {
  const tabEscapes = useRef(false);

  /*
   * Edits through execCommand so the browser's undo stack survives. Assigning
   * to textarea.value would discard it, and a single Cmd+Z after Tab would then
   * throw away everything typed beforehand as well. It is deprecated but still
   * the only undoable way to edit a textarea, and it fires the input event that
   * keeps React's state in step.
   */
  const replaceRange = useCallback(
    (from: number, to: number, text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.focus();
      textarea.setSelectionRange(from, to);

      if (!document.execCommand("insertText", false, text)) {
        const next = textarea.value.slice(0, from) + text + textarea.value.slice(to);
        onFallbackChange(next);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(from + text.length, from + text.length);
        });
      }
    },
    [textareaRef, onFallbackChange]
  );

  return useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        tabEscapes.current = true;
        return;
      }

      if (e.key !== "Tab") {
        tabEscapes.current = false;
        return;
      }

      if (tabEscapes.current) {
        tabEscapes.current = false;
        return; // let focus move on, as Tab normally would
      }

      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd, value } = textarea;
      const spansLines = value.slice(selectionStart, selectionEnd).includes("\n");

      e.preventDefault();

      // A plain Tab with nothing selected just inserts an indent.
      if (!e.shiftKey && !spansLines) {
        replaceRange(selectionStart, selectionEnd, INDENT);
        return;
      }

      const { from, to } = lineRange(value, selectionStart, selectionEnd);
      const block = value.slice(from, to);
      const updated = e.shiftKey ? outdentBlock(block) : indentBlock(block);
      if (updated === block) return;

      replaceRange(from, to, updated);

      // Keep the same lines selected so the shortcut can be repeated.
      requestAnimationFrame(() => {
        textarea.setSelectionRange(from, from + updated.length);
      });
    },
    [replaceRange]
  );
}
