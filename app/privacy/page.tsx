import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import { GITHUB_REPO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What SharePad stores, what it does not, and how to delete it. No accounts, no email, no adverts.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "12 August 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh paper-dot overflow-x-hidden">
      <SiteHeader />

      <main id="main" className="max-w-2xl mx-auto px-5 py-14">
        <h1
          className="text-[clamp(2rem,5vw,2.6rem)] leading-tight mb-2"
          style={{ fontFamily: "var(--font-sketch), serif" }}
        >
          Privacy
        </h1>
        <p className="text-[0.85rem] mb-9" style={{ color: "var(--ink-3)" }}>
          Last updated {UPDATED}
        </p>

        <div className="space-y-9 text-[0.98rem] leading-[1.75]" style={{ color: "var(--ink-2)" }}>
          <Section title="The short version">
            <p>
              SharePad has no accounts, so it never learns who you are. It stores what
              you write, for as long as you choose, and deletes it afterwards. It shows
              no adverts and sells nothing to anyone.
            </p>
            <p>
              It is also not end-to-end encrypted. Please read{" "}
              <a href="#what-this-is-not" className="underline" style={{ color: "var(--red)" }}>
                what this is not
              </a>{" "}
              before pasting anything genuinely sensitive.
            </p>
          </Section>

          <Section title="What gets stored">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The title and text of your notebook and its pages.</li>
              <li>The last ten drafts of each page, so an edit can be undone.</li>
              <li>Comments, with whatever name was typed alongside them.</li>
              <li>A count of how many times a notebook has been opened. Just a number — no record of who or when.</li>
              <li>The settings you choose: expiry date, paper, typeface, whether editing is open.</li>
            </ul>
            <p>
              This lives in a Postgres database run by Supabase, hosted in Mumbai
              (ap-south-1).
            </p>
          </Section>

          <Section title="What is never collected">
            <p>
              No email address, no name, no password for an account, because there are no
              accounts. No IP address is stored against a notebook, and nothing you write
              is read for advertising or sold on.
            </p>
          </Section>

          <Section title="How a notebook can be yours without an account">
            <p>
              Creating one produces a secret edit link. Only a SHA-256 hash of that link
              is stored, so the database holds no copy of the link itself — which also
              means it cannot be recovered or emailed to you if it is lost.
            </p>
            <p>
              If you set a password on a notebook, it is hashed with bcrypt and never
              stored as typed.
            </p>
          </Section>

          <Section title="What sits on your own device">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Your edit links.</strong> The browser keeps a list so notebooks
                appear on the home page. It stays on your device and is only ever sent
                back when you save a change. Removing one with the Forget button erases it.
              </li>
              <li>
                <strong>A preference</strong> for whether the editor panes scroll together.
              </li>
              <li>
                <strong>One cookie</strong>, and only if you unlock a password-protected
                notebook. It records that you got the password right, lasts a day, and
                cannot be read by scripts.
              </li>
            </ul>
          </Section>

          <Section title="Analytics">
            <p>
              Visits are counted using PostHog, to see which pages people arrive on and
              whether anything is broken. Three deliberate limits:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>No analytics cookie is set, so there is no banner asking you to accept one.</li>
              <li>
                Session recording is switched off inside notebooks. A recording of the
                editor would be a recording of you typing a private note.
              </li>
              <li>
                Events carry counts and settings only. Note contents, titles, addresses
                and edit links are never sent.
              </li>
            </ul>
          </Section>

          <Section title="Who else is involved">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Supabase</strong> — stores the database.</li>
              <li><strong>PostHog</strong> — receives the analytics events described above.</li>
              <li>
                <strong>The hosting provider</strong> — serves the site and keeps ordinary
                request logs, as every web host does.
              </li>
              <li>
                <strong>Ko-fi</strong> — only if you follow the donate link, and then their
                terms apply, not these.
              </li>
            </ul>
          </Section>

          <Section title="Deleting things">
            <p>
              Open your notebook with its edit link, go to settings, and delete it. Every
              page, draft and comment goes at the same time and the shared link stops
              working immediately.
            </p>
            <p>
              Notebooks also delete themselves. Ten days is the default; it can be
              anything from a day to a year, or never. A scheduled job removes expired
              notebooks from the database three days after the date passes, and read-once
              notebooks a day after they are opened.
            </p>
            <p>
              If you have lost the edit link there is no way to prove the notebook was
              yours, so it cannot be deleted on request — waiting for it to expire is the
              only route. If something needs taking down for another reason,{" "}
              <a href={`${GITHUB_REPO}/issues/new`} className="underline" style={{ color: "var(--red)" }}>
                open an issue
              </a>
              .
            </p>
          </Section>

          <Section title="What this is not" id="what-this-is-not">
            <p>
              Notebooks are unlisted, not secret. Anyone holding the link can read one,
              and an address is guessable if you choose a simple one.
            </p>
            <p>
              Content is not encrypted end-to-end. It is stored so that the server can
              render it, which means whoever operates the database can technically read
              it. Nobody goes looking, but the honest position is that this is the wrong
              place for passwords, financial details, health records or anything you would
              be harmed by losing.
            </p>
          </Section>

          <Section title="Changes and contact">
            <p>
              If this policy changes, the date at the top changes with it. The whole
              application is open source, so the behaviour described here can be checked
              against the code rather than taken on trust.
            </p>
            <p>
              Questions go to{" "}
              <a href={`${GITHUB_REPO}/issues/new`} className="underline" style={{ color: "var(--red)" }}>
                the issue tracker
              </a>
              .
            </p>
          </Section>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/quick" className="btn btn-ink">
            Start writing
          </Link>
          <Link href="/" className="btn">
            Back to the start
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ scrollMarginTop: "5rem" }}>
      <h2
        className="text-[1.35rem] mb-2"
        style={{ fontFamily: "var(--font-sketch), serif", color: "var(--ink)" }}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
