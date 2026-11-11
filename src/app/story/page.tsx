import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, Line } from "@/components/Reveal";
import { Sachet } from "@/components/Sachet";
import { Closing } from "@/components/Sections";
import cyclist from "@/assets/bw-cyclist.webp";

export const metadata: Metadata = {
  title: "Our story",
  description: "Why Still ON. exists: caffeine, without the can. A dissolvable strip for days that don't stay in one place.",
  alternates: { canonical: "/story" },
};

// Brand point of view only. Nothing here is a founder anecdote: add one only once it is supplied and verified.
const WHY = [
  ["The day moved.", "Work, training, travel, whatever comes after. Most days no longer happen in one place."],
  ["The caffeine didn’t.", "It still mostly comes as a drink: a cup to find, a can to carry, something to finish."],
  ["So we made it smaller.", "One thin strip with 50 mg of caffeine, sealed in a sachet smaller than a credit card. On your tongue, and it dissolves."],
] as const;

export default function Story() {
  return (
    <>
      <section className="wrap bg-white pt-[calc(var(--header-h)+8vh)] pb-20 md:pb-28">
        <p className="eyebrow mb-6 flex items-center gap-3 text-grey">
          <span className="inline-block h-2 w-2 rounded-full bg-pink" /> Why Still ON. exists
        </p>
        <Reveal as="h1" variant="lines" className="display text-[15vw] md:text-[10.5vw]">
          <Line>Caffeine,</Line>
          <Line delay={90}>
            <span className="display-italic">without the can</span>
            <span className="text-pink">.</span>
          </Line>
        </Reveal>
        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-2 md:gap-16">
          <Reveal variant="rv-img" className="relative aspect-[1122/1290] overflow-hidden">
            <Image src={cyclist} alt="Black-and-white, direct flash: a cyclist in a silver helmet and dark glasses stares into the lens." fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </Reveal>
          <ol className="flex flex-col justify-center">
            {WHY.map(([h, p], i) => (
              <Reveal as="li" key={h} delay={i * 80} className="border-t border-ink/15 py-7 first:border-t-2 first:border-ink">
                <span className="text-sm font-black text-pinkdeep tabular-nums">0{i + 1}</span>
                <h2 className="mt-2 text-3xl font-black tracking-tight uppercase md:text-4xl">{h}</h2>
                <p className="mt-3 max-w-[44ch] text-[17px] text-grey">{p}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap bg-ivory py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center md:gap-16">
          <Reveal as="h2" variant="lines" className="display text-[12vw] md:text-[5.4vw]">
            <Line>Not a better coffee.</Line>
            <Line delay={90}>
              A <span className="display-italic">different format</span>
              <span className="text-pink">.</span>
            </Line>
          </Reveal>
          <div className="space-y-5 text-[17px] text-grey">
            <p>Still ON. doesn’t replace the drink you love. It is for the moments a drink is in the way: no cup, no can, no mixing, and the amount printed on every sachet.</p>
            <p>
              <strong className="text-ink">The day isn’t done.</strong> That is the feeling. <strong className="text-ink">Caffeine, without the can.</strong> That is the product.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-3">
              <Sachet className="w-[96px] rotate-[-6deg]" />
              <Link href="/products/energy-strips" className="btn btn-ink">
                See the strips
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Closing />
    </>
  );
}
