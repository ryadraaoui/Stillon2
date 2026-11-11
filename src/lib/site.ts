/** Single source of truth for product facts. Every value here comes from the founder's reference pack. */
export const SITE = {
  name: "Still ON.",
  tagline: "Caffeine + L-theanine energy strip",
  city: "Montréal",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const PRODUCT = {
  slug: "energy-strips",
  number: "N°01",
  nameFr: "Bandelettes énergisantes",
  nameEn: "Energy strips",
  flavourFr: "Menthe",
  flavourEn: "Mint",
  count: 30,
  box: { w: 80, d: 35, h: 110 }, // mm
  sachet: { w: 50, h: 70 }, // mm
  strip: { w: 22, h: 32 }, // mm, approximate (REF-07)
};

export const FORMULA = [
  { amount: "50", unit: "mg", fr: "Caféine", en: "Caffeine", note: "The headline act. 50 mg per strip, so you always know exactly how much you took." },
  { amount: "30", unit: "mg", fr: "L-théanine", en: "L-theanine", note: "An amino acid found naturally in tea leaves. Paired with the caffeine in every strip." },
  { amount: "1,3", unit: "mg", fr: "Vitamine B6", en: "Vitamin B6", note: "A B vitamin. 1.3 mg per strip." },
  { amount: "20", unit: "mcg", fr: "Vitamine B12", en: "Vitamin B12", note: "Another B vitamin. 20 mcg per strip." },
] as const;

export const NAV = [
  { href: "/products/energy-strips", label: "The strips" },
  { href: "/#how", label: "How it works" },
  { href: "/#formula", label: "Formula" },
  { href: "/#campaign", label: "Campaign" },
  { href: "/story", label: "Our story" },
] as const;

export const FAQ = [
  { q: "What is Still ON.?", a: "A caffeine + L-theanine energy strip. A thin white film, sealed in its own sachet. No can, no cup, no water." },
  { q: "How do I take it?", a: "Open the sachet. Put the strip on your tongue. Let it dissolve. That is the whole routine: ouvre, sur la langue, ON." },
  { q: "What is in one strip?", a: "Caffeine 50 mg, L-theanine 30 mg, vitamin B6 1.3 mg and vitamin B12 20 mcg. The amounts are printed on the back of every sachet." },
  { q: "What does it taste like?", a: "Mint. One flavour, N°01." },
  { q: "How big is it?", a: "The sachet is 5 × 7 cm, smaller than a credit card. The strip inside is about 22 × 32 mm, white, with nothing printed on it." },
  { q: "What comes in a box?", a: "30 strips, each sealed in its own sachet, in an 80 × 35 × 110 mm box." },
  { q: "How much caffeine is that, really?", a: "50 mg per strip. Check it against the rest of your day, and if you are sensitive to caffeine or unsure whether it is right for you, ask a health professional first." },
] as const;
