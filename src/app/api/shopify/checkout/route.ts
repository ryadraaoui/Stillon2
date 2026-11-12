import { NextResponse } from "next/server";
import { getOffer, offerConfig } from "@/config/offers";
import { createCheckout, resolveVariantId, sellingPlanFor, shopifyEnabled } from "@/lib/shopify";

/** Creates a Shopify cart for the chosen bundle and returns the hosted-checkout URL. No payment is handled here. */
export async function POST(req: Request) {
  if (!shopifyEnabled()) return NextResponse.json({ error: "Checkout is not open yet." }, { status: 503 });
  type In = { offer?: unknown; purchaseType?: unknown; interval?: unknown; quantity?: unknown };
  let body: In & { lines?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  // either one bundle (legacy shape) or a bag of lines
  const input: In[] = Array.isArray(body.lines) ? (body.lines as In[]) : [body];
  if (input.length < 1 || input.length > 6) return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
  const lines: { merchandiseId: string; quantity: number; sellingPlanId?: string }[] = [];
  for (const l of input) {
    const offer = typeof l.offer === "string" ? getOffer(l.offer) : undefined;
    if (!offer) return NextResponse.json({ error: "That bundle doesn't exist." }, { status: 400 });
    const repeat = l.purchaseType === "repeat";
    if (repeat && !offer.subscriptionEligible) return NextResponse.json({ error: `${offer.name} is one-time only.` }, { status: 400 });
    const interval = Number(l.interval);
    if (repeat && !(offerConfig.intervals as readonly number[]).includes(interval)) return NextResponse.json({ error: "Pick a delivery interval." }, { status: 400 });
    const quantity = l.quantity === undefined ? 1 : Number(l.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) return NextResponse.json({ error: "Quantity must be between 1 and 5." }, { status: 400 });
    let variant: string | null = null;
    try {
      variant = await resolveVariantId(offer.id);
    } catch (e) {
      console.error("[shopify/checkout] variant lookup", e);
    }
    const plan = repeat ? sellingPlanFor(interval as 30 | 60 | 90) : null;
    if (!variant || (repeat && !plan)) return NextResponse.json({ error: "This bundle isn't set up in the shop yet." }, { status: 503 });
    lines.push({ merchandiseId: variant, quantity, ...(plan ? { sellingPlanId: plan } : {}) });
  }
  try {
    return NextResponse.json({ url: await createCheckout(lines) });
  } catch (e) {
    console.error("[shopify/checkout]", e);
    return NextResponse.json({ error: "We couldn't start checkout. Nothing was charged. Please try again." }, { status: 502 });
  }
}
