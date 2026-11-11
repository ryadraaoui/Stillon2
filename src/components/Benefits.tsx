"use client";
import { useEffect, useRef } from "react";
import { BENEFITS, type Benefit } from "@/config/copy";
import { track } from "@/lib/track";

/** One stroke weight, one size, drawn for this product rather than pulled from an icon set. */
function Glyph({ id }: { id: Benefit["id"] }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      {id === "no-water" && (
        <>
          <path {...p} d="M9 9h14l-1.600 15.200a2 2 0 0 1-2 1.800h-6.800a2 2 0 0 1-2-1.800z" />
          <path {...p} d="M10 14h12" />
          <path d="M5 27 27 5" fill="none" stroke="var(--color-pink)" strokeWidth="1.800" strokeLinecap="round" />
        </>
      )}
      {id === "measured" && (
        <>
          <rect {...p} x="9" y="5" width="14" height="22" rx="2" />
          <path {...p} d="M9 11h4M9 16h6M9 21h4" />
          <path d="M19 16h1" fill="none" stroke="var(--color-pink)" strokeWidth="2.400" strokeLinecap="round" />
        </>
      )}
      {id === "pocket" && (
        <>
          <path {...p} d="M6 8h20v9a10 10 0 0 1-20 0z" />
          <path {...p} d="M6 12h20" />
          <rect x="13" y="4.500" width="6" height="9" rx="1" fill="#fff" stroke="var(--color-pink)" strokeWidth="1.500" />
        </>
      )}
      {id === "sealed" && (
        <>
          <rect {...p} x="8" y="4" width="16" height="24" rx="1.500" />
          <path d="M8 9h16" fill="none" stroke="var(--color-pink)" strokeWidth="1.500" strokeDasharray="2 1.800" />
          <path {...p} d="M12 15h8M12 19h5" />
        </>
      )}
    </svg>
  );
}

/**
 * The four functional benefits as one compact strip. It sits at the end of the product reveal (same section)
 * and on the product page. Understandable at a glance: pictogram, short headline, one line.
 */
export function Benefits({ source, className = "" }: { source: string; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (track("benefits_view", { source }), io.disconnect()), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [source]);
  return (
    <ul ref={ref} data-testid="benefits" className={`grid grid-cols-2 border-t-2 border-ink lg:grid-cols-4 ${className}`}>
      {BENEFITS.map((b, i) => (
        <li key={b.id} className={`flex flex-col gap-3 py-6 pr-4 lg:py-8 lg:pr-8 ${i % 2 ? "max-lg:border-l max-lg:border-ink/15 max-lg:pl-4" : ""} ${i > 1 ? "max-lg:border-t max-lg:border-ink/15" : ""} ${i ? "lg:border-l lg:border-ink/15 lg:pl-8" : ""}`}>
          <Glyph id={b.id} />
          <div>
            <h3 className="text-[15px] leading-tight font-black tracking-[-0.01em] uppercase lg:text-[19px]">{b.title}</h3>
            <p className="mt-2 text-[13px] leading-snug text-grey lg:text-[15px]">{b.line}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
