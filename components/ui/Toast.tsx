"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

const TINT: Record<Toast["type"], string> = {
  success: "var(--sticky-g)",
  error: "var(--sticky-p)",
  info: "var(--sticky-y)",
};

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t, i) => (
        <ToastItem key={t.id} toast={t} index={i} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  index,
  onDismiss,
}: {
  toast: Toast;
  index: number;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3400);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="sk note-enter pointer-events-auto min-w-[15rem] max-w-sm"
      style={{
        background: TINT[toast.type],
        ["--rot" as string]: index % 2 ? "0.8deg" : "-0.8deg",
        transform: `rotate(${index % 2 ? "0.8deg" : "-0.8deg"})`,
      }}
    >
      <div className="sk-b" />
      <div className="sk-i flex items-center gap-3 px-4 py-2.5">
        <span className="text-[0.92rem] flex-1">{toast.message}</span>
        <button onClick={onDismiss} className="btn-ghost !px-1 !py-0.5" aria-label="Dismiss">
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}
