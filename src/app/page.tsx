import { Hero } from "@/components/Hero";
import { ProductReveal } from "@/components/ProductReveal";
import { Ticker } from "@/components/Ticker";
import { Campaign } from "@/components/Campaign";
import { Closing, Conversion, Formula, HowItWorks } from "@/components/Sections";
import { SITE } from "@/lib/site";

/** Eight experiences: hero → ticker → product reveal → how it works → campaign reel → formula → early access → closing. */
export default function Home() {
  const ld = { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, logo: `${SITE.url}/icon.svg` };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Hero />
      <Ticker />
      <ProductReveal />
      <HowItWorks />
      <Campaign />
      <Formula />
      <Conversion />
      <Closing />
    </>
  );
}
