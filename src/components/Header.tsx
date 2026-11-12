"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EARLY_ACCESS, NAV } from "@/lib/site";
import { Logo } from "./Brand";
import { useCart } from "./Cart";
import { useBag } from "./Bag";
import { getLenis } from "./SmoothScroll";

type Tone = "light" | "dark";
const TOP = 60; // always visible this close to the top
const HIDE_AFTER = 100; // never hide before this
const INTENT = 10; // accumulated px in one direction before reacting

/**
 * Floating frosted navigation.
 * desktop — Shop · Our story | wordmark (true viewport centre) | FAQ · Get early access
 * mobile  — menu | wordmark | early access, with a frosted panel that drops from under the capsule
 *
 * Auto-hide: slides away on deliberate downward scroll, returns on deliberate upward scroll, always present
 * near the top, and never hides while the menu is open, the pointer is on it or keyboard focus is inside it.
 * Scroll work is one passive listener + requestAnimationFrame writing data-attributes directly: no React
 * re-render per frame, no layout shift (transform only).
 * Tone: each zone reads what is underneath it (data-nav-tone="dark" on dark/pink page elements) and sets its ink.
 */
export function Header() {
  const { commerce, qty, open } = useCart();
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const shell = useRef<HTMLElement>(null);
  const capsule = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const menuOpen = useRef(false);
  const live = commerce.mode === "live";
  const bag = useBag();
  const bagOn = commerce.mode === "shopify" && bag.count > 0;
  const CTA = commerce.mode === "shopify" ? "Get yours" : "Get early access";

  useEffect(() => {
    const el = shell.current!;
    const cap = capsule.current!;
    const zones = [...cap.querySelectorAll<HTMLElement>("[data-zone]")];
    let lastY = Math.max(0, window.scrollY);
    let acc = 0;
    let frame = 0;
    let hover = false;

    const setHidden = (h: boolean) => {
      if (el.dataset.hidden !== String(h)) el.dataset.hidden = String(h);
    };
    const pinned = () => menuOpen.current || hover || el.contains(document.activeElement);

    // What is under each zone? First element in the hit stack that declares a tone wins; default is light.
    const readTone = () => {
      const r = cap.getBoundingClientRect();
      const y = Math.max(4, r.top + r.height / 2);
      if (r.bottom < 0) return; // hidden: nothing to do
      let dark = 0;
      zones.forEach((z) => {
        const zr = z.getBoundingClientRect();
        const x = Math.min(window.innerWidth - 2, Math.max(2, zr.left + zr.width / 2));
        let tone: Tone = "light";
        for (const n of document.elementsFromPoint(x, y)) {
          if (el.contains(n) || n.closest("#mobile-menu, [data-nav-ui]")) continue;
          const t = n.getAttribute("data-nav-tone");
          if (t) {
            tone = t as Tone;
            break;
          }
          if (n.tagName === "SECTION" || n.tagName === "MAIN" || n.tagName === "FOOTER") break;
        }
        if (tone === "dark") dark++;
        if (z.dataset.tone !== tone) z.dataset.tone = tone;
      });
      const overall: Tone = menuOpen.current || dark >= 2 ? "dark" : "light";
      if (cap.dataset.tone !== overall) cap.dataset.tone = overall;
    };

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = Math.min(Math.max(0, window.scrollY), Math.max(0, max)); // ignore overscroll bounce
      const d = y - lastY;
      lastY = y;
      if (y <= TOP || pinned()) {
        acc = 0;
        setHidden(false);
      } else if (d !== 0) {
        acc = Math.sign(d) === Math.sign(acc) ? acc + d : d; // direction change restarts the count
        if (acc > INTENT && y > HIDE_AFTER) setHidden(true);
        else if (acc < -INTENT) setHidden(false);
      }
      readTone();
    };
    let after = 0;
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
      // scroll-scrubbed scenes keep changing colour briefly after scrolling stops: read the tone again then
      clearTimeout(after);
      after = window.setTimeout(() => {
        readTone();
        after = window.setTimeout(readTone, 700);
      }, 260);
    };
    const show = () => {
      acc = 0;
      setHidden(false);
      readTone();
    };
    const enter = () => {
      hover = true;
    };
    const leave = () => {
      hover = false;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    el.addEventListener("focusin", show); // tabbing into a hidden nav brings it back
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    update();
    const settle = [300, 1200, 2400].map((t) => window.setTimeout(readTone, t)); // after images, entrance and pin set-up
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(after);
      settle.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      el.removeEventListener("focusin", show);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [pathname]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu after navigation
  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    menuOpen.current = menu;
    if (capsule.current && menu) capsule.current.dataset.tone = "dark";
    capsule.current?.querySelectorAll<HTMLElement>("[data-zone]").forEach((z) => menu && (z.dataset.tone = "dark"));
    if (!menu) {
      window.dispatchEvent(new Event("scroll")); // re-read the tone under the nav
      return;
    }
    if (shell.current) shell.current.dataset.hidden = "false";
    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    const focusT = setTimeout(() => panel.current?.querySelector<HTMLElement>("a")?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        toggle.current?.focus();
      }
      if (e.key === "Tab" && panel.current) {
        const f = [toggle.current!, ...panel.current.querySelectorAll<HTMLElement>("a[href], button")];
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focusT);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      getLenis()?.start();
    };
  }, [menu]);

  const [left, right] = [NAV.slice(0, 2), NAV.slice(2)];
  const link = (n: (typeof NAV)[number]) => (
    <Link key={n.href} href={n.href} className="nav-link" aria-current={pathname === n.href ? "page" : undefined}>
      {n.label}
    </Link>
  );

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-ivory">
        Skip to content
      </a>
      <header ref={shell} className="nav-shell" data-hidden="false" data-testid="nav-shell">
        <div ref={capsule} className="nav-capsule grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-2 lg:px-8" data-tone="light" data-testid="nav-capsule">
          <div data-zone className="nav-zone flex items-center justify-self-start">
            <nav aria-label="Primary" className="hidden items-center gap-10 lg:flex">
              {left.map(link)}
            </nav>
            <button ref={toggle} type="button" className="grid h-11 w-11 place-items-center rounded-full lg:hidden" aria-expanded={menu} aria-controls="mobile-menu" aria-label={menu ? "Close menu" : "Open menu"} onClick={() => setMenu((m) => !m)}>
              <span className="relative block h-[10px] w-[22px]" aria-hidden="true">
                <span className={`absolute left-0 h-[1.5px] w-full bg-current transition-transform duration-300 motion-reduce:transition-none ${menu ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-[1.5px] w-full bg-current transition-transform duration-300 motion-reduce:transition-none ${menu ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"}`} />
              </span>
            </button>
          </div>
          {/* equal flexible columns either side keep the wordmark on the viewport's centre line */}
          <div data-zone className="nav-zone justify-self-center">
            <Link href="/" aria-label="Still ON. — home" className="nav-logo transition-opacity duration-200 hover:opacity-80">
              <Logo priority decorative className="h-[19px] w-auto min-[380px]:h-[21px] lg:h-[27px]" />
              <Logo light priority decorative className="h-[19px] w-auto min-[380px]:h-[21px] lg:h-[27px]" />
            </Link>
          </div>
          <div data-zone className="nav-zone flex items-center gap-8 justify-self-end">
            <nav aria-label="Secondary" className="hidden items-center gap-10 lg:flex">
              {right.map(link)}
            </nav>
            {live ? (
              <button type="button" onClick={open} className="nav-link gap-2 max-lg:px-3" aria-label={`Open cart, ${qty} item${qty === 1 ? "" : "s"}`}>
                Cart
                <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] tracking-normal tabular-nums ${qty ? "bg-pink text-white" : "bg-current/15"}`} data-testid="cart-count">
                  <span className={qty ? "" : "text-inherit"}>{qty}</span>
                </span>
              </button>
            ) : bagOn ? (
              <button type="button" onClick={bag.open} className="nav-cta gap-2" aria-label={`Open bag, ${bag.count} item${bag.count === 1 ? "" : "s"}`} data-testid="bag-button">
                Bag
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-pink px-1 text-[10px] tracking-normal text-white tabular-nums">{bag.count}</span>
              </button>
            ) : (
              <Link href={EARLY_ACCESS} className="nav-cta">
                <span className="max-lg:hidden">{CTA}</span>
                <span className="max-[379px]:hidden lg:hidden" aria-hidden="true">
                  {commerce.mode === "shopify" ? "Get yours" : "Early access"}
                </span>
                <span className="hidden max-[379px]:inline" aria-hidden="true">
                  {commerce.mode === "shopify" ? "Shop" : "Access"}
                </span>
                <span className="sr-only lg:hidden">{CTA}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="nav-scrim lg:hidden" data-nav-ui data-open={menu} onClick={() => setMenu(false)} aria-hidden="true" />
      <div id="mobile-menu" ref={panel} inert={!menu} data-open={menu} className="nav-panel lg:hidden">
        <nav aria-label="Mobile" className="flex flex-col">
          {NAV.map((n, i) => (
            <Link key={n.href} href={n.href} onClick={() => setMenu(false)} aria-current={pathname === n.href ? "page" : undefined} className="display display-italic flex min-h-[60px] items-center border-b border-white/12 text-[40px] leading-none transition-colors duration-200 hover:text-pink">
              {n.label}
              {i === 0 && <span className="text-pink">.</span>}
            </Link>
          ))}
        </nav>
        {!live && (
          <Link href={EARLY_ACCESS} onClick={() => setMenu(false)} className="btn btn-ivory mt-5 w-full">
            {CTA}
          </Link>
        )}
      </div>
    </>
  );
}
