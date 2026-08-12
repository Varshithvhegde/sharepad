"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Trash2 } from "lucide-react";
import { getSavedNotebooks, removeSavedNotebook } from "@/lib/local-storage";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import SupportSection from "@/components/marketing/SupportSection";
import type { SavedNotebook } from "@/lib/types";

const TAB_COLORS = ["sn-y", "sn-b", "sn-p", "sn-g"];

const capabilities = [
  {
    tape: "y",
    rot: "-1.2deg",
    color: "sn-y",
    title: "As many pages as you need",
    body: "A notebook is not one note. Add pages, name them, reorder them — they all live behind the same link.",
  },
  {
    tape: "b",
    rot: "1deg",
    color: "sn-b",
    title: "Pick your own link",
    body: "Claim sharepad.app/n/kitchen-reno while you type. Taken names tell you right away.",
  },
  {
    tape: "p",
    rot: "-0.8deg",
    color: "sn-p",
    title: "Notes that clean up after themselves",
    body: "Everything expires in 10 days unless you say otherwise. Stretch it to a year, or keep it forever.",
  },
  {
    tape: "g",
    rot: "1.4deg",
    color: "sn-g",
    title: "Two links, two levels of trust",
    body: "Hand out the view link freely. The edit link stays with you and is the only way back in.",
  },
  {
    tape: "o",
    rot: "-1.5deg",
    color: "sn-o",
    title: "Lock it if it's private",
    body: "Add a password, flip it read-only, or let it burn after a single read.",
  },
  {
    tape: "y",
    rot: "0.9deg",
    color: "sn-y",
    title: "Undo yesterday",
    body: "Every page keeps its last ten drafts. Open the history and put any of them back.",
  },
  {
    tape: "b",
    rot: "-1deg",
    color: "sn-b",
    title: "Hand it over",
    body: "Flip one switch and anyone with the link can write in it too. Handy for a shared list nobody wants to sign up for.",
  },
  {
    tape: "p",
    rot: "1.2deg",
    color: "sn-p",
    title: "Prints like a document",
    body: "Save the whole notebook as a PDF and the handwriting disappears — clean serif, contents page, one page per sheet.",
  },
];

