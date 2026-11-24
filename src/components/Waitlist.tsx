"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WaitlistForm } from "./WaitlistForm";
import { Sachet } from "./Sachet";
import { Censor } from "./Brand";
import { Reveal, Line } from "./Reveal";
import { FORMULA } from "@/lib/site";
import { BENEFITS } from "@/config/copy";
import { track } from "@/lib/track";
import hero from "@/assets/bw-hero.webp";
import boxer from "@/assets/bw-boxer.webp";
import runner from "@/assets/bw-runner.webp";
import cyclist from "@/assets/bw-cyclist.webp";
import shades from "@/assets/bw-shades.webp";
import closing from "@/assets/bw-closing.webp";

gsap.registerPlugin(ScrollTrigger);

/** Count down to a real date only. Renders nothing before hydration (no mismatched numbers) or after the date. */
function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  if (!Number.isFinite(target) || now === null || now >= target) return null;
  const s = Math.floor((target - now) / 1000);
  const parts: [number, string][] = [
    [Math.floor(s / 86400), "days"],
    [Math.floor((s % 86400) / 3600), "hrs"],
    [Math.floor((s % 3600) / 60), "min"],
    [s % 60, "sec"],
  ];
  return (
    <div className="flex items-end gap-4 md:gap-6" data-testid="countdown" aria-label={`First look in ${parts[0][0]} days`}>
      {parts.map(([n, l]) => (
        <div key={l} className="text-center">
          <div className="text-[34px] leading-none font-black tracking-[-0.04em] tabular-nums md:text-[44px]">{String(n).padStart(2, "0")}</div>
          <div className="eyebrow mt-1.5 text-ivory/55">{l}</div>
        </div>
      ))}
    </div>
  );
}

