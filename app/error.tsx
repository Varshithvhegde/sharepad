"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-dvh paper-dot flex items-center justify-center px-5 py-14">
      <div className="w-full max-w-md">
        <div className="relative note-enter">
          <span
            className="tape tape-p"
            style={{ top: -10, left: "50%", transform: "translateX(-50%) rotate(3deg)", width: 72, height: 18 }}
          />
          <div className="sk" style={{ transform: "rotate(0.8deg)" }}>
            <div className="sk-b" />
            <div className="sk-i">
              <div className="margin-rule paper-ruled pt-8 pb-8 pl-14 pr-6">
                <InkBlot />

                <h1
                  className="text-[1.8rem] leading-tight mt-4 mb-2"
                  style={{ fontFamily: "var(--font-sketch), serif" }}
                >
                  The pen leaked
                </h1>
                <p className="text-[0.96rem] mb-1" style={{ color: "var(--ink-2)" }}>
                  Something broke on our side, not yours. Nothing you wrote has been lost —
                  pages are saved as you type.
                </p>
                {error.digest && (
                  <p
                    className="text-[0.74rem] mt-4"
                    style={{ color: "var(--ink-3)", fontFamily: "ui-monospace, monospace" }}
                  >
                    Reference: {error.digest}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <button onClick={reset} className="btn btn-ink text-[1.02rem]">
            <RotateCcw size={15} /> Try that again
          </button>
          <Link href="/" className="btn text-[1.02rem]">
            <Home size={15} /> Back to the start
          </Link>
        </div>
      </div>
    </main>
  );
}

/** A spreading ink stain, drawn rather than photographed so it scales cleanly. */
function InkBlot() {
  return (
    <svg width="92" height="66" viewBox="0 0 92 66" fill="none" aria-hidden>
      <path
        d="M20 30c-6-10 2-22 14-22 9 0 12 6 20 6 9 0 14-8 22-4 9 5 10 18 3 26-6 7-16 6-22 12-6 5-14 8-21 4-8-5-10-14-16-22z"
        fill="var(--red)"
        opacity="0.85"
      />
      <circle cx="70" cy="52" r="5" fill="var(--red)" opacity="0.7" />
      <circle cx="81" cy="60" r="3" fill="var(--red)" opacity="0.55" />
      <circle cx="14" cy="52" r="3.5" fill="var(--red)" opacity="0.6" />
    </svg>
  );
}
