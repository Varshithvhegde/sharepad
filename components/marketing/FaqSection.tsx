const FAQS = [
  {
    q: "Do I need an account?",
    a: "No, and there isn't one to make. No email, no password, no sign-in. Creating a notebook gives you a secret edit link, and holding that link is what makes it yours.",
  },
  {
    q: "Is it really free?",
    a: "Yes, with no paid tier holding anything back. Passwords, expiry dates, PDF export, comments and unlimited pages are all included. It is open source, and donations cover the hosting.",
  },
  {
    q: "How long do my notes stay up?",
    a: "Ten days by default. You can set anything from one day to a year, or turn expiry off so a notebook stays until you delete it. Expired notebooks are removed from the database rather than just hidden.",
  },
  {
    q: "Who can see what I write?",
    a: "Only people you give the link to. Notebooks are unlisted and are not indexed by search engines unless you deliberately mark one public. You can also add a password, or set a notebook to delete itself after a single read.",
  },
  {
    q: "What happens if I lose my edit link?",
    a: "Your browser remembers notebooks you have made, so check the home page on the same device first. If the link is gone entirely there is no way to recover it — that is the trade for never asking who you are.",
  },
  {
    q: "Can other people edit my notebook?",
    a: "Only if you let them. By default the link you share is read-only. One switch in settings opens the notebook so anyone with the link can write in it, which is useful for a shared list. Settings and deletion always stay with you.",
  },
  {
    q: "Can I get my writing back out?",
    a: "Any time. Download the whole notebook as a single Markdown file, or as a PDF laid out as a proper document in a serif typeface with a contents page.",
  },
  {
    q: "How many pages can one notebook hold?",
    a: "Up to two hundred, all behind the same link, with an index down the side for readers. This is the main thing that separates SharePad from a one-page paste tool.",
  },
];

export default function FaqSection() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <section
      className="max-w-3xl mx-auto px-5 py-16"
      style={{ borderTop: "1.5px dashed var(--rule)" }}
      aria-labelledby="faq-heading"
    >
      <h2
        id="faq-heading"
        className="text-[1.9rem] mb-2"
        style={{ fontFamily: "var(--font-sketch), serif" }}
      >
        Questions people ask
      </h2>
      <p className="text-[0.98rem] mb-8" style={{ color: "var(--ink-2)" }}>
        The ones that come up before anyone writes anything.
      </p>

      <dl style={{ borderTop: "1.5px solid rgba(28,28,28,0.12)" }}>
        {FAQS.map((faq) => (
          <div
            key={faq.q}
            className="py-5"
            style={{ borderBottom: "1.5px solid rgba(28,28,28,0.12)" }}
          >
            <dt
              className="text-[1.08rem] mb-1.5"
              style={{ fontFamily: "var(--font-sketch), serif" }}
            >
              {faq.q}
            </dt>
            <dd className="text-[0.96rem] leading-[1.7]" style={{ color: "var(--ink-2)" }}>
              {faq.a}
            </dd>
          </div>
        ))}
      </dl>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
