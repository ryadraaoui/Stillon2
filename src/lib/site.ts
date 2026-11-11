/** Single source of truth for product facts. Every value here comes from the founder's reference pack. */
export const SITE = {
  name: "Still ON.",
  tagline: "Dissolvable caffeine strips",
  city: "Montréal",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Optional. Footer links for these appear only when the value is set, so nothing dead or invented ships.
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
};

export const EARLY_ACCESS = "/#early-access";
export const CTA = "Get early access";

export const PRODUCT = {
  slug: "energy-strips",
  number: "N°01",
  nameFr: "Bandelettes énergisantes",
  nameEn: "Energy strips",
  flavourFr: "Menthe",
  flavourEn: "Mint",
  count: 30,
  box: { w: 80, d: 35, h: 110 }, // mm, supplier dieline
  sachet: { w: 50, h: 70 }, // mm
  // Strip dimensions are deliberately not published: the brief (3 × 3.5 cm) and the reference pack (~22 × 32 mm)
  // disagree. Add them here once the manufacturer file confirms one.
};

/** As printed on the back of the sachet (REF-03). The two leads first. */
export const FORMULA = [
  { amount: "50", unit: "mg", fr: "Caféine", en: "Caffeine", note: "50 mg in every strip. The number is printed on the sachet, so you always know what you took." },
  { amount: "30", unit: "mg", fr: "L-théanine", en: "L-theanine", note: "An amino acid found naturally in tea leaves. 30 mg in every strip." },
  { amount: "1.3", unit: "mg", fr: "Vitamine B6", en: "Vitamin B6", note: "" },
  { amount: "20", unit: "mcg", fr: "Vitamine B12", en: "Vitamin B12", note: "" },
] as const;

export const NAV = [
  { href: "/products/energy-strips", label: "Shop" },
  { href: "/story", label: "Our story" },
  { href: "/faq", label: "FAQ" },
] as const;

export const FAQ = [
  { q: "What is Still ON.?", a: "Caffeine, without the can. A thin white strip that dissolves on your tongue, with 50 mg of caffeine and 30 mg of L-theanine, sealed in its own sachet." },
  { q: "Why a strip instead of coffee or an energy drink?", a: "Because sometimes you want the caffeine and not the drink. A strip needs no cup, no can and no mixing, it fits in a pocket, and the amount is printed on every sachet. Coffee and energy drinks are still coffee and energy drinks; this is a different format, not a verdict on them." },
  { q: "Do I need water?", a: "No. The directions are to place one strip on your tongue and let it dissolve." },
  { q: "How do I take it?", a: "Open the sachet. Place the strip on your tongue. Let it dissolve." },
  { q: "What is in one strip?", a: "Caffeine 50 mg, L-theanine 30 mg, vitamin B6 1.3 mg and vitamin B12 20 mcg. The amounts are printed on the back of every sachet." },
  { q: "What does it taste like?", a: "Mint. One flavour, N°01." },
  { q: "How big is the sachet?", a: "5 × 7 cm, smaller than a credit card." },
  { q: "What comes in a box?", a: "30 strips, each sealed in its own sachet, in an 80 × 35 × 110 mm box." },
  { q: "Can I buy it now?", a: "Not yet. Still ON. is in prelaunch. Get early access and we will email you when it is available, with the price." },
  { q: "How much caffeine is that?", a: "50 mg per strip. Count it against the rest of your day. If you are sensitive to caffeine or unsure whether it is right for you, ask a health professional first." },
] as const;
