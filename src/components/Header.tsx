"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CTA, EARLY_ACCESS, NAV } from "@/lib/site";
import { Logo } from "./Brand";
import { useCart } from "./Cart";
import { getLenis } from "./SmoothScroll";

/**
 * Floating navigation capsule. One fixed, frosted, pill-shaped bar:
 * desktop  — Shop · Our story | wordmark (true viewport centre) | FAQ · Get early access
 * mobile   — menu | wordmark | early access
 * The material lives in globals.css (.nav-capsule / .nav-fade). It never hides and never changes size,
 * so there is no layout shift; on scroll it only gains a little opacity for legibility.
 * The cart appears only when purchases are actually enabled.
 */
export function Header() {
  const { commerce, qty, open } = useCart();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const live = commerce.mode === "live";

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu after navigation
  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    if (!menu) return;
    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    const focusT = setTimeout(() => overlay.current?.querySelector<HTMLElement>("a")?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        toggle.current?.focus();
      }
      if (e.key === "Tab" && overlay.current) {
        const f = [toggle.current!, ...overlay.current.querySelectorAll<HTMLElement>("a[href], button")];
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
  const cart = live && (
    <button type="button" onClick={open} className="nav-link gap-2" aria-label={`Open cart, ${qty} item${qty === 1 ? "" : "s"}`}>
      Cart
      <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] tracking-normal tabular-nums ${qty ? "bg-pink text-white" : "bg-white/15"}`} data-testid="cart-count">
        {qty}
      </span>
    </button>
  );

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-ivory">
        Skip to content
      </a>
      <div className="nav-fade" aria-hidden="true" />
      <header className="fixed inset-x-[var(--nav-inset)] top-[var(--nav-top)] z-[70]">
        <div className="nav-capsule grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-2 lg:px-9" data-scrolled={scrolled || menu} data-testid="nav-capsule">
          {/* left */}
          <div className="flex items-center justify-self-start">
            <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
              {left.map(link)}
            </nav>
            <button
              ref={toggle}
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full transition-colors duration-200 hover:bg-white/10 lg:hidden"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Close menu" : "Open menu"}
              onClick={() => setMenu((m) => !m)}
            >
              <span className="relative block h-[11px] w-[22px]" aria-hidden="true">
                <span className={`absolute left-0 h-[1.5px] w-full bg-ivory transition-transform duration-300 ${menu ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-[1.5px] w-full transition-transform duration-300 ${menu ? "top-1/2 -translate-y-1/2 -rotate-45 bg-ivory" : "bottom-0 bg-pink"}`} />
              </span>
            </button>
          </div>
          {/* centre: equal 1fr columns either side keep the wordmark on the viewport's centre line */}
          <Link href="/" aria-label="Still ON. — home" className="flex h-11 items-center justify-self-center px-2 transition-opacity duration-200 hover:opacity-85 lg:px-3">
            <Logo light priority className="h-[19px] w-auto min-[380px]:h-[21px] lg:h-[29px]" />
          </Link>
          {/* right */}
          <div className="flex items-center gap-7 justify-self-end">
            <nav aria-label="Secondary" className="hidden items-center gap-9 lg:flex">
              {right.map(link)}
            </nav>
            {cart}
            {!live && (
              <Link href={EARLY_ACCESS} className="nav-cta">
                <span className="max-lg:hidden">{CTA}</span>
                <span className="max-[379px]:hidden lg:hidden" aria-hidden="true">
                  Early access
                </span>
                <span className="hidden max-[379px]:inline" aria-hidden="true">
                  Access
                </span>
                <span className="sr-only lg:hidden">{CTA}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={overlay}
        inert={!menu}
        className={`fixed inset-0 z-[60] flex flex-col bg-ink/[0.86] px-[calc(var(--nav-inset)+12px)] pt-[calc(var(--header-h)+28px)] pb-8 text-ivory backdrop-blur-2xl backdrop-saturate-150 transition-[opacity,visibility] duration-300 lg:hidden ${menu ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center gap-1">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenu(false)}
              aria-current={pathname === n.href ? "page" : undefined}
              className={`display display-italic block py-1 text-[15vw] leading-[0.98] transition-[transform,opacity,color] duration-500 hover:text-pink motion-reduce:transition-none sm:text-7xl ${menu ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: menu ? `${80 + i * 55}ms` : "0ms" }}
            >
              {n.label}
              {i === 0 && <span className="text-pink">.</span>}
            </Link>
          ))}
        </nav>
        {!live && (
          <Link href={EARLY_ACCESS} onClick={() => setMenu(false)} className="btn btn-ivory w-full">
            {CTA}
          </Link>
        )}
        <p className="mt-5 text-center text-[11px] font-semibold tracking-[0.14em] text-ivory/60 uppercase">Energy strips with caffeine + L‑theanine</p>
      </div>
    </>
  );
}
