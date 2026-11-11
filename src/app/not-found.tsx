import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[86svh] flex-col justify-center bg-ivory pt-[var(--header-h)]">
      <p className="eyebrow mb-5 text-grey">404</p>
      <h1 className="display display-italic text-[19vw] md:text-[12vw]">
        This page is off<span className="text-pink">.</span>
      </h1>
      <p className="mt-6 max-w-[40ch] text-lg text-grey">Everything else is still on.</p>
      <Link href="/" className="btn btn-ink mt-9 self-start">
        Back home
      </Link>
    </section>
  );
}
