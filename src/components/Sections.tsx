import Image from "next/image";
import Link from "next/link";
import { CTA, EARLY_ACCESS, FORMULA, PRODUCT } from "@/lib/site";
import { Reveal, Line } from "./Reveal";
import { Sachet, Strip } from "./Sachet";
import { Box3D } from "./Box3D";
import { Purchase } from "./Purchase";
import shades from "@/assets/bw-shades.webp";
import closing from "@/assets/bw-closing.webp";

/** Experience 04. Three steps, three pictures, eleven words. */
export function HowItWorks() {
  const card = "group relative flex min-h-[440px] flex-col overflow-hidden md:min-h-[72svh]";
  const num = "text-[84px] leading-none font-black md:text-[110px]";
  const title = "display text-[9vw] md:text-[2.9vw]";
  return (
    <section id="how" aria-label="How it works" className="bg-white">
      <ol className="grid md:grid-cols-3">
        <Reveal as="li" className={`${card} bg-bone`}>
          <div className="p-6 md:p-8">
            <span className={`${num} text-pinktext`}>1</span>
            <h3 className={`${title} mt-2`}>Open it.</h3>
          </div>
          <div className="relative mt-auto flex justify-center px-10">
            <Strip className="absolute top-[-16%] z-0 w-[24%] rotate-[4deg] transition-transform duration-700 ease-out group-hover:-translate-y-[18%]" />
            <Sachet open className="relative z-10 w-[58%] translate-y-[14%] rotate-[-4deg]" label="An opened Still ON. sachet with the white strip coming out of the top" />
          </div>
        </Reveal>
        <Reveal as="li" delay={120} className={`${card} bg-[#e5e5e5]`}>
          <Image src={shades} alt="Black-and-white, direct flash: a woman in tinted glasses places the strip on her tongue with one finger." fill sizes="(max-width: 768px) 100vw, 34vw" className="object-cover object-[50%_30%] transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
          <div className="relative p-6 md:p-8">
            <span className={`${num} text-white mix-blend-difference`}>2</span>
          </div>
          <div className="relative mt-auto bg-gradient-to-t from-ink/75 to-transparent p-6 pt-24 text-white md:p-8 md:pt-28">
            <h3 className={title}>Place it on your tongue.</h3>
          </div>
        </Reveal>
        <Reveal as="li" delay={240} className={`${card} bg-ink text-white`}>
          <div className="p-6 md:p-8">
            <span className={`${num} text-pink`}>3</span>
            <h3 className={`${title} mt-2`}>Let it dissolve.</h3>
          </div>
          <div className="relative mt-auto grid place-items-center pb-14 md:pb-20">
            <Strip className="dissolve w-[22%]" />
          </div>
        </Reveal>
      </ol>
    </section>
  );
}

/** Experience 06. The formula as printed on pack: two leads set large, the rest in one line. */
export function Formula() {
  const [caf, the, b6, b12] = FORMULA;
  return (
    <section id="formula" className="wrap bg-ivory py-24 md:py-36">
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
      <p className="mt-2 text-xs text-grey">Amounts as printed on pack. Contains caffeine. Read the label before use.</p>
    </section>
  );
}

/** Experience 07. The one signup on the page. Hero, header, closing and footer CTAs all land here. */
export function Conversion() {
  return (
    <section id="early-access" className="wrap scroll-mt-[var(--header-h)] bg-bone py-24 md:py-36">
      <div className="grid items-center gap-14 md:grid-cols-2 md:gap-10">
        <Reveal className="relative mx-auto flex w-full max-w-[540px] items-end justify-center gap-[4%] py-6">
          <Box3D className="w-[46%]" />
          <Sachet className="mb-[2%] w-[23%] rotate-[-5deg]" />
          <Sachet side="back" className="mb-[1%] -ml-[6%] w-[23%] rotate-[7deg]" label="Back of the sachet: the three steps and the formula." />
        </Reveal>
        <div>
          <p className="eyebrow mb-5 text-grey">
            {PRODUCT.number} · {PRODUCT.nameEn} · {PRODUCT.flavourEn}
          </p>
          <Reveal as="h2" variant="lines" className="display text-[12.5vw] md:text-[5.6vw]">
            <Line>Your next move</Line>
            <Line delay={90}>
              <span className="display-italic">starts here</span>
              <span className="text-pink">.</span>
            </Line>
          </Reveal>
          <Reveal className="mt-6 max-w-[40ch] text-[17px] text-grey">
            {PRODUCT.nameFr}. Thirty dissolvable strips with caffeine + L-theanine, each sealed in its own 5 × 7 cm sachet.
          </Reveal>
          <div className="mt-8">
            <Purchase source="home" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Experience 08. The closing frame. No new information. */
export function Closing() {
  return (
    <section className="grid overflow-hidden bg-pink text-white md:grid-cols-[1fr_38%]">
      <div className="relative h-[78vw] md:order-last md:h-auto">
        <Image src={closing} alt="" fill sizes="(max-width: 768px) 100vw, 38vw" className="object-cover object-[50%_22%]" />
      </div>
      <div className="wrap flex flex-col justify-end py-14 md:min-h-[86svh] md:py-20">
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
