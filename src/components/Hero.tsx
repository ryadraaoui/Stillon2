"use client";
import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { Sachet } from "./Sachet";
import hero from "@/assets/campaign-tongue.webp";

/** Priority 1. The founder's approved "THE DAY ISN'T DONE." portrait (REF-08), with live type and the live sachet. */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  // layout effect: GSAP must restore the DOM (pin spacers) before React removes it on navigation
  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from("[data-h-img]", { clipPath: "inset(100% 0 0 0)", scale: 1.12, duration: 1.6 }, 0)
        .from("[data-h-line] > span", { yPercent: 108, duration: 1.2, stagger: 0.09 }, 0.15)
        .from("[data-h-fade]", { opacity: 0, y: 18, duration: 0.9, stagger: 0.08 }, 0.7)
        .from("[data-h-sachet]", { y: -80, opacity: 0, rotate: -30, duration: 1.4 }, 0.55);
      // scroll parallax
      gsap.to("[data-h-img]", { yPercent: 9, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-h-sachet-wrap]", { yPercent: -60, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      // pointer parallax on the sachet
      const s = el.querySelector<HTMLElement>("[data-sachet-3d]");
      const rx = gsap.quickTo(s, "rotationX", { duration: 0.8, ease: "power3" });
      const ry = gsap.quickTo(s, "rotationY", { duration: 0.8, ease: "power3" });
      const move = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        ry((e.clientX / window.innerWidth - 0.5) * 34);
        rx(-(e.clientY / window.innerHeight - 0.5) * 22);
      };
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    }, el);
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-[#f5f0ea] pt-[var(--header-h)]">
      <div className="absolute inset-x-0 top-[var(--header-h)] h-[62svh] md:inset-y-0 md:top-0 md:right-0 md:left-auto md:h-full md:w-[60%]">
        <Image
          data-h-img
          src={hero}
          alt="Close portrait, direct flash: a woman with slicked-back hair looks into the camera, a small white Still ON. strip on her tongue, one pink nail at her chin."
          priority
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover object-[50%_18%] md:object-[40%_30%]"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#f5f0ea] to-transparent md:inset-y-0 md:right-auto md:left-0 md:h-full md:w-1/4 md:bg-gradient-to-r" />
      </div>

      <div data-h-sachet-wrap className="pointer-events-none absolute top-[calc(var(--header-h)+27svh)] right-[5vw] z-20 w-[22vw] max-w-[130px] md:top-[52%] md:right-auto md:left-[41.5%] md:w-[11.5vw] md:max-w-[200px]">
        <div data-h-sachet>
          <Sachet className="float w-full" style={{ "--r": "-9deg" } as React.CSSProperties} />
        </div>
      </div>

      <div className="wrap relative z-10 pb-8 md:pb-12">
        <p data-h-fade className="eyebrow mb-4 flex items-center gap-3 md:mb-6">
          <span className="inline-block h-2 w-2 rounded-full bg-pink" />
          N°01 — Caffeine + L-theanine energy strip
        </p>
        <h1 className="display display-italic text-[19.5vw] md:text-[12.6vw]">
          <span data-h-line className="-mb-[0.08em] block overflow-hidden pr-[0.1em] pb-[0.08em]"><span className="block">The day</span></span>
          <span data-h-line className="-mb-[0.08em] block overflow-hidden pr-[0.1em] pb-[0.08em]"><span className="block">isn’t</span></span>
          <span data-h-line className="-mb-[0.08em] block overflow-hidden pr-[0.1em] pb-[0.08em]">
            <span className="block">
              done<span className="text-pink">.</span>
            </span>
          </span>
        </h1>
        <div className="mt-6 flex flex-col gap-5 md:mt-9 md:flex-row md:items-center md:gap-10">
          <p data-h-fade className="max-w-[30ch] text-[17px] leading-snug font-medium md:text-lg">
            One small white strip. On your tongue. <strong className="font-black">ON.</strong> No can, no cup, no water.
          </p>
          <div data-h-fade className="flex flex-wrap gap-3">
            <Link href="/products/energy-strips" className="btn btn-ink">
              Get the strips
            </Link>
            <Link href="/#reveal" className="btn btn-line">
              Open one ↓
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
