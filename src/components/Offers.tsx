"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { CTA } from "@/lib/site";
import { track } from "@/lib/track";
import { contents, getOffer, isBestUnitValue, money, offerConfig, priceFor, repeatSaving, unitLabel, type Interval, type OfferId, type PurchaseType } from "@/config/offers";
import { Box3D } from "./Box3D";

/**
 * ON Tag — TEMPORARY DESIGN PLACEHOLDER.
 * No approved ON Tag artwork exists in the project yet, so this is a deliberately schematic outline with a
 * visible "placeholder" caption, not a rendering of the real accessory. Replace with the approved image.
 */
export function OnTagPlaceholder({ className = "", caption = true }: { className?: string; caption?: boolean }) {
  return (
    <figure className={className} data-testid="on-tag">
      <svg viewBox="0 0 60 104" className="h-auto w-full" role="img" aria-label="ON Tag, a wearable case for sachets. Placeholder drawing, final design pending.">
        <circle cx="30" cy="11" r="8.5" fill="none" stroke="#9a9a9a" strokeWidth="2" />
        <rect x="26.500" y="17" width="7" height="9" rx="2" fill="#b9b9b9" />
        <rect x="9" y="25" width="42" height="74" rx="7" fill="#ffffff" fillOpacity=".72" stroke="#111" strokeOpacity=".28" strokeWidth="1" strokeDasharray="3 2.4" />
        <text x="30" y="60" textAnchor="middle" fontSize="8.500" fontWeight="900" fontStyle="italic" fill="#111" letterSpacing="-.3">ON</text>
        <text x="30" y="70" textAnchor="middle" fontSize="6" fontWeight="800" fill="#111" letterSpacing=".4">TAG</text>
        <circle cx="30" cy="84" r="1.800" fill="#ff006e" />
      </svg>
      {caption && <figcaption className="mt-1 text-center text-[10px] leading-tight font-semibold tracking-[0.08em] text-grey uppercase">Placeholder</figcaption>}
    </figure>
  );
}

/** The product arrangement for the selected offer: 1, 2 or 3 live boxes, plus the ON Tag when it is included. */
function Stage({ boxes, tag }: { boxes: number; tag: boolean }) {
  // x offset (% of stage), scale and z for each of the three box slots, per box count
  const layout: Record<number, [number, number, number][]> = {
    1: [[0, 1, 3], [0, 0.9, 1], [0, 0.9, 1]],
    2: [[-21, 0.94, 3], [21, 0.94, 2], [21, 0.86, 1]],
    3: [[-31, 0.84, 3], [0, 0.9, 2], [31, 0.84, 1]],
  };
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[600px]" aria-hidden="true">
      {[0, 1, 2].map((i) => {
        const [x, s, z] = layout[boxes][i];
        const on = i < boxes;
        return (
          <div key={i} className="absolute top-[7%] left-1/2 w-[38%] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" style={{ transform: `translateX(calc(-50% + ${x}cqw)) scale(${s})`, opacity: on ? 1 : 0, zIndex: z }}>
            <Box3D className="w-full" />
          </div>
        );
      })}
      <div className={`absolute right-[5%] bottom-[6%] z-10 w-[12%] transition-[opacity,transform] duration-500 motion-reduce:transition-none ${tag ? "opacity-100" : "translate-y-3 opacity-0"}`}>
        <OnTagPlaceholder />
      </div>
    </div>
  );
}

const seg = "relative flex min-h-[44px] flex-1 cursor-pointer items-center justify-center px-4 text-[12px] font-bold tracking-[0.08em] uppercase transition-colors duration-200 has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pink";

/**
 * The offer configurator: choose a bundle, one-time or ON REPEAT., a delivery interval, then register interest.
 * One component for the homepage (with the product stage) and the product page (compact, beside the gallery).
 * Prelaunch only: it records interest. It takes no payment and starts no subscription.
 */
