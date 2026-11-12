import { NextResponse } from "next/server";
import { lastShopifyProblem, loadShopifyOffers, merchandiseFor, SHOPIFY_API_VERSION } from "@/lib/shopify";

export const dynamic = "force-dynamic";

/**
 * Setup check for preview deployments. Shows which Shopify settings this deployment can see (yes/no only)
 * and, if it fell back to prelaunch, the reason. Never shows a token or a value. Disabled on production.
 */
export async function GET() {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({ error: "Not available on production." }, { status: 404 });
  const has = (k: string) => Boolean(process.env[k]?.trim());
  const enabledRaw = process.env.SHOPIFY_CHECKOUT_ENABLED;
  const shop = await loadShopifyOffers();
  return NextResponse.json({
    deployment: process.env.VERCEL_ENV ?? "local",
    settingsVisibleToThisDeployment: {
      SHOPIFY_CHECKOUT_ENABLED: enabledRaw === undefined ? "missing" : enabledRaw === "true" ? "true" : "set, but not exactly true",
      SHOPIFY_STORE_DOMAIN: has("SHOPIFY_STORE_DOMAIN") ? (process.env.SHOPIFY_STORE_DOMAIN!.trim().endsWith(".myshopify.com") ? "present" : "present, but not a .myshopify.com address") : "missing",
      SHOPIFY_STOREFRONT_PRIVATE_TOKEN: has("SHOPIFY_STOREFRONT_PRIVATE_TOKEN") ? "present" : "missing",
      SHOPIFY_STOREFRONT_TOKEN: has("SHOPIFY_STOREFRONT_TOKEN") ? "present" : "missing (fine if the private token is set)",
      SHOPIFY_PRODUCT_INTRO: merchandiseFor("intro") ? "present" : "missing or not a number",
      SHOPIFY_PRODUCT_EVERYDAY: merchandiseFor("everyday") ? "present" : "missing or not a number",
      SHOPIFY_PRODUCT_STOCKUP: merchandiseFor("stockup") ? "present" : "missing or not a number",
    },
    apiVersion: SHOPIFY_API_VERSION,
    result: shop ? "Shopify is ON for this deployment" : "Prelaunch (Shopify off)",
    reason: shop ? null : (lastShopifyProblem() ?? "The switch-on settings above are not all visible to this deployment."),
    prices: shop ? Object.fromEntries(shop.offers.map((o) => [o.id, { oneTime: o.oneTimePrice, onRepeat: o.subscriptionPrice }])) : null,
    currency: shop?.currency ?? null,
  });
}
