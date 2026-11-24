import { NextResponse } from "next/server";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getOffer, offerConfig, priceFor, type PurchaseType } from "@/config/offers";
import { klaviyoEnabled, klaviyoSubscribe } from "@/lib/klaviyo";

/**
 * Early-access and waitlist signup. Stores the email with the offer the visitor showed interest in.
 * This records interest only: it never reserves stock, takes payment or starts a subscription.
 * - KLAVIYO_PRIVATE_KEY + KLAVIYO_LIST_ID set: subscribes the email to the Klaviyo waitlist list with consent
 *   (see src/lib/klaviyo.ts). Klaviyo de-duplicates and sends the welcome flow. A webhook, if also set, gets a copy.
 * - NOTIFY_WEBHOOK_URL set: forwards { email, source, consent, ts } as JSON (Klaviyo/Zapier/Make/your own endpoint).
 *   De-duplication is then the list provider's job; the request is idempotent on email.
 * - Not set, outside production (or NOTIFY_ALLOW_FILE=true on a host with a persistent disk):
 *   appends to .data/early-access.jsonl and de-duplicates on email.
 * - Not set, in production: fails honestly with 503 rather than pretending to subscribe anyone.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: { email?: unknown; source?: unknown; company?: unknown; consent?: unknown; offer?: unknown; purchaseType?: unknown; interval?: unknown; utm?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body.company) return NextResponse.json({ ok: true }); // honeypot: bots get a quiet no-op
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: "Please tick the box so we're allowed to email you." }, { status: 400 });
  }
  // Offer interest is optional, but if present it must match the configuration exactly.
  let interest: Record<string, string | number | null> = {};
  if (body.offer !== undefined) {
    const offer = typeof body.offer === "string" ? getOffer(body.offer) : undefined;
    if (!offer) return NextResponse.json({ error: "That offer doesn't exist." }, { status: 400 });
    const type: PurchaseType = body.purchaseType === "repeat" ? "repeat" : "one-time";
    if (type === "repeat" && !offer.subscriptionEligible) return NextResponse.json({ error: `${offer.name} is one-time only.` }, { status: 400 });
    const interval = type === "repeat" ? Number(body.interval) : null;
    if (type === "repeat" && !(offerConfig.intervals as readonly number[]).includes(interval as number)) return NextResponse.json({ error: "Pick a delivery interval." }, { status: 400 });
    interest = { offer: offer.id, purchaseType: type, intervalDays: interval, previewPrice: priceFor(offer, type), currency: offerConfig.currency, pricingStatus: offerConfig.pricingStatus };
  }
  // utm_* from the landing link (e.g. the Instagram bio), so Klaviyo can tell which post brought each signup
  const utm: Record<string, string> = {};
  if (body.utm && typeof body.utm === "object") {
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
      const v = (body.utm as Record<string, unknown>)[k];
      if (typeof v === "string" && v.trim()) utm[k] = v.trim().slice(0, 80);
    }
  }
  const entry = { email, source: typeof body.source === "string" ? body.source.slice(0, 40) : "site", consent: true, ...interest, ...utm, ts: new Date().toISOString() };
  const hook = process.env.NOTIFY_WEBHOOK_URL;
  try {
    if (klaviyoEnabled()) {
      await klaviyoSubscribe({ email, source: entry.source, properties: { ...utm, ...(Object.keys(interest).length ? { offer_interest: interest.offer, purchase_type: interest.purchaseType, interval_days: interest.intervalDays } : {}) } });
      if (hook) await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) }).catch((e) => console.error("[notify] webhook copy", e));
      return NextResponse.json({ ok: true });
    }
    if (hook) {
      const res = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
      return NextResponse.json({ ok: true });
    }
    if (process.env.NODE_ENV !== "production" || process.env.NOTIFY_ALLOW_FILE === "true") {
      const dir = path.join(process.cwd(), ".data");
      const file = path.join(dir, "early-access.jsonl");
      await mkdir(dir, { recursive: true });
      const existing = await readFile(file, "utf8").catch(() => "");
      const already = existing.split("\n").some((l) => l && JSON.parse(l).email === email);
      // a returning address keeps one registration; their latest offer interest is appended as an update
      await appendFile(file, JSON.stringify(already ? { ...entry, update: true } : entry) + "\n");
      return NextResponse.json({ ok: true, already });
    }
    return NextResponse.json({ error: "The list isn't connected yet. Please check back soon." }, { status: 503 });
  } catch (e) {
    console.error("[notify]", e);
    return NextResponse.json({ error: "We couldn't add you just now. Please try again." }, { status: 502 });
  }
}
