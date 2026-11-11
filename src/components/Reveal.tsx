"use client";
import { useEffect, useRef } from "react";

/** Adds .is-in when the element scrolls into view. Variants are styled in globals.css (.rv, .rv-img, lines). */
export function Reveal({
  as = "div",
  variant = "rv",
  delay = 0,
  className = "",
  children,
  ...rest
}: { as?: keyof React.JSX.IntrinsicElements; variant?: "rv" | "rv-img" | "lines"; delay?: number; className?: string; children?: React.ReactNode } & Record<string, unknown>) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as "div";
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`${variant === "lines" ? "" : variant} ${className}`} style={{ "--d": `${delay}ms` } as React.CSSProperties} {...rest}>
      {children}
    </Tag>
  );
}

/** A headline line that slides up out of a mask. Use inside <Reveal variant="lines">. */
export function Line({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <span className={`rv-line ${className}`} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      <span>{children}</span>
    </span>
  );
}
