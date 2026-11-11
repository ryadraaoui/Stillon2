"use client";
import { useLayoutEffect, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CtaText } from "./Cart";
import { EARLY_ACCESS } from "@/lib/site";
import { Logo } from "./Brand";
import { Sachet } from "./Sachet";
import cyclist from "@/assets/bw-cyclist.webp";
import boxer from "@/assets/bw-boxer.webp";
import runner from "@/assets/bw-runner.webp";

gsap.registerPlugin(ScrollTrigger);
const H = "h-[66svh] md:h-[76svh]";

function Photo({ src, alt, n, label, wide = false }: { src: StaticImageData; alt: string; n: string; label: string; wide?: boolean }) {
  return (
    <figure data-nav-tone="dark" className={`relative ${H} overflow-hidden bg-bone`} style={{ aspectRatio: wide ? "1 / 1.02" : `${src.width} / ${src.height}` }}>
      {/* the image is wider than its frame so it can drift as the reel moves */}
      <div data-drift className="absolute inset-y-0 -left-[9%] w-[118%]">
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 90vw, 60vw" className="object-cover" />
      </div>
      <figcaption className="eyebrow absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 backdrop-blur">
        <span className="text-pinkdeep">{n}</span> {label}
      </figcaption>
    </figure>
  );
}

/**
 * Experience 05. The campaign as a horizontal reel: oversized type, three athletes, two posters.
 * Desktop: vertical scroll drives the reel while the section is pinned; images drift inside their frames and
 * the headline travels at its own speed. Touch and reduced motion: a native swipeable, snapping row. Nothing is trapped.
 */
export function Campaign() {
  const root = useRef<HTMLElement>(null);
  // layout effect: GSAP must restore the DOM (pin spacer) before React removes it on navigation
  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const track = el.querySelector<HTMLElement>("[data-track]")!;
      track.classList.add("is-pinned");
      const dist = () => track.scrollWidth - window.innerWidth;
      const reel = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      el.querySelectorAll<HTMLElement>("[data-drift]").forEach((d) => {
        gsap.fromTo(d, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: d.parentElement, containerAnimation: reel, start: "left right", end: "right left", scrub: true } });
      });
      gsap.to(el.querySelector("[data-title]"), { xPercent: 14, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${dist() * 0.4}`, scrub: 0.6 } });
      gsap.fromTo(el.querySelectorAll("[data-poster-type]"), { xPercent: 10 }, { xPercent: -10, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${dist()}`, scrub: 0.6 } });
      gsap.to(el.querySelector("[data-reel-bar]"), { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${dist()}`, scrub: true } });
      return () => {
        track.classList.remove("is-pinned");
        gsap.set(track, { clearProps: "transform" });
      };
    }, el);
    return () => mm.revert();
  }, []);

  return (
    <section id="campaign" ref={root} aria-label="Campaign: not made to stop" className="relative overflow-hidden bg-ivory py-20 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:py-0 lg:pt-[var(--header-h)]">
      <div data-track className="hscroll items-center gap-4 px-[var(--gutter)] md:gap-6" tabIndex={0} role="group" aria-label="Campaign images. Swipe or scroll sideways.">
        <div className={`flex ${H} w-[86vw] flex-col justify-between md:w-[50vw]`}>
          <p className="eyebrow text-grey">Campaign 01</p>
          <h2 data-title className="display display-italic text-[16.5vw] whitespace-nowrap md:text-[10.5vw]">
            Not made
            <br />
            to stop<span className="text-pink">.</span>
          </h2>
          <p className="eyebrow flex items-center gap-3 text-grey">
            <span className="lg:hidden">Swipe</span>
            <span className="max-lg:hidden">Keep scrolling</span>
            <span className="inline-block h-px w-16 bg-ink" />
          </p>
        </div>

        <Photo n="01" label="Cyclist" src={cyclist} alt="Black-and-white, direct flash: a cyclist in a silver helmet and dark wraparound glasses stares into the lens, jersey soaked." />

        <div className={`flex ${H} aspect-[4/5] flex-col justify-between bg-white p-6 md:p-10`}>
          <p data-poster-type className="display text-[10.5vw] md:text-[5vw]">
            Small strip.
            <br />
            <span className="display-italic">Big attitude</span>
            <span className="text-pink">.</span>
          </p>
          <Sachet className="w-[36%] rotate-[9deg] self-center drop-shadow-[16px_24px_16px_rgba(0,0,0,0.2)]" />
          <Logo decorative className="h-6 w-auto self-start" />
        </div>

        <Photo n="02" label="Boxer" src={boxer} alt="Black-and-white, direct flash: a boxer sits forward between rounds, hands wrapped, one pink band at the wrist, a white strip held between two fingers." />

        <div className={`flex ${H} aspect-[4/5] flex-col justify-end overflow-hidden bg-pink p-6 text-white md:p-10`} data-nav-tone="dark">
          <p data-poster-type className="display display-italic text-[13.5vw] leading-[0.82] md:text-[6.6vw]">
            La journée
            <br />
            n’est pas
            <br />
            finie.
          </p>
          <p className="eyebrow mt-5 text-white/80">Printed inside every lid</p>
        </div>

        <Photo n="03" label="Runner" src={runner} alt="Black-and-white, direct flash: a sprinter runs straight at the camera, both feet off the ground, a blank pink bib on her top." />

        <div className={`flex ${H} w-[80vw] flex-col justify-center gap-8 md:w-[34vw] md:pl-8`}>
          <p className="max-w-[16ch] text-2xl leading-tight font-black md:text-4xl">Goes where you go. Fits in a pocket.</p>
          <Link href={EARLY_ACCESS} className="btn btn-ink self-start">
            <CtaText />
          </Link>
        </div>
      </div>
      <div aria-hidden="true" className="wrap mt-8 hidden lg:block">
        <div className="h-[2px] bg-ink/10">
          <div data-reel-bar className="h-full origin-left scale-x-0 bg-ink" />
        </div>
      </div>
    </section>
  );
}
