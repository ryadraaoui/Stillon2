import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, Line } from "@/components/Reveal";
import { Censor } from "@/components/Brand";
import { Sachet } from "@/components/Sachet";
import { Closing, Marquee } from "@/components/Sections";
import wet from "@/assets/campaign-wet.webp";
import cyclist from "@/assets/campaign-cyclist.webp";

export const metadata: Metadata = {
  title: "Our story",
  description: "Why Still ON. exists: a small white energy strip from Montréal for people whose day isn't done.",
  alternates: { canonical: "/story" },
};

const BELIEFS = [
  ["Small beats loud.", "A can announces itself. A strip doesn't. 5 × 7 cm, 2 mm thick, gone in the time it takes to put your phone away."],
  ["Say the number.", "50 mg of caffeine. 30 mg of L-theanine. 1.3 mg of B6. 20 mcg of B12. It's on the back of every sachet, in two languages."],
  ["No wellness voice.", "We're not going to tell you to optimise your morning. We're going to hand you a strip and get out of the way."],
  ["One pink thing.", "Warm ivory, near black, and exactly one hit of #FF006E per frame. If everything shouts, nothing does."],
] as const;

export default function Story() {
  return (
    <>
      <section className="wrap relative overflow-hidden bg-ivory pt-[calc(var(--header-h)+8vh)] pb-20 md:pb-32">
        <p className="eyebrow mb-6 flex items-center gap-3 text-grey">
          <span className="inline-block h-2 w-2 rounded-full bg-pink" /> Our story · Montréal
        </p>
        <Reveal as="h1" variant="lines" className="display text-[17vw] md:text-[12vw]">
          <Line>We weren’t</Line>
          <Line delay={90}>
            <span className="display-italic">finished</span>
            <span className="text-pink">.</span>
          </Line>
        </Reveal>
        <div className="mt-12 grid gap-10 md:mt-20 md:grid-cols-[1fr_1.1fr] md:gap-20">
          <Reveal variant="rv-img" className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-bone">
            <Image src={wet} alt="A woman with wet hair and a white tank top looks straight into the flash." fill priority sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
          </Reveal>
          <div className="flex flex-col justify-center gap-6 text-[19px] leading-snug md:text-[22px]">
            <Reveal as="p" className="font-black">
              Still ON. started with a simple annoyance: the day keeps going, and the options for keeping up with it are a tall can, a third coffee, or giving in.
            </Reveal>
            <Reveal as="p" delay={80} className="text-grey">
              So we made the smallest thing we could. A white mint strip with caffeine and L-theanine in it, sealed in a sachet smaller than a credit card. It goes on your tongue and dissolves. That is the entire product.
            </Reveal>
            <Reveal as="p" delay={160} className="text-grey">
              Then we dressed it like it was going somewhere. French first, because we&apos;re from Montréal. Black type, warm ivory, one pink swipe across the word we&apos;re not printing. <Censor className="font-black text-ink" /> <strong className="text-ink">l’ordinaire.</strong>
            </Reveal>
          </div>
        </div>
      </section>

      <Marquee className="display display-italic border-y border-ink/10 py-5 text-[9vw] md:text-[3.4vw]" items={["La journée n’est pas finie", "The day isn’t done", "Ouvre. Dépose. On.", "Open. Strip. On."]} dur={36} />

      <section className="wrap bg-ivory py-24 md:py-36">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-20">
          <h2 className="display text-[14vw] md:sticky md:top-28 md:self-start md:text-[6.6vw]">
            What we
            <br />
            <span className="display-italic">believe</span>
            <span className="text-pink">.</span>
          </h2>
          <ol className="border-t-2 border-ink">
            {BELIEFS.map(([h, p], i) => (
              <Reveal as="li" key={h} delay={i * 60} className="grid grid-cols-[auto_1fr] gap-x-6 border-b border-ink/15 py-8">
                <span className="text-sm font-black text-pinktext tabular-nums">0{i + 1}</span>
                <div>
                  <h3 className="text-3xl font-black tracking-tight uppercase md:text-4xl">{h}</h3>
                  <p className="mt-3 max-w-[50ch] text-[17px] text-grey">{p}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="grid bg-bone md:grid-cols-2">
        <div className="relative min-h-[70vh]">
          <Image src={cyclist} alt="A cyclist in a silver helmet and dark glasses stares into the flash, jersey soaked." fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="wrap flex flex-col justify-center gap-8 py-20 md:px-16">
          <Sachet className="w-[120px] rotate-[-6deg]" />
          <h2 className="display text-[13vw] md:text-[5vw]">
            N°01 is mint<span className="text-pink">.</span>
          </h2>
          <p className="max-w-[40ch] text-[17px] text-grey">Thirty strips, thirty sachets, one box. It&apos;s the first thing we&apos;ve made. The number is a hint.</p>
          <Link href="/products/energy-strips" className="btn btn-ink self-start">
            Meet N°01
          </Link>
        </div>
      </section>
      <Closing />
    </>
  );
}
