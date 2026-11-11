import Link from "next/link";
import { NAV, SITE } from "@/lib/site";
import { Logo } from "./Brand";

export function Footer() {
  return (
    <footer className="wrap border-t border-ink/10 bg-ivory pt-14 pb-8">
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display text-3xl md:text-4xl">
            Open. Strip. <span className="text-pink">On.</span>
          </p>
          <p className="mt-4 max-w-[36ch] text-sm text-grey">Caffeine + L-theanine energy strips. Mint. 30 to a box. From {SITE.city}.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-col items-start gap-2">
          <p className="eyebrow mb-2 text-grey">Explore</p>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="link-u text-[15px] font-bold">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-start gap-2">
          <p className="eyebrow mb-2 text-grey">More</p>
          <Link href="/#faq" className="link-u text-[15px] font-bold">
            FAQ
          </Link>
          <Link href="/#list" className="link-u text-[15px] font-bold">
            Launch list
          </Link>
        </div>
      </div>
      <Logo decorative className="mt-14 h-auto w-full select-none" />
      <div className="mt-8 flex flex-col gap-2 text-xs text-grey md:flex-row md:justify-between">
        <p>
          © {new Date().getFullYear()} Still ON. {SITE.city}.
        </p>
        <p>Contains caffeine: 50 mg per strip. Read the label before use.</p>
      </div>
    </footer>
  );
}
