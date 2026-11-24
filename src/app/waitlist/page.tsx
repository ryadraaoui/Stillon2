import type { Metadata } from "next";
import { Waitlist } from "@/components/Waitlist";
import { klaviyoListCount } from "@/lib/klaviyo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Join the waitlist",
  description: "Caffeine, without the can. Still ON. N°01 is a 50 mg caffeine strip that dissolves on your tongue. Join the waitlist: the launch date, the price and the first orders go to the list first.",
  alternates: { canonical: "/waitlist" },
  openGraph: { title: "Still ON. — Get it first.", description: "Caffeine, without the can. Join the waitlist.", url: "/waitlist" },
  twitter: { card: "summary_large_image", title: "Still ON. — Get it first.", description: "Caffeine, without the can. Join the waitlist." },
};

/**
 * First-look date for the countdown. Campaign plan: product reveal on Dec 22, 2026.
 * Override with NEXT_PUBLIC_WAITLIST_REVEAL_AT (ISO date), or set it to "off" to hide the countdown.
 */
const REVEAL_AT = process.env.NEXT_PUBLIC_WAITLIST_REVEAL_AT ?? "2026-12-22T12:00:00-05:00";

export default async function WaitlistPage() {
  const count = await klaviyoListCount();
  return <Waitlist count={count} revealAt={REVEAL_AT === "off" ? null : REVEAL_AT} />;
}
