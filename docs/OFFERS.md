# Offers

All bundle data lives in `src/config/offers.ts`. The homepage and product page render the same `OfferConfigurator` (`src/components/Offers.tsx`) from it, so a price changed there changes everywhere. Unit prices, the ON Repeat. saving and the "best unit value" label are calculated, never typed in.

## Status: preview

`pricingStatus` is `"preview"`. The prices are provisional USD figures for design and market-interest testing. The interface says so, and signing up takes no payment, reserves nothing and starts no subscription.

## What a signup stores

`email`, `consent`, `source` (`home` or `pdp`), `offer`, `purchaseType` (`one-time` or `repeat`), `intervalDays`, the `previewPrice` shown, `currency`, `pricingStatus`, timestamp. The API rejects an unknown offer, ON Repeat. on The Intro, and a repeat signup without a valid interval. A returning email keeps one registration; its newest choice is appended with `update: true`.

## Going live later

1. Replace the values in `src/config/offers.ts` with the store's product and selling-plan data and set `pricingStatus` to `"live"`.
2. Swap the form step in `OfferConfigurator` for the real add-to-cart / checkout call. The selection state (`offerId`, purchase type, interval) is already there.
3. Publish cancellation and account-management terms before enabling ON Repeat.

## ON Tag

`OnTagPlaceholder` in `Offers.tsx` is a schematic drawing captioned "Placeholder". No approved ON Tag image is in the project. Replace it with the approved asset.

## Analytics

`src/lib/track.ts` emits `hero_cta_click`, `product_discovery`, `offer_impression`, `offer_select`, `purchase_type_select`, `frequency_select`, `early_access_submit`, `early_access_success`, `early_access_error` to `window.dataLayer` (if present) and as a `stillon:track` DOM event. No analytics product is connected yet, and no event carries an email.
