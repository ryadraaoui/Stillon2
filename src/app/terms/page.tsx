import type { Metadata } from "next";
import { ContactLine, Legal } from "@/components/Legal";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <Legal title="Terms" updated="November 2026">
      <p>Still ON. is in prelaunch. This website presents the product and collects early-access signups. Nothing is for sale here yet.</p>
      <h2>Early access</h2>
      <p>Signing up is free and creates no obligation to buy. It means we may email you about the launch, as described in the Privacy Policy.</p>
      <h2>Product information</h2>
      <p>Product details on this site reflect the current packaging. The label on the product you receive is the authoritative source, including ingredients, amounts and directions for use.</p>
      <h2>Content</h2>
      <p>The Still ON. name, logo, packaging design, photography and text on this site belong to Still ON. and may not be reused without permission.</p>
      <h2>Sales</h2>
      <p>Terms of sale, including pricing, shipping and returns, will be published here before the shop opens.</p>
      <ContactLine />
    </Legal>
  );
}
