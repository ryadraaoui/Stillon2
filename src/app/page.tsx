import { Hero } from "@/components/Hero";
import { ProductReveal } from "@/components/ProductReveal";
import { Campaign } from "@/components/Campaign";
import { Closing, Conversion, Formula } from "@/components/Sections";
import { getCommerce } from "@/lib/commerce";
import { SITE } from "@/lib/site";

/** Six sections: hero → product reveal (with usage) → campaign → formula → offer + early access → closing. */
export default async function Home() {
  const commerce = await getCommerce();
  const ld = { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, logo: `${SITE.url}/icon.svg` };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Hero />
      <ProductReveal />
      <Campaign />
      <Formula />
      <Conversion live={commerce.mode === "live"} shop={commerce.mode === "shopify"} />
      <Closing />
    </>
  );
}
