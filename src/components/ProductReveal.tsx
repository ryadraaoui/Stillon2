"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sachet, Strip } from "./Sachet";

gsap.registerPlugin(ScrollTrigger);

const CALLOUTS = [
  { k: "~22 × 32 mm", v: "The whole thing. Shown larger than life.", pos: "left-[var(--gutter)] top-[20%] md:left-[12%] md:top-[37%]", align: "text-left" },
  { k: "White. Matte.", v: "Nothing printed on it.", pos: "right-[var(--gutter)] top-[20%] md:right-[12%] md:top-[37%]", align: "text-right" },
  { k: "50 mg + 30 mg", v: "Caffeine + L-theanine. Plus B6 and B12.", pos: "left-[var(--gutter)] bottom-[14%] md:left-[12%] md:bottom-[28%]", align: "text-left" },
  { k: "Menthe · Mint", v: "On the tongue. Let it dissolve.", pos: "right-[var(--gutter)] bottom-[14%] md:right-[12%] md:bottom-[28%]", align: "text-right" },
];
const CAPS = [
  { n: "01", t: "The sachet", h: ["One strip.", "One sachet."], p: "5 × 7 cm of matte ivory, sealed on all four sides. Smaller than a credit card." },
  { n: "02", t: "The back", h: ["Instructions", "included."], p: "1 Ouvre. 2 Sur la langue. 3 ON. The formula is printed right underneath." },
  { n: "03", t: "Déchirer ici", h: ["Tear", "here."], p: "Follow the pink dashed line." },
  { n: "04", t: "The strip", h: ["This", "is it."], p: "" },
];

/**
 * Priority 2. A pinned, scroll-scrubbed product reveal across three colour worlds (ivory → pink → black).
 * The sachet is live artwork, so every frame is exact at any resolution. All copy is live HTML.
 * Reduced motion: the pinned sequence is replaced by four static panels.
 */
