import "server-only";
import { offerConfig, type Interval, type Offer, type OfferId } from "@/config/offers";

/**
 * Shopify Storefront API integration (headless). Off unless explicitly enabled.
 *
 * What it does when on:
 *  - reads the real price of each bundle's variant (and the per-delivery price of its selling plan) from Shopify,
 *    so Shopify is the source of truth and src/config/offers.ts is only the preview fallback;
 *  - creates a Shopify cart for the chosen bundle (+ selling plan for ON Repeat.) and sends the visitor to
 *    Shopify's hosted checkout. Payment, tax, shipping, subscriptions and the ON Tag logic all live in Shopify.
 * Nothing here takes payment or stores card data.
 *
 * Required environment (see docs/SHOPIFY.md):
 *   SHOPIFY_CHECKOUT_ENABLED=true     explicit go-live switch. Without it the site stays in prelaunch.
 *   SHOPIFY_STORE_DOMAIN              your-store.myshopify.com
 *   SHOPIFY_STOREFRONT_TOKEN          Storefront API public access token (a private-delivery token also works)
 *   SHOPIFY_VARIANT_INTRO|EVERYDAY|STOCKUP   variant id (numeric or gid://shopify/ProductVariant/…)
 *   SHOPIFY_SELLING_PLAN_30|60|90     selling-plan ids for ON Repeat. (numeric or gid://shopify/SellingPlan/…)
 * Optional: SHOPIFY_API_VERSION (default below). SHOPIFY_STOREFRONT_URL exists for automated tests only.
 */
export const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-07";

const gid = (kind: "ProductVariant" | "SellingPlan", v: string | undefined) => (!v ? null : v.startsWith("gid://") ? v : /^\d+$/.test(v) ? `gid://shopify/${kind}/${v}` : null);

export function shopifyEnabled() {
  return process.env.SHOPIFY_CHECKOUT_ENABLED === "true" && Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_TOKEN);
}
export const variantFor = (id: OfferId) => gid("ProductVariant", process.env[`SHOPIFY_VARIANT_${id.toUpperCase()}`]);
export const sellingPlanFor = (interval: Interval) => gid("SellingPlan", process.env[`SHOPIFY_SELLING_PLAN_${interval}`]);

export async function storefront<T>(query: string, variables: Record<string, unknown>, revalidate?: number): Promise<T> {
  const url = process.env.SHOPIFY_STOREFRONT_URL ?? `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN ?? "" },
    body: JSON.stringify({ query, variables }),
    ...(revalidate !== undefined ? { next: { revalidate } } : { cache: "no-store" as const }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.errors?.length) throw new Error(json?.errors?.[0]?.message ?? `Shopify responded ${res.status}`);
  return json.data as T;
}

type VariantNode = {
  id: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  sellingPlanAllocations?: { nodes: { sellingPlan: { id: string }; priceAdjustments: { perDeliveryPrice?: { amount: string }; price?: { amount: string } }[] }[] };
};
const VARIANTS = `query Variants($ids: [ID!]!) { nodes(ids: $ids) { ... on ProductVariant { id availableForSale price { amount currencyCode } sellingPlanAllocations(first: 10) { nodes { sellingPlan { id } priceAdjustments { price { amount } perDeliveryPrice { amount } } } } } } }`;

export type ShopifyCommerce = { mode: "shopify"; currency: string; offers: Offer[] };

/**
 * Builds the bundle list from Shopify. Returns null (so the site falls back to prelaunch) if anything is missing,
 * unavailable or priced in more than one currency: a half-configured shop must never show wrong prices.
 */
export async function loadShopifyOffers(): Promise<ShopifyCommerce | null> {
  if (!shopifyEnabled()) return null;
  try {
    const ids = offerConfig.offers.map((o) => variantFor(o.id));
    if (ids.some((i) => !i)) throw new Error("a SHOPIFY_VARIANT_* id is missing or malformed");
    const data = await storefront<{ nodes: (VariantNode | null)[] }>(VARIANTS, { ids }, 300);
    const planIds = offerConfig.intervals.map((d) => sellingPlanFor(d)).filter(Boolean);
    const currencies = new Set<string>();
    const offers = offerConfig.offers.map((base, i) => {
      const v = data.nodes[i];
      if (!v || v.id !== ids[i]) throw new Error(`variant for ${base.id} was not found`);
      if (!v.availableForSale) throw new Error(`variant for ${base.id} is not available for sale`);
      currencies.add(v.price.currencyCode);
      let subscriptionPrice: number | null = null;
      if (base.subscriptionEligible) {
        const alloc = v.sellingPlanAllocations?.nodes.find((a) => planIds.includes(a.sellingPlan.id)) ?? v.sellingPlanAllocations?.nodes[0];
        const adj = alloc?.priceAdjustments[0];
        const amount = adj?.perDeliveryPrice?.amount ?? adj?.price?.amount;
        if (amount !== undefined) subscriptionPrice = Number(amount);
      }
      return { ...base, oneTimePrice: Number(v.price.amount), subscriptionPrice, subscriptionEligible: base.subscriptionEligible && subscriptionPrice !== null };
    });
    if (currencies.size !== 1) throw new Error("bundles are priced in different currencies");
    return { mode: "shopify", currency: [...currencies][0], offers };
  } catch (e) {
    console.error("[shopify] falling back to prelaunch:", e);
    return null;
  }
}

/** Creates a cart and returns Shopify's hosted checkout URL. */
export async function createCheckout(variantId: string, sellingPlanId?: string): Promise<string> {
  const data = await storefront<{ cartCreate: { cart: { checkoutUrl: string } | null; userErrors: { message: string }[] } }>(
    `mutation CartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl } userErrors { field message } } }`,
    { input: { lines: [{ merchandiseId: variantId, quantity: 1, ...(sellingPlanId ? { sellingPlanId } : {}) }] } },
  );
  const { cart, userErrors } = data.cartCreate;
  if (!cart?.checkoutUrl || userErrors?.length) throw new Error(userErrors?.[0]?.message ?? "Shopify returned no checkout URL");
  return cart.checkoutUrl;
}
