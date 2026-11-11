"use client";
import { useRef } from "react";
import { Logo, Swipe } from "./Brand";

/** Box N°01 — 80 × 35 × 110 mm, rebuilt live from the V2 French-first box spec (REF-05). Tilts toward the pointer. */
export function Box3D({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${28 + x * 34}deg`);
    el.style.setProperty("--rx", `${-6 - y * 10}deg`);
  };
  const leave = () => {
    ref.current?.style.removeProperty("--ry");
    ref.current?.style.removeProperty("--rx");
  };
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`box3d ${className}`} role="img" aria-label="Still ON. box N°01: bandelettes énergisantes, caffeine + L-theanine, mint, 30 strips">
      <div className="box3d-shadow" />
      <div className="box3d-inner" aria-hidden="true">
        <div className="box3d-face box3d-front px-[7cqw] pt-[7.5cqw]">
          <div className="flex items-start justify-between">
            <Logo decorative className="h-auto w-[52cqw]" />
            <span className="pt-[2cqw] text-[2.6cqw] font-extrabold">N°01</span>
          </div>
          <p className="mt-[5.5cqw] text-[5.5cqw] leading-none font-black tracking-[-0.03em] uppercase">Bandelettes énergisantes</p>
          <p className="mt-[1.6cqw] text-[2.9cqw] font-semibold tracking-[-0.01em]">
            Caféine + L-théanine · Menthe · <span className="font-medium text-grey/70">Energy strips</span>
          </p>
          <p className="mt-[14cqw] flex items-center text-[19cqw] leading-none font-black">
            F<Swipe className="ml-[2cqw] h-[13cqw] w-[58cqw]" />
          </p>
          <p className="mt-[1cqw] text-[15.6cqw] leading-none font-black tracking-[-0.055em] uppercase">L’ordinaire.</p>
          <p className="mt-[1.5cqw] text-[2.8cqw] font-medium text-grey/80">the ordinary.</p>
          <div className="absolute inset-x-[7cqw] bottom-[7cqw] flex justify-between border-t-[0.4cqw] border-ink pt-[2.4cqw] text-[2.7cqw] font-extrabold tracking-[0.02em] uppercase">
            <span>Menthe · Mint</span>
            <span>30 bandelettes · strips</span>
          </div>
        </div>
        <div className="box3d-face box3d-right px-[5cqw] pt-[9cqw]">
          <p className="text-[15cqw] leading-none font-black tracking-[-0.05em]">30</p>
          <p className="mt-[1.5cqw] text-[2.9cqw] leading-tight font-extrabold">bandelettes</p>
          <p className="text-[2.6cqw] font-medium text-grey/70">strips</p>
        </div>
        <div className="box3d-face box3d-left" />
        <div className="box3d-face box3d-top flex items-center px-[6cqw]">
          <p className="text-[3cqw] leading-tight font-extrabold tracking-[0.01em] uppercase">
            N°01 — Bandelettes · Ouvre. Dépose. <span className="text-pinktext">On.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
