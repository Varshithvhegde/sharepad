import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import { formatBlogDate, getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on building SharePad — a no-signup markdown notebook you share with one link.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "SharePad Blog",
    description:
      "Notes on building SharePad — a no-signup markdown notebook you share with one link.",
    url: "/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-dvh paper-dot overflow-x-hidden">
      <SiteHeader />

      <main id="main" className="max-w-3xl mx-auto px-5 py-14">
        <h1
          className="text-[clamp(2rem,5.5vw,2.9rem)] leading-[1.1] mb-4"
          style={{ fontFamily: "var(--font-sketch), serif" }}
        >
          Blog
        </h1>
        <p className="text-[1.05rem] leading-[1.75] mb-12" style={{ color: "var(--ink-2)" }}>
          How SharePad got built, why it exists, and what broke along the way. Cross-posted from{" "}
          <a
            href="https://dev.to/varshithvhegde"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "var(--red)" }}
          >
            dev.to
          </a>
          .
        </p>

        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="relative">
                <span
                  className="tape tape-y"
                  style={{ top: -8, left: 24, transform: "rotate(-2deg)", width: 52, height: 15 }}
                />
                <div className="sk">
                  <div className="sk-b" />
                  <div className="sk-i p-5 pt-7">
                    <time
                      dateTime={post.publishedAt}
                      className="text-[0.82rem] block mb-2"
                      style={{ color: "var(--ink-3)" }}
                    >
                      {formatBlogDate(post.publishedAt)}
                    </time>
                    <h2 className="text-[1.35rem] leading-snug mb-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:underline"
                        style={{ fontFamily: "var(--font-sketch), serif" }}
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-[0.95rem] leading-[1.65] mb-4" style={{ color: "var(--ink-2)" }}>
                      {post.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/blog/${post.slug}`} className="btn btn-ink text-[0.9rem]">
                        Read here <ArrowRight size={15} />
                      </Link>
                      <a
                        href={post.devtoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.88rem] underline inline-flex items-center gap-1"
                        style={{ color: "var(--ink-3)" }}
                      >
                        On dev.to <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>

      <SiteFooter />
    </div>
  );
}
