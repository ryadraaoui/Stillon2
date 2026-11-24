"use client";
import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/track";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;
const SITE_LINK = "/waitlist";

/** utm_* from the landing URL, kept for the session so a second form on the page still carries them. */
function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  const q = new URLSearchParams(window.location.search);
  for (const k of UTM_KEYS) {
    const v = q.get(k);
    if (v) out[k] = v.slice(0, 80);
  }
  try {
    if (Object.keys(out).length) sessionStorage.setItem("stillon:utm", JSON.stringify(out));
    else return JSON.parse(sessionStorage.getItem("stillon:utm") ?? "{}");
  } catch {}
  return out;
}

/** Shared "you're in" state across both forms on the page, so signing up once updates everything. */
const DONE_EVENT = "stillon:waitlist-done";

/**
 * Waitlist signup. One field, one button, one consent box. Posts to /api/notify (Klaviyo when connected) and
 * reports the real outcome. After success it offers a share, because the best new signup is a friend's.
 */
export function WaitlistForm({ source, tone = "dark", size = "lg", autoFocus = false }: { source: string; tone?: "dark" | "light" | "pink"; size?: "lg" | "md"; autoFocus?: boolean }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const on = () => setState("done");
    window.addEventListener(DONE_EVENT, on);
    return () => window.removeEventListener(DONE_EVENT, on);
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "busy") return;
    const company = new FormData(e.currentTarget).get("company");
    setState("busy");
    track("waitlist_submit", { source });
    try {
      const res = await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source, company, consent, utm: readUtm() }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't add you just now. Please try again.");
      setMsg(data.already ? "You were already on the list. Still counts." : "");
      setState("done");
      track("waitlist_success", { source });
      window.dispatchEvent(new Event(DONE_EVENT));
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      track("waitlist_error", { source });
    }
  }

  async function share() {
    const url = `${window.location.origin}${SITE_LINK}?utm_source=referral&utm_medium=share`;
    const text = "Caffeine, without the can. Still ON. drops soon. Get on the list.";
    track("waitlist_share", { source });
    try {
      if (navigator.share) return await navigator.share({ title: "Still ON.", text, url });
    } catch {
      return; // the person closed the share sheet
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  }

  const dark = tone !== "light";
  const ring = tone === "light" ? "sm:ring-ink" : "sm:ring-ivory/55";
  const ringSm = tone === "light" ? "max-sm:ring-ink" : "max-sm:ring-ivory/55";
  const text = dark ? "text-ivory" : "text-ink";
  const big = size === "lg";

  if (state === "done") {
    return (
      <div role="status" className={`wl-done ${text}`} data-testid="waitlist-done">
        <p className={`display display-italic ${big ? "text-[15vw] md:text-[6.2vw]" : "text-[13vw] md:text-[4.6vw]"}`}>
          You’re <span className={tone === "pink" ? "text-ink" : "text-pink"}>ON.</span>
        </p>
        <p className={`mt-3 max-w-[42ch] text-[16px] font-semibold ${dark ? "text-ivory/80" : "text-ink/75"}`}>
          {msg || "Check your inbox. The launch date and the price come to you first."}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={share} className={`btn ${tone === "light" ? "btn-ink" : "btn-ivory"}`}>
            {copied ? "Link copied" : "Bring someone who never stops"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-[560px]" aria-busy={state === "busy"} data-testid="waitlist-form">
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div className={`flex flex-col gap-2 sm:flex-row sm:rounded-full sm:p-1.5 sm:ring-[1.5px] ${ring} ${tone === "dark" ? "sm:bg-white/[0.04] sm:backdrop-blur" : ""}`}>
        <input
          id={id}
          type="email"
          name="email"
          required
          autoFocus={autoFocus}
          autoComplete="email"
          inputMode="email"
          enterKeyHint="go"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={state === "error" ? `${id}-err` : undefined}
          aria-invalid={state === "error" || undefined}
          className={`${big ? "min-h-[58px] text-[17px]" : "min-h-[52px] text-base"} min-w-0 flex-1 rounded-full bg-transparent px-5 font-semibold outline-none max-sm:ring-[1.5px] ${ringSm} ${dark ? "text-ivory placeholder:text-ivory/45" : "text-ink placeholder:text-grey/70"}`}
        />
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <button type="submit" disabled={state === "busy"} className={`btn ${big ? "min-h-[58px] px-8" : ""} ${tone === "light" ? "btn-ink" : tone === "pink" ? "btn-ink" : "btn-pink"}`}>
          {state === "busy" ? "Adding you…" : "Join the waitlist"}
          {state !== "busy" && <span aria-hidden="true">→</span>}
        </button>
      </div>
      <label className={`mt-3 flex cursor-pointer items-start gap-3 px-1 text-[13px] leading-snug ${dark ? "text-ivory/75" : "text-grey"}`}>
        <input type="checkbox" name="consent" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] flex-none accent-[#ff006e]" />
        <span>
          Yes, email me about the Still ON. launch. No spam, unsubscribe in one click.{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy
          </Link>
        </span>
      </label>
      {state === "error" && (
        <p id={`${id}-err`} role="alert" className={`mt-2 px-1 text-sm font-bold ${tone === "pink" ? "text-ink" : "text-pink"}`}>
          {msg}
        </p>
      )}
    </form>
  );
}
