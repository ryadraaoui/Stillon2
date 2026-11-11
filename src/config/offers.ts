/**
 * The one source of truth for bundles and prices. Homepage and product page both read from here.
 *
 * pricingStatus "preview": these are provisional prices for design and market-interest testing only.
 * Nothing here takes payment. When real commerce is connected, replace this file's values with the
 * store's authoritative product and selling-plan data (see docs/OFFERS.md) and set pricingStatus to "live".
 */
export type OfferId = "intro" | "everyday" | "stockup";
export type PurchaseType = "one-time" | "repeat";

export type Offer = {
  id: OfferId;
  name: string;
  line: string;
  boxes: number;
  strips: number;
  oneTimePrice: number;
  subscriptionPrice: number | null;
  includesOnTag: boolean;
  subscriptionEligible: boolean;
  /** small typographic label; "value" is only shown if the maths below agrees */
  label?: "entry" | "recommended" | "value";
};

export const offerConfig = {
  currency: "USD",
  pricingStatus: "preview" as "preview" | "live",
  defaultOffer: "everyday" as OfferId,
  intervals: [30, 60, 90] as const, // days between deliveries
  offers: [
    { id: "intro", name: "The Intro.", line: "One box to try the format. No commitment.", boxes: 1, strips: 30, oneTimePrice: 39, subscriptionPrice: null, includesOnTag: false, subscriptionEligible: false, label: "entry" },
    { id: "everyday", name: "The Everyday.", line: "Two boxes and the ON Tag to carry them in.", boxes: 2, strips: 60, oneTimePrice: 69, subscriptionPrice: 62, includesOnTag: true, subscriptionEligible: true, label: "recommended" },
    { id: "stockup", name: "The Stockup.", line: "Three boxes. More on hand, less per strip.", boxes: 3, strips: 90, oneTimePrice: 89, subscriptionPrice: 80, includesOnTag: true, subscriptionEligible: true, label: "value" },
  ] satisfies Offer[] as Offer[],
};
export type Interval = (typeof offerConfig.intervals)[number];

export const getOffer = (id: string) => offerConfig.offers.find((o) => o.id === id);
export const money = (n: number, currency: string = offerConfig.currency) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n);
/** Price for the chosen purchase type. Falls back to one-time when the offer cannot repeat. */
export const priceFor = (o: Offer, type: PurchaseType) => (type === "repeat" && o.subscriptionEligible && o.subscriptionPrice != null ? o.subscriptionPrice : o.oneTimePrice);
/** Always derived, never typed in. */
export const unitPrice = (o: Offer, type: PurchaseType = "one-time") => priceFor(o, type) / o.strips;
export const unitLabel = (o: Offer, type: PurchaseType = "one-time", currency: string = offerConfig.currency) => `${money(unitPrice(o, type), currency).replace(/(\.\d)$/, "$10")} per strip`;
/** Saving per delivery when repeating, derived from the two configured prices. 0 when not applicable. */
export const repeatSaving = (o: Offer) => (o.subscriptionEligible && o.subscriptionPrice != null ? o.oneTimePrice - o.subscriptionPrice : 0);
/** True only for the offer(s) whose one-time unit price is genuinely the lowest. */
export const isBestUnitValue = (o: Offer, list: Offer[] = offerConfig.offers) => unitPrice(o) <= Math.min(...list.map((x) => unitPrice(x))) + 1e-9;
export const contents = (o: Offer) => `${o.strips} strips${o.includesOnTag ? " + ON Tag" : ""}`;
