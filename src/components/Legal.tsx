import { SITE } from "@/lib/site";

/** Plain, compact page shell for policy pages. */
export function Legal({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="wrap mx-auto max-w-[860px] bg-ivory pt-[calc(var(--header-h)+8vh)] pb-24">
      <h1 className="display text-[12vw] md:text-[5vw]">
        {title}
        <span className="text-pink">.</span>
      </h1>
      <p className="eyebrow mt-4 text-grey">Last updated {updated}</p>
      <div className="mt-10 space-y-5 text-[17px] leading-relaxed text-grey [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-ink [&_h2]:uppercase">{children}</div>
    </article>
  );
}

export function ContactLine() {
  return SITE.contactEmail ? (
    <p>
      Questions or requests: <a className="underline underline-offset-2" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
    </p>
  ) : null;
}
