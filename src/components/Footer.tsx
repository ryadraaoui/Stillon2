import Link from "next/link";
import { CTA, EARLY_ACCESS, SITE } from "@/lib/site";
import { Logo } from "./Brand";

export function Footer() {
  const links: [string, string][] = [
    ["/products/energy-strips", "The strips"],
    ["/story", "Our story"],
    ["/faq", "FAQ"],
    ["/shipping", "Shipping & returns"],
  ];
  const l = "link-u py-1 text-sm font-bold";
  return (
    <footer className="wrap bg-ivory pt-12 pb-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/" aria-label="Still ON. — home">
            <Logo decorative className="h-8 w-auto" />
          </Link>
          <p className="mt-3 text-sm text-grey">{SITE.tagline}.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-1">
          {links.map(([h, t]) => (
            <Link key={h} href={h} className={l}>
              {t}
            </Link>
          ))}
          {SITE.contactEmail && (
            <a href={`mailto:${SITE.contactEmail}`} className={l}>
              Contact
            </a>
          )}
          {SITE.instagram && (
            <a href={SITE.instagram} className={l} rel="noopener noreferrer" target="_blank">
              Instagram
            </a>
          )}
          <Link href={EARLY_ACCESS} className={`${l} text-pinkdeep`}>
            {CTA}
          </Link>
        </nav>
      </div>
      <div className="mt-10 flex flex-col gap-2 border-t border-ink/10 pt-5 text-xs text-grey md:flex-row md:justify-between">
        <p>
          © {new Date().getFullYear()} Still ON. · Contains caffeine: 50 mg per strip. Read the label before use.
        </p>
        <p className="flex gap-5">
          <Link href="/privacy" className="link-u">
            Privacy Policy
          </Link>
          <Link href="/terms" className="link-u">
            Terms
          </Link>
        </p>
      </div>
    </footer>
  );
}
