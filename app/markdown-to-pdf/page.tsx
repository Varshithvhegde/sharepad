import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UseCasePage from "@/components/marketing/UseCasePage";
import { getUseCase } from "@/lib/use-cases";

const SLUG = "markdown-to-pdf";
const useCase = getUseCase(SLUG);

export const metadata: Metadata = {
  title: useCase?.metaTitle,
  description: useCase?.metaDescription,
  alternates: { canonical: `/${SLUG}` },
  openGraph: {
    title: useCase?.metaTitle,
    description: useCase?.metaDescription,
    url: `/${SLUG}`,
  },
};

export default function Page() {
  if (!useCase) notFound();
  return <UseCasePage useCase={useCase} />;
}
