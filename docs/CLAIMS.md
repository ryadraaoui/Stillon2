# Claims register

The only product documentation in this project is the founder's reference pack (REF-01 → REF-09), whose own notes say the regulatory text is not final. "Supported" below means "matches the reference pack", not "approved for sale". Nothing on the site should be treated as legally cleared until a regulatory review has happened for the real formula, classification and sales jurisdictions.

## Published, supported by the reference pack

| Claim on site | Source | Still needs |
| --- | --- | --- |
| Dissolvable caffeine strip; place on the tongue, let it dissolve | Box back, mode d'emploi | Final label |
| No water needed. No cup, no can, no mixing | Follows from the directions above | Manufacturer confirmation that no liquid is required |
| 50 mg caffeine per strip | Sachet back, box back | Final manufacturer specification |
| 30 mg L-theanine, 1.3 mg B6, 20 mcg B12 per strip | Sachet back, box back | Final specification. The brief also describes a two-ingredient formula: reconcile |
| Mint | Sachet and box | — |
| Sachet 5 × 7 cm, one strip per sachet, sealed on four sides | Sachet spec | Supplier dieline (an earlier canvas said ~45 × 61 mm) |
| 30 per box; box 80 × 35 × 110 mm | Box spec | — |
| Amounts are printed on every sachet, in French and English | Sachet back artwork | Final artwork |
| "Lowest price per strip" on The Stockup | Calculated from configured prices | Final pricing |

## Deliberately not published

| Claim | Why it is absent | What would unlock it |
| --- | --- | --- |
| Zero sugar / sugar-free | Nothing in the pack states it | Formula, nutrition panel, applicable standard |
| Dissolve time, texture, aftertaste, storage | Not supplied | Manufacturer data or documented product testing |
| Strip dimensions | 3 × 3.5 cm and ~22 × 32 mm conflict | Manufacturer file |
| No crash, no jitters, focus, instant energy, faster than coffee | Unsubstantiated effect claims | Not recommended at this formulation without evidence |
| Coffee-cup equivalence | Coffee caffeine varies too widely | — |
| Third-party testing, certifications, manufacturing location, quality systems | No document in the project | Certificates, batch test reports, manufacturer QA statement |
| Reviews, ratings, customer counts, endorsements | Prelaunch: none exist | Real, consented feedback after sampling or sales |
| Founder origin story | Not documented | The founder's own account |
| Age restriction, pregnancy, daily limit and other warnings | Regulatory text marked "to confirm" in the pack | Regulatory review |

Rows in `src/config/copy.ts` with `value: null` (dissolve time, texture, aftertaste, storage, sugar) appear on the product page automatically once a value is entered.

## For regulatory review

- Product classification in each market (food, supplement, natural health product) and what that requires on pack and online.
- Caffeine cautions, age guidance and maximum daily amounts.
- Whether "energy" wording and the L-theanine pairing are acceptable as presented.
- ON Repeat. terms: cancellation, renewal notices, and that delivery frequency is not a consumption recommendation.
- Privacy, terms and consent wording (drafted in plain language, not reviewed).

## Not independently verified

The competitor references in the brief (Bloom, Milia Matcha, Sleep or Die, Liquid I.V., AG1, Magic Mind, Neuro, caffeine gum, mints and strips) could not be browsed from the build environment. The positioning follows the brief; no competitor claim, price or conversion figure was used.
