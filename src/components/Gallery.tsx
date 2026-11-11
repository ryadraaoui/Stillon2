"use client";
import { useLayoutEffect, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Censor, Logo } from "./Brand";
import { Sachet } from "./Sachet";
import cyclist from "@/assets/campaign-cyclist.webp";
import wet from "@/assets/campaign-wet.webp";
import shadesPoster from "@/assets/campaign-shades-poster.webp";
import boxer from "@/assets/gen-boxer.webp";
import runner from "@/assets/gen-runner.webp";
import tennis from "@/assets/gen-tennis.webp";

gsap.registerPlugin(ScrollTrigger);
const H = "h-[68svh] md:h-[74svh]";
function Photo({ src, alt, caption, n }: { src: StaticImageData; alt: string; caption: string; n: string }) {
  return (
    <figure className={`group relative ${H} overflow-hidden rounded-xl bg-bone`} style={{ aspectRatio: `${src.width} / ${src.height}` }}>
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 85vw, 50vw" className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]" />
      <figcaption className="eyebrow absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-ivory/90 px-3 py-2 backdrop-blur">
        <span className="text-pinktext">{n}</span> {caption}
      </figcaption>
    </figure>
  );
}

/** Priority 4. Editorial campaign gallery: a pinned horizontal reel on desktop, native swipe on touch / reduced motion. */
export function Gallery() {
  const root = useRef<HTMLElement>(null);
  // layout effect: GSAP must restore the DOM (pin spacers) before React removes it on navigation
  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const track = el.querySelector<HTMLElement>("[data-track]")!;
      track.classList.add("is-pinned");
      const dist = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      gsap.to(el.querySelector("[data-reel-bar]"), { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${dist()}`, scrub: true } });
      return () => {
        tween.kill();
        track.classList.remove("is-pinned");
        gsap.set(track, { clearProps: "transform" });
      };
    }, el);
    return () => mm.revert();
  }, []);

  return (
    <section id="campaign" ref={root} aria-label="Campaign gallery" className="relative overflow-hidden bg-ivory py-20 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:py-0 lg:pt-[var(--header-h)]">
      <div data-track className="hscroll items-center gap-4 px-[var(--gutter)] md:gap-6" tabIndex={0} role="group" aria-label="Campaign images, scroll horizontally">
        <div className={`flex ${H} w-[84vw] flex-col justify-between md:w-[44vw]`}>
          <p className="eyebrow text-grey">Campaign 01 · Direct flash, real skin</p>
          <div>
            <h2 className="display display-italic text-[17vw] md:text-[8.8vw]">
              Not
              <br />
              made
              <br />
              to stop<span className="text-pink">.</span>
            </h2>
            <p className="mt-6 max-w-[34ch] text-[17px] text-grey">Sweat, freckles, pores. No golden hour, no motivational quotes. One pink thing per frame.</p>
          </div>
          <p className="eyebrow hidden items-center gap-3 lg:flex">
            Keep scrolling <span className="inline-block h-px w-16 bg-ink" />
          </p>
        </div>

        <Photo n="01" src={cyclist} caption="Head-on" alt="A cyclist in a silver helmet and dark wraparound glasses stares straight into the flash, white jersey soaked, skin wet." />

        <div className={`flex ${H} aspect-[4/5] flex-col justify-between rounded-xl bg-bone p-6 md:p-10`}>
          <span className="eyebrow text-grey">Poster 02</span>
          <p className="display text-[19vw] leading-[0.8] md:text-[9.5vw]">
            Tired?
            <br />
            <span className="text-pink">Cute.</span>
          </p>
          <Logo decorative className="h-6 w-auto self-start" />
        </div>

        <Photo n="03" src={wet} caption="Still on" alt="A woman with wet dark hair and a white tank top looks into the camera, skin glistening under hard flash." />

        <Photo n="04" src={boxer} caption="Between rounds" alt="A boxer sits leaning toward the camera, hands in white wraps with one pink band, holding a small white strip between thumb and finger. Direct flash, ivory wall." />

        <div className={`relative flex ${H} aspect-[4/5] flex-col items-center justify-between overflow-hidden rounded-xl bg-white p-6 md:p-10`}>
          <p className="display self-start text-[11vw] md:text-[5.2vw]">
            Small strip.
            <br />
            Big plans<span className="text-pink">.</span>
          </p>
          <Sachet className="w-[38%] rotate-[9deg] drop-shadow-[18px_26px_18px_rgba(0,0,0,0.22)]" />
          <span className="eyebrow self-start text-grey">Actual sachet: 5 × 7 cm</span>
        </div>

        <figure className={`relative ${H} overflow-hidden rounded-xl`} style={{ aspectRatio: `${shadesPoster.width} / ${shadesPoster.height}` }}>
          <Image src={shadesPoster} alt="Campaign poster: “Not made to stop.” A freckled woman in pink-tinted glasses places a strip on her tongue. Still ON. logo." fill sizes="(max-width: 768px) 85vw, 50vw" className="object-cover" />
        </figure>

        <Photo n="05" src={runner} caption="Mid-stride" alt="A sprinter in black runs straight at the camera, both feet off the ground, a blank pink bib on her top. Direct flash, ivory studio." />

        <Photo n="06" src={tennis} caption="Serve" alt="A tennis player in white reaches up mid-serve, racket back, pink grip on the handle. Direct flash, ivory wall." />

        <div className={`flex ${H} w-[84vw] flex-col justify-center gap-8 md:w-[40vw] md:pl-10`}>
          <p className="display text-[15vw] md:text-[7vw]">
            <Censor /> the
            <br />
            crash<span className="text-pink">.</span>
          </p>
          <Link href="/products/energy-strips" className="btn btn-ink self-start">
            Get the strips
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
