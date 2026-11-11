import "server-only";
import { loadShopifyOffers, type ShopifyCommerce } from "@/lib/shopify";

/**
 * Commerce state. Nothing here is invented: the price is read from Stripe.
 * Without STRIPE_SECRET_KEY + STRIPE_PRICE_ID the site runs in pre-launch mode (launch list instead of cart).
 */
export type Price = { amount: number; currency: string; formatted: string };
export type Commerce = { mode: "live"; price: Price } | ShopifyCommerce | { mode: "prelaunch" };

export const STRIPE_API = process.env.STRIPE_API_BASE ?? "https://api.stripe.com";

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

export function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}

export async function stripe(path: string, init?: { method?: string; body?: URLSearchParams; revalidate?: number }) {
  const res = await fetch(`${STRIPE_API}/v1/${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(init?.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: init?.body,
    ...(init?.revalidate !== undefined ? { next: { revalidate: init.revalidate } } : { cache: "no-store" as const }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error?.message ?? `Stripe responded ${res.status}`);
  return json;
}

export async function getCommerce(): Promise<Commerce> {
  // Shopify wins when it is explicitly enabled and fully configured; otherwise Stripe if configured; otherwise prelaunch.
  const shop = await loadShopifyOffers();
  if (shop) return shop;
  if (!stripeConfigured()) return { mode: "prelaunch" };
  try {
    const price = await stripe(`prices/${process.env.STRIPE_PRICE_ID}`, { revalidate: 300 });
    if (typeof price?.unit_amount !== "number" || !price.currency || price.active === false) return { mode: "prelaunch" };
    return { mode: "live", price: { amount: price.unit_amount, currency: price.currency, formatted: formatPrice(price.unit_amount, price.currency) } };
  } catch (e) {
    console.error("[commerce] could not load price from Stripe:", e);
    return { mode: "prelaunch" };
  }
}
