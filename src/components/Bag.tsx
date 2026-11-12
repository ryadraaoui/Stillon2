"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { money, priceFor, unitLabel, type Interval, type Offer, type OfferId, type PurchaseType } from "@/config/offers";
import Link from "next/link";
import { track } from "@/lib/track";
import { useCart } from "./Cart";
import { Box3D } from "./Box3D";
import { getLenis } from "./SmoothScroll";

/**
 * The on-site bag (Shopify mode only). Visitors add bundles here, review them in the site's own design,
 * and only the final payment step happens on Shopify's hosted checkout. Nothing is charged on this site.
 * Lines persist in the browser so a reload or a cancelled checkout doesn't empty the bag.
 */
export type BagLine = { offer: OfferId; type: PurchaseType; interval: Interval | null; qty: number };
type Ctx = { lines: BagLine[]; count: number; isOpen: boolean; open: () => void; close: () => void; add: (l: Omit<BagLine, "qty">) => void; setQty: (i: number, qty: number) => void; remove: (i: number) => void };
const BagCtx = createContext<Ctx | null>(null);
export const useBag = () => {
  const c = useContext(BagCtx);
  if (!c) throw new Error("useBag outside BagProvider");
  return c;
};
const KEY = "stillon.bag.v1";
const MAX = 5;
const same = (a: Omit<BagLine, "qty">, b: Omit<BagLine, "qty">) => a.offer === b.offer && a.type === b.type && a.interval === b.interval;

export function BagProvider({ children }: { children: React.ReactNode }) {
  const { commerce } = useCart();
  const shop = commerce.mode === "shopify" ? commerce : null;
  const [lines, setLines] = useState<BagLine[]>([]);
  const [isOpen, setOpen] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      // keep only lines that still match a bundle on sale
      const ok = Array.isArray(saved) && shop ? saved.filter((l) => shop.offers.some((o) => o.id === l?.offer && (l.type !== "repeat" || o.subscriptionEligible)) && l.qty >= 1 && l.qty <= MAX) : [];
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once, after mount
      setLines(ok);
    } catch {}
    loaded.current = true;
  }, [shop]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const value = useMemo<Ctx>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add: (l) => {
        setLines((cur) => (cur.some((x) => same(x, l)) ? cur.map((x) => (same(x, l) ? { ...x, qty: Math.min(MAX, x.qty + 1) } : x)) : [...cur, { ...l, qty: 1 }]));
        setOpen(true);
      },
      setQty: (i, qty) => setLines((cur) => cur.map((x, n) => (n === i ? { ...x, qty: Math.max(1, Math.min(MAX, qty)) } : x))),
      remove: (i) => setLines((cur) => cur.filter((_, n) => n !== i)),
    }),
    [lines, isOpen],
  );
  return (
    <BagCtx.Provider value={value}>
      {children}
      {shop && <BagPanel offers={shop.offers} currency={shop.currency} />}
    </BagCtx.Provider>
  );
}

