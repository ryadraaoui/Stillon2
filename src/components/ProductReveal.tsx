"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Box3D } from "./Box3D";
import { Sachet, Strip } from "./Sachet";

gsap.registerPlugin(ScrollTrigger);

const FRAMES = [
  { n: "01", t: "The box", p: "Thirty strips. Thirty sachets. N°01, mint." },
  { n: "02", t: "The sachet", p: "5 × 7 cm. Smaller than a credit card. One strip inside." },
  { n: "03", t: "The strip", p: "White. Mint. Nothing printed on it." },
];
const STEPS = ["Open it.", "Place it on your tongue.", "Let it dissolve."];

function Steps({ className = "" }: { className?: string }) {
  return (
    <ol className={className}>
      {STEPS.map((s, i) => (
        <li key={s} data-step className="flex items-baseline gap-4 border-t border-ink/15 py-4 first:border-t-2 first:border-ink md:gap-6 md:py-5">
          <span className="w-[0.7em] text-3xl leading-none font-black text-pinktext md:text-5xl">{i + 1}</span>
          <span className="display text-[7vw] md:text-[2.9vw]">{s}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Section 02. Product reveal + how it works as one story on white: box → sachet → strip → usage.
 * A short pin (about two screens of scroll), scrubbed, never hijacked. Reduced motion gets four stills.
 * Box and sachet are live artwork rebuilt from the approved pack spec, so every frame is exact.
 */
export function ProductReveal() {
  const root = useRef<HTMLElement>(null);
  // layout effect: GSAP must restore the DOM (pin spacer) before React removes it on navigation
  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(el);
      const caps = q("[data-cap]");
      const sachet = q("[data-sachet-holder]");
      const strip = q("[data-strip]");
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      gsap.set(caps.slice(1), { autoAlpha: 0, y: 24 });
      gsap.set(q("[data-steps]"), { autoAlpha: 0 });
      gsap.set(q("[data-pin] [data-step]"), { autoAlpha: 0, x: 30 });
      gsap.set(sachet, { xPercent: 78, yPercent: 30, scale: 0.5, rotation: 9 });
      gsap.set(strip, { autoAlpha: 0, xPercent: -50 });
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: q("[data-pin]")[0], start: "top top", end: "+=210%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
      });
      const swap = (from: number, to: number, at: number) => tl.to(caps[from], { autoAlpha: 0, y: -24, duration: 0.35 }, at).to(caps[to], { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.3);
      // 01 → 02: the box leaves, one sachet comes forward
      tl.to(q("[data-box]"), { xPercent: -130, autoAlpha: 0, rotation: -6, duration: 1.4 }, 0.4).to(sachet, { xPercent: 0, yPercent: 0, scale: 1, rotation: 0, duration: 1.5 }, 0.4);
      swap(0, 1, 0.9);
      // 02 → 03: tear, the strip rises, the sachet drops away
      tl.set(strip, { autoAlpha: 1 }, 2.5)
        .to(q("[data-pin] [data-sachet-cap]"), { x: "70%", y: "-260%", rotation: 28, autoAlpha: 0, duration: 0.9, ease: "power2.out" }, 2.5)
        .to(strip, { yPercent: -78, rotation: 3, duration: 1, ease: "power2.out" }, 2.7)
        .to(sachet, { y: "110vh", rotation: 14, duration: 1.2, ease: "power2.in" }, 3.5)
        .to(strip, { top: "50%", yPercent: -50, rotation: -6, scale: 1.5, duration: 1.2 }, 3.6);
      swap(1, 2, 3.5);
      // 03 → 04: how it works
      tl.to(caps[2], { autoAlpha: 0, y: -24, duration: 0.35 }, 5)
        .to(q("[data-stage]"), desktop ? { xPercent: -42, duration: 1 } : { yPercent: -24, scale: 0.8, duration: 1 }, 5)
        .set(q("[data-steps]"), { autoAlpha: 1 }, 5.2)
        .to(q("[data-pin] [data-step]"), { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.25 }, 5.3)
        .to({}, { duration: 0.5 });
      tl.to(q("[data-progress]"), { scaleX: 1, duration: tl.duration(), ease: "none" }, 0);
    }, el);
    return () => mm.revert();
  }, []);

  const head = (
    <>
      <p className="eyebrow mb-3 text-grey">The product</p>
      <h2 className="display text-[11vw] md:text-[4.6vw]">
        Small strip<span className="text-pink">.</span>
        <br />
        <span className="display-italic">Big attitude.</span>
      </h2>
    </>
  );

  return (
    <section id="strips" ref={root} aria-label="The product and how it works" className="relative bg-white">
      <div data-pin className="relative h-[100svh] overflow-hidden bg-white motion-reduce:hidden">
        <div className="wrap absolute top-[calc(var(--header-h)+2.5svh)] left-0 z-20">{head}</div>

        <div className="absolute inset-0 grid place-items-center pt-[calc(var(--header-h)+10svh)] max-md:pb-[20svh]">
          <div data-stage className="relative w-[min(31svh,50vw)] md:w-[min(36svh,26vw)]">
            <div data-box className="absolute top-[14%] left-[-58%] w-[86%]">
              <Box3D className="w-full" />
            </div>
            <Strip data-strip className="absolute top-[11%] left-1/2 z-0 w-[44%]" />
            <div data-sachet-holder className="relative z-10">
              <Sachet className="w-full" />
            </div>
          </div>
        </div>

        {FRAMES.map((f) => (
          <div key={f.n} data-cap className="absolute bottom-[6svh] left-[var(--gutter)] z-20 max-w-[min(84vw,360px)] md:bottom-[10svh]">
            <p className="eyebrow mb-2 flex items-center gap-3">
              <span className="text-pinkdeep">{f.n}</span> {f.t}
            </p>
            <p className="text-xl leading-snug font-bold md:text-2xl">{f.p}</p>
          </div>
        ))}

        <div data-steps className="absolute inset-x-[var(--gutter)] bottom-[5svh] z-20 md:inset-x-auto md:top-1/2 md:right-[var(--gutter)] md:bottom-auto md:w-[40vw] md:-translate-y-1/2">
          <p className="eyebrow mb-3 flex items-center gap-3">
            <span className="text-pinkdeep">04</span> How it works
          </p>
          <Steps />
        </div>

        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-30 h-[3px]">
          <div data-progress className="h-full origin-left scale-x-0 bg-pink" />
        </div>
      </div>

      {/* Reduced motion: the same story as stills */}
      <div className="wrap hidden py-24 motion-reduce:block">
        {head}
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          <figure className="flex flex-col items-center gap-6">
            <Box3D className="w-[150px]" />
            <figcaption className="text-center font-bold">{FRAMES[0].p}</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-6">
            <Sachet className="w-[170px]" />
            <figcaption className="text-center font-bold">{FRAMES[1].p}</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-6">
            <div className="grid h-[238px] place-items-center">
              <Strip className="w-[90px]" />
            </div>
            <figcaption className="text-center font-bold">{FRAMES[2].p}</figcaption>
          </figure>
        </div>
        <Steps className="mx-auto mt-14 max-w-xl" />
      </div>
    </section>
  );
}
