import { Bug, Code2, Coffee } from "lucide-react";
import { GITHUB_REPO, KOFI_URL } from "@/lib/site";

const CARDS = [
  {
    tape: "b",
    tint: "sn-b",
    rot: "-0.9deg",
    Icon: Bug,
    title: "Something broken?",
    body: "Bugs and ideas both go in the same place. Tell me what you were doing and what happened instead.",
    href: `${GITHUB_REPO}/issues/new`,
    label: "Open an issue",
  },
  {
    tape: "g",
    tint: "sn-g",
    rot: "0.7deg",
    Icon: Code2,
    title: "Read the code",
    body: "The whole thing is open source. Fork it, run it yourself, or send a pull request.",
    href: GITHUB_REPO,
    label: "View on GitHub",
  },
  {
    tape: "y",
    tint: "sn-y",
    rot: "-0.6deg",
    Icon: Coffee,
    title: "Keep it free",
    body: "There is no paid tier and no adverts. If it saved you some time, a coffee covers the hosting.",
    href: KOFI_URL,
    label: "Buy me a coffee",
  },
];

export default function SupportSection() {
  return (
    <section
      className="max-w-5xl mx-auto px-5 py-16"
      style={{ borderTop: "1.5px dashed var(--rule)" }}
      aria-labelledby="support-heading"
    >
      <h2
        id="support-heading"
        className="text-[1.9rem] mb-2"
        style={{ fontFamily: "var(--font-sketch), serif" }}
      >
        Free, and staying that way
      </h2>
      <p className="text-[0.98rem] mb-9" style={{ color: "var(--ink-2)" }}>
        Built in the open by one person. Three ways to help, none of them costing anything.
      </p>

      <div className="grid sm:grid-cols-3 gap-7">
        {CARDS.map(({ tape, tint, rot, Icon, title, body, href, label }) => (
          <div key={title} className="relative">
            <span
              className={`tape tape-${tape}`}
              style={{ top: -8, left: 22, transform: "rotate(-3deg)", width: 48, height: 15 }}
            />
            <div className={`sk ${tint} h-full`} style={{ transform: `rotate(${rot})` }}>
              <div className="sk-b" />
              <div className="sk-i p-5 pt-7 flex flex-col h-full">
                <Icon size={20} className="mb-3" aria-hidden="true" />
                <h3
                  className="text-[1.12rem] leading-snug mb-2"
                  style={{ fontFamily: "var(--font-sketch), serif" }}
                >
                  {title}
                </h3>
                <p className="text-[0.9rem] leading-[1.6] mb-4" style={{ color: "var(--ink-2)" }}>
                  {body}
                </p>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn !py-2 !px-4 text-[0.9rem] mt-auto self-start"
                >
                  {label}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
