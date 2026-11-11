"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/site";
import { Logo } from "./Brand";
import { useCart } from "./Cart";
import { getLenis } from "./SmoothScroll";

export function Header() {
  const { commerce, qty, open } = useCart();
  const [menu, setMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // hide on scroll down, show on scroll up
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setHidden(y > 120 && y > last);
      last = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu after navigation
  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    if (!menu) return;
    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
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
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      getLenis()?.start();
    };
  }, [menu]);

  const action =
    commerce.mode === "live" ? (
      <button type="button" onClick={open} className="eyebrow flex h-11 items-center gap-2 rounded-full px-4 ring-[1.5px] ring-ink transition-colors hover:bg-ink hover:text-ivory" aria-label={`Open cart, ${qty} item${qty === 1 ? "" : "s"}`}>
        Cart
        <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] tabular-nums ${qty ? "bg-pink text-white" : "bg-ink/10"}`} data-testid="cart-count">
          {qty}
        </span>
      </button>
    ) : (
      <Link href="/#list" className="eyebrow flex h-11 items-center rounded-full bg-ink px-5 text-ivory transition-colors hover:bg-pink">
        Launch list
      </Link>
    );

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-ivory">
        Skip to content
      </a>
      <header className={`fixed inset-x-0 top-0 z-[70] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${hidden && !menu ? "-translate-y-full" : ""}`}>
        <div className="wrap flex h-[var(--header-h)] items-center justify-between bg-ivory/90 backdrop-blur-md">
          <Link href="/" aria-label="Still ON. — home" className="relative z-10 block">
            <Logo priority className="h-[22px] w-auto md:h-[26px]" />
          </Link>
          <nav aria-label="Primary" className="absolute inset-x-0 hidden justify-center gap-8 lg:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="eyebrow link-u py-2">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="relative z-10 flex items-center gap-2">
            {action}
            <button
              ref={toggle}
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full lg:hidden"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Close menu" : "Open menu"}
              onClick={() => setMenu((m) => !m)}
            >
              <span className="relative block h-3 w-6">
                <span className={`absolute left-0 h-[2.5px] w-full bg-ink transition-transform duration-300 ${menu ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-[2.5px] w-full transition-transform duration-300 ${menu ? "top-1/2 -translate-y-1/2 -rotate-45 bg-ink" : "bottom-0 bg-pink"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>
      <div
        id="mobile-menu"
        ref={overlay}
        inert={!menu}
        className={`fixed inset-0 z-[60] flex flex-col bg-ivory px-[var(--gutter)] pt-[calc(var(--header-h)+24px)] pb-8 transition-[clip-path] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${menu ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"}`}
      >
        <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center gap-1">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenu(false)}
              className={`display display-italic block text-[13vw] leading-[0.95] transition-[transform,opacity,color] duration-700 hover:text-pink sm:text-7xl ${menu ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
              style={{ transitionDelay: menu ? `${120 + i * 60}ms` : "0ms" }}
            >
              {n.label}
              {i === 0 && <span className="text-pink">.</span>}
            </Link>
          ))}
        </nav>
        <p className="eyebrow text-grey">Caffeine + L-theanine energy strip · Montréal</p>
      </div>
    </>
  );
}
