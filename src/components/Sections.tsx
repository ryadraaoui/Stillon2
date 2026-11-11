import Image from "next/image";
import Link from "next/link";
import { CTA, EARLY_ACCESS, FORMULA, PRODUCT } from "@/lib/site";
import { Reveal, Line } from "./Reveal";
import { Sachet } from "./Sachet";
import { Box3D } from "./Box3D";
import { Purchase } from "./Purchase";
import { OfferConfigurator } from "./Offers";
import { MESSAGE } from "@/config/copy";
import closing from "@/assets/bw-closing.webp";

/** Section 04. The formula as printed on pack: two leads set large, the rest in one line. */
export function Formula() {
  const [caf, the, b6, b12] = FORMULA;
  return (
    <section id="formula" className="wrap bg-ivory py-24 md:py-32">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-4 text-grey">What&apos;s inside · Per strip</p>
          <Reveal as="h2" variant="lines" className="display text-[13vw] md:text-[6.4vw]">
            <Line>Two leads.</Line>
            <Line delay={90}>
              <span className="display-italic">One idea</span>
              <span className="text-pink">.</span>
            </Line>
          </Reveal>
        </div>
        <Link href="/products/energy-strips" className="eyebrow link-u self-start md:self-end">
          Complete product information →
        </Link>
      </div>
      <dl className="mt-12 grid border-t-2 border-ink md:mt-16 md:grid-cols-2">
        {[caf, the].map((f, i) => (
          <Reveal key={f.en} delay={i * 100} className={`py-8 md:py-12 ${i === 1 ? "max-md:border-t max-md:border-ink/15 md:border-l md:border-ink/15 md:pl-12" : "md:pr-12"}`}>
            <dd className="text-[30vw] leading-[0.78] font-black tracking-[-0.06em] tabular-nums md:text-[15vw]">
              {f.amount}
              <span className="ml-1 text-[0.2em] font-extrabold tracking-normal">{f.unit}</span>
            </dd>
            <dt className="mt-5 text-2xl font-black uppercase md:text-3xl">
              {f.en} <span className="text-base font-medium text-grey normal-case">/ {f.fr}</span>
            </dt>
            <dd className="mt-2 max-w-[40ch] text-[15px] text-grey">{f.note}</dd>
          </Reveal>
        ))}
      </dl>
      <p className="border-t border-ink/15 pt-6 text-[15px] font-bold">
        Also in every strip: vitamin B6 {b6.amount} {b6.unit} · vitamin B12 {b12.amount} {b12.unit} · {PRODUCT.flavourEn.toLowerCase()} flavour.
      </p>
      <p className="mt-6 flex max-w-[60ch] items-start gap-3 text-[15px]" data-testid="rtb">
        <span aria-hidden="true" className="mt-[0.45em] h-2 w-2 flex-none rounded-full bg-pink" />
        <span>
          <strong className="font-black uppercase">It’s on the label.</strong> <span className="text-grey">Every sachet states what is in the strip and how much, per strip, in French and English.</span>
        </span>
      </p>
      <p className="mt-4 text-xs text-grey">Amounts as printed on pack. Contains caffeine. Read the label before use.</p>
    </section>
  );
}

/** Section 05. The offer: pick a bundle, a pace, and register. The only signup on the page. */
export function Conversion({ live }: { live: boolean }) {
  return (
    <section id="early-access" className="wrap bg-white py-24 md:py-32">
      <div className="mb-10 flex flex-col justify-between gap-3 md:mb-14 md:flex-row md:items-end">
        <Reveal as="h2" variant="lines" className="display text-[15vw] md:text-[7.4vw]">
          <Line>
            Pick your <span className="display-italic">pace</span>
            <span className="text-pink">.</span>
          </Line>
        </Reveal>
        <Reveal className="md:pb-3 md:text-right">
          <p className="text-[19px] font-black uppercase md:text-xl">{MESSAGE.offer}</p>
          <p className="mt-1 text-[15px] text-grey">{MESSAGE.offerSupport}</p>
        </Reveal>
      </div>
      {live ? (
        <div className="grid items-center gap-14 md:grid-cols-2">
          <div className="mx-auto flex w-full max-w-[520px] items-end justify-center gap-[4%]">
            <Box3D className="w-[46%]" />
            <Sachet className="mb-[2%] w-[23%] rotate-[-5deg]" />
          </div>
          <Purchase source="home" />
        </div>
      ) : (
        <OfferConfigurator source="home" />
      )}
    </section>
  );
}

/** Section 06. The closing frame. No new information. */
export function Closing() {
  return (
    <section data-nav-tone="dark" className="grid overflow-hidden bg-pink text-white md:grid-cols-[1fr_38%]">
      <div className="relative h-[72vw] md:order-last md:h-auto">
        <Image src={closing} alt="" fill sizes="(max-width: 768px) 100vw, 38vw" className="object-cover object-[50%_22%]" />
      </div>
      <div className="wrap flex flex-col justify-end py-16 md:min-h-[72svh] md:py-20">
        <Reveal as="h2" variant="lines" className="display display-italic text-[20vw] md:text-[13vw]">
          <Line>The day</Line>
          <Line delay={90}>isn’t</Line>
          <Line delay={180}>done.</Line>
        </Reveal>
        <Reveal className="mt-8">
          <Link href={EARLY_ACCESS} className="btn btn-ivory">
            {CTA}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/** Credit card vs sachet, drawn to true relative scale (1 mm = 1 unit). Product page only. */
export function ScaleCompare() {
  return (
    <figure className="rounded-2xl bg-bone p-6 md:p-10">
      <svg viewBox="0 0 156 84" className="h-auto w-full" role="img" aria-label="To scale: a credit card is 85.6 by 54 millimetres, the sachet is 50 by 70 millimetres.">
        <rect x="1" y="15" width="85.6" height="54" rx="3.2" fill="none" stroke="#111" strokeWidth=".5" strokeDasharray="1.6 1.4" />
        <text x="5" y="23" fontSize="3.6" fontWeight="700" fill="#4a4642">CREDIT CARD</text>
        <text x="5" y="64" fontSize="3.4" fill="#4a4642">85.6 × 54 mm</text>
        <rect x="102" y="7" width="50" height="70" rx="1" fill="#f7f3ee" stroke="#111" strokeWidth=".5" />
        <line x1="102" y1="12" x2="152" y2="12" stroke="#ff006e" strokeWidth=".5" strokeDasharray="1.4 1" />
        <text x="106" y="22" fontSize="3.6" fontWeight="800" fill="#111">SACHET</text>
        <text x="106" y="72" fontSize="3.4" fill="#4a4642">50 × 70 mm</text>
      </svg>
      <figcaption className="eyebrow mt-5 text-grey">To scale. Smaller than a credit card.</figcaption>
    </figure>
  );
}
