import type { Metadata } from "next";
import { Faq } from "@/components/Faq";
import { FAQ } from "@/lib/site";

export const metadata: Metadata = { title: "FAQ", description: "Answers about Still ON. energy strips: what they are, what is in them, how to take one and when you can buy them.", alternates: { canonical: "/faq" } };

export default function FaqPage() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <div className="pt-[var(--header-h)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1 className="sr-only">Frequently asked questions</h1>
      <Faq />
    </div>
  );
}
