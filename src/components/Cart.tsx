"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { Commerce } from "@/lib/commerce";
import { PRODUCT } from "@/lib/site";
import { getLenis } from "./SmoothScroll";
import boxImg from "@/assets/render-box-scale.webp";

type Ctx = {
  commerce: Commerce;
  qty: number;
  add: (n: number) => void;
  setQty: (n: number) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};
const CartCtx = createContext<Ctx | null>(null);
/** The primary call to action: "Get early access" in prelaunch, "Get yours" once Shopify checkout is on. */
export function CtaText() {
  const { commerce } = useCart();
  return <>{commerce.mode === "shopify" ? "Get yours" : "Get early access"}</>;
}
export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
};
const KEY = "stillon.cart.v1";
const MAX = 10;
const clamp = (n: number) => Math.max(0, Math.min(MAX, Math.round(n)));

export function CartProvider({ commerce, children }: { commerce: Commerce; children: React.ReactNode }) {
  const [qty, setQtyState] = useState(0);
  const [isOpen, setOpen] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const saved = Number(JSON.parse(localStorage.getItem(KEY) ?? "0"));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once, after mount
      if (Number.isFinite(saved) && commerce.mode === "live") setQtyState(clamp(saved));
    } catch {}
    loaded.current = true;
  }, [commerce.mode]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(qty));
    } catch {}
  }, [qty]);

  const value = useMemo<Ctx>(
    () => ({
      commerce,
      qty,
      add: (n) => {
        setQtyState((q) => clamp(q + n));
        setOpen(true);
      },
      setQty: (n) => setQtyState(clamp(n)),
      clear: () => setQtyState(0),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
    }),
    [commerce, qty, isOpen],
  );
  return (
    <CartCtx.Provider value={value}>
      {children}
      <CartDrawer />
    </CartCtx.Provider>
  );
}

export function QtyStepper({ value, onChange, min = 1, label = "Quantity" }: { value: number; onChange: (n: number) => void; min?: number; label?: string }) {
  const b = "grid h-11 w-11 place-items-center text-lg font-semibold transition-colors hover:bg-ink hover:text-ivory disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink";
  return (
    <div className="inline-flex items-center overflow-hidden rounded-full ring-[1.5px] ring-ink" role="group" aria-label={label}>
      <button type="button" className={b} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        −
      </button>
      <output className="w-9 text-center text-sm font-extrabold tabular-nums" aria-live="polite">
        {value}
      </output>
      <button type="button" className={b} onClick={() => onChange(value + 1)} disabled={value >= MAX} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}

function CartDrawer() {
  const { commerce, qty, setQty, isOpen, close } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Focus management, ESC, scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
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
      prev?.focus?.();
    };
  }, [isOpen, close]);

  const checkout = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity: qty }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "We could not start checkout. Nothing was charged.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not start checkout. Nothing was charged.");
      setBusy(false);
    }
  }, [qty]);

  const price = commerce.mode === "live" ? commerce.price : null;
  const subtotal = price ? new Intl.NumberFormat("en-CA", { style: "currency", currency: price.currency.toUpperCase() }).format((price.amount * qty) / 100) : null;

  return (
    <div className={`fixed inset-0 z-[90] ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen} inert={!isOpen}>
      <div className={`absolute inset-0 bg-ink/50 transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={close} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        data-lenis-prevent
        className={`absolute top-0 right-0 flex h-full w-full max-w-[440px] flex-col bg-ivory shadow-2xl transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-ink/15 px-6 py-5">
          <h2 className="display text-2xl">
            Cart <span className="text-pink">({qty})</span>
          </h2>
          <button type="button" data-autofocus onClick={close} className="eyebrow link-u" aria-label="Close cart">
            Close
          </button>
        </div>
        {qty === 0 || !price ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-6 px-6">
            <p className="display text-5xl">
              Nothing
              <br />
              here<span className="text-pink">.</span>
            </p>
            <p className="max-w-[28ch] text-grey">Your cart is empty.</p>
            <a href="/products/energy-strips" className="btn btn-ink" onClick={close}>
              See the strips
            </a>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex gap-4">
                <div className="relative h-28 w-24 flex-none overflow-hidden rounded-lg bg-bone">
                  <Image src={boxImg} alt="" fill sizes="96px" className="object-cover object-left" />
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-[15px] leading-tight font-extrabold uppercase">
                    {PRODUCT.nameFr} {PRODUCT.number}
                  </p>
                  <p className="mt-1 text-sm text-grey">
                    {PRODUCT.nameEn} · {PRODUCT.flavourEn} · {PRODUCT.count} strips
                  </p>
                  <p className="mt-1 text-sm font-bold tabular-nums">{price.formatted}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QtyStepper value={qty} onChange={setQty} min={1} label="Quantity in cart" />
                    <button type="button" className="eyebrow link-u text-grey" onClick={() => setQty(0)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-ink/15 px-6 py-6">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Subtotal</span>
                <span className="text-2xl font-black tabular-nums" data-testid="subtotal">
                  {subtotal}
                </span>
              </div>
              <p className="mt-1 text-xs text-grey">Shipping and taxes are calculated at checkout.</p>
              {error && (
                <p role="alert" className="mt-3 rounded-lg bg-pink/10 px-3 py-2 text-sm font-semibold text-pinkdeep">
                  {error}
                </p>
              )}
              <button type="button" className="btn btn-ink mt-4 w-full" onClick={checkout} disabled={busy}>
                {busy ? "Opening secure checkout…" : "Checkout"}
              </button>
              <p className="mt-3 text-center text-[11px] text-grey">Secure payment by Stripe.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
