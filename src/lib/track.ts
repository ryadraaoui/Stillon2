/**
 * Measurement hook. No analytics product is connected to this project yet, so this only:
 *  - pushes to window.dataLayer when one exists (Google Tag Manager and most tools read it), and
 *  - fires a "stillon:track" DOM event you can listen to.
 * Never pass an email address or any other personal data: events carry choices, not people.
 */
export type TrackEvent =
  | "hero_cta_click"
  | "product_discovery"
  | "product_reveal_complete"
  | "benefits_view"
  | "product_page_view"
  | "offer_impression"
  | "offer_select"
  | "purchase_type_select"
  | "frequency_select"
  | "checkout_start"
  | "early_access_submit"
  | "early_access_success"
  | "early_access_error";

export function track(event: TrackEvent, props: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, copy_variant: process.env.NEXT_PUBLIC_COPY_VARIANT ?? "a", ...props };
  const w = window as unknown as { dataLayer?: unknown[] };
  if (Array.isArray(w.dataLayer)) w.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("stillon:track", { detail: payload }));
}
