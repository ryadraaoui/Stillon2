"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ROWS = [
  ["The day isn’t done", "La journée n’est pas finie", "The day isn’t done", "La journée n’est pas finie"],
  ["Not made to stop", "Ouvre. Dépose. On.", "Not made to stop", "Open. Strip. On."],
];

/** Experience 02. Two oversized lines sliding in opposite directions, driven by scroll. Fast, short, no pin. */
export function Ticker() {
  const root = useRef<HTMLElement>(null);
  // layout effect: GSAP must restore the DOM before React removes it on navigation
  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.querySelectorAll<HTMLElement>("[data-row]").forEach((row, i) => {
        gsap.fromTo(row, { xPercent: i ? -22 : 0 }, { xPercent: i ? 0 : -22, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.5 } });
      });
    }, el);
    return () => mm.revert();
  }, []);
  return (
    <section ref={root} aria-label="The day isn't done. Not made to stop." className="overflow-hidden bg-ivory py-10 md:py-16">
      {ROWS.map((row, i) => (
        <div key={i} data-row aria-hidden="true" className={`display flex w-max items-center whitespace-nowrap text-[15vw] leading-[0.95] md:text-[9.5vw] ${i ? "display-italic text-transparent [-webkit-text-stroke:1.5px_#111]" : ""}`}>
          {row.map((t, n) => (
            <span key={n} className="flex items-center">
              <span className="px-[0.3em]">{t}</span>
              <span className="inline-block h-[0.2em] w-[0.2em] rounded-full bg-pink" />
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}
