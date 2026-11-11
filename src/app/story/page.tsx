import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, Line } from "@/components/Reveal";
import { Sachet } from "@/components/Sachet";
import { Closing } from "@/components/Sections";
import cyclist from "@/assets/bw-cyclist.webp";

export const metadata: Metadata = {
  title: "Our story",
  description: "What Still ON. is and what it stands for: a small white energy strip for people whose day isn't done.",
  alternates: { canonical: "/story" },
};

const BELIEFS = [
  ["Small beats loud.", "A strip, not a can. 5 × 7 cm of sachet, one thin white film inside."],
  ["Say the number.", "50 mg of caffeine. 30 mg of L-theanine. 1.3 mg of B6. 20 mcg of B12. Printed on every sachet, in French and English."],
  ["One pink thing.", "Warm ivory, near black, and exactly one hit of pink. If everything shouts, nothing does."],
] as const;

export default function Story() {
  return (
    <>
      <section className="wrap bg-ivory pt-[calc(var(--header-h)+8vh)] pb-20 md:pb-28">
        <p className="eyebrow mb-6 flex items-center gap-3 text-grey">
          <span className="inline-block h-2 w-2 rounded-full bg-pink" /> Our story
        </p>
        <Reveal as="h1" variant="lines" className="display text-[17vw] md:text-[12vw]">
          <Line>Not made</Line>
          <Line delay={90}>
            <span className="display-italic">to stop</span>
            <span className="text-pink">.</span>
          </Line>
        </Reveal>
        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-2 md:gap-16">
          <Reveal variant="rv-img" className="relative aspect-[1122/1290] overflow-hidden">
            <Image src={cyclist} alt="Black-and-white, direct flash: a cyclist in a silver helmet and dark glasses stares into the lens." fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </Reveal>
          <div className="flex flex-col justify-center gap-6 text-[19px] leading-snug md:text-[22px]">
            <Reveal as="p" className="font-black">
              Still ON. is the smallest thing we could make for a day that keeps going: a white mint strip with caffeine and L-theanine, sealed in a sachet smaller than a credit card.
            </Reveal>
            <Reveal as="p" delay={80} className="text-grey">
              You open it, place it on your tongue and let it dissolve. That is the entire product.
            </Reveal>
          </div>
        </div>
      </section>

      <section className="wrap bg-ivory pb-24 md:pb-36">
        <ol className="grid border-t-2 border-ink md:grid-cols-3">
          {BELIEFS.map(([h, p], i) => (
            <Reveal as="li" key={h} delay={i * 80} className={`py-8 md:py-10 ${i ? "max-md:border-t max-md:border-ink/15 md:border-l md:border-ink/15 md:pl-8" : ""} md:pr-8`}>
              <span className="text-sm font-black text-pinkdeep tabular-nums">0{i + 1}</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight uppercase">{h}</h2>
              <p className="mt-3 text-[17px] text-grey">{p}</p>
            </Reveal>
          ))}
        </ol>
        <div className="mt-16 flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-10">
          <Sachet className="w-[110px] rotate-[-6deg]" />
          <Link href="/products/energy-strips" className="btn btn-ink">
            Meet N°01
          </Link>
        </div>
      </section>
      <Closing />
    </>
  );
}
