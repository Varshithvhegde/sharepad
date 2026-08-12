"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";

export default function RecoverPage() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const input = value.trim();
    const token = input.match(/\/e\/([a-f0-9]{64})/i)?.[1] ?? input;

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      setError("That doesn't look like an edit link. Paste the whole /e/… address.");
      return;
    }
    track({ name: "notebook_recovered", props: {} });
    router.push(`/e/${token}`);
  }

  return (
    <div className="min-h-screen paper-dot flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="btn-ghost !px-0 mb-7 text-[0.92rem]">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="relative">
          <span
            className="tape tape-b"
            style={{ top: -9, left: 32, transform: "rotate(-3deg)", width: 58, height: 17 }}
          />
          <form onSubmit={handleSubmit} className="sk">
            <div className="sk-b" />
            <div className="sk-i p-7 pt-9">
              <h1 className="text-[1.7rem] leading-tight mb-1" style={{ fontFamily: "var(--font-sketch), serif" }}>
                Open a notebook
              </h1>
              <p className="text-[0.93rem] mb-5" style={{ color: "var(--ink-2)" }}>
                Paste the edit link you saved when you created it.
              </p>

              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={3}
                placeholder="https://…/e/9f2c…"
                aria-label="Edit link"
                autoFocus
                className="field resize-none text-[0.8rem] mb-3"
                style={{ fontFamily: "ui-monospace, monospace" }}
              />

              {error && (
                <p className="text-[0.88rem] mb-3" style={{ color: "var(--red)" }}>
                  {error}
                </p>
              )}

              <button type="submit" className="btn btn-ink w-full">
                Open it <ArrowRight size={15} />
              </button>

              <p className="text-[0.82rem] mt-5" style={{ color: "var(--ink-3)" }}>
                Lost the link? There is no way to recover it — that is what keeps notebooks
                private without accounts.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
