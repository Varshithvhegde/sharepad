import type { Metadata } from "next";
import { Inter, Instrument_Serif, Kalam } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SharePad — Share markdown notebooks instantly, no signup",
  description:
    "Create multi-page markdown notebooks and share with one link. Password lock, embed, export — zero login required.",
  openGraph: {
    title: "SharePad",
    description: "Share markdown notebooks instantly. No signup.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} ${kalam.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
