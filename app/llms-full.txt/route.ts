import { SITE_URL } from "@/lib/site";
import { USE_CASES } from "@/lib/use-cases";

/**
 * The companion to llms.txt: the same guides as Markdown, in full, so an agent
 * can answer from one fetch instead of rendering four HTML pages.
 */
export async function GET() {
  const sections = USE_CASES.map((useCase) => {
    const steps = useCase.steps
      .map((step, i) => `${i + 1}. **${step.heading}** — ${step.body}`)
      .join("\n");

    const points = useCase.points
      .map((point) => `- **${point.heading}** — ${point.body}`)
      .join("\n");

    const faqs = useCase.faqs
      .map((faq) => `**${faq.q}**\n\n${faq.a}`)
      .join("\n\n");

    return `## ${useCase.title}

Source: ${SITE_URL}/${useCase.slug}

${useCase.intro}

### How it works

${steps}

### Details

${points}

### Questions

${faqs}`;
  }).join("\n\n---\n\n");

  const body = `# SharePad — full text

> A notebook of markdown pages that lives at one shareable link. No account, no email, no sign-up.

This file contains the complete text of the SharePad guides. It is generated
from the same source as the pages themselves, so it does not drift.

---

${sections}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
