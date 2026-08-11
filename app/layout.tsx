import type { Metadata } from "next";
import { Kalam, Architects_Daughter } from "next/font/google";
import "./globals.css";

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

const architectsDaughter = Architects_Daughter({
  variable: "--font-sketch",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SharePad — Share notes with one link, no signup",
  description:
    "Write a notebook of markdown pages and share it with a single link. Password lock, expiry dates, comments. No account needed.",
  openGraph: {
    title: "SharePad",
    description: "Share notes with one link. No signup.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${kalam.variable} ${architectsDaughter.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
