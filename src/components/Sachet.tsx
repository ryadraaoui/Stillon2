import { forwardRef } from "react";
import { Logo, Swipe } from "./Brand";

/**
 * The Still ON. sachet, rebuilt as live vector artwork from REF-02 / REF-03 / REF-04:
 * 5 × 7 cm, matte warm ivory, 4-side crimped seal, pink dashed tear line, Inter Tight, black + pink.
 * Sized by its container width; every measurement inside is in container units so it stays exact at any size.
 */
type Props = { className?: string; open?: boolean; side?: "front" | "back"; label?: string; style?: React.CSSProperties };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="sachet-cap" data-sachet-cap />
      <div className="sachet-body">
        <div className="sachet-side ridge-h left-0" />
        <div className="sachet-side ridge-h right-0" />
        <div className="sachet-foot ridge-v" />
        <div className="sachet-panel" />
        <div className="sachet-tear" />
        <div className="sachet-notch" />
        <div className="sachet-copy">{children}</div>
      </div>
    </>
  );
}

export const Sachet = forwardRef<HTMLDivElement, Props>(function Sachet({ className = "", open = false, side = "front", label, style }, ref) {
  return (
    <div
      ref={ref}
      className={`sachet ${className}`}
      style={style}
      role="img"
      aria-label={label ?? "Still ON. sachet: bandelette énergisante, one energy strip. Tear here."}
    >
      <div className="sachet-3d" data-sachet-3d style={side === "back" ? { transform: "rotateY(180deg)" } : undefined} aria-hidden="true">
        <div className={`sachet-face sachet-front ${open ? "[&_.sachet-cap]:opacity-0" : ""}`}>
          <Shell>
            <Logo decorative className="top-[7.5%] !right-auto h-auto w-[62%]" />
            <p className="top-[22.5%] text-[6.5cqw] leading-[1.02] font-extrabold tracking-[-0.01em] uppercase">
              Bandelette
              <br />
              Énergisante
            </p>
            <p className="top-[37%] text-[4.3cqw] font-medium tracking-[-0.01em] text-grey/70">
              <span className="font-semibold text-grey">1 bandelette</span> · energy strip
            </p>
            <p className="top-[45.5%] flex items-center text-[11.4cqw] leading-none font-black tracking-[-0.03em]">
              F<Swipe className="ml-[1cqw] h-[7.6cqw] w-[17cqw]" />
            </p>
            <p className="top-[56%] text-[11.4cqw] leading-none font-black tracking-[-0.045em] uppercase">L’ordinaire.</p>
            <p className="bottom-[8.5%] text-[4.3cqw] font-extrabold tracking-[0.01em] uppercase">
              Déchirer ici ↑ <span className="font-medium tracking-normal text-grey/70 normal-case">tear here</span>
            </p>
          </Shell>
        </div>
        <div className="sachet-face sachet-back">
          <Shell>
            {[
              ["1", "Ouvre.", "open."],
              ["2", "Sur la langue.", "on the tongue."],
              ["3", "On.", ""],
            ].map(([n, fr, en], i) => (
              <p key={n} className="flex items-baseline gap-[2.6cqw]" style={{ top: `${8 + i * 11.5}%` }}>
                <span className="w-[6cqw] text-[9.4cqw] leading-none font-black text-pinktext">{n}</span>
                <span className="text-[5.5cqw] leading-[1.1] font-extrabold tracking-[-0.02em] uppercase">
                  {fr} <span className="text-[3.9cqw] font-medium tracking-normal text-grey/70 normal-case">{en}</span>
                </span>
              </p>
            ))}
            <p className="top-[46%] text-[4.25cqw] leading-[1.45] font-medium tracking-[-0.01em] text-grey">
              Caféine 50 mg · L-théanine 30 mg
              <br />
              Vit. B6 1,3 mg · Vit. B12 20 mcg
              <br />
              Saveur menthe · Mint
            </p>
            <p className="top-[69%] border-[0.3cqw] border-dashed border-grey/50 py-[2cqw] text-center text-[3.6cqw] font-medium text-grey/80">Lot · EXP</p>
            <div className="bottom-[7.5%] flex items-end justify-between">
              <Logo decorative className="h-auto w-[30%]" />
              <span className="text-[5cqw] leading-none font-black tracking-[-0.04em] text-pink italic">ON.</span>
            </div>
          </Shell>
        </div>
      </div>
    </div>
  );
});

/** The strip itself: ~22 × 32 mm, white, matte, nothing printed on it (REF-07). */
export const Strip = forwardRef<HTMLDivElement, { className?: string; style?: React.CSSProperties } & Record<`data-${string}`, string | boolean>>(function Strip({ className = "", style, ...rest }, ref) {
  return (
    <div
      ref={ref}
      {...rest}
      role="img"
      aria-label="The strip: a small white film, nothing printed on it"
      className={`aspect-[22/32] rounded-[7%/5%] ${className}`}
      style={{
        background: "linear-gradient(115deg, #ffffff 0%, #f6f6f4 38%, #ffffff 52%, #ecebe8 100%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.9), inset 0 0 14px rgba(120,110,100,.12), 0 10px 30px rgba(30,20,10,.18)",
        ...style,
      }}
    />
  );
});
