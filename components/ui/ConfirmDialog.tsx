"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

export interface ConfirmOptions {
  title: string;
  /** What actually happens, in plain terms. */
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface ConfirmDialogProps extends ConfirmOptions {
  onResolve: (confirmed: boolean) => void;
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onResolve,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onResolve(false);
      }
    }
    // Capture phase so the editor's own Escape handling doesn't run as well.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onResolve]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-5"
      style={{ background: "rgba(28,28,28,0.4)" }}
      onClick={() => onResolve(false)}
      role="presentation"
    >
      <div
        className="w-full max-w-sm relative note-enter"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <span
          className={`tape ${destructive ? "tape-p" : "tape-y"}`}
          style={{
            top: -9,
            left: "50%",
            transform: "translateX(-50%) rotate(-2deg)",
            width: 60,
            height: 17,
          }}
        />
        <div className="sk">
          <div className="sk-b" />
          <div className="sk-i p-6 pt-8">
            <div className="flex items-start gap-3 mb-4">
              {destructive && (
                <AlertTriangle size={20} className="shrink-0 mt-0.5" style={{ color: "var(--red)" }} />
              )}
              <div>
                <h2
                  id="confirm-title"
                  className="text-[1.3rem] leading-tight mb-1"
                  style={{ fontFamily: "var(--font-sketch), serif" }}
                >
                  {title}
                </h2>
                <p id="confirm-message" className="text-[0.92rem]" style={{ color: "var(--ink-2)" }}>
                  {message}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => onResolve(false)} className="btn flex-1">
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                onClick={() => onResolve(true)}
                className={`btn flex-1 ${destructive ? "btn-red" : "btn-ink"}`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Replaces window.confirm with something that matches the rest of the app.
 * `ask` resolves to true when the person goes ahead.
 */
export function useConfirm() {
  const [pending, setPending] = useState<
    (ConfirmOptions & { resolve: (v: boolean) => void }) | null
  >(null);

  const ask = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    []
  );

  const resolve = useCallback(
    (confirmed: boolean) => {
      pending?.resolve(confirmed);
      setPending(null);
    },
    [pending]
  );

  const dialog = pending ? <ConfirmDialog {...pending} onResolve={resolve} /> : null;

  return { ask, dialog };
}
