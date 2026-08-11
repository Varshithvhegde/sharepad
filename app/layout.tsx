import type { Metadata } from "next";
import {
  Architects_Daughter,
  Inter,
  JetBrains_Mono,
  Kalam,
  Source_Serif_4,
} from "next/font/google";
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

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SharePad — Share notes with one link, no signup",
  description:
    "Write a notebook of markdown pages and share it with a single link. Password lock, expiry dates, comments and PDF export. No account needed.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "SharePad",
    title: "SharePad — Share notes with one link",
    description: "A notebook of markdown pages that lives at one address. No signup.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "SharePad" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SharePad — Share notes with one link",
    description: "A notebook of markdown pages that lives at one address. No signup.",
    images: ["/og.svg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${kalam.variable} ${architectsDaughter.variable} ${sourceSerif.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
