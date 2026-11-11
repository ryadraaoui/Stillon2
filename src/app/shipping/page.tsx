import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, Legal } from "@/components/Legal";
import { EARLY_ACCESS } from "@/lib/site";
import { getCommerce } from "@/lib/commerce";

export const metadata: Metadata = { title: "Shipping & returns", alternates: { canonical: "/shipping" } };

export default async function Shipping() {
  const shop = (await getCommerce()).mode === "shopify";
  return (
    <Legal title="Shipping & returns" updated="November 2026">
      {shop ? (
        <>
          <p>Shipping destinations, rates and delivery times are calculated at checkout, based on where you are sending your order.</p>
          <p>Returns terms for this product will be listed here and in your order confirmation.</p>
        </>
      ) : (
        <>
          <p>We are not shipping yet. Still ON. is in prelaunch.</p>
          <p>Shipping destinations, costs, delivery times and the returns policy will be published on this page before the shop opens.</p>
          <p>
            <Link href={EARLY_ACCESS} className="btn btn-ink mt-4">
              Get early access
            </Link>
          </p>
        </>
      )}
      <ContactLine />
    </Legal>
  );
}
