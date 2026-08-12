import Link from "next/link";
import { KeyRound } from "lucide-react";
import NotebookMark from "@/components/marketing/NotebookMark";

export default function SiteHeader() {
  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        borderBottom: "1.5px solid rgba(28,28,28,0.14)",
        background: "rgba(250,249,246,0.93)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
          <NotebookMark />
          <span className="text-[1.35rem] leading-none" style={{ fontFamily: "var(--font-sketch), serif" }}>
            SharePad
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/blog" className="btn-ghost text-[0.9rem] hidden sm:inline-flex">
            Blog
          </Link>
          <Link href="/recover" className="btn-ghost text-[0.9rem]">
            <KeyRound size={14} />
            <span className="hidden sm:inline">I have an edit link</span>
            <span className="sm:hidden">Edit link</span>
          </Link>
          <Link href="/new" className="btn btn-y text-[0.95rem] !py-2 !px-4">
            Start writing
          </Link>
        </div>
      </div>
    </nav>
  );
}