function BagPanel({ offers, currency }: { offers: Offer[]; currency: string }) {
  const { lines, count, isOpen, close, setQty, remove } = useBag();
  const panel = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const m = (n: number) => money(n, currency);
  const rows = lines.map((l) => ({ l, o: offers.find((o) => o.id === l.offer)! })).filter((r) => r.o);
  const subtotal = rows.reduce((n, { l, o }) => n + priceFor(o, l.type) * l.qty, 0);
  const anyRepeat = rows.some((r) => r.l.type === "repeat");
  const anyTag = rows.some((r) => r.o.includesOnTag);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]");
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
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      getLenis()?.start();
      prev?.focus?.();
    };
  }, [isOpen, close]);

  const checkout = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    track("checkout_start", { lines: lines.length, units: count });
    try {
      const res = await fetch("/api/shopify/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lines: lines.map((l) => ({ offer: l.offer, purchaseType: l.type, interval: l.interval ?? undefined, quantity: l.qty })) }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "We couldn't start checkout. Nothing was charged.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't start checkout. Nothing was charged.");
      setBusy(false);
    }
  }, [busy, lines, count]);

  const step = "grid h-10 w-10 place-items-center text-lg font-semibold transition-colors duration-200 hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink";
  return (
    <div className={`fixed inset-0 z-[90] ${isOpen ? "" : "pointer-events-none"}`} inert={!isOpen} data-nav-ui>
      <div className={`absolute inset-0 bg-ink/35 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={close} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        data-lenis-prevent
        data-testid="bag"
        className={`absolute inset-y-2 right-2 flex w-[calc(100%-16px)] max-w-[460px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_-20px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:inset-y-3 sm:right-3 ${isOpen ? "translate-x-0" : "translate-x-[calc(100%+24px)]"}`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="display text-[28px]">
            Your bag<span className="text-pink">.</span>
          </h2>
          <button type="button" data-autofocus onClick={close} className="eyebrow link-u py-2" aria-label="Close bag">
            Close
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-5 px-6 pb-10">
            <p className="display display-italic text-[44px]">
              Nothing yet<span className="text-pink">.</span>
            </p>
            <p className="text-[15px] text-grey">Pick your pace and it lands here.</p>
            <Link href="/#early-access" onClick={close} className="btn btn-ink">
              See the bundles
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6">
              {rows.map(({ l, o }, i) => (
                <li key={`${l.offer}-${l.type}-${l.interval}`} className="grid grid-cols-[84px_1fr] gap-4 border-t border-ink/15 py-5" data-testid="bag-line">
                  <div className="relative grid h-[104px] place-items-center overflow-hidden rounded-2xl bg-ivory" aria-hidden="true">
                    <div className="pointer-events-none w-[46px]">
                      <Box3D className="w-full" />
                    </div>
                    {o.boxes > 1 && <span className="absolute right-1.5 bottom-1.5 rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-extrabold text-white tabular-nums">×{o.boxes}</span>}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[18px] leading-none font-black tracking-[-0.02em] uppercase">{o.name}</p>
                      <p className="text-[18px] leading-none font-black tabular-nums" data-testid="bag-line-price">
                        {m(priceFor(o, l.type) * l.qty)}
                      </p>
                    </div>
                    <p className="mt-2 text-[12px] font-bold tracking-[0.08em] text-grey uppercase">
                      {o.strips} strips{o.includesOnTag ? " + ON Tag" : ""}
                    </p>
                    <p className="mt-1 text-[12px] text-grey">
                      {l.type === "repeat" ? `ON Repeat. · every ${l.interval} days · ${m(priceFor(o, l.type))} per delivery` : `One-time · ${unitLabel(o, l.type, currency)}`}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(17,17,17,0.14)]" role="group" aria-label={`Quantity of ${o.name}`}>
                        <button type="button" className={step} onClick={() => setQty(i, l.qty - 1)} disabled={l.qty <= 1} aria-label="Decrease quantity">
                          −
                        </button>
                        <output className="w-8 text-center text-sm font-extrabold tabular-nums" aria-live="polite">
                          {l.qty}
                        </output>
                        <button type="button" className={step} onClick={() => setQty(i, l.qty + 1)} disabled={l.qty >= MAX} aria-label="Increase quantity">
                          +
                        </button>
                      </div>
                      <button type="button" className="eyebrow link-u py-2 text-grey" onClick={() => remove(i)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink/15 bg-ivory px-6 pt-5 pb-6">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Subtotal</span>
                <span className="text-[30px] leading-none font-black tracking-[-0.03em] tabular-nums" data-testid="bag-subtotal">
                  {m(subtotal)}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-grey">
                Shipping and taxes are calculated at checkout.{anyTag && " ON Tag included with your first order."}
                {anyRepeat && " ON Repeat. renews at the delivery price until you cancel."}
              </p>
              {error && (
                <p role="alert" className="mt-3 text-sm font-semibold text-pinkdeep">
                  {error}
                </p>
              )}
              <button type="button" className="btn btn-ink mt-4 w-full" onClick={checkout} disabled={busy} data-testid="bag-checkout">
                {busy ? "Opening secure checkout…" : "Secure checkout"}
              </button>
              <p className="mt-3 text-center text-[11px] text-grey">Payment is completed on Shopify’s secure checkout.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
