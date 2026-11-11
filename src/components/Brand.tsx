import Image from "next/image";
import logo from "@/assets/logo.png";
import logoLight from "@/assets/logo-light.png";

/** The one real logo (REF-01), colour-keyed from the supplied raster. Use on ivory or light surfaces only. */
export function Logo({ className = "", priority = false, decorative = false, light = false }: { className?: string; priority?: boolean; decorative?: boolean; light?: boolean }) {
  // light: "Still" in warm ivory for dark surfaces (the nav capsule). Same shapes, same pink "ON."
  return <Image src={light ? logoLight : logo} alt={decorative ? "" : "Still ON."} aria-hidden={decorative || undefined} className={className} priority={priority} sizes="(max-width: 768px) 60vw, 40vw" />;
}

/** The dry-brush censor swipe from the pack ("F▮ L'ORDINAIRE."). */
export function Swipe({ className = "", color = "var(--color-pink)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 34" className={className} aria-hidden="true" preserveAspectRatio="none">
      <path fill={color} d="M2.5 5.5C20 3 62 4.200 96.500 2.500l2.400 5.200-3.900 2.500 4.300 3.600-3.300 4.200 3.400 4.100-4.100 3.300 2 4.300C62 32.500 26 31.200 3.200 31.400L.8 25l3.300-5.400-2.900-6.200z" />
      <path fill="#fff" opacity=".16" d="M8 9.500h70l-2 1.200H9zM14 24h62l-3 1.100H15z" />
    </svg>
  );
}

/** "F▮" censor device. Reads as "F" to assistive tech with the swipe hidden. */
export function Censor({ className = "", swipeClass = "" }: { className?: string; swipeClass?: string }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap ${className}`}>
      F<Swipe className={`ml-[0.06em] inline-block h-[0.62em] w-[1.5em] ${swipeClass}`} />
    </span>
  );
}
