import type { Metadata } from "next";
import { ContactLine, Legal } from "@/components/Legal";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <Legal title="Privacy Policy" updated="November 2026">
      <p>This page describes what this website collects today, while Still ON. is in prelaunch.</p>
      <h2>What we collect</h2>
      <p>If you ask for early access, we collect the email address you enter, the fact that you ticked the consent box, the page you signed up from and the time.</p>
      <h2>Why</h2>
      <p>To email you about the Still ON. launch: when the product is available and what it costs. Nothing else.</p>
      <h2>Your choices</h2>
      <p>You can unsubscribe at any time using the link in any email we send, and you can ask us to delete your address.</p>
      <h2>What we do not do</h2>
      <p>We do not sell your email address. The cart on this site stores its contents in your own browser, not on our servers.</p>
      <h2>Payments</h2>
      <p>When the shop opens, payments will be processed by Stripe. Card details go to Stripe and never touch this website.</p>
      <ContactLine />
    </Legal>
  );
}
