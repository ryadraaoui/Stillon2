# Measurement

No analytics product is connected yet. `src/lib/track.ts` pushes events to `window.dataLayer` when one exists and fires a `stillon:track` DOM event. No event carries an email or other personal data. Every event includes `copy_variant`.

| Question | Event(s) | Read it as |
| --- | --- | --- |
| Does the hero get a click? | `hero_cta_click` (`cta`), `product_discovery` | Clicks ÷ sessions |
| Do people finish the reveal? | `product_reveal_complete` | Completions ÷ sessions |
| Do they see the benefits? | `benefits_view` (`source`) | Views ÷ sessions |
| Do they visit the product page? | `product_page_view` | — |
| Which bundle draws interest? | `offer_impression`, `offer_select` (`offer`) | Share of selections per offer |
| Is there subscription interest? | `purchase_type_select`, `frequency_select` | Repeat share among eligible offers |
| Do they register? | `early_access_submit`, `early_access_success`, `early_access_error` (`offer`, `purchase_type`, `source`) | Success ÷ offer impressions |

The stored signup also records offer, purchase type, interval, preview price and source.

## Copy test

`NEXT_PUBLIC_COPY_VARIANT` switches the hero descriptor between `a` (default) and `b` (see `src/config/copy.ts`). Deploy each to a share of traffic and compare `early_access_success` per `offer_impression` by `copy_variant`. A better-looking page is not evidence of a better-converting one.

## Comprehension, which analytics cannot answer

Ask five people who have not seen the site, after ten seconds on the homepage: What is it? Why would you use it instead of a drink? What does it cost? Is that price final? Did you buy anything?
