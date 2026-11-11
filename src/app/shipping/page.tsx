import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, Legal } from "@/components/Legal";
import { CTA, EARLY_ACCESS } from "@/lib/site";

export const metadata: Metadata = { title: "Shipping & returns", alternates: { canonical: "/shipping" } };

export default function Shipping() {
  return (
    <Legal title="Shipping & returns" updated="November 2026">
      <p>We are not shipping yet. Still ON. is in prelaunch.</p>
      <p>Shipping destinations, costs, delivery times and the returns policy will be published on this page before the shop opens.</p>
      <p>
        <Link href={EARLY_ACCESS} className="btn btn-ink mt-4">
          {CTA}
        </Link>
      </p>
      <ContactLine />
    </Legal>
  );
}