export function OfferConfigurator({ source, stage = true }: { source: string; stage?: boolean }) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const [offerId, setOfferId] = useState<OfferId>(offerConfig.defaultOffer);
  const [type, setType] = useState<PurchaseType>("one-time");
  const [interval, setInterval_] = useState<Interval>(30);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const offer = getOffer(offerId)!;
  const effType: PurchaseType = offer.subscriptionEligible ? type : "one-time";
  const price = priceFor(offer, effType);
  const saving = repeatSaving(offer);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (track("offer_impression", { source }), io.disconnect()), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [source]);

  const pick = (id: OfferId) => {
    setOfferId(id);
    track("offer_select", { offer: id, source });
  };
  const pickType = (t: PurchaseType) => {
    setType(t);
    track("purchase_type_select", { offer: offerId, purchase_type: t, source });
  };
  const pickInterval = (d: Interval) => {
    setInterval_(d);
    track("frequency_select", { offer: offerId, interval_days: d, source });
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "busy") return;
    const company = new FormData(e.currentTarget).get("company");
    setState("busy");
    track("early_access_submit", { offer: offerId, purchase_type: effType, source });
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, company, consent, offer: offerId, purchaseType: effType, interval: effType === "repeat" ? interval : undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't add you just now. Please try again.");
      setState("done");
      setMsg(data.already ? "You were already on it. We've noted your latest pick." : "");
      track("early_access_success", { offer: offerId, purchase_type: effType, source });
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      track("early_access_error", { source });
    }
  }

  return (
    <div ref={root} className={stage ? "grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14" : ""} data-testid="offers">
      {stage && (
        <div className="@container min-w-0">
          <Stage boxes={offer.boxes} tag={offer.includesOnTag} />
          <p className="mt-4 text-center text-[11px] font-semibold tracking-[0.12em] text-grey uppercase" aria-live="polite">
            {offer.boxes} {offer.boxes === 1 ? "box" : "boxes"} · {offer.strips} strips{offer.includesOnTag ? " · plus the ON Tag" : ""}
          </p>
        </div>
      )}

      <div className="min-w-0">
        {/* 1 — the three editions */}
        <fieldset>
          <legend className="sr-only">Choose your bundle</legend>
          <div className="flex flex-col gap-2">
            {offerConfig.offers.map((o) => {
              const on = o.id === offerId;
              const best = o.label === "value" && isBestUnitValue(o);
              return (
                <label
                  key={o.id}
                  data-offer={o.id}
                  className={`relative grid cursor-pointer grid-cols-[auto_1fr_auto] min-h-[76px] items-center gap-x-4 rounded-2xl bg-white px-4 py-4 transition-shadow duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pink sm:px-5 ${on ? "shadow-[inset_0_0_0_1.5px_var(--color-pink)]" : "shadow-[inset_0_0_0_1px_rgba(17,17,17,0.14)] hover:shadow-[inset_0_0_0_1px_rgba(17,17,17,0.5)]"}`}
                >
                  <input type="radio" name={`${uid}-offer`} value={o.id} checked={on} onChange={() => pick(o.id)} className="sr-only" />
                  <span aria-hidden="true" className={`grid h-[18px] w-[18px] place-items-center rounded-full transition-shadow duration-200 ${on ? "shadow-[inset_0_0_0_1.5px_var(--color-pink)]" : "shadow-[inset_0_0_0_1.5px_rgba(17,17,17,0.35)]"}`}>
                    <span className={`h-2 w-2 rounded-full bg-pink transition-transform duration-200 ${on ? "scale-100" : "scale-0"}`} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                      <span className="text-[19px] leading-none font-black tracking-[-0.02em] uppercase sm:text-[21px]">{o.name}</span>
                      {o.label === "recommended" && (
                        <span className="text-[11px] font-extrabold tracking-[0.12em] whitespace-nowrap text-pinkdeep uppercase">
                          <span className="sr-only">Recommended. </span>The full experience.
                        </span>
                      )}
                      {best && <span className="text-[11px] font-extrabold tracking-[0.12em] whitespace-nowrap text-grey uppercase">Best unit value</span>}
                    </span>
                    <span className="mt-2 block text-[12px] font-bold tracking-[0.08em] text-grey uppercase">{contents(o)}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[24px] leading-none font-black tracking-[-0.03em] tabular-nums sm:text-[26px]" data-price={o.id}>
                      {money(o.oneTimePrice)}
                    </span>
                    <span className="mt-2 block text-[11px] font-semibold text-grey tabular-nums">{unitLabel(o)}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 2 — one-time or ON REPEAT. */}
        <fieldset className="mt-5">
          <legend className="mb-2 flex w-full items-baseline justify-between text-[11px] font-bold tracking-[0.12em] uppercase">
            <span>How often</span>
            <span className="text-grey normal-case tracking-normal">Your strips. On repeat.</span>
          </legend>
          {offer.subscriptionEligible ? (
            <div className="flex overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(17,17,17,0.14)]">
              <label className={seg}>
                <input type="radio" name={`${uid}-type`} value="one-time" checked={effType === "one-time"} onChange={() => pickType("one-time")} className="sr-only" />
                One-time
              </label>
              <label className={seg}>
                <input type="radio" name={`${uid}-type`} value="repeat" checked={effType === "repeat"} onChange={() => pickType("repeat")} className="sr-only" />
                ON Repeat.
                {saving > 0 && <span className={`ml-2 text-[11px] font-extrabold tabular-nums ${effType === "repeat" ? "text-pink" : "text-pinkdeep"}`}>−{money(saving)}</span>}
              </label>
            </div>
          ) : (
            <p className="flex min-h-[44px] items-center rounded-full px-5 text-[12px] font-bold tracking-[0.08em] text-grey uppercase shadow-[inset_0_0_0_1px_rgba(17,17,17,0.14)]" data-testid="one-time-only">
              One-time only. ON Repeat. starts at The Everyday.
            </p>
          )}
          <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${effType === "repeat" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} inert={effType !== "repeat"}>
            <div className="overflow-hidden">
              <div className="flex gap-2 pt-2" role="radiogroup" aria-label="Delivery interval">
                {offerConfig.intervals.map((d) => (
                  <label key={d} className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-full text-[11px] font-bold tracking-[0.08em] uppercase shadow-[inset_0_0_0_1px_rgba(17,17,17,0.14)] transition-shadow duration-200 has-[:checked]:text-pinkdeep has-[:checked]:shadow-[inset_0_0_0_1.5px_var(--color-pink)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pink">
                    <input type="radio" name={`${uid}-interval`} value={d} checked={interval === d} onChange={() => pickInterval(d)} className="sr-only" />
                    Every {d} days
                  </label>
                ))}
              </div>
            </div>
          </div>
        </fieldset>

        {/* 3 — what you picked */}
        <div className="mt-5 border-t border-ink/15 pt-4" aria-live="polite" data-testid="summary">
          <div className="flex items-end justify-between gap-4">
            <p className="text-[12px] font-bold tracking-[0.08em] uppercase">
              {offer.name} <span className="text-grey">{effType === "repeat" ? `ON Repeat. · every ${interval} days` : "One-time"}</span>
            </p>
            <p className="text-right leading-none">
              <span className="text-[34px] font-black tracking-[-0.04em] tabular-nums" data-testid="total">
                {money(price)}
              </span>
              {effType === "repeat" && <span className="ml-1 text-[12px] font-bold text-grey">per delivery</span>}
            </p>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-grey">
            {offer.boxes} {offer.boxes === 1 ? "box" : "boxes"} · {offer.strips} strips · {unitLabel(offer, effType)}.
            {offer.includesOnTag && <span data-testid="tag-note"> ON Tag included with your first order.{effType === "repeat" ? " Refills only after your first delivery." : ""}</span>}
            {effType === "repeat" && " Cancellation and account terms will be published before ON Repeat. goes live."}
          </p>
        </div>

        {/* 4 — register */}
        {state === "done" ? (
          <div role="status" className="mt-5 rounded-2xl bg-ink px-6 py-7 text-white" data-testid="confirmation">
            <p className="display text-[30px] sm:text-[36px]">
              You’re on the list<span className="text-pink">.</span>
            </p>
            <p className="mt-2 text-[13px] font-bold tracking-[0.08em] text-white/75 uppercase">The day isn’t done. Neither are we.</p>
            {msg && <p className="mt-3 text-[13px] text-white/70">{msg}</p>}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5" aria-busy={state === "busy"}>
            <label htmlFor={`${uid}-email`} className="sr-only">
              Email address
            </label>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:gap-x-0 sm:gap-y-3">
              <div aria-hidden="true" className="pointer-events-none col-start-1 col-end-3 row-start-1 hidden rounded-full shadow-[inset_0_0_0_1.5px_var(--color-ink)] sm:block" />
              <input
                id={`${uid}-email`}
                type="email"
                name="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-describedby={state === "error" ? `${uid}-err` : `${uid}-note`}
                aria-invalid={state === "error" || undefined}
                className="col-start-1 row-start-1 min-h-[56px] min-w-0 rounded-full bg-transparent px-5 text-base font-medium text-ink outline-none placeholder:text-grey max-sm:shadow-[inset_0_0_0_1.5px_var(--color-ink)] sm:min-h-[64px] sm:pl-6"
              />
              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <label className="flex cursor-pointer items-start gap-3 px-1 text-[13px] leading-snug text-grey max-sm:row-start-2 sm:col-span-2 sm:row-start-2">
                <input type="checkbox" name="consent" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] flex-none accent-[#ff006e]" />
                <span>
                  Yes, email me about the Still ON. launch. Unsubscribe any time.{" "}
                  <Link href="/privacy" className="underline underline-offset-2">
                    Privacy
                  </Link>
                </span>
              </label>
              <button type="submit" disabled={state === "busy"} className="btn btn-ink max-sm:row-start-3 sm:col-start-2 sm:row-start-1 sm:m-1.5">
                {state === "busy" ? "Adding you…" : CTA}
              </button>
            </div>
            {state === "error" && (
              <p id={`${uid}-err`} role="alert" className="mt-2 px-1 text-sm font-semibold text-pinkdeep">
                {msg}
              </p>
            )}
            <p id={`${uid}-note`} className="mt-4 px-1 text-[11px] leading-relaxed text-grey" data-testid="disclosure">
              <strong className="font-bold text-ink">You’re early. Good.</strong> Preview pricing in {offerConfig.currency}. Subject to change. Signing up doesn’t take payment, reserve stock or lock this price.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
