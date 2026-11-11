import Image from "next/image";
import Link from "next/link";
import { FORMULA, PRODUCT } from "@/lib/site";
import { Censor, Logo } from "./Brand";
import { Reveal, Line } from "./Reveal";
import { Sachet, Strip } from "./Sachet";
import { Box3D } from "./Box3D";
import { NotifyForm, Purchase } from "./Purchase";
import shades from "@/assets/campaign-shades.webp";

export function Marquee({ items, className = "", dur = 30 }: { items: React.ReactNode[]; className?: string; dur?: number }) {
  const row = (hidden: boolean) => (
    <div className="flex flex-none items-center" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <span key={i} className="flex items-center">
          <span className="px-[0.5em]">{it}</span>
          <span className="inline-block h-[0.22em] w-[0.22em] rounded-full bg-pink" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee-track" style={{ "--dur": `${dur}s` } as React.CSSProperties}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export function HowItWorks() {
  const num = "text-[84px] leading-none font-black text-pinktext md:text-[120px]";
  const card = "relative flex min-h-[480px] flex-col overflow-hidden rounded-2xl md:min-h-[620px]";
  return (
    <section id="how" className="wrap bg-ivory py-24 md:py-36">
      <div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
        <Reveal as="h2" variant="lines" className="display text-[15vw] md:text-[8.4vw]">
          <Line>Three steps.</Line>
          <Line delay={90}>
            Two are <span className="display-italic">easy</span>
            <span className="text-pink">.</span>
          </Line>
        </Reveal>
        <Reveal className="max-w-[34ch] text-[17px] text-grey">It&apos;s printed on the back of every sachet, in case you forget. You won&apos;t.</Reveal>
      </div>
      <ol className="grid gap-4 md:grid-cols-3">
        <Reveal as="li" className={`${card} bg-bone`}>
          <div className="p-6 md:p-8">
            <span className={num}>1</span>
            <h3 className="display mt-2 text-4xl md:text-5xl">Ouvre.</h3>
            <p className="mt-1 text-grey">open.</p>
          </div>
          <div className="relative mt-auto flex justify-center px-10 pb-0">
            <Strip className="absolute top-[-16%] z-0 w-[26%] rotate-[4deg]" />
            <Sachet open className="relative z-10 w-[62%] translate-y-[14%] rotate-[-4deg]" label="An opened Still ON. sachet with the white strip coming out of the top" />
          </div>
        </Reveal>
        <Reveal as="li" delay={120} className={`${card} bg-[#eae1dc]`}>
          <Image src={shades} alt="A woman in pink-tinted glasses places the clear-white strip on her tongue with one finger." fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-[50%_30%] transition-transform duration-[1.2s] ease-out hover:scale-[1.04]" />
          <div className="relative p-6 md:p-8">
            <span className={num}>2</span>
          </div>
          <div className="relative mt-auto bg-gradient-to-t from-ink/70 to-transparent p-6 pt-20 text-ivory md:p-8 md:pt-24">
            <h3 className="display text-4xl md:text-5xl">Sur la langue.</h3>
            <p className="mt-1 text-ivory/80">on the tongue. Let it dissolve.</p>
          </div>
        </Reveal>
        <Reveal as="li" delay={240} className={`${card} bg-ink text-ivory`}>
          <div className="p-6 md:p-8">
            <span className={`${num} !text-ivory`}>3</span>
          </div>
          <div className="mt-auto p-6 md:p-8">
            <h3 className="display display-italic text-[150px] leading-[0.8] text-pink md:text-[13vw]">On.</h3>
            <p className="mt-4 text-ivory/70">That&apos;s it. Go be somewhere.</p>
          </div>
        </Reveal>
      </ol>
    </section>
  );
}

/** Credit card vs sachet vs strip, drawn to true relative scale (1 mm = 1 unit). */
export function ScaleCompare() {
  return (
    <figure className="rounded-2xl bg-bone p-6 md:p-10">
      <svg viewBox="0 0 190 84" className="h-auto w-full" role="img" aria-label="To scale: a credit card is 85.6 by 54 millimetres, the sachet is 50 by 70 millimetres, the strip is about 22 by 32 millimetres.">
        <rect x="1" y="15" width="85.6" height="54" rx="3.2" fill="none" stroke="#111" strokeWidth=".5" strokeDasharray="1.6 1.4" />
        <text x="5" y="23" fontSize="3.4" fontWeight="700" fill="#4a4642">CREDIT CARD</text>
        <text x="5" y="64" fontSize="3.2" fill="#4a4642">85.6 × 54 mm</text>
        <rect x="100" y="7" width="50" height="70" rx="1" fill="#f7f3ee" stroke="#111" strokeWidth=".5" />
        <line x1="100" y1="12" x2="150" y2="12" stroke="#ff006e" strokeWidth=".5" strokeDasharray="1.4 1" />
        <text x="104" y="22" fontSize="3.4" fontWeight="800" fill="#111">SACHET</text>
        <text x="104" y="72" fontSize="3.2" fill="#4a4642">50 × 70 mm</text>
        <rect x="163" y="26" width="22" height="32" rx="1.6" fill="#fff" stroke="#111" strokeWidth=".4" />
        <text x="163" y="23" fontSize="3.4" fontWeight="800" fill="#111">STRIP</text>
        <text x="163" y="64" fontSize="3.2" fill="#4a4642">~22 × 32 mm</text>
      </svg>
      <figcaption className="eyebrow mt-5 text-grey">To scale. Smaller than a credit card. Fits where a can doesn&apos;t.</figcaption>
    </figure>
  );
}

export function Formula() {
  return (
    <section id="formula" className="wrap bg-ivory py-24 md:py-36">
      <div className="grid gap-12 md:grid-cols-[1fr_1.25fr] md:gap-20">
        <div className="md:sticky md:top-28 md:self-start">
          <p className="eyebrow mb-5 text-grey">Per strip · Par bandelette</p>
          <Reveal as="h2" variant="lines" className="display text-[15vw] md:text-[7.2vw]">
            <Line>Four things.</Line>
            <Line delay={90}>
              No <span className="display-italic">mystery</span>
              <span className="text-pink">.</span>
            </Line>
          </Reveal>
          <Reveal className="mt-6 max-w-[38ch] text-[17px] text-grey">
            The whole formula fits on the back of a 5 × 7 cm sachet. So does the flavour: <strong className="text-ink">{PRODUCT.flavourFr.toLowerCase()} · mint</strong>.
          </Reveal>
          <Reveal className="mt-10 hidden md:block">
            <ScaleCompare />
          </Reveal>
        </div>
        <div>
          <dl className="border-t-2 border-ink">
            {FORMULA.map((f, i) => (
              <Reveal key={f.en} delay={i * 70} className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 border-b border-ink/15 py-7 md:py-9">
                <dd className="order-1 text-[19vw] leading-[0.8] font-black tracking-[-0.06em] tabular-nums transition-colors duration-500 group-hover:text-pink md:text-[9.5vw]">
                  {f.amount}
                  <span className="ml-1 text-[0.24em] font-extrabold tracking-normal">{f.unit}</span>
                </dd>
                <dt className="order-2 justify-self-end text-right">
                  <span className="block text-xl font-black uppercase md:text-2xl">{f.en}</span>
                  <span className="block text-sm text-grey">{f.fr}</span>
                </dt>
                <dd className="order-3 col-span-2 mt-4 max-w-[52ch] text-[15px] text-grey">{f.note}</dd>
              </Reveal>
            ))}
          </dl>
          <p className="mt-5 text-xs text-grey">Amounts as printed on pack. Contains caffeine. Not a substitute for sleep, whatever our posters say.</p>
          <div className="mt-10 md:hidden">
            <ScaleCompare />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ShopSection() {
  return (
    <section id="shop" className="wrap bg-bone py-24 md:py-36">
      <div className="grid items-center gap-14 md:grid-cols-2 md:gap-10">
        <Reveal className="relative mx-auto flex w-full max-w-[560px] items-end justify-center gap-[4%] py-6">
          <Box3D className="w-[44%]" />
          <Sachet className="mb-[2%] w-[22%] rotate-[-5deg]" />
          <Sachet side="back" className="mb-[1%] -ml-[6%] w-[22%] rotate-[7deg]" label="Back of the sachet: 1 ouvre, 2 sur la langue, 3 ON. Caffeine 50 mg, L-theanine 30 mg, vitamin B6 1.3 mg, vitamin B12 20 mcg, mint." />
        </Reveal>
        <div>
          <p className="eyebrow mb-5 text-grey">
            {PRODUCT.number} · {PRODUCT.flavourFr} · {PRODUCT.flavourEn}
          </p>
          <Reveal as="h2" variant="lines" className="display text-[14vw] md:text-[6.6vw]">
            <Line>Thirty strips.</Line>
            <Line delay={90}>
              One box<span className="text-pink">.</span>
            </Line>
          </Reveal>
          <Reveal className="mt-6 max-w-[40ch] text-[17px] text-grey">
            {PRODUCT.nameFr}. Thirty individually sealed sachets in a box the size of your palm: {PRODUCT.box.w} × {PRODUCT.box.d} × {PRODUCT.box.h} mm. <Censor className="font-black text-ink" /> <strong className="text-ink">l&apos;ordinaire.</strong>
          </Reveal>
          <ul className="mt-7 grid max-w-md grid-cols-2 gap-x-6 gap-y-3 text-sm font-bold">
            {["50 mg caffeine", "30 mg L-theanine", "Mint", "Dissolves on the tongue", "30 sealed sachets", "No water needed"].map((t) => (
              <li key={t} className="flex items-center gap-2.5 border-t border-ink/15 pt-3">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-9">
            <Purchase source="home-shop" />
          </div>
          <Link href="/products/energy-strips" className="eyebrow link-u mt-7 inline-block">
            Full product details →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Community() {
  return (
    <section id="list" className="relative overflow-hidden bg-ink py-24 text-ivory md:py-36">
      <div className="wrap grid gap-12 md:grid-cols-[1.3fr_1fr] md:items-end">
        <div>
          <p className="eyebrow mb-5 text-ivory/60">The list</p>
          <Reveal as="h2" variant="lines" className="display text-[17vw] md:text-[9.6vw]">
            <Line>Stay</Line>
            <Line delay={90}>
              <span className="display-italic text-pink">on.</span>
            </Line>
          </Reveal>
        </div>
        <Reveal>
          <p className="mb-6 max-w-[40ch] text-[17px] text-ivory/75">Drops, restocks and the occasional bad idea at 2 a.m. One list. People who are still up. No daily emails. We&apos;re tired of those too.</p>
          <NotifyForm source="home-list" dark cta="I'm in" />
        </Reveal>
      </div>
      <Marquee className="display mt-20 text-[13vw] text-ivory/10 md:text-[8vw]" dur={40} items={["still on", "encore là", "not done yet", "pas fini", "still on", "open late"]} />
    </section>
  );
}

export function Closing() {
  return (
    <section className="relative overflow-hidden bg-pink py-28 text-white md:py-44">
      <div className="wrap flex flex-col items-center text-center">
        <Reveal as="h2" variant="lines" className="display text-[22vw] md:text-[15.5vw]">
          <Line>The day</Line>
          <Line delay={90}>isn’t</Line>
          <Line delay={180}>done.</Line>
        </Reveal>
        <Reveal className="mt-10 flex flex-col items-center gap-5">
          <p className="max-w-[30ch] text-lg font-semibold">Neither are you. Caffeine + L-theanine energy strips, N°01.</p>
          <Link href="/products/energy-strips" className="btn btn-ivory">
            Get the strips
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function Manifesto() {
  return (
    <section className="wrap bg-ivory py-24 md:py-40">
      <div className="grid gap-10 md:grid-cols-[auto_1fr] md:gap-24">
        <p className="eyebrow text-grey md:pt-4">Manifesto</p>
        <div data-manifesto className="max-w-[20ch] text-[9.6vw] leading-[0.98] font-black tracking-[-0.04em] md:max-w-[19ch] md:text-[5.6vw]">
          {"Tired is not a personality. The day isn’t done at 3 p.m., or at 6, or when the group chat gives up. We made something small for people with big plans.".split(" ").map((w, i) => (
            <span key={i} data-w className="inline-block pr-[0.22em]">
              {w}
            </span>
          ))}
          <span data-w className="inline-block">
            <Censor className="text-ink" />
            &nbsp;
          </span>
          <span data-w className="inline-block text-pink">
            the&nbsp;
          </span>
          <span data-w className="inline-block text-pink">
            ordinary.
          </span>
        </div>
      </div>
      <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 md:mt-24 md:pl-[calc(6rem+70px)]">
        <Logo decorative className="h-7 w-auto" />
        <p className="eyebrow text-grey">Caffeine + L-theanine energy strip · Mint · Montréal</p>
      </div>
    </section>
  );
}
