"use client";
import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Scroll-linked word-by-word read-through for the manifesto. Static text when motion is reduced. */
export function ManifestoFx() {
  // layout effect: GSAP must restore the DOM (pin spacers) before React removes it on navigation
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const box = document.querySelector("[data-manifesto]");
      if (!box) return;
      gsap.fromTo(box.querySelectorAll("[data-w]"), { opacity: 0.12 }, { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: box, start: "top 78%", end: "bottom 45%", scrub: 0.4 } });
    });
    return () => mm.revert();
  }, []);
  return null;
}
