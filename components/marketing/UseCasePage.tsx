import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import { USE_CASES, type UseCase } from "@/lib/use-cases";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";

const TAPES = ["y", "b", "p", "g", "o"];

export default function UseCasePage({ useCase }: { useCase: UseCase }) {
  const others = USE_CASES.filter((u) => u.slug !== useCase.slug);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: useCase.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SharePad", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: useCase.metaTitle,
        item: `${SITE_URL}/${useCase.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-dvh paper-dot">
      <SiteHeader />

      <main id="main" className="max-w-3xl mx-auto px-5 py-14">
        <article>
          <h1
            className="text-[clamp(2rem,5.5vw,2.9rem)] leading-[1.1] mb-5"
            style={{ fontFamily: "var(--font-sketch), serif" }}
          >
            {useCase.title}
          </h1>

          <p className="text-[1.08rem] leading-[1.75] mb-10" style={{ color: "var(--ink-2)" }}>
            {useCase.intro}
          </p>

          <Link href={useCase.cta.href} className="btn btn-ink btn-lg mb-14">
            {useCase.cta.label} <ArrowRight size={18} />
          </Link>

          {/* Steps */}
          <h2
            className="text-[1.6rem] mb-6 mt-4"
            style={{ fontFamily: "var(--font-sketch), serif" }}
          >
            How it works
          </h2>
          <ol className="space-y-6 mb-14">
            {useCase.steps.map((step, i) => (
              <li key={step.heading} className="flex gap-5">
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
                  <h3 className="text-[1.15rem] mb-1" style={{ fontFamily: "var(--font-sketch), serif" }}>
                    {step.heading}
                  </h3>
                  <p className="text-[0.96rem] leading-[1.7]" style={{ color: "var(--ink-2)" }}>
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* Points */}
          <div className="grid sm:grid-cols-3 gap-6 mb-14">
            {useCase.points.map((point, i) => (
              <div key={point.heading} className="relative">
                <span
                  className={`tape tape-${TAPES[i % TAPES.length]}`}
                  style={{ top: -8, left: 20, transform: "rotate(-3deg)", width: 46, height: 14 }}
                />
                <div
                  className="sk h-full"
                  style={{ transform: `rotate(${i % 2 ? "0.6deg" : "-0.6deg"})` }}
                >
                  <div className="sk-b" />
                  <div className="sk-i p-4 pt-6">
                    <h3
                      className="text-[1.05rem] leading-snug mb-1.5"
                      style={{ fontFamily: "var(--font-sketch), serif" }}
                    >
                      {point.heading}
                    </h3>
                    <p className="text-[0.9rem] leading-[1.6]" style={{ color: "var(--ink-2)" }}>
                      {point.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <h2 className="text-[1.6rem] mb-6" style={{ fontFamily: "var(--font-sketch), serif" }}>
            Questions people ask
          </h2>
          <dl className="mb-14" style={{ borderTop: "1.5px dashed var(--rule)" }}>
            {useCase.faqs.map((faq) => (
              <div key={faq.q} className="py-5" style={{ borderBottom: "1.5px dashed var(--rule)" }}>
                <dt className="text-[1.05rem] mb-1.5" style={{ fontFamily: "var(--font-sketch), serif" }}>
                  {faq.q}
                </dt>
                <dd className="text-[0.96rem] leading-[1.7]" style={{ color: "var(--ink-2)" }}>
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-3 mb-14">
            <Link href={useCase.cta.href} className="btn btn-red btn-lg">
              {useCase.cta.label} <ArrowRight size={18} />
            </Link>
            <Link href="/" className="btn btn-lg">
              See everything it does
            </Link>
          </div>

          {/* Related, which also gives crawlers a path between these pages */}
          <nav aria-label="Related pages" style={{ borderTop: "1.5px solid rgba(28,28,28,0.12)" }}>
            <h2 className="text-[1.2rem] mt-8 mb-4" style={{ fontFamily: "var(--font-sketch), serif" }}>
              Also useful
            </h2>
            <ul className="space-y-2">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/${other.slug}`}
                    className="text-[0.98rem] underline"
                    style={{ color: "var(--red)" }}
                  >
                    {other.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </article>
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </div>
  );
}
