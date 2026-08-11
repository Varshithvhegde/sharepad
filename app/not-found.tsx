import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";

const REASONS = [
  { tape: "y", text: "It ran out of time. Notebooks delete themselves on a schedule." },
  { tape: "b", text: "Someone deleted it on purpose." },
  { tape: "p", text: "It was a read-once link and has already been opened." },
  { tape: "g", text: "The address has a typo in it." },
];

export default function NotFound() {
  return (
    <main className="min-h-dvh paper-dot flex items-center justify-center px-5 py-14">
      <div className="w-full max-w-lg">
        <TornPage />

        <div className="mt-10 text-center">
          <h1
            className="text-[1.9rem] leading-tight mb-2"
            style={{ fontFamily: "var(--font-sketch), serif" }}
          >
            This page isn&apos;t in the notebook
          </h1>
          <p className="text-[1rem] mb-8" style={{ color: "var(--ink-2)" }}>
            Four of the usual suspects:
          </p>
        </div>

        <ul className="space-y-3 mb-10">
          {REASONS.map((reason, i) => (
            <li key={reason.text} className="relative">
              <span
                className={`tape tape-${reason.tape}`}
                style={{
                  top: -7,
                  left: 20,
                  transform: "rotate(-3deg)",
                  width: 42,
                  height: 13,
                }}
              />
              <div
                className="sk"
                style={{ transform: `rotate(${i % 2 ? "0.4deg" : "-0.4deg"})` }}
              >
                <div className="sk-b" style={{ borderWidth: "1.2px" }} />
                <div className="sk-i px-4 py-3 text-[0.94rem]">{reason.text}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/quick" className="btn btn-ink text-[1.02rem]">
            Write a new one <ArrowRight size={15} />
          </Link>
          <Link href="/recover" className="btn text-[1.02rem]">
            <KeyRound size={14} /> I have an edit link
          </Link>
        </div>
      </div>
    </main>
  );
}

/** A page ripped out of the notebook, with 404 scrawled where the text should be. */
function TornPage() {
  return (
    <div className="relative mx-auto w-full max-w-[19rem] note-enter">
      <span
        className="tape tape-o"
        style={{ top: -10, left: "50%", transform: "translateX(-50%) rotate(-4deg)", width: 74, height: 19 }}
      />
      <div className="sk" style={{ transform: "rotate(-1.5deg)" }}>
        <div className="sk-b" />
        <div className="sk-i">
          <div
            className="margin-rule paper-ruled pt-8 pb-10 pl-14 pr-6"
            style={{
              // A torn bottom edge, cut straight out of the paper.
              clipPath:
                "polygon(0 0, 100% 0, 100% 86%, 92% 92%, 84% 85%, 75% 93%, 66% 86%, 57% 94%, 48% 87%, 39% 95%, 30% 88%, 21% 95%, 12% 88%, 4% 94%, 0 88%)",
            }}
          >
            <p
              className="text-[3.6rem] leading-none mb-2"
              style={{ fontFamily: "var(--font-sketch), serif", color: "var(--red)" }}
            >
              404
            </p>
            <svg width="150" height="12" viewBox="0 0 150 12" preserveAspectRatio="none" aria-hidden>
              <path
                d="M1,7 C26,2 50,10 74,6 C98,2 124,9 149,6"
                stroke="var(--ink)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <p className="mt-4 text-[0.95rem]" style={{ color: "var(--ink-2)" }}>
              nothing here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
