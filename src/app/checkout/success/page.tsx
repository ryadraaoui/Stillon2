import type { Metadata } from "next";
import Link from "next/link";
import { stripe, stripeConfigured } from "@/lib/commerce";
import { ClearCart } from "./ClearCart";

export const metadata: Metadata = { title: "Order", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Confirms the order only if Stripe says the session is paid. Never shows a success state on trust. */
export default async function Success({ searchParams }: PageProps<"/checkout/success">) {
  const { session_id } = await searchParams;
  let paid = false;
  let email: string | null = null;
  if (stripeConfigured() && typeof session_id === "string" && /^cs_[A-Za-z0-9_]+$/.test(session_id)) {
    try {
      const s = await stripe(`checkout/sessions/${session_id}`);
      paid = s?.payment_status === "paid";
      email = s?.customer_details?.email ?? null;
    } catch (e) {
      console.error("[checkout/success]", e);
    }
  }
  return (
    <section className="wrap flex min-h-[86svh] flex-col justify-center bg-ivory pt-[var(--header-h)]">
      {paid ? (
        <>
          <ClearCart />
          <p className="eyebrow mb-5 text-pinktext">Order confirmed</p>
          <h1 className="display display-italic text-[18vw] md:text-[11vw]">
            You’re on<span className="text-pink">.</span>
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg text-grey">Payment received. {email ? `A receipt is on its way to ${email}.` : "A receipt is on its way to your inbox."}</p>
        </>
      ) : (
        <>
          <p className="eyebrow mb-5 text-grey">Checkout</p>
          <h1 className="display text-[14vw] md:text-[8vw]">
            We can’t confirm that order<span className="text-pink">.</span>
          </h1>
          <p className="mt-6 max-w-[48ch] text-lg text-grey">We couldn&apos;t verify a completed payment for this link. If you were charged, your receipt email is the proof of purchase. Otherwise your cart is untouched.</p>
        </>
      )}
      <Link href="/" className="btn btn-ink mt-9 self-start">
        Back to the site
      </Link>
    </section>
  );
}
