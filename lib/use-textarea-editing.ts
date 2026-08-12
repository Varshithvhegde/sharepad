"use client";

import { useCallback, useRef, type KeyboardEvent, type RefObject } from "react";
import { INDENT, indentBlock, lineRange, outdentBlock } from "./editor-indent";

/**
 * Editing helpers for the Markdown textareas.
 *
 * Everything that changes the text goes through `replaceRange`, which matters
 * more than it looks: rebuilding the document and assigning it to React state
 * replaces the textarea's whole value and throws away the browser's undo
 * history, so Ctrl+Z would work after typing but do nothing after a toolbar
 * button. Editing through execCommand keeps one continuous undo stack across
 * typing, toolbar buttons and Tab alike.
 *
 * execCommand is deprecated but is still the only undoable way to edit a
 * textarea. It fires the input event, so React's state follows normally, and
 * because the state then matches the DOM there is no re-render to disturb the
 * selection.
 */
export function useTextareaEditing(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  onFallbackChange: (value: string) => void
) {
  const tabEscapes = useRef(false);

  const replaceRange = useCallback(
    (from: number, to: number, text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.focus();
      textarea.setSelectionRange(from, to);

      if (!document.execCommand("insertText", false, text)) {
        // Undo history is lost on this path, but the edit still lands.
        const next = textarea.value.slice(0, from) + text + textarea.value.slice(to);
        onFallbackChange(next);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(from + text.length, from + text.length);
        });
      }
    },
    [textareaRef, onFallbackChange]
  );

  /**
   * Wraps or prefixes the selection, then leaves the inner text selected so the
   * placeholder can be typed straight over.
   */
  const applyFormat = useCallback(
    (before: string, after = "", placeholder = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd, value } = textarea;
      const selected = value.slice(selectionStart, selectionEnd) || placeholder;

      replaceRange(selectionStart, selectionEnd, before + selected + after);

      const innerStart = selectionStart + before.length;
      requestAnimationFrame(() => {
        textarea.setSelectionRange(innerStart, innerStart + selected.length);
      });
    },
    [textareaRef, replaceRange]
  );

  /**
   * Tab indents rather than leaving the box, which is what anyone nesting a
   * list expects. Pressing Escape first restores normal behaviour for one
   * keystroke, so a keyboard user is never stuck here.
   */
  const handleKeyDown = useCallback(
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

  /** Drops text in at the caret. */
  const insertAtCaret = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      replaceRange(textarea.selectionStart, textarea.selectionEnd, text);
    },
    [textareaRef, replaceRange]
  );

  /**
   * Swaps the first occurrence of some exact text, used to turn an upload
   * placeholder into its finished link wherever the writer has since moved to.
   */
  const replaceText = useCallback(
    (find: string, replaceWith: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const at = textarea.value.indexOf(find);
      if (at === -1) return; // already edited away; leave the text alone

      replaceRange(at, at + find.length, replaceWith);
    },
    [textareaRef, replaceRange]
  );

  return { replaceRange, applyFormat, handleKeyDown, insertAtCaret, replaceText };
}
