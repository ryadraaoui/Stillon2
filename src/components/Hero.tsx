"use client";
import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { CTA, EARLY_ACCESS } from "@/lib/site";
import { Sachet } from "./Sachet";
import hero from "@/assets/bw-hero.webp";

/** Section 01. One campaign photograph, the line, the product, the CTA. Entrance runs under 1.5 s and never blocks input. */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  // layout effect: GSAP must restore the DOM before React removes it on navigation
  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The photo itself is painted immediately (good LCP); a curtain slides off it.
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to("[data-h-curtain]", { yPercent: -101, duration: 1.1, ease: "expo.inOut" }, 0)
        .from("[data-h-img]", { scale: 1.08, duration: 1.6 }, 0)
        .from("[data-h-line] > span", { yPercent: 108, duration: 1, stagger: 0.08 }, 0.35)
        .from("[data-h-sub]", { opacity: 0, y: 14, duration: 0.7 }, 0.85)
        .from("[data-h-cta]", { opacity: 0, y: 14, duration: 0.7 }, 1)
        .from("[data-h-sachet]", { y: -50, opacity: 0, rotate: -24, duration: 1.1 }, 0.7);
      gsap.to("[data-h-img]", { yPercent: 7, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      const s = el.querySelector<HTMLElement>("[data-sachet-3d]");
      const rx = gsap.quickTo(s, "rotationX", { duration: 0.8, ease: "power3" });
      const ry = gsap.quickTo(s, "rotationY", { duration: 0.8, ease: "power3" });
      const move = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        ry((e.clientX / window.innerWidth - 0.5) * 30);
        rx(-(e.clientY / window.innerHeight - 0.5) * 20);
      };
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    }, el);
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-[#fcfcfc] pt-[var(--header-h)]">
      <div className="absolute inset-x-0 top-[var(--header-h)] h-[58svh] overflow-hidden md:inset-y-0 md:top-0 md:right-0 md:left-auto md:h-full md:w-[58%]">
        <Image
          data-h-img
          src={hero}
          alt="Black-and-white close portrait, direct flash: a woman looks into the camera with a small white Still ON. strip on her tongue. One fingernail is hot pink."
          priority
          fetchPriority="high"
          fill
          sizes="(max-width: 768px) 100vw, 58vw"
          className="object-cover object-[50%_16%] md:object-[42%_30%]"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#fcfcfc] to-transparent md:inset-y-0 md:right-auto md:left-0 md:h-full md:w-1/4 md:bg-gradient-to-r" />
        <div data-h-curtain aria-hidden="true" className="absolute inset-0 bg-[#fcfcfc] motion-reduce:hidden" />
      </div>

      <div className="pointer-events-none absolute top-[calc(var(--header-h)+25svh)] right-[5vw] z-20 w-[21vw] max-w-[120px] md:top-[50%] md:right-auto md:left-[42%] md:w-[11vw] md:max-w-[190px]">
        <div data-h-sachet>
          <Sachet className="float w-full" style={{ "--r": "-9deg" } as React.CSSProperties} />
        </div>
      </div>

      <div className="wrap relative z-10 pb-8 md:pb-12">
        <h1 className="display display-italic text-[19vw] md:text-[12.4vw]">
          {["The day", "isn’t"].map((t) => (
            <span key={t} data-h-line className="-mb-[0.08em] block overflow-hidden pr-[0.1em] pb-[0.08em]">
              <span className="block">{t}</span>
            </span>
          ))}
          <span data-h-line className="-mb-[0.08em] block overflow-hidden pr-[0.1em] pb-[0.08em]">
            <span className="block">
              done<span className="text-pink">.</span>
            </span>
          </span>
        </h1>
        <div className="mt-6 flex flex-col gap-5 md:mt-8 md:flex-row md:items-center md:gap-10">
          <p data-h-sub className="max-w-[26ch] text-[19px] leading-snug font-bold md:text-xl">
            Energy strips with caffeine + L‑theanine.
          </p>
          <div data-h-cta className="flex flex-wrap gap-3">
            <Link href={EARLY_ACCESS} className="btn btn-ink">
              {CTA}
            </Link>
            <Link href="/#strips" className="btn btn-line">
              Discover the strips
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
