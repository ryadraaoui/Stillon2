"use client";
import { useState } from "react";
import { FAQ } from "@/lib/site";

export function Faq({ limit, heading = true }: { limit?: number; heading?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = limit ? FAQ.slice(0, limit) : FAQ;
  return (
    <section id="faq" className="wrap bg-ivory py-24 md:py-36">
      <div className="grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-20">
        {heading && (
          <h2 className="display text-[15vw] md:sticky md:top-28 md:self-start md:text-[7.2vw]">
            Asked.
            <br />
            <span className="display-italic">Answered</span>
            <span className="text-pink">.</span>
          </h2>
        )}
        <div className="border-t-2 border-ink">
          {items.map((f, i) => {
            const on = open === i;
            return (
              <div key={f.q} className="border-b border-ink/15">
                <h3>
                  <button type="button" id={`faq-b-${i}`} aria-expanded={on} aria-controls={`faq-p-${i}`} onClick={() => setOpen(on ? null : i)} className="group flex w-full items-center justify-between gap-6 py-6 text-left">
                    <span className="text-xl font-black tracking-tight transition-colors group-hover:text-pinktext md:text-2xl">{f.q}</span>
                    <span className="relative h-4 w-4 flex-none" aria-hidden="true">
                      <span className="absolute top-1/2 left-0 h-[2.5px] w-full -translate-y-1/2 bg-ink" />
                      <span className={`absolute top-0 left-1/2 h-full w-[2.5px] -translate-x-1/2 bg-pink transition-transform duration-500 ${on ? "scale-y-0" : ""}`} />
                    </span>
                  </button>
                </h3>
                <div id={`faq-p-${i}`} role="region" aria-labelledby={`faq-b-${i}`} inert={!on} className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="max-w-[58ch] pb-7 text-[17px] text-grey">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
