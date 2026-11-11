import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCommerce } from "@/lib/commerce";
import { FORMULA, PRODUCT, SITE } from "@/lib/site";
import { PdpGallery } from "@/components/PdpGallery";
import { Purchase } from "@/components/Purchase";
import { OfferConfigurator } from "@/components/Offers";
import { Reveal, Line } from "@/components/Reveal";
import { ScaleCompare, Closing } from "@/components/Sections";
import { Faq } from "@/components/Faq";
import inHand from "@/assets/bw-strip-hand.webp";
import { Benefits } from "@/components/Benefits";
import { PageView } from "@/components/PageView";
import { COMPARISON, USAGE_FACTS } from "@/config/copy";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Caffeine strips N°01 — Bandelettes énergisantes, mint",
  description: "Caffeine, without the can. Dissolvable caffeine strips: 50 mg caffeine and 30 mg L-theanine per strip, no water needed. Mint. 30 individually sealed sachets per box.",
  alternates: { canonical: "/products/energy-strips" },
};

export default async function ProductPage({ searchParams }: PageProps<"/products/energy-strips">) {
  const [commerce, sp] = await Promise.all([getCommerce(), searchParams]);
  const live = commerce.mode === "live";
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Still ON. ${PRODUCT.nameFr} ${PRODUCT.number} — ${PRODUCT.nameEn}`,
    description: "Dissolvable caffeine strips. 50 mg caffeine and 30 mg L-theanine per strip. Mint. 30 individually sealed sachets per box.",
    brand: { "@type": "Brand", name: SITE.name },
    url: `${SITE.url}/products/energy-strips`,
    ...(live ? { offers: { "@type": "Offer", price: (commerce.price.amount / 100).toFixed(2), priceCurrency: commerce.price.currency.toUpperCase(), availability: "https://schema.org/InStock", url: `${SITE.url}/products/energy-strips` } } : {}),
  };
  const specs: [string, string][] = [
    ["In the box", `${PRODUCT.count} sachets · ${PRODUCT.count} strips`],
    ["Sachet", "5 × 7 cm, matte ivory, sealed on four sides"],
    ["Box", `${PRODUCT.box.w} × ${PRODUCT.box.d} × ${PRODUCT.box.h} mm`],
  ];
  const h2 = "eyebrow mt-12 mb-3 text-grey";
  return (
    <>
      <PageView />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="wrap bg-ivory pt-[calc(var(--header-h)+20px)] pb-20 md:pb-28">
        <nav aria-label="Breadcrumb" className="eyebrow mb-5 text-grey">
          <Link href="/" className="link-u">Home</Link> <span aria-hidden="true">/</span> <span aria-current="page" className="text-ink">The strips</span>
        </nav>
        {sp?.checkout === "cancelled" && (
          <p role="status" className="mb-5 rounded-2xl bg-bone px-5 py-4 text-sm font-semibold">
            Checkout cancelled. Nothing was charged, and your cart is still here.
          </p>
        )}
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="min-w-0 md:sticky md:top-20 md:self-start">
            <PdpGallery />
          </div>
          <div className="min-w-0 md:py-4">
            <p className="eyebrow mb-4 text-grey">
              {PRODUCT.number} · {PRODUCT.flavourFr} · {PRODUCT.flavourEn} · {PRODUCT.count} strips per box
            </p>
            <h1 className="display text-[13vw] md:text-[5.2vw]">
              Bandelettes
              <br />
              énergisantes<span className="text-pink">.</span>
            </h1>
            <p className="display mt-4 text-[22px] md:text-[26px]">
              Caffeine, without the can<span className="text-pink">.</span>
            </p>
            <p className="mt-2 max-w-[46ch] text-[16px] text-grey">Dissolvable caffeine strips. Place one on your tongue and let it dissolve. No cup, no can, no mixing.</p>
            <div id="early-access" className="mt-7 scroll-mt-28">
              {live ? (
                <div className="rounded-2xl bg-bone p-6 md:p-7">
                  <Purchase source="pdp" />
                </div>
              ) : (
                <>
                  <p className="eyebrow mb-3 flex items-center gap-2" data-testid="status">
                    <span className="inline-block h-2 w-2 rounded-full bg-pink" /> Prelaunch · Pick your pace
                  </p>
                  <OfferConfigurator source="pdp" stage={false} />
                </>
              )}
            </div>

            <h2 className={h2}>Per strip · Par bandelette</h2>
            <table className="w-full border-t-2 border-ink text-left">
              <caption className="sr-only">Amounts per strip</caption>
              <tbody>
                {FORMULA.map((f) => (
                  <tr key={f.en} className="border-b border-ink/15">
                    <th scope="row" className="py-4 text-[15px] font-bold">
                      {f.en} <span className="font-normal text-grey">/ {f.fr}</span>
                    </th>
                    <td className="py-4 text-right text-[15px] font-black tabular-nums">
                      {f.amount} {f.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className={h2}>How to use · Mode d’emploi</h2>
            <ol className="grid grid-cols-3 gap-2">
              {["Open it.", "Place it on your tongue.", "Let it dissolve."].map((t, i) => (
                <li key={t} className="rounded-2xl bg-bone p-4">
                  <span className="text-3xl font-black text-pinktext">{i + 1}</span>
                  <p className="mt-2 text-sm leading-tight font-black uppercase">{t}</p>
                </li>
              ))}
            </ol>

            <h2 className={h2}>Using it</h2>
            <dl className="border-t-2 border-ink" data-testid="usage">
              {USAGE_FACTS.filter((f) => f.value).map((f) => (
                <div key={f.label} className="grid grid-cols-[120px_1fr] gap-4 border-b border-ink/15 py-4 text-[15px]">
                  <dt className="font-bold">{f.label}</dt>
                  <dd className="text-grey">{f.value}</dd>
                </div>
              ))}
            </dl>

            <h2 className={h2}>In the box</h2>
            <dl className="border-t-2 border-ink">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[120px_1fr] gap-4 border-b border-ink/15 py-4 text-[15px]">
                  <dt className="font-bold">{k}</dt>
                  <dd className="text-grey">{v}</dd>
                </div>
              ))}
            </dl>

            <h2 className={h2}>Safety</h2>
            <div className="rounded-2xl border border-ink/15 p-5 text-[15px] text-grey">
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

      <section className="wrap bg-white py-20 md:py-28">
        <p className="eyebrow mb-4 text-grey">Why a strip</p>
        <Benefits source="pdp" />
      </section>

      <section className="grid bg-ivory md:grid-cols-2">
        <div className="relative min-h-[70vw] md:min-h-[80svh]">
          <Image src={inHand} alt="Black-and-white, direct flash: a hand with one hot pink nail holds the small white strip up beside an athlete's chin." fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="wrap flex min-w-0 flex-col justify-center gap-8 py-20 md:px-16">
          <Reveal as="h2" variant="lines" className="display text-[12vw] md:text-[4.8vw]">
            <Line>Caffeine,</Line>
            <Line delay={90}>
              <span className="display-italic">without the can</span>
              <span className="text-pink">.</span>
            </Line>
          </Reveal>
          <div data-testid="comparison">
            {/* phones: one block per question, three short answers */}
            <dl className="border-t-2 border-ink lg:hidden">
              {COMPARISON.rows.map(([k, ...cells]) => (
                <div key={k} className="border-b border-ink/15 py-4">
                  <dt className="text-[11px] font-extrabold tracking-[0.1em] uppercase">{k}</dt>
                  {cells.map((c, i) => (
                    <dd key={i} className={`mt-2 grid grid-cols-[104px_1fr] gap-3 text-[14px] ${i === 0 ? "font-bold text-ink" : "text-grey"}`}>
                      <span className="text-[12px] font-semibold">{COMPARISON.columns[i]}</span>
                      <span>{c}</span>
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
            <table className="hidden w-full border-t-2 border-ink text-left text-[14px] lg:table">
              <caption className="sr-only">How a Still ON. strip differs in format from coffee and an energy drink</caption>
              <thead>
                <tr className="border-b border-ink/15">
                  <td className="py-3" />
                  {COMPARISON.columns.map((c, i) => (
                    <th key={c} scope="col" className={`py-3 pr-3 text-[11px] font-extrabold tracking-[0.1em] uppercase ${i === 0 ? "text-ink" : "text-grey"}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.rows.map(([k, ...cells]) => (
                  <tr key={k} className="border-b border-ink/15 align-top">
                    <th scope="row" className="py-4 pr-3 font-bold">
                      {k}
                    </th>
                    {cells.map((c, i) => (
                      <td key={i} className={`py-4 pr-3 ${i === 0 ? "font-bold text-ink" : "text-grey"}`}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="max-w-[52ch] text-[13px] text-grey">{COMPARISON.note}</p>
          <ScaleCompare />
        </div>
      </section>

      <Faq />
      <Closing />
    </>
  );
}