export function ProductReveal() {
  const root = useRef<HTMLElement>(null);
  // layout effect: GSAP must restore the DOM (pin spacers) before React removes it on navigation
  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(el);
      const s3d = q("[data-pin] [data-sachet-3d]");
      const caps = q("[data-cap]");
      gsap.set(s3d, { rotationY: -38, rotationX: 10, scale: 0.86 });
      gsap.set(caps.slice(1), { autoAlpha: 0, y: 30 });
      gsap.set(q("[data-dim], [data-callout]"), { autoAlpha: 0 });
      gsap.set(q("[data-strip]"), { autoAlpha: 0, xPercent: -50 });
      const show = (i: number, at: number) => tl.to(caps[i], { autoAlpha: 1, y: 0, duration: 0.5 }, at);
      const hide = (i: number, at: number) => tl.to(caps[i], { autoAlpha: 0, y: -30, duration: 0.4 }, at);

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: q("[data-pin]")[0], start: "top top", end: "+=460%", pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true },
      });
      // 01 — ivory: settle to face the camera, measure it
      tl.to(s3d, { rotationY: 0, rotationX: 0, scale: 1, duration: 1.5 }, 0)
        .to(q("[data-dim]"), { autoAlpha: 1, duration: 0.4 }, 1.1)
        .to(q("[data-dim]"), { autoAlpha: 0, duration: 0.3 }, 2);
      // 02 — flip to the back
      hide(0, 2);
      tl.to(s3d, { rotationY: 180, duration: 1.5 }, 2.1);
      show(1, 2.9);
      // 03 — pink world, flip to front, tear
      hide(1, 4.1);
      tl.to(s3d, { rotationY: 360, duration: 1.4 }, 4.2)
        .to(q("[data-bg-pink]"), { clipPath: "circle(150% at 50% 55%)", duration: 1.2, ease: "power2.in" }, 4.3)
        .to(q("[data-progress]"), { backgroundColor: "#f7f3ee", duration: 0.2 }, 5);
      show(2, 5.3);
      tl.set(q("[data-strip]"), { autoAlpha: 1 }, 5.6)
        .to(q("[data-pin] [data-sachet-cap]"), { x: "70%", y: "-260%", rotation: 28, duration: 1.2, ease: "power2.out" }, 5.7)
        .to(q("[data-strip]"), { yPercent: -78, rotation: 3, duration: 1.3, ease: "power2.out" }, 6);
      // 04 — black world: the sachet drops away, the strip is the hero
      hide(2, 7.3);
      tl.to(q("[data-bg-black]"), { clipPath: "circle(150% at 50% 45%)", duration: 1.1, ease: "power2.in" }, 7.4)
        .to(q("[data-pin] [data-sachet-cap]"), { autoAlpha: 0, duration: 0.3 }, 7.4)
        .to(q("[data-sachet-holder]"), { y: "130vh", rotation: 16, duration: 1.4, ease: "power2.in" }, 7.5)
        .to(q("[data-strip]"), { top: "50%", yPercent: -50, rotation: -6, scale: 1.75, duration: 1.4 }, 7.6);
      show(3, 8.6);
      tl.to(q("[data-callout]"), { autoAlpha: 1, duration: 0.5, stagger: 0.18 }, 8.8).to({}, { duration: 0.6 });
      tl.to(q("[data-progress]"), { scaleX: 1, duration: tl.duration(), ease: "none" }, 0);
    }, el);
    return () => mm.revert();
  }, []);

  return (
    <section id="reveal" ref={root} aria-label="The product, opened" className="relative bg-ivory">
      {/* ---------- Pinned, scrubbed sequence ---------- */}
      <div data-pin className="relative h-[100svh] overflow-hidden bg-ivory motion-reduce:hidden">
        <div data-bg-pink className="absolute inset-0 bg-pink" style={{ clipPath: "circle(0% at 50% 55%)" }} />
        <div data-bg-black className="absolute inset-0 bg-ink" style={{ clipPath: "circle(0% at 50% 45%)" }} />

        <div className="absolute inset-0 grid place-items-center pt-[var(--header-h)] max-md:pb-[22svh]">
          <div className="relative w-[min(35svh,54vw)] md:w-[min(38svh,30vw)]">
            <Strip data-strip className="absolute top-[11%] left-1/2 z-0 w-[44%]" />
            <div data-sachet-holder className="relative z-10">
              <Sachet className="w-full" />
            </div>
            <div data-dim aria-hidden="true" className="absolute inset-x-0 -bottom-9 flex items-center gap-2 text-[11px] font-extrabold tracking-[0.14em]">
              <span className="h-px flex-1 bg-ink" />5 CM<span className="h-px flex-1 bg-ink" />
            </div>
            <div data-dim aria-hidden="true" className="absolute inset-y-0 -right-9 flex flex-col items-center gap-2 text-[11px] font-extrabold tracking-[0.14em]">
              <span className="w-px flex-1 bg-ink" />
              <span className="[writing-mode:vertical-rl]">7 CM</span>
              <span className="w-px flex-1 bg-ink" />
            </div>
          </div>
        </div>

        {CALLOUTS.map((c) => (
          <div key={c.k} data-callout className={`absolute z-20 max-w-[42vw] text-ivory md:max-w-[220px] ${c.pos} ${c.align}`}>
            <p className="text-lg leading-tight font-black tracking-tight md:text-2xl">{c.k}</p>
            <p className="mt-1 text-xs text-ivory/65 md:text-sm">{c.v}</p>
          </div>
        ))}

        {CAPS.map((c, i) => (
          <div key={c.n} data-cap className={`absolute bottom-[5svh] left-[var(--gutter)] z-20 max-w-[min(86vw,420px)] md:bottom-[9svh] ${i >= 2 ? "text-ivory" : "text-ink"} ${i === 3 ? "md:bottom-auto md:top-[calc(var(--header-h)+5svh)] max-md:hidden" : ""}`}>
            <p className="eyebrow mb-3 flex items-center gap-3">
              <span className={i === 2 ? "text-ink" : "text-pink"}>{c.n}</span> {c.t}
            </p>
            <p className="display text-[13vw] md:text-[4.1vw]">
              {c.h[0]}
              <br />
              <span className="display-italic">{c.h[1]}</span>
            </p>
            {c.p && <p className={`mt-3 max-w-[34ch] text-[15px] md:text-[17px] ${i >= 2 ? "text-ivory/90" : "text-grey"}`}>{c.p}</p>}
          </div>
        ))}

        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-30 h-[3px]">
          <div data-progress className="h-full origin-left scale-x-0 bg-pink" />
        </div>
        <p className="eyebrow absolute right-[var(--gutter)] bottom-[5svh] z-20 hidden text-grey mix-blend-difference md:block" aria-hidden="true">
          Scroll to open
        </p>
      </div>

      {/* ---------- Reduced-motion: the same story as four still panels ---------- */}
      <div className="hidden motion-reduce:block">
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col items-center gap-8 bg-ivory px-8 py-20">
            <Sachet className="w-[min(60vw,260px)]" />
            <Still c={CAPS[0]} />
          </div>
          <div className="flex flex-col items-center gap-8 bg-bone px-8 py-20">
            <Sachet side="back" className="w-[min(60vw,260px)]" label="Back of the sachet with the three steps and the formula" />
            <Still c={CAPS[1]} />
          </div>
          <div className="flex flex-col items-center gap-8 bg-pink px-8 py-20 text-ivory">
            <div className="relative w-[min(60vw,260px)] pt-[30%]">
              <Strip className="absolute top-0 left-1/2 w-[44%] -translate-x-1/2" />
              <Sachet open className="relative w-full" />
            </div>
            <Still c={CAPS[2]} />
          </div>
          <div className="flex flex-col items-center gap-8 bg-ink px-8 py-20 text-ivory">
            <Strip className="w-[min(34vw,150px)]" />
            <Still c={CAPS[3]} />
            <ul className="grid grid-cols-2 gap-5 text-left">
              {CALLOUTS.map((c) => (
                <li key={c.k}>
                  <p className="font-black">{c.k}</p>
                  <p className="text-sm text-ivory/65">{c.v}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Still({ c }: { c: (typeof CAPS)[number] }) {
  return (
    <div className="max-w-sm text-center">
      <p className="eyebrow mb-2">
        {c.n} — {c.t}
      </p>
      <p className="display text-5xl">
        {c.h[0]} <span className="display-italic">{c.h[1]}</span>
      </p>
      {c.p && <p className="mt-3 opacity-80">{c.p}</p>}
    </div>
  );
}
