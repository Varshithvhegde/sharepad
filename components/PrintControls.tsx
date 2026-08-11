"use client";

import { useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";

/**
 * Floating bar on the print view. Hidden from the printed output itself,
 * and opens the print dialog automatically so "Save as PDF" is one step.
 */
export default function PrintControls({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
    const timer = setTimeout(() => window.print(), 700);
    return () => clearTimeout(timer);
  }, [title]);

  return (
    <div
      className="no-print sticky top-0 z-10 flex items-center gap-3 px-5 py-3"
      style={{
        background: "#f6f6f4",
        borderBottom: "1px solid #dcdcd8",
        fontFamily: "var(--font-sans), system-ui, sans-serif",
      }}
    >
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-[0.85rem]"
        style={{ color: "#555" }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <p className="flex-1 text-[0.85rem] text-center" style={{ color: "#777" }}>
        Choose <strong style={{ color: "#333" }}>Save as PDF</strong> as the destination.
      </p>

      <button
        onClick={() => window.print()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[0.85rem]"
        style={{ background: "#222", color: "#fff", borderRadius: 4 }}
      >
        <Printer size={14} /> Print
      </button>
    </div>
  );
}
