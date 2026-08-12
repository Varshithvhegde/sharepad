import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import MarkdownPreview from "@/components/MarkdownPreview";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import { formatBlogDate, type BlogPostMeta } from "@/lib/blog";
import { GITHUB_REPO, SITE_URL } from "@/lib/site";

interface BlogPostPageProps {
  post: BlogPostMeta & { content: string };
}

export default function BlogPostPage({ post }: BlogPostPageProps) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: "Varshith Hegde", url: "https://github.com/Varshithvhegde" },
    image: post.coverImage,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    isBasedOn: post.devtoUrl,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SharePad", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-dvh paper-dot overflow-x-hidden">
      <SiteHeader />

      <main id="main" className="max-w-3xl mx-auto px-5 py-10 sm:py-14">
        <nav className="mb-8 text-[0.88rem]" style={{ color: "var(--ink-3)" }} aria-label="Breadcrumb">
          <Link href="/blog" className="hover:underline" style={{ color: "var(--ink-2)" }}>
            Blog
          </Link>
          <span aria-hidden="true"> / </span>
          <span>Post</span>
        </nav>

        <article>
          <header className="mb-8">
            <time
              dateTime={post.publishedAt}
              className="text-[0.85rem] block mb-3"
              style={{ color: "var(--ink-3)" }}
            >
              {formatBlogDate(post.publishedAt)}
            </time>
            <h1
              className="text-[clamp(1.85rem,5vw,2.65rem)] leading-[1.12] mb-5"
              style={{ fontFamily: "var(--font-sketch), serif" }}
            >
              {post.title}
            </h1>
            <p className="text-[1.05rem] leading-[1.7] mb-5" style={{ color: "var(--ink-2)" }}>
              {post.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span key={tag} className="chip" data-on={false}>
                  {tag}
                </span>
              ))}
            </div>

            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-[0.9rem]"
              style={{
                background: "var(--sticky-b)",
                border: "1.5px solid rgba(28,28,28,0.14)",
              }}
            >
              <span style={{ color: "var(--ink-2)" }}>
                Also on{" "}
                <a
                  href={post.devtoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                  style={{ color: "var(--ink)" }}
                >
                  DEV Community
                </a>
              </span>
              <a
                href={post.devtoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost !py-1 !px-2 text-[0.85rem] ml-auto"
              >
                Read on dev.to <ExternalLink size={14} />
              </a>
            </div>
          </header>

          <div className="blog-article font-serif-doc">
            <MarkdownPreview content={post.content} />
          </div>

          <footer
            className="mt-14 pt-8 flex flex-wrap gap-3"
            style={{ borderTop: "1.5px dashed var(--rule)" }}
          >
            <Link href="/quick" className="btn btn-red btn-lg">
              Try SharePad <ArrowRight size={18} />
            </Link>
            <a href={post.devtoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-lg">
              Comment on dev.to <ExternalLink size={16} />
            </a>
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="btn btn-lg">
              View source
            </a>
          </footer>
        </article>
      </main>

      <SiteFooter />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </div>
  );
}
