"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { CTA } from "@/lib/site";
import { useCart, QtyStepper } from "./Cart";

/** Early-access signup. Posts to /api/notify and reports the real outcome. One submission at a time. */
export function EarlyAccessForm({ source, dark = false }: { source: string; dark?: boolean }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "busy") return; // ignore double submits
    const company = new FormData(e.currentTarget).get("company");
    setState("busy");
    try {
      const res = await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source, company, consent }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't add you just now. Please try again.");
      setState("done");
      setMsg(data.already ? "You're already on the list. We'll email you when it's available." : "You're in. We'll email you when it's available.");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }
  const tone = dark ? "text-ivory" : "text-ink";
  if (state === "done") {
    return (
      <p role="status" className={`text-lg font-extrabold ${tone}`}>
        <span className="text-pink">ON.</span> {msg}
      </p>
    );
  }
  return (
    <form onSubmit={submit} className="w-full max-w-[520px]" aria-busy={state === "busy"}>
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div className={`flex flex-col gap-2 sm:flex-row sm:rounded-full sm:p-1.5 sm:ring-[1.5px] ${dark ? "sm:ring-ivory/60" : "sm:ring-ink"}`}>
        <input
          id={id}
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={state === "error" ? `${id}-err` : undefined}
          aria-invalid={state === "error" || undefined}
          className={`min-h-[52px] min-w-0 flex-1 rounded-full bg-transparent px-5 text-base font-medium outline-none max-sm:ring-[1.5px] ${dark ? "text-ivory placeholder:text-ivory/50 max-sm:ring-ivory/60" : "text-ink placeholder:text-grey/70 max-sm:ring-ink"}`}
        />
        {/* honeypot */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <button type="submit" disabled={state === "busy"} className={`btn ${dark ? "btn-ivory" : "btn-ink"}`}>
          {state === "busy" ? "Adding you…" : CTA}
        </button>
      </div>
      <label className={`mt-3 flex cursor-pointer items-start gap-3 px-1 text-[13px] leading-snug ${dark ? "text-ivory/80" : "text-grey"}`}>
        <input type="checkbox" name="consent" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] flex-none accent-[#ff006e]" />
        <span>
          Yes, email me about the Still ON. launch. Unsubscribe any time.{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy
          </Link>
        </span>
      </label>
      {state === "error" && (
        <p id={`${id}-err`} role="alert" className="mt-2 px-1 text-sm font-semibold text-pinkdeep">
          {msg}
        </p>
      )}
    </form>
  );
}

/**
 * Buy module, modular by design.
 * Prelaunch (default): availability status + early-access signup.
 * Live (Stripe configured): real price, quantity, add to cart. No code change needed to switch.
 */
export function Purchase({ source }: { source: string }) {
  const { commerce, add } = useCart();
  const [n, setN] = useState(1);
  if (commerce.mode === "live") {
    return (
      <div>
        <p className="flex items-baseline gap-3">
          <span className="text-4xl font-black tracking-tight tabular-nums" data-testid="price">
            {commerce.price.formatted}
          </span>
          <span className="text-sm text-grey">per box of 30</span>
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <QtyStepper value={n} onChange={(v) => setN(Math.max(1, Math.min(10, v)))} />
          <button type="button" className="btn btn-ink min-w-[220px] flex-1 sm:flex-none" onClick={() => add(n)}>
            Add to cart
          </button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <p className="eyebrow flex items-center gap-2 text-ink" data-testid="status">
        <span className="inline-block h-2 w-2 rounded-full bg-pink" /> Prelaunch · Not on sale yet
      </p>
      <p className="mt-2 max-w-[40ch] text-[15px] text-grey">Leave your email. You&apos;ll hear first when N°01 is available, with the price.</p>
      <div className="mt-5">
        <EarlyAccessForm source={source} />
      </div>
    </div>
  );
}
