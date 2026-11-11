import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCommerce } from "@/lib/commerce";
import { FORMULA, PRODUCT, SITE } from "@/lib/site";
import { PdpGallery } from "@/components/PdpGallery";
import { Purchase } from "@/components/Purchase";
import { Reveal, Line } from "@/components/Reveal";
import { ScaleCompare, Closing } from "@/components/Sections";
import { Faq } from "@/components/Faq";
import inHand from "@/assets/bw-strip-hand.webp";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Bandelettes énergisantes N°01 — Energy strips, mint, box of 30",
  description: "Still ON. N°01: energy strips with caffeine + L-theanine. 50 mg caffeine, 30 mg L-theanine, B6 and B12 per strip. Mint. 30 individually sealed 5 × 7 cm sachets per box.",
  alternates: { canonical: "/products/energy-strips" },
};

export default async function ProductPage({ searchParams }: PageProps<"/products/energy-strips">) {
  const [commerce, sp] = await Promise.all([getCommerce(), searchParams]);
  const live = commerce.mode === "live";
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Still ON. ${PRODUCT.nameFr} ${PRODUCT.number} — ${PRODUCT.nameEn}`,
    description: "Energy strips with caffeine + L-theanine. Mint. 30 individually sealed sachets per box.",
    brand: { "@type": "Brand", name: SITE.name },
    url: `${SITE.url}/products/energy-strips`,
    ...(live ? { offers: { "@type": "Offer", price: (commerce.price.amount / 100).toFixed(2), priceCurrency: commerce.price.currency.toUpperCase(), availability: "https://schema.org/InStock", url: `${SITE.url}/products/energy-strips` } } : {}),
  };
  const specs: [string, string][] = [
    ["Format", "Dissolvable strip, one per sachet"],
    ["Flavour", `${PRODUCT.flavourFr} · ${PRODUCT.flavourEn}`],
    ["In the box", `${PRODUCT.count} sachets · ${PRODUCT.count} strips`],
    ["Strip", "White, matte, nothing printed on it"],
    ["Sachet", "5 × 7 cm, matte ivory, sealed on four sides"],
    ["Box", `${PRODUCT.box.w} × ${PRODUCT.box.d} × ${PRODUCT.box.h} mm`],
  ];
  const h2 = "eyebrow mt-12 mb-3 text-grey";
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="wrap bg-ivory pt-[calc(var(--header-h)+20px)] pb-20 md:pb-28">
        <nav aria-label="Breadcrumb" className="eyebrow mb-5 text-grey">
          <Link href="/" className="link-u">Home</Link> <span aria-hidden="true">/</span> <span aria-current="page" className="text-ink">The strips</span>
        </nav>
        {sp?.checkout === "cancelled" && (
          <p role="status" className="mb-5 rounded-xl bg-bone px-5 py-4 text-sm font-semibold">
            Checkout cancelled. Nothing was charged, and your cart is still here.
          </p>
        )}
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="min-w-0 md:sticky md:top-20 md:self-start">
            <PdpGallery />
          </div>
          <div className="min-w-0 md:py-4">
            <p className="eyebrow mb-4 text-grey">
              {PRODUCT.number} · {PRODUCT.flavourFr} · {PRODUCT.flavourEn} · Box of {PRODUCT.count}
            </p>
            <h1 className="display text-[13vw] md:text-[5.2vw]">
              Bandelettes
              <br />
              énergisantes<span className="text-pink">.</span>
            </h1>
            <p className="mt-3 text-lg font-bold text-grey">Energy strips with caffeine + L-theanine</p>
            <div id="early-access" className="mt-7 scroll-mt-24 rounded-2xl bg-bone p-6 md:p-7">
              <Purchase source="pdp" />
            </div>
            <p className="mt-7 max-w-[46ch] text-[17px]">One small white strip in its own sachet. Open it, place it on your tongue, let it dissolve.</p>

            <h2 className={h2}>Per strip · Par bandelette</h2>
            <table className="w-full border-t-2 border-ink text-left">
              <caption className="sr-only">Amounts per strip</caption>
              <tbody>
                {FORMULA.map((f) => (
                  <tr key={f.en} className="border-b border-ink/15">
                    <th scope="row" className="py-3.5 text-[15px] font-bold">
                      {f.en} <span className="font-normal text-grey">/ {f.fr}</span>
                    </th>
                    <td className="py-3.5 text-right text-[15px] font-black tabular-nums">
                      {f.amount} {f.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className={h2}>How to use · Mode d’emploi</h2>
            <ol className="grid grid-cols-3 gap-2">
              {["Open it.", "Place it on your tongue.", "Let it dissolve."].map((t, i) => (
                <li key={t} className="rounded-xl bg-bone p-4">
                  <span className="text-3xl font-black text-pinktext">{i + 1}</span>
                  <p className="mt-2 text-sm leading-tight font-black uppercase">{t}</p>
                </li>
              ))}
            </ol>

            <h2 className={h2}>Details</h2>
            <dl className="border-t-2 border-ink">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-4 border-b border-ink/15 py-3.5 text-[15px]">
                  <dt className="font-bold">{k}</dt>
                  <dd className="text-grey">{v}</dd>
                </div>
              ))}
            </dl>

            <h2 className={h2}>Safety</h2>
            <div className="rounded-xl border border-ink/15 p-5 text-[15px] text-grey">
              <p>
                <strong className="text-ink">Contains caffeine: 50 mg per strip.</strong> Count it against the rest of your day. Always read and follow the label on the pack.
              </p>
              <p className="mt-2">If you are sensitive to caffeine or unsure whether this product is right for you, ask a health professional first.</p>
            </div>

            <h2 className={h2}>Shipping</h2>
            <p className="text-[15px] text-grey">
              Not shipping yet. Details will be on the <Link href="/shipping" className="underline underline-offset-2">shipping page</Link> before launch.
            </p>
          </div>
        </div>
      </section>

      <section className="grid bg-white md:grid-cols-2">
        <div className="relative min-h-[70vw] md:min-h-[86svh]">
          <Image src={inHand} alt="Black-and-white, direct flash: a hand with one hot pink nail holds the small white strip up beside an athlete's chin." fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="wrap flex flex-col justify-center gap-8 py-20 md:px-16">
          <Reveal as="h2" variant="lines" className="display text-[13vw] md:text-[5.6vw]">
            <Line>Small strip.</Line>
            <Line delay={90}>
              <span className="display-italic">Big attitude</span>
              <span className="text-pink">.</span>
            </Line>
          </Reveal>
          <p className="max-w-[38ch] text-[17px] text-grey">The sachet is 5 × 7 cm. It goes where a can won&apos;t: a jersey pocket, a waistband, a wallet.</p>
          <ScaleCompare />
        </div>
      </section>

      <Faq />
      <Closing />
    </>
  );
}
