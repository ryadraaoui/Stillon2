import { Hero } from "@/components/Hero";
import { ProductReveal } from "@/components/ProductReveal";
import { Gallery } from "@/components/Gallery";
import { Faq } from "@/components/Faq";
import { ManifestoFx } from "@/components/HomeFx";
import { Censor } from "@/components/Brand";
import { Closing, Community, Formula, HowItWorks, Manifesto, Marquee, ShopSection } from "@/components/Sections";
import { FAQ, SITE } from "@/lib/site";

export default function Home() {
  const ld = [
    { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, logo: `${SITE.url}/icon.svg`, address: { "@type": "PostalAddress", addressLocality: "Montréal", addressRegion: "QC", addressCountry: "CA" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Hero />
      <Marquee
        className="display display-italic border-y border-ink/10 bg-ivory py-4 text-[9vw] md:py-5 md:text-[3.4vw]"
        items={["Not done yet", "Tired? Cute.", <span key="c"><Censor /> l’ordinaire</span>, "Open late", "Not made to stop", "Still on"]}
      />
      <Manifesto />
      <ManifestoFx />
      <ProductReveal />
      <HowItWorks />
      <Formula />
      <Gallery />
      <ShopSection />
      <Faq />
      <Community />
      <Closing />
    </>
  );
}
