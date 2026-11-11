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

- `/` — hero, manifesto, pinned product reveal, how it works, formula, campaign gallery, shop, FAQ, launch list, closing campaign
- `/products/energy-strips` — product page
- `/story` — our story
- `/checkout/success` — confirms an order only when Stripe reports the session as paid
- `/api/checkout`, `/api/notify`, `sitemap.xml`, `robots.txt`

## Where things live

- `src/lib/site.ts` — every product fact and the FAQ. Edit copy and numbers here.
- `src/lib/commerce.ts` — Stripe access. The price is read from Stripe, never hard-coded.
- `src/components/Sachet.tsx`, `Box3D.tsx` — the pack, rebuilt as live artwork from the spec. Replace with print-file exports when available.
- `src/components/ProductReveal.tsx` — the scroll sequence. `Gallery.tsx` — the campaign reel.
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
