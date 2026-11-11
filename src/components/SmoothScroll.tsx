"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/** Lenis smooth scrolling driven by the GSAP ticker. Fully disabled when the visitor prefers reduced motion. */
export function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ lerp: 0.11, anchors: { offset: -96 } });
    lenis = l;
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis = null;
    };
  }, []);
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) lenis?.scrollTo(0, { immediate: true });
    // Pinned sections add scroll length after mount, so re-measure, then land on the anchor for real.
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
      if (!hash) return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      if (lenis) lenis.scrollTo(target, { immediate: true, offset: -96, force: true });
      else target.scrollIntoView();
    }, 350);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}
