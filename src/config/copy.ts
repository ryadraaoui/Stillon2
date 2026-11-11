/**
 * Message architecture, in one place: emotional promise → functional advantage → verified product facts.
 * Every fact below carries where it comes from. Anything without a source is NOT rendered (value: null)
 * and is listed in docs/CLAIMS.md as needing approval. Do not fill a null from memory or by inference.
 */
export const COPY_VARIANT = (process.env.NEXT_PUBLIC_COPY_VARIANT ?? "a") as "a" | "b";

export const MESSAGE = {
  promise: "The day isn’t done.", // emotional — brand line
  advantage: "Caffeine, without the can.", // functional — the reason the format exists
  // product explanation; variant "b" exists so the descriptor can be tested against "a" without a code change
  descriptor: { a: "Dissolvable caffeine strips. Made for whatever comes next.", b: "A caffeine strip that dissolves on your tongue. No drink to carry." }[COPY_VARIANT],
  campaign: "Not made to stop.",
  offer: "Your caffeine. Your call.",
  offerSupport: "One small strip. No drink to carry.",
} as const;

export type Benefit = { id: "no-water" | "measured" | "pocket" | "sealed"; title: string; line: string; source: string };
/** The four functional benefits. Zero sugar is deliberately absent: nothing in the reference pack verifies it. */
export const BENEFITS: Benefit[] = [
  { id: "no-water", title: "No water needed.", line: "No cup. No can. No mixing.", source: "Pack directions: “One strip on the tongue. Let it dissolve.”" },
  { id: "measured", title: "50 mg. Clearly measured.", line: "A known amount in every strip.", source: "Sachet back and box back: Caféine 50 mg per strip." },
  { id: "pocket", title: "Pocket-sized caffeine.", line: "5 × 7 cm. Small enough to come along.", source: "Sachet spec: 50 × 70 mm (founder; supplier to confirm)." },
  { id: "sealed", title: "Individually sealed.", line: "One strip per sachet. Thirty to a box.", source: "Sachet spec: 4-side seal, one strip per sachet, 30 per box." },
];

/** Using it: only rows with a value are shown. null = fact not yet supplied. */
export const USAGE_FACTS: { label: string; value: string | null; source?: string }[] = [
  { label: "How to take it", value: "Place one strip on your tongue and let it dissolve.", source: "Box back, mode d’emploi" },
  { label: "Flavour", value: "Mint", source: "Sachet and box" },
  { label: "Format", value: "One strip per sachet, sealed on four sides", source: "Sachet spec" },
  { label: "The strip", value: "White, matte, nothing printed on it", source: "REF-07 strip sample" },
  { label: "Time to dissolve", value: null },
  { label: "Texture", value: null },
  { label: "Aftertaste", value: null },
  { label: "Storage", value: null },
  { label: "Sugar", value: null },
];

/**
 * Format comparison for the product page. It compares formats, not quality or effect, and it is meant to be fair:
 * drinks are portable too, and many products state their caffeine. A sugar row is omitted until verified.
 */
export const COMPARISON = {
  columns: ["Still ON. strip", "Coffee", "Energy drink"],
  rows: [
    ["Needs a drink", "No. The strip is the serving", "It is the drink", "It is the drink"],
    ["Preparation", "Open the sachet", "Brewed or bought", "Opened"],
    ["What you carry", "A 5 × 7 cm sachet", "A cup or flask", "A can or bottle"],
    ["Caffeine per serving", "50 mg, printed on every sachet", "Varies with the drink and its size", "Stated on the pack; varies by product"],
  ],
  note: "Coffee and energy drinks travel too, and plenty of products state their caffeine. The difference here is the format: a strip instead of a drink.",
} as const;
