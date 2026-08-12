import type { Metadata } from "next";
import { Suspense } from "react";
import AnalyticsRouteGuard from "@/components/AnalyticsRouteGuard";
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

import { SITE_URL } from "@/lib/site";

const TITLE = "SharePad — Share notes with one link, no signup";
const DESCRIPTION =
  "Write a notebook of markdown pages and share it with a single link. Password lock, expiry dates, comments and PDF export. Free, and no account needed.";

// The social image is picked up automatically from app/opengraph-image.png.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    // Notebook pages set their own name and get the product appended.
    template: "%s — SharePad",
  },
  description: DESCRIPTION,
  applicationName: "SharePad",
  keywords: [
    "share notes",
    "markdown notebook",
    "no signup notepad",
    "share markdown link",
    "online notepad",
    "paste and share text",
    "temporary notes",
    "markdown to pdf",
  ],
  authors: [{ name: "Varshith Hegde", url: "https://github.com/Varshithvhegde" }],
  creator: "Varshith Hegde",
  alternates: { canonical: "/" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "SharePad",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "productivity",
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SharePad",
  url: SITE_URL,
  description: DESCRIPTION,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Multi-page markdown notebooks behind one link",
    "No account or sign-up",
    "Password protection and expiry dates",
    "Export to PDF or Markdown",
    "Anonymous comments",
    "Version history",
  ],
  author: { "@type": "Person", name: "Varshith Hegde" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${kalam.variable} ${architectsDaughter.variable} ${sourceSerif.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Suspense fallback={null}>
          <AnalyticsRouteGuard />
        </Suspense>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
      </body>
    </html>
  );
}
