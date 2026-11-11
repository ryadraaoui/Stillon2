# Still ON. — website

Next.js 16 (App Router, TypeScript), Tailwind 4, GSAP ScrollTrigger, Lenis. Built from the founder reference pack (REF-01 → REF-09).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
```

Copy `.env.example` to `.env.local` and fill in what you have. With nothing set the site runs in **pre-launch mode**: no price, no cart, launch-list signup instead.

## Pages

- `/` — six sections: hero, pinned product reveal (ending on how it works), horizontal campaign reel, formula, offer + early access, closing
- `/products/energy-strips` — product page (full details, safety, FAQ)
- `/story`, `/faq`, `/shipping`, `/privacy`, `/terms`
- `/checkout/success` — confirms an order only when Stripe reports the session as paid
- `/api/checkout`, `/api/notify`, `sitemap.xml`, `robots.txt`

## Shopify

Headless Storefront API integration, built and tested against a mock, off by default. See `docs/SHOPIFY.md`.

## Prelaunch vs live

With no Stripe variables the site is in prelaunch: every primary CTA is "Get early access" and leads to the one signup form.
Set `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` and the same components switch to price, cart and checkout with no code change.

Early-access signups need `NOTIFY_WEBHOOK_URL` in production (the host has no persistent disk). Optional footer links: `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_INSTAGRAM_URL`.

## Where things live

- `src/config/copy.ts` — message hierarchy, the four benefits, usage facts and the format comparison, each with its source (see `docs/CLAIMS.md`, `docs/MEASUREMENT.md`).
- `src/config/offers.ts` — bundles and preview prices, one source of truth (see `docs/OFFERS.md`).

- `src/lib/site.ts` — every product fact and the FAQ. Edit copy and numbers here.
- `src/lib/commerce.ts` — Stripe access. The price is read from Stripe, never hard-coded.
- `src/components/Sachet.tsx`, `Box3D.tsx` — the pack, rebuilt as live artwork from the spec. Replace with print-file exports when available.
- `src/components/ProductReveal.tsx` — the pinned product sequence. `Campaign.tsx` — the horizontal reel. `Ticker.tsx` — the scroll-driven type band. `Sections.tsx` — how it works, formula, conversion, closing.
- `scripts/bw-treatment.py` — the black-and-white campaign grade.
- `scripts/prepare-assets.py` — how each image in `src/assets` was cut from the reference pack.
- `docs/IMAGE-STATUS.md` — which images are final and which need replacing. `docs/HIGGSFIELD-PROMPTS.md` — prompts for the missing shots.

## Tests

`scripts/qa/func.mjs` is a Playwright suite (navigation, links, overflow, reduced motion, forms, cart, checkout). It needs a running server:

```bash
node scripts/qa/func.mjs http://localhost:3000 prelaunch
# live mode: run scripts/qa/mock-stripe.mjs, then start the site with
# STRIPE_SECRET_KEY=sk_test_mock STRIPE_PRICE_ID=price_test STRIPE_API_BASE=http://localhost:4010 on port 3001
node scripts/qa/func.mjs http://localhost:3001 live
```

## Rollback

Every change is a git commit. `git log` shows the history; `git revert <commit>` undoes one safely.
