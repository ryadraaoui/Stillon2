import { NextResponse } from "next/server";
import { stripe, stripeConfigured } from "@/lib/commerce";

/** Creates a real Stripe Checkout Session. No payment is ever simulated: without credentials this returns 503. */
export async function POST(req: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Checkout is not open yet." }, { status: 503 });
  }
  let quantity = 1;
  try {
    const body = await req.json();
    quantity = Number(body?.quantity);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return NextResponse.json({ error: "Quantity must be between 1 and 10." }, { status: 400 });
  }
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const params = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": process.env.STRIPE_PRICE_ID!,
    "line_items[0][quantity]": String(quantity),
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/products/energy-strips?checkout=cancelled`,
  });
  const countries = (process.env.STRIPE_SHIPPING_COUNTRIES ?? "CA").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
  countries.forEach((c, i) => params.set(`shipping_address_collection[allowed_countries][${i}]`, c));
  if (process.env.STRIPE_AUTOMATIC_TAX === "true") params.set("automatic_tax[enabled]", "true");
  try {
    const session = await stripe("checkout/sessions", { method: "POST", body: params });
    if (!session?.url) throw new Error("Stripe returned no checkout URL");
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout]", e);
    return NextResponse.json({ error: "We could not start checkout. Nothing was charged. Please try again." }, { status: 502 });
  }
}
