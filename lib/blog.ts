import fs from "fs";
import path from "path";

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  /** ISO date string */
  publishedAt: string;
  devtoUrl: string;
  tags: string[];
  coverImage: string;
  /** Filename under content/blog/ */
  contentFile: string;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "i-built-a-notebook-for-sharing-notes-that-doesnt-ask-you-to-sign-up-first",
    title: "I Built a Notebook for Sharing Notes That Doesn't Ask You to Sign Up First",
    description:
      "Why I built SharePad — one link, many markdown pages, a secret edit URL, and no accounts. Next.js, Supabase, Cloudflare R2, and the bugs along the way.",
    publishedAt: "2026-08-12",
    devtoUrl:
      "https://dev.to/varshithvhegde/i-built-a-notebook-for-sharing-notes-that-doesnt-ask-you-to-sign-up-first-2ldd",
    tags: ["webdev", "nextjs", "markdown", "opensource", "supabase"],
    coverImage:
      "https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/4gonownf0rpyrx25l20q.png",
    contentFile: "i-built-a-notebook-for-sharing-notes-that-doesnt-ask-you-to-sign-up-first.md",
  },
];

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

export function getBlogPost(slug: string): (BlogPostMeta & { content: string }) | null {
  const meta = BLOG_POSTS.find((p) => p.slug === slug);
  if (!meta) return null;

  const filePath = path.join(CONTENT_DIR, meta.contentFile);
  if (!fs.existsSync(filePath)) return null;

  return { ...meta, content: fs.readFileSync(filePath, "utf8") };
}

export function getAllBlogPosts(): BlogPostMeta[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function formatBlogDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
