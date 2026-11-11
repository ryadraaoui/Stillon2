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
      {STEPS.map((t, i) => (
        <li key={t} data-step className="flex items-baseline gap-4 border-t border-current/25 py-4 first:border-t-2 first:border-current md:gap-6 md:py-5">
          <span className="w-[0.7em] text-3xl leading-none font-black md:text-5xl">{i + 1}</span>
          <span className="display text-[7vw] md:text-[3vw]">{t}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Section 02. The immersive product reveal: box → sachet (turns to show its back) → torn open as the
 * world floods pink → the strip alone → how to use it. One pinned sequence of about three screens, scrubbed, never hijacked.
 * Box and sachet are live artwork rebuilt from the approved pack spec, so every frame is exact.
 * Reduced motion: three stills.
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
      const s3d = q("[data-pin] [data-sachet-3d]");
      const strip = q("[data-strip]");
      gsap.set(caps.slice(1), { autoAlpha: 0, y: 24 });
      const wide = window.matchMedia("(min-width: 768px)").matches;
      gsap.set(sachet, { xPercent: wide ? 78 : 58, yPercent: 30, scale: wide ? 0.5 : 0.42, rotation: 9 });
      gsap.set(strip, { autoAlpha: 0, xPercent: -50 });
      gsap.set(q("[data-steps]"), { autoAlpha: 0 });
      gsap.set(q("[data-pin] [data-step]"), { autoAlpha: 0, x: 30 });
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: q("[data-pin]")[0], start: "top top", end: "+=330%", pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true },
      });
      const swap = (from: number, to: number, at: number) => tl.to(caps[from], { autoAlpha: 0, y: -24, duration: 0.35 }, at).to(caps[to], { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.3);
      // 01 → 02: the box leaves, one sachet comes forward
      tl.to(q("[data-box]"), { xPercent: -140, autoAlpha: 0, rotation: -8, duration: 1.4 }, 0.3).to(sachet, { xPercent: 0, yPercent: 0, scale: 1, rotation: 0, duration: 1.5 }, 0.3);
      swap(0, 1, 0.8);
      // 02: a full turn, so the back (steps + formula) passes the camera once
      tl.to(s3d, { rotationY: 360, duration: 1.8, ease: "power1.inOut" }, 2);
      // 02 → 03: the world floods pink, tear, the strip rises
      tl.to(caps[1], { autoAlpha: 0, y: -24, duration: 0.35 }, 3.6)
        .to(q("[data-bg-pink]"), { clipPath: "circle(150% at 50% 55%)", duration: 1.1, ease: "power2.in" }, 3.7)
        .to(q("[data-ink]"), { color: "#ffffff", duration: 0.4 }, 4.2)
        .to(q("[data-progress]"), { backgroundColor: "#ffffff", duration: 0.2 }, 4.2)
        .set(strip, { autoAlpha: 1 }, 4.6)
        .to(q("[data-pin] [data-sachet-cap]"), { x: "70%", y: "-260%", rotation: 28, duration: 1, ease: "power2.out" }, 4.6)
        .to(strip, { yPercent: -78, rotation: 3, duration: 1.1, ease: "power2.out" }, 4.8)
        .to(caps[2], { autoAlpha: 1, y: 0, duration: 0.45 }, 5)
        // 03: the sachet drops away, the strip is the hero
        .to(q("[data-pin] [data-sachet-cap]"), { autoAlpha: 0, duration: 0.3 }, 6)
        .to(sachet, { y: "115vh", rotation: 16, duration: 1.3, ease: "power2.in" }, 6)
        .to(strip, { top: "50%", yPercent: -50, rotation: -7, scale: 1.7, duration: 1.3 }, 6.1)
        // 04: how it works, beside the strip
        .to(caps[2], { autoAlpha: 0, y: -24, duration: 0.35 }, 7.5)
        .to(q("[data-stage]"), wide ? { xPercent: -62, duration: 1 } : { yPercent: -30, scale: 0.72, duration: 1 }, 7.5)
        .set(q("[data-steps]"), { autoAlpha: 1 }, 7.7)
        .to(q("[data-pin] [data-step]"), { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.22 }, 7.8)
        .to({}, { duration: 0.5 });
      tl.to(q("[data-progress]"), { scaleX: 1, duration: tl.duration(), ease: "none" }, 0);
    }, el);
    return () => mm.revert();
  }, []);

  const head = (
    <>
      <p className="eyebrow mb-3 opacity-70">The product</p>
      <h2 className="display text-[11vw] md:text-[4.6vw]">
        Small strip.
        <br />
        <span className="display-italic">Big attitude.</span>
      </h2>
    </>
  );

  return (
    <section id="strips" ref={root} aria-label="The product" className="relative bg-white">
      <div data-pin className="relative h-[100svh] overflow-hidden bg-white motion-reduce:hidden">
        <div data-bg-pink data-nav-tone="dark" className="absolute inset-0 bg-pink" style={{ clipPath: "circle(0% at 50% 55%)" }} />
        <div data-ink className="wrap absolute top-[calc(var(--header-h)+2.5svh)] left-0 z-20 text-ink">
          {head}
        </div>

        <div className="absolute inset-0 grid place-items-center pt-[calc(var(--header-h)+10svh)] max-md:pb-[14svh]">
          <div data-stage className="relative w-[min(31svh,50vw)] md:w-[min(36svh,26vw)]">
            <div data-box className="absolute top-[22%] left-[-34%] w-[70%] md:top-[14%] md:left-[-58%] md:w-[86%]">
              <Box3D className="w-full" />
            </div>
            <Strip data-strip className="absolute top-[11%] left-1/2 z-0 w-[44%]" />
            <div data-sachet-holder className="relative z-10">
              <Sachet className="w-full" />
            </div>
          </div>
        </div>

        {FRAMES.map((f, i) => (
          <div key={f.n} data-cap className={`absolute bottom-[6svh] left-[var(--gutter)] z-20 max-w-[min(84vw,360px)] md:bottom-[10svh] ${i === 2 ? "text-white" : "text-ink"}`}>
            <p className="eyebrow mb-2 flex items-center gap-3">
              <span className={i === 2 ? "" : "text-pinkdeep"}>{f.n}</span> {f.t}
            </p>
            <p className="text-xl leading-snug font-bold md:text-2xl">{f.p}</p>
          </div>
        ))}

        <div data-steps className="absolute inset-x-[var(--gutter)] bottom-[5svh] z-20 text-white md:inset-x-auto md:top-1/2 md:right-[var(--gutter)] md:bottom-auto md:w-[42vw] md:-translate-y-1/2">
          <p className="eyebrow mb-3">04 How it works</p>
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
