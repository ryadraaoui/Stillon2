import { Hero } from "@/components/Hero";
import { ProductReveal } from "@/components/ProductReveal";
import { Campaign, Closing, Conversion, Formula } from "@/components/Sections";
import { SITE } from "@/lib/site";

/** Six sections, in order: hero → product reveal → campaign → formula → conversion → closing. */
export default function Home() {
  const ld = { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, logo: `${SITE.url}/icon.svg` };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Hero />
      <ProductReveal />
      <Campaign />
      <Formula />
      <Conversion />
      <Closing />
    </>
  );
}
