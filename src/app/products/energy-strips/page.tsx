import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCommerce } from "@/lib/commerce";
import { FORMULA, PRODUCT, SITE } from "@/lib/site";
import { PdpGallery } from "@/components/PdpGallery";
import { Purchase } from "@/components/Purchase";
import { Reveal, Line } from "@/components/Reveal";
import { Censor } from "@/components/Brand";
import { Strip } from "@/components/Sachet";
import { ScaleCompare, Closing } from "@/components/Sections";
import { Faq } from "@/components/Faq";
import tongue from "@/assets/campaign-tongue-poster.webp";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Bandelettes énergisantes N°01 — Energy strips, mint, box of 30",
  description: "Still ON. N°01: caffeine + L-theanine energy strips. 50 mg caffeine, 30 mg L-theanine, B6 and B12 per strip. Mint. 30 individually sealed 5 × 7 cm sachets per box.",
  alternates: { canonical: "/products/energy-strips" },
};

export default async function ProductPage({ searchParams }: PageProps<"/products/energy-strips">) {
  const [commerce, sp] = await Promise.all([getCommerce(), searchParams]);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Still ON. ${PRODUCT.nameFr} ${PRODUCT.number} — ${PRODUCT.nameEn}`,
    description: "Caffeine + L-theanine energy strips. Mint. 30 individually sealed sachets per box.",
    brand: { "@type": "Brand", name: SITE.name },
    url: `${SITE.url}/products/energy-strips`,
    ...(commerce.mode === "live"
      ? { offers: { "@type": "Offer", price: (commerce.price.amount / 100).toFixed(2), priceCurrency: commerce.price.currency.toUpperCase(), availability: "https://schema.org/InStock", url: `${SITE.url}/products/energy-strips` } }
      : {}),
  };
  const specs: [string, string][] = [
    ["Format", "Dissolvable strip, one per sachet"],
    ["Flavour", `${PRODUCT.flavourFr} · ${PRODUCT.flavourEn}`],
    ["In the box", `${PRODUCT.count} sachets · ${PRODUCT.count} strips`],
    ["Strip", `~${PRODUCT.strip.w} × ${PRODUCT.strip.h} mm, white, nothing printed on it`],
    ["Sachet", "5 × 7 cm, matte ivory, sealed on four sides, ~2 mm thick"],
    ["Box", `${PRODUCT.box.w} × ${PRODUCT.box.d} × ${PRODUCT.box.h} mm`],
  ];
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
          <div className="min-w-0 md:py-6">
            <p className="eyebrow mb-4 flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-pink" /> {PRODUCT.number} · {PRODUCT.flavourFr} · {PRODUCT.flavourEn}
            </p>
            <h1 className="display text-[13vw] md:text-[5.4vw]">
              Bandelettes
              <br />
              énergisantes<span className="text-pink">.</span>
            </h1>
            <p className="mt-3 text-lg font-bold text-grey">Energy strips · Caffeine + L-theanine · Box of {PRODUCT.count}</p>
            <p className="mt-6 max-w-[44ch] text-[17px]">
              One small white strip in its own sachet. Tear it open, put it on your tongue, let it dissolve. No can to carry, no cup to find, no water to chase it with. <Censor className="font-black" /> <strong>l’ordinaire.</strong>
            </p>
            <div className="mt-8 rounded-2xl bg-bone p-6 md:p-7">
              <Purchase source="pdp" />
            </div>

            <h2 className="eyebrow mt-12 mb-3 text-grey">Per strip · Par bandelette</h2>
            <table className="w-full border-t-2 border-ink text-left">
              <caption className="sr-only">Amounts per strip</caption>
              <tbody>
                {FORMULA.map((f) => (
                  <tr key={f.en} className="border-b border-ink/15">
                    <th scope="row" className="py-3.5 text-[15px] font-bold">
                      {f.en} <span className="font-normal text-grey">/ {f.fr}</span>
                    </th>
                    <td className="py-3.5 text-right text-[15px] font-black tabular-nums">
                      {f.amount.replace(",", ".")} {f.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className="eyebrow mt-10 mb-3 text-grey">Details</h2>
            <dl className="border-t-2 border-ink">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-4 border-b border-ink/15 py-3.5 text-[15px]">
                  <dt className="font-bold">{k}</dt>
                  <dd className="text-grey">{v}</dd>
                </div>
              ))}
            </dl>

            <h2 className="eyebrow mt-10 mb-3 text-grey">How to · Mode d’emploi</h2>
            <ol className="grid grid-cols-3 gap-2">
              {[["1", "Ouvre.", "open."], ["2", "Sur la langue.", "on the tongue."], ["3", "On.", "that's it."]].map(([n, fr, en]) => (
                <li key={n} className="rounded-xl bg-bone p-4">
                  <span className="text-3xl font-black text-pinktext">{n}</span>
                  <p className="mt-2 text-sm leading-tight font-black uppercase">{fr}</p>
                  <p className="text-xs text-grey">{en}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-xs text-grey">Contains caffeine (50 mg per strip). Read the full label on pack before use.</p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-24 text-ivory md:py-36">
        <div className="wrap grid items-center gap-14 md:grid-cols-2">
          <div className="relative mx-auto grid aspect-square w-full max-w-[460px] place-items-center rounded-full ring-1 ring-ivory/15">
            <div className="absolute inset-[12%] rounded-full ring-1 ring-ivory/10" />
            <Strip className="float w-[30%]" style={{ "--r": "-7deg" } as React.CSSProperties} />
          </div>
          <div>
            <p className="eyebrow mb-5 text-ivory/60">Anatomy of a strip</p>
            <Reveal as="h2" variant="lines" className="display text-[14vw] md:text-[6.4vw]">
              <Line>White.</Line>
              <Line delay={90}>Blank.</Line>
              <Line delay={180}>
                <span className="display-italic text-pink">Busy.</span>
              </Line>
            </Reveal>
            <ul className="mt-9 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {[["~22 × 32 mm", "About the size of a postage stamp."], ["Nothing printed on it", "Plain white film. The sachet does the talking."], ["50 mg + 30 mg", "Caffeine + L-theanine, plus B6 and B12."], ["Menthe · Mint", "On the tongue. Let it dissolve."]].map(([k, v]) => (
                <li key={k} className="border-t border-ivory/20 pt-4">
                  <p className="text-xl font-black">{k}</p>
                  <p className="mt-1 text-sm text-ivory/65">{v}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="wrap grid items-center gap-12 bg-ivory py-24 md:grid-cols-2 md:py-36">
        <div>
          <p className="eyebrow mb-5 text-grey">Size</p>
          <Reveal as="h2" variant="lines" className="display text-[14vw] md:text-[6.4vw]">
            <Line>Pocket.</Line>
            <Line delay={90}>Waistband.</Line>
            <Line delay={180}>
              Wallet<span className="text-pink">.</span>
            </Line>
          </Reveal>
          <p className="mt-6 max-w-[40ch] text-[17px] text-grey">The sachet is 5 × 7 cm and about 2 mm thick. It goes where a can won&apos;t: a jersey pocket, a clutch, the coin pocket of your jeans.</p>
        </div>
        <Reveal>
          <ScaleCompare />
        </Reveal>
      </section>

      <section className="wrap bg-ivory pb-24 md:pb-36">
        <Reveal variant="rv-img" className="relative mx-auto aspect-[3/4] w-full max-w-[720px] overflow-hidden rounded-2xl">
          <Image src={tongue} alt="Campaign poster: “The day isn't done.” A woman looks into the camera with a white strip on her tongue. Still ON. logo." fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
        </Reveal>
      </section>

      <Faq />
      <Closing />
    </>
  );
}