export default function HomePage() {
  const [saved, setSaved] = useState<SavedNotebook[]>([]);

  useEffect(() => {
    setSaved(getSavedNotebooks());
  }, []);

  return (
    <div className="min-h-screen paper-dot">
      <SiteHeader />

      {/* ── Hero ── */}
      <section id="main" className="max-w-5xl mx-auto px-5 pt-14 pb-10 sm:pt-20">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
          <div>
            <PinnedTag />

            <h1
              className="mt-6 mb-1 leading-[1.06]"
              style={{
                fontFamily: "var(--font-sketch), serif",
                fontSize: "clamp(2.4rem, 6.5vw, 4rem)",
              }}
            >
              Write it down.
              <br />
              Send one link.
            </h1>

            <svg
              width="270"
              height="13"
              viewBox="0 0 270 13"
              preserveAspectRatio="none"
              className="block mb-6 draw-line"
              aria-hidden
            >
              <path
                d="M1,8 C42,3 78,11 118,7 C158,3 196,11 236,6 C250,4.5 262,7 269,8"
                stroke="var(--red)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            <p
              className="text-[1.08rem] leading-[1.75] max-w-[30rem] mb-8"
              style={{ color: "var(--ink-2)" }}
            >
              A notebook of markdown pages that lives at one address. No account, no
              email, no setup — start typing and the link is yours.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/quick" className="btn btn-ink btn-lg">
                Paste something now <ArrowRight size={18} />
              </Link>
              <Link href="/new" className="btn btn-lg">
                Set one up properly
              </Link>
            </div>

            <p className="mt-5 text-[0.88rem]" style={{ color: "var(--ink-3)" }}>
              Notes expire in 10 days unless you change it. ·{" "}
              <Link href="/recover" className="underline">
                Already have an edit link?
              </Link>
            </p>
          </div>

          {/* Signature: a real notebook with index tabs */}
          <NotebookPreview />
        </div>
      </section>

      {/* ── Saved notebooks ── */}
      {saved.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 py-10">
          <h2
            className="text-[1.4rem] mb-1"
            style={{ fontFamily: "var(--font-sketch), serif" }}
          >
            Back to your desk
          </h2>
          <p className="text-[0.9rem] mb-5" style={{ color: "var(--ink-2)" }}>
            Edit links this browser remembers.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {saved.map((nb, i) => (
              <div key={nb.editToken} className="relative">
                <span
                  className={`tape tape-${["y", "b", "p", "g"][i % 4]}`}
                  style={{
                    top: -8,
                    left: "50%",
                    transform: "translateX(-50%) rotate(-2deg)",
                    width: 48,
                    height: 15,
                  }}
                />
                <div
                  className={`sk ${TAB_COLORS[i % TAB_COLORS.length]}`}
                  style={{ transform: `rotate(${i % 2 ? "0.8deg" : "-0.9deg"})` }}
                >
                  <div className="sk-b" />
                  <div className="sk-i p-5 pt-6">
                    <Link href={`/e/${nb.editToken}`} className="block">
                      <h3
                        className="text-[1.15rem] leading-tight mb-1"
                        style={{ fontFamily: "var(--font-sketch), serif" }}
                      >
                        {nb.title}
                      </h3>
                      <p className="text-[0.8rem]" style={{ color: "var(--ink-2)" }}>
                        Opens straight into editing
                      </p>
                    </Link>
                    <button
                      onClick={() => {
                        removeSavedNotebook(nb.slug, nb.editToken);
                        setSaved(getSavedNotebooks());
                      }}
                      className="btn-ghost mt-3 !px-2 !py-1 text-[0.78rem]"
                      title="Forget this link on this browser"
                    >
                      <Trash2 size={12} /> Forget
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Capabilities ── */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <h2
          className="text-[1.9rem] mb-2"
          style={{ fontFamily: "var(--font-sketch), serif" }}
        >
          What you get
        </h2>
        <p className="text-[0.98rem] mb-9" style={{ color: "var(--ink-2)" }}>
          Nothing to configure. It all works from the first page.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {capabilities.map((c) => (
            <div key={c.title} className="relative">
              <span
                className={`tape tape-${c.tape}`}
                style={{
                  top: -8,
                  left: 24,
                  transform: "rotate(-3deg)",
                  width: 54,
                  height: 16,
                }}
              />
              <article
                className={`sk ${c.color} h-full`}
                style={{ transform: `rotate(${c.rot})` }}
              >
                <div className="sk-b" />
                <div className="sk-i p-5 pt-7">
                  <h3
                    className="text-[1.12rem] leading-snug mb-2"
                    style={{ fontFamily: "var(--font-sketch), serif" }}
                  >
                    {c.title}
                  </h3>
                  <p
                    className="text-[0.9rem] leading-[1.6]"
                    style={{ color: "var(--ink-2)" }}
                  >
                    {c.body}
                  </p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        className="max-w-3xl mx-auto px-5 py-16"
        style={{ borderTop: "1.5px dashed var(--rule)" }}
      >
        <h2
          className="text-[1.9rem] mb-8"
          style={{ fontFamily: "var(--font-sketch), serif" }}
        >
          Three steps, start to shared
        </h2>

        <ol className="space-y-7">
          {[
            {
              t: "Paste or name it",
              d: "Drop text straight in and take the link, or set the address, paper and typeface yourself.",
            },
            {
              t: "Fill it with pages",
              d: "Write markdown on the left, watch it render on the right. Add pages whenever you need one.",
            },
            {
              t: "Pass the view link on",
              d: "Readers get the whole notebook, can leave comments, and can save it as a PDF.",
            },
          ].map((s, i) => (
            <li key={s.t} className="flex gap-5">
              <span
                className="shrink-0 w-9 h-9 flex items-center justify-center text-[1.05rem]"
                style={{
                  border: "1.8px solid var(--ink)",
                  background: "var(--sticky-y)",
                  fontFamily: "var(--font-sketch), serif",
                  boxShadow: "2px 2px 0 rgba(28,28,28,0.18)",
                }}
              >
                {i + 1}
              </span>
              <div>
                <h3
                  className="text-[1.2rem] mb-1"
                  style={{ fontFamily: "var(--font-sketch), serif" }}
                >
                  {s.t}
                </h3>
                <p className="text-[0.94rem]" style={{ color: "var(--ink-2)" }}>
                  {s.d}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/quick" className="btn btn-red text-[1.05rem]">
            Paste something now <ArrowRight size={16} />
          </Link>
          <Link href="/new" className="btn text-[1.05rem]">
            Set one up properly
          </Link>
        </div>
      </section>

      <SupportSection />

      <SiteFooter />
    </div>
  );
}

/** The promise people most want confirmed before they start, pinned up front. */
function PinnedTag() {
  return (
    <div className="relative inline-block">
      <span
        className="tape tape-o"
        style={{ top: -8, left: 22, transform: "rotate(-5deg)", width: 40, height: 13 }}
      />
      <p className="sk sn-y" style={{ transform: "rotate(-1.2deg)" }}>
        <span className="sk-b" style={{ borderWidth: "1.5px" }} />
        <span className="sk-i block px-3.5 py-2 text-[0.9rem]">
          Free forever · No sign-up · No email
        </span>
      </p>
    </div>
  );
}

function NotebookPreview() {
  const tabs = [
    { label: "Trip plan", color: "var(--sticky-y)" },
    { label: "Packing", color: "var(--sticky-b)" },
    { label: "Budget", color: "var(--sticky-p)" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[26rem] note-enter" style={{ ["--rot" as string]: "1.2deg" }}>
      <span
        className="tape tape-y"
        style={{ top: -10, left: "38%", transform: "rotate(-3deg)", width: 66, height: 18 }}
      />

      {/* Index tabs down the right edge */}
      <div className="absolute -right-2 top-12 flex flex-col gap-2 z-20">
        {tabs.map((t, i) => (
          <span
            key={t.label}
            className="text-[0.72rem] px-2 py-1"
            style={{
              background: t.color,
              border: "1.5px solid var(--ink)",
              boxShadow: "2px 2px 0 rgba(28,28,28,0.15)",
              opacity: i === 0 ? 1 : 0.75,
            }}
          >
            {t.label}
          </span>
        ))}
      </div>

      <div className="sk" style={{ transform: "rotate(1.2deg)" }}>
        <div className="sk-b" />
        <div className="sk-i">
          <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{ borderBottom: "1.5px solid var(--rule)" }}
          >
            <span className="text-[0.95rem]">🧭</span>
            <span className="text-[0.92rem]">Iceland, March</span>
            <span className="stamp ml-auto">10 days left</span>
          </div>

          <div className="margin-rule paper-ruled px-4 py-4 pl-14 min-h-[17rem]">
            <h3
              className="text-[1.3rem] mb-2"
              style={{ fontFamily: "var(--font-sketch), serif" }}
            >
              Trip plan
            </h3>
            <p className="text-[0.9rem] mb-3" style={{ color: "var(--ink-2)" }}>
              Landing Thursday morning, picking the car up at the airport.
            </p>
            <ul className="text-[0.9rem] space-y-1.5">
              <li>✅ Book the guesthouse</li>
              <li>✅ Rent the 4×4</li>
              <li style={{ color: "var(--ink-3)" }}>◻︎ Ring road route</li>
              <li style={{ color: "var(--ink-3)" }}>◻︎ Northern lights forecast</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
