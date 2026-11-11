# Shopify

The site talks to Shopify's **Storefront API** (headless). Shopify stays the shop: it holds prices, inventory, tax, shipping, payments, subscriptions and the hosted checkout. The site only reads prices and creates a cart.

## Status

Built and tested against a **mock** Storefront API only. It has not been run against a real store, and the default API version (`2026-07`) has not been checked against your store. It is **off by default**: with no environment variables the site stays in prelaunch (early access).

## What turns it on

All of these must be set (see `.env.example`): `SHOPIFY_CHECKOUT_ENABLED=true`, `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, the three `SHOPIFY_VARIANT_*` ids and, for ON Repeat., the three `SHOPIFY_SELLING_PLAN_*` ids. Set them in Vercel (Project → Settings → Environment Variables) and redeploy: pages are generated at build time and refresh every 5 minutes.

If anything is missing, a variant is not found, a variant is not available for sale, or the bundles are priced in different currencies, the site **falls back to prelaunch** and logs why. A half-configured shop never shows wrong prices.

## What changes when it is on

| Area | Prelaunch | Shopify on |
| --- | --- | --- |
| Prices | `src/config/offers.ts` preview prices | Read from Shopify (variant price; selling-plan per-delivery price) |
| Button | Get early access + email form | Checkout → Shopify hosted checkout |
| CTA labels | Get early access | Get yours |
| Disclosure | "Preview pricing…" | "Taxes and shipping are calculated at checkout…" |
| Shipping page, FAQ "Can I buy it now?" | Not shipping yet | Calculated at checkout / Yes |

The bundle names, contents (boxes, strips, ON Tag), layout, selection behaviour and ON Repeat. intervals still come from `src/config/offers.ts`; only prices come from Shopify.

## Setting up the store

1. **Three products or one product with three variants**, one variant per bundle: The Intro (1 box, 30 strips), The Everyday (2 boxes, 60), The Stockup (3 boxes, 90). Copy each variant id into the `SHOPIFY_VARIANT_*` variables.
2. **A Storefront API token.** Create a custom app (or use the Headless channel), enable Storefront API access, and grant at least: read product listings, read selling plans, write checkouts/carts. Confirm the exact scope names in your Shopify admin.
3. **ON Repeat.** Use Shopify Subscriptions (or a subscription app) to create selling plans for 30, 60 and 90 days and attach them to the Everyday and Stockup variants only. Put their ids in `SHOPIFY_SELLING_PLAN_*`. The Intro must not have a plan.
4. **Shipping, taxes, payments, checkout branding** are configured in Shopify.

## Things that cannot be done from this site

- **ON Tag on the first order only.** A selling plan repeats the whole variant. Including the tag once needs the tag to be a bundle component or a first-order gift/discount configured in Shopify (Bundles, Flow, or your subscription app). Until that exists, do not enable Shopify checkout for the Everyday and Stockup, or the site's "ON Tag included with your first order. Refills only after your first delivery." line will not be true.
- **Cancellation and account terms** for ON Repeat. must be published before it goes live. The site's disclosure only points to order emails and the account; check that matches what your subscription app provides.
- **Final prices.** Whatever the variants are priced at is what the site shows.

## Files

`src/lib/shopify.ts` (client, price loading, cart creation) · `src/app/api/shopify/checkout/route.ts` · `src/lib/commerce.ts` (mode selection: Shopify → Stripe → prelaunch) · `src/components/Offers.tsx` (shop mode) · `scripts/qa/mock-shopify.mjs`, `scripts/qa/shop.mjs` (tests).

The earlier Stripe code remains as a fallback and is used only if Shopify is not enabled.

## Testing

```bash
node scripts/qa/mock-shopify.mjs &   # port 4020
SHOPIFY_CHECKOUT_ENABLED=true SHOPIFY_STORE_DOMAIN=test.myshopify.com SHOPIFY_STOREFRONT_TOKEN=test-token \
SHOPIFY_STOREFRONT_URL=http://localhost:4020/api SHOPIFY_VARIANT_INTRO=101 SHOPIFY_VARIANT_EVERYDAY=102 \
SHOPIFY_VARIANT_STOCKUP=103 SHOPIFY_SELLING_PLAN_30=301 SHOPIFY_SELLING_PLAN_60=302 SHOPIFY_SELLING_PLAN_90=303 \
npx next build && npx next start -p 3002
node scripts/qa/shop.mjs http://localhost:3002 http://localhost:4020
```

`SHOPIFY_STOREFRONT_URL` exists for tests only. Do not set it in production.
