"use client";
import { useId, useState } from "react";
import { useCart, QtyStepper } from "./Cart";

/** Email capture for the launch list. Posts to /api/notify and reports the real outcome. */
export function NotifyForm({ source, dark = false, cta = "Tell me first" }: { source: string; dark?: boolean; cta?: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const company = new FormData(e.currentTarget).get("company");
    setState("busy");
    try {
      const res = await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source, company }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't add you just now. Please try again.");
      setState("done");
      setMsg("You're on the list. We'll email you once, when it's on.");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }
  if (state === "done") {
    return (
      <p role="status" className={`text-lg font-extrabold ${dark ? "text-ivory" : "text-ink"}`}>
        <span className="text-pink">ON.</span> {msg}
      </p>
    );
  }
  return (
    <form onSubmit={submit} noValidate={false} className="w-full max-w-[520px]">
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
          className={`min-h-[52px] flex-1 rounded-full bg-transparent px-5 text-base font-medium outline-none max-sm:ring-[1.5px] ${dark ? "text-ivory placeholder:text-ivory/50 max-sm:ring-ivory/60" : "text-ink placeholder:text-grey/60 max-sm:ring-ink"}`}
        />
        {/* honeypot */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <button type="submit" disabled={state === "busy"} className={`btn ${dark ? "btn-ivory" : "btn-ink"}`}>
          {state === "busy" ? "Adding…" : cta}
        </button>
      </div>
      {state === "error" && (
        <p id={`${id}-err`} role="alert" className="mt-2 px-2 text-sm font-semibold text-pinktext">
          {msg}
        </p>
      )}
    </form>
  );
}

/** Buy module. Live mode (Stripe configured): real price, quantity, add to cart. Otherwise: launch list. */
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
      <p className="eyebrow text-pinktext">Not on sale yet</p>
      <p className="mt-2 max-w-[38ch] text-[15px] text-grey">N°01 hasn&apos;t dropped. Leave your email and you&apos;ll be the first to know the date and the price.</p>
      <div className="mt-5">
        <NotifyForm source={source} />
      </div>
    </div>
  );
}
