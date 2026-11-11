"use client";
import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Sachet } from "./Sachet";
import { Box3D } from "./Box3D";
import rBox from "@/assets/render-box-scale.webp";
import rOpen from "@/assets/render-open.webp";
import rFan from "@/assets/render-fan.webp";
import rSide from "@/assets/render-side.webp";
import rStrip from "@/assets/render-strip.webp";

type View = { id: string; label: string; bg: string } & ({ kind: "box" | "front" | "back" } | { kind: "img"; src: StaticImageData; alt: string; fit?: string });
const VIEWS: View[] = [
  { id: "box", kind: "box", label: "The box", bg: "bg-bone" },
  { id: "front", kind: "front", label: "Sachet, front", bg: "bg-ivory" },
  { id: "back", kind: "back", label: "Sachet, back", bg: "bg-bone" },
  { id: "open", kind: "img", label: "Torn open", bg: "bg-pink", src: rOpen, alt: "Render: the sachet torn open on a pink background, the white strip rising out of the top.", fit: "object-cover" },
  { id: "scale", kind: "img", label: "To scale", bg: "bg-[#e6e3de]", src: rBox, alt: "Render: the box, 80 × 35 × 110 mm, beside two 5 × 7 cm sachets, to scale.", fit: "object-cover" },
  { id: "side", kind: "img", label: "Side, ~2 mm", bg: "bg-[#e8e4de]", src: rSide, alt: "Render: the sachet seen edge-on, about 2 mm thick.", fit: "object-cover" },
  { id: "fan", kind: "img", label: "Three, fanned", bg: "bg-[#131313]", src: rFan, alt: "Render: three sachets fanned out on black.", fit: "object-cover" },
  { id: "strip", kind: "img", label: "The strip", bg: "bg-[#f6f3ee]", src: rStrip, alt: "Render: the strip itself, a small white film with nothing printed on it.", fit: "object-cover" },
];

/** Priority 3. Product gallery: live box, live sachet (front/back), then the founder's own renders. Keyboard and swipe friendly. */
export function PdpGallery() {
  const [i, setI] = useState(0);
  const v = VIEWS[i];
  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") setI((n) => (n + 1) % VIEWS.length);
    if (e.key === "ArrowLeft") setI((n) => (n - 1 + VIEWS.length) % VIEWS.length);
  };
  return (
    <div className="flex min-w-0 flex-col gap-3 md:flex-row-reverse">
      <div className={`relative aspect-[4/5] flex-1 overflow-hidden rounded-2xl transition-colors duration-700 ${v.bg}`} aria-live="polite">
        {VIEWS.map((view, n) => (
          <div key={view.id} aria-hidden={n !== i} className={`absolute inset-0 grid place-items-center transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${n === i ? "opacity-100" : "pointer-events-none scale-[0.96] opacity-0"}`}>
            {view.kind === "box" && <Box3D className="w-[44%]" />}
            {view.kind === "front" && <Sachet className="w-[50%]" />}
            {view.kind === "back" && <Sachet side="back" className="w-[50%]" label="Back of the sachet: the three steps and the formula" />}
            {view.kind === "img" && <Image src={view.src} alt={view.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className={view.fit} priority={n < 2} />}
          </div>
        ))}
        <p className="eyebrow absolute bottom-4 left-4 rounded-full bg-ivory/90 px-3 py-2 text-ink backdrop-blur">
          <span className="text-pinktext">
            {String(i + 1).padStart(2, "0")}/{String(VIEWS.length).padStart(2, "0")}
          </span>{" "}
          {v.label}
        </p>
      </div>
      <div role="tablist" aria-label="Product views" aria-orientation="horizontal" onKeyDown={key} className="hscroll max-w-full gap-2 p-1 md:w-[84px] md:flex-col md:overflow-visible">
        {VIEWS.map((view, n) => (
          <button
            key={view.id}
            role="tab"
            type="button"
            aria-selected={n === i}
            aria-label={view.label}
            tabIndex={n === i ? 0 : -1}
            onClick={() => setI(n)}
            className={`relative grid h-[76px] w-[62px] flex-none place-items-center overflow-hidden rounded-lg transition-shadow md:h-[92px] md:w-full ${view.bg} ${n === i ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory" : "opacity-70 hover:opacity-100"}`}
          >
            {view.kind === "box" && <span className="text-[10px] font-black">BOX</span>}
            {view.kind === "front" && <Sachet className="w-[52%]" label="" />}
            {view.kind === "back" && <Sachet side="back" className="w-[52%]" label="" />}
            {view.kind === "img" && <Image src={view.src} alt="" fill sizes="80px" className="object-cover" />}
          </button>
        ))}
      </div>
    </div>
  );
}
