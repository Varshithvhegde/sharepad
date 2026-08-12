import Link from "next/link";
import { USE_CASES } from "@/lib/use-cases";
import { GITHUB_REPO } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer
      className="px-5 py-10"
      style={{ borderTop: "1.5px solid rgba(28,28,28,0.12)" }}
    >
      <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8">
        <nav aria-label="Blog">
          <h2 className="text-[1.05rem] mb-3" style={{ fontFamily: "var(--font-sketch), serif" }}>
            Blog
          </h2>
          <ul className="space-y-1.5">
            <li>
              <Link href="/blog" className="text-[0.9rem] hover:underline" style={{ color: "var(--ink-2)" }}>
                All posts
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Guides">
          <h2 className="text-[1.05rem] mb-3" style={{ fontFamily: "var(--font-sketch), serif" }}>
            Guides
          </h2>
          <ul className="space-y-1.5">
            {USE_CASES.map((useCase) => (
              <li key={useCase.slug}>
                <Link
                  href={`/${useCase.slug}`}
                  className="text-[0.9rem] hover:underline"
                  style={{ color: "var(--ink-2)" }}
                >
                  {useCase.metaTitle}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-[1.05rem] mb-3" style={{ fontFamily: "var(--font-sketch), serif" }}>
            The project
          </h2>
          <ul className="space-y-1.5 text-[0.9rem]" style={{ color: "var(--ink-2)" }}>
            <li>
              <a href={GITHUB_REPO} className="hover:underline">
                Source on GitHub
              </a>
            </li>
            <li>
              <a href={`${GITHUB_REPO}/issues/new`} className="hover:underline">
                Report a bug or ask for a feature
              </a>
            </li>
            <li>
              <a href="https://ko-fi.com/varshithvhegde" className="hover:underline">
                Support the project
              </a>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <a href="https://github.com/Varshithvhegde" className="hover:underline">
                Made by Varshith
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