const TICKER = ["No water needed", "50 mg, clearly measured", "Pocket-sized", "Individually sealed", "Mint", "N°01"];
function Ticker({ className = "" }: { className?: string }) {
  const row = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {TICKER.map((t) => (
        <span key={t} className="flex items-center">
          <span className="px-6 md:px-9">{t}</span>
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-pink" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`wl-ticker overflow-hidden whitespace-nowrap ${className}`}>
      <p className="sr-only">{TICKER.join(", ")}.</p>
      <div className="wl-ticker-track flex w-max">
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}

const PERKS = [
  { n: "01", t: "The date. First.", l: "You hear when N°01 goes on sale before it’s posted anywhere." },
  { n: "02", t: "The price. First.", l: "The bundles and what they cost land in your inbox before the public page." },
  { n: "03", t: "The first orders.", l: "The link to order reaches the list before it goes public." },
];

const FRAMES = [
  { src: boxer, alt: "Black-and-white, direct flash: a boxer sits forward between rounds, hands wrapped, one pink band at the wrist, a white strip held between two fingers.", t: "05:40" },
  { src: runner, alt: "Black-and-white, direct flash: a sprinter runs straight at the camera, a blank pink bib on her top.", t: "06:15" },
  { src: cyclist, alt: "Black-and-white, direct flash: a cyclist in a silver helmet and dark wraparound glasses stares into the lens.", t: "18:04" },
  { src: shades, alt: "Black-and-white, direct flash: a woman in tinted glasses places a strip on her tongue.", t: "23:50" },
];

/**
 * /waitlist — the campaign landing page. One job: an email on the list.
 * Every section ends in the same action; nothing else on the page asks for anything.
 * Motion: GSAP entrance + scroll scrubs on desktop, all of it skipped under reduced motion.
 * Social proof is the real Klaviyo count, shown only once it is worth showing; never a made-up number.
 */
export function Waitlist({ count, revealAt }: { count: number | null; revealAt: string | null }) {
  const root = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    track("waitlist_view");
    // the mobile join bar shows once the hero form has scrolled away, and hides whenever a form is on screen
    const forms = [...document.querySelectorAll("[data-wl-form]")];
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting));
      const anyVisible = [...seen.values()].some(Boolean);
      const pastHero = window.scrollY > window.innerHeight * 0.6;
      setSticky(!anyVisible && pastHero);
    }, { threshold: 0 });
    forms.forEach((f) => io.observe(f));
    const onScroll = () => {
      const anyVisible = [...seen.values()].some(Boolean);
      setSticky(!anyVisible && window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from("[data-wl-img]", { scale: 1.18, opacity: 0, duration: 1.8 }, 0)
        .from("[data-wl-line] > span", { yPercent: 110, duration: 1.1, stagger: 0.09 }, 0.15)
        .from("[data-wl-swipe]", { scaleX: 0, transformOrigin: "left center", duration: 0.7, ease: "power4.inOut" }, 0.75)
        .from("[data-wl-up]", { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 }, 0.7)
        .from("[data-wl-sachet]", { y: -120, opacity: 0, rotate: -40, duration: 1.4 }, 0.45);
      // hero photo sinks, the giant ON. drifts the other way
      gsap.to("[data-wl-img]", { yPercent: 12, ease: "none", scrollTrigger: { trigger: "[data-wl-hero]", start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-wl-ghost]", { xPercent: -18, ease: "none", scrollTrigger: { trigger: "[data-wl-hero]", start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-wl-sachet]", { y: 160, rotate: 28, ease: "none", scrollTrigger: { trigger: "[data-wl-hero]", start: "top top", end: "bottom top", scrub: true } });
      // the manifesto line fills in word by word as it scrolls through
      gsap.fromTo("[data-wl-word]", { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: "[data-wl-manifesto]", start: "top 75%", end: "bottom 45%", scrub: true } });
      // frames slide sideways at different speeds
      gsap.utils.toArray<HTMLElement>("[data-wl-frame]").forEach((f, i) => {
        gsap.fromTo(f, { y: 80 + i * 40 }, { y: -40 - i * 30, ease: "none", scrollTrigger: { trigger: "[data-wl-frames]", start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.fromTo("[data-wl-big]", { scale: 0.7, opacity: 0.2 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: "[data-wl-formula]", start: "top 85%", end: "center 55%", scrub: true } });
      // pointer tilt on the sachet
      const s = el.querySelector<HTMLElement>("[data-wl-sachet] [data-sachet-3d]");
      if (s) {
        const rx = gsap.quickTo(s, "rotationX", { duration: 0.8, ease: "power3" });
        const ry = gsap.quickTo(s, "rotationY", { duration: 0.8, ease: "power3" });
        const move = (e: PointerEvent) => {
          if (e.pointerType === "touch") return;
          ry((e.clientX / window.innerWidth - 0.5) * 50);
          rx(-(e.clientY / window.innerHeight - 0.5) * 30);
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      }
    }, el);
    return () => mm.revert();
  }, []);

  const showCount = count !== null && count >= Number(process.env.NEXT_PUBLIC_WAITLIST_SHOW_COUNT_FROM ?? 100);
  const manifesto = "Not made to stop. Made for the 5:40 alarm, the second session, the last train, the shift that runs over. One strip. No can. The day isn’t done.".split(" ");
  const [caf, the] = FORMULA;

  return (
    <div ref={root} className="bg-ink text-ivory">
      {/* ───────────── 01 HERO: the offer and the form, above the fold ───────────── */}
      <section data-wl-hero data-nav-tone="dark" className="wl-grain relative flex min-h-[100svh] flex-col overflow-hidden pt-[var(--header-h)]">
        <div className="absolute inset-x-0 top-0 h-[58svh] overflow-hidden md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-[56%]">
          <Image data-wl-img src={hero} alt="" priority fetchPriority="high" fill sizes="(max-width: 768px) 100vw, 56vw" className="object-cover object-[50%_30%] md:object-[42%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent md:bg-gradient-to-r md:from-ink md:via-ink/10 md:to-transparent" />
        </div>
        <div aria-hidden="true" data-wl-ghost className="wl-ghost pointer-events-none absolute -right-[8vw] bottom-[10vh] select-none">
          ON.
        </div>
        <div data-wl-sachet className="pointer-events-none absolute top-[calc(var(--header-h)+11svh)] right-[4vw] z-20 w-[19vw] max-w-[110px] md:top-[15%] md:right-[3.5%] md:w-[10vw] md:max-w-[180px]">
          <Sachet className="float w-full" style={{ "--r": "12deg" } as React.CSSProperties} />
        </div>

        <div className="wrap relative z-10 flex flex-1 flex-col justify-end pt-10 pb-10 md:pb-14">
          <p data-wl-up className="eyebrow mb-5 flex items-center gap-2.5 text-ivory/80">
            <span className="wl-pulse inline-block h-2 w-2 rounded-full bg-pink" /> Waitlist open · N°01 Energy strips
          </p>
          <h1 className="display display-italic text-[21vw] leading-[0.82] md:text-[10.4vw]">
            <span data-wl-line className="block overflow-hidden pr-[0.1em] pb-[0.06em]">
              <span className="block">Get it</span>
            </span>
            <span data-wl-line className="block overflow-hidden pr-[0.1em] pb-[0.06em]">
              <span className="block">
                first<span className="text-pink">.</span>
              </span>
            </span>
          </h1>
          <p data-wl-up className="display mt-5 text-[6.4vw] leading-none md:text-[2.5vw]">
            Caffeine, without the{" "}
            <span className="relative isolate inline-block px-[0.08em] text-white">
              <span data-wl-swipe aria-hidden="true" className="absolute inset-x-0 top-[0.06em] bottom-[-0.04em] -z-10 -skew-x-6 bg-pink" />
              can.
            </span>
          </p>
          <p data-wl-up className="mt-5 max-w-[46ch] text-[16px] leading-snug font-semibold text-ivory/80 md:text-[18px]">
            A 50 mg caffeine strip that dissolves on your tongue. Join the waitlist: the launch date, the price and the first orders go to the list before anywhere else.
          </p>
          <div data-wl-up data-wl-form id="join" className="mt-7 scroll-mt-[calc(var(--header-h)+24px)]">
            <WaitlistForm source="waitlist-hero" tone="dark" />
          </div>
          <div data-wl-up className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {revealAt ? (
              <div>
                <p className="eyebrow mb-3 text-pink">First look in</p>
                <Countdown to={revealAt} />
              </div>
            ) : (
              <span />
            )}
            {showCount && (
              <p className="text-[15px] font-bold text-ivory/80" data-testid="waitlist-count">
                <span className="text-2xl font-black text-ivory tabular-nums">{count!.toLocaleString("en-US")}</span> people already in line.
              </p>
            )}
          </div>
        </div>
        <Ticker className="relative z-10 border-t border-ivory/15 py-4 text-[13px] font-extrabold tracking-[0.14em] uppercase md:text-[15px]" />
      </section>

      {/* ───────────── 02 MANIFESTO: the reason, scrubbed in word by word ───────────── */}
      <section data-nav-tone="dark" data-wl-manifesto className="wrap py-28 md:py-44">
        <p className="eyebrow mb-8 text-pink">Why it exists</p>
        <p className="display max-w-[16ch] text-[11vw] leading-[0.9] md:text-[6.6vw]">
          {manifesto.map((w, i) => (
            <span key={i} data-wl-word className={`inline-block pr-[0.22em] ${w.startsWith("done") || w === "can." ? "display-italic text-pink" : ""}`}>
              {w}
            </span>
          ))}
        </p>
      </section>

      {/* ───────────── 03 FRAMES: the hours nobody sees ───────────── */}
      <section data-nav-tone="dark" data-wl-frames className="relative overflow-hidden pb-24 md:pb-40">
        <div className="wrap mb-10 flex items-end justify-between gap-6 md:mb-14">
          <Reveal as="h2" variant="lines" className="display text-[13vw] md:text-[6.4vw]">
            <Line>The hours</Line>
            <Line delay={90}>
              <span className="display-italic">nobody sees</span>
              <span className="text-pink">.</span>
            </Line>
          </Reveal>
        </div>
        <div className="wrap grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {FRAMES.map((f, i) => (
            <figure key={f.t} data-wl-frame className={`relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#1b1b1b] ${i % 2 ? "md:mt-24" : ""}`}>
              <Image src={f.src} alt={f.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover grayscale transition-transform duration-[1.4s] ease-[cubic-bezier(.22,1,.36,1)] hover:scale-105" />
              <figcaption className="absolute top-3 left-3 rounded-full bg-ink/70 px-3 py-1.5 text-[12px] font-black tracking-[0.08em] tabular-nums backdrop-blur">
                <span className="text-pink">●</span> {f.t}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ───────────── 04 WHAT THE LIST GETS ───────────── */}
      <section className="wrap bg-ivory py-24 text-ink md:py-36">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal as="h2" variant="lines" className="display text-[14vw] md:text-[7vw]">
            <Line>On the list,</Line>
            <Line delay={90}>
              <span className="display-italic">you’re early</span>
              <span className="text-pink">.</span>
            </Line>
          </Reveal>
          <Reveal className="max-w-[34ch] text-[16px] font-semibold text-ink/70 md:pb-3 md:text-right">One email when it matters. No daily newsletter, no spam.</Reveal>
        </div>
        <ol className="mt-12 border-t-2 border-ink md:mt-16">
          {PERKS.map((p, i) => (
            <Reveal as="li" key={p.n} delay={i * 90} className="wl-row group grid grid-cols-[auto_1fr] items-baseline gap-x-6 border-b border-ink/15 py-7 md:grid-cols-[120px_1fr_1fr] md:py-10">
              <span className="text-[13px] font-black tracking-[0.1em] text-pinkdeep tabular-nums">{p.n}</span>
              <span className="display text-[9vw] leading-none transition-colors duration-300 group-hover:text-pink md:text-[3.6vw]">{p.t}</span>
              <span className="col-start-2 mt-3 max-w-[44ch] text-[16px] text-grey md:col-start-3 md:mt-0">{p.l}</span>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ───────────── 05 THE PRODUCT IN FOUR LINES + FORMULA ───────────── */}
      <section data-wl-formula className="wrap overflow-hidden bg-white py-24 text-ink md:py-36">
        <div className="grid gap-14 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <p className="eyebrow mb-6 text-grey">Per strip · As printed on pack</p>
            <div data-wl-big className="flex items-end gap-6 md:gap-10">
              <div>
                <div className="text-[38vw] leading-[0.76] font-black tracking-[-0.07em] tabular-nums md:text-[17vw]">
                  {caf.amount}
                  <span className="ml-1 text-[0.2em] tracking-normal">{caf.unit}</span>
                </div>
                <div className="mt-3 text-xl font-black uppercase">{caf.en}</div>
              </div>
              <div className="pb-2">
                <div className="text-[13vw] leading-[0.8] font-black tracking-[-0.06em] text-pink tabular-nums md:text-[6vw]">
                  {the.amount}
                  <span className="ml-0.5 text-[0.3em] tracking-normal">{the.unit}</span>
                </div>
                <div className="mt-3 text-base font-black uppercase">{the.en}</div>
              </div>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {BENEFITS.map((b, i) => (
              <Reveal as="li" key={b.id} delay={i * 80} className="rounded-[22px] bg-bone p-6 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 md:p-7">
                <span className="mb-6 block h-2.5 w-2.5 rounded-full bg-pink" />
                <p className="text-[22px] leading-tight font-black uppercase">{b.title}</p>
                <p className="mt-2 text-[15px] text-grey">{b.line}</p>
              </Reveal>
            ))}
          </ul>
        </div>
        <p className="mt-10 text-xs text-grey">Amounts as printed on pack. Contains caffeine. Read the label before use.</p>
      </section>

      {/* ───────────── 06 F▮ THE ORDINARY — the closer, with the form again ───────────── */}
      <section data-nav-tone="dark" className="relative grid overflow-hidden bg-pink text-white md:grid-cols-[1fr_36%]">
        <div className="relative h-[80vw] md:order-last md:h-auto">
          <Image src={closing} alt="" fill sizes="(max-width: 768px) 100vw, 36vw" className="object-cover object-[50%_22%]" />
        </div>
        <div className="wrap flex flex-col justify-end py-16 md:min-h-[86svh] md:py-24">
          <Reveal as="h2" variant="lines" className="display display-italic text-[17vw] md:text-[9.6vw]">
            <Line>
              <span aria-label="F the">
                <Censor swipeClass="[&_path:first-child]:fill-ink" /> the
              </span>
            </Line>
            <Line delay={90}>ordinary.</Line>
          </Reveal>
          <Reveal className="mt-4 max-w-[40ch] text-[17px] font-bold text-white/90">The day isn’t done. Neither is the list. Get on it.</Reveal>
          <div data-wl-form className="mt-8">
            <WaitlistForm source="waitlist-closer" tone="pink" size="md" />
          </div>
        </div>
      </section>

      {/* mobile join bar */}
      <div className={`wl-sticky md:hidden ${sticky ? "is-on" : ""}`} aria-hidden={!sticky} inert={!sticky}>
        <a href="#join" className="btn btn-pink w-full" onClick={() => track("hero_cta_click", { cta: "waitlist_sticky" })}>
          Join the waitlist →
        </a>
      </div>
    </div>
  );
}
