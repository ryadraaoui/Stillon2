import { NextResponse } from "next/server";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Early-access signup.
 * - NOTIFY_WEBHOOK_URL set: forwards { email, source, consent, ts } as JSON (Klaviyo/Zapier/Make/your own endpoint).
 *   De-duplication is then the list provider's job; the request is idempotent on email.
 * - Not set, outside production (or NOTIFY_ALLOW_FILE=true on a host with a persistent disk):
 *   appends to .data/early-access.jsonl and de-duplicates on email.
 * - Not set, in production: fails honestly with 503 rather than pretending to subscribe anyone.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: { email?: unknown; source?: unknown; company?: unknown; consent?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body.company) return NextResponse.json({ ok: true }); // honeypot: bots get a quiet no-op
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: "Please tick the box so we're allowed to email you." }, { status: 400 });
  }
  const entry = { email, source: typeof body.source === "string" ? body.source.slice(0, 40) : "site", consent: true, ts: new Date().toISOString() };
  const hook = process.env.NOTIFY_WEBHOOK_URL;
  try {
    if (hook) {
      const res = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
      return NextResponse.json({ ok: true });
    }
    if (process.env.NODE_ENV !== "production" || process.env.NOTIFY_ALLOW_FILE === "true") {
      const dir = path.join(process.cwd(), ".data");
      const file = path.join(dir, "early-access.jsonl");
      await mkdir(dir, { recursive: true });
      const existing = await readFile(file, "utf8").catch(() => "");
      const already = existing.split("\n").some((l) => l && JSON.parse(l).email === email);
      if (!already) await appendFile(file, JSON.stringify(entry) + "\n");
      return NextResponse.json({ ok: true, already });
    }
    return NextResponse.json({ error: "Early access isn't connected yet. Please check back soon." }, { status: 503 });
  } catch (e) {
    console.error("[notify]", e);
    return NextResponse.json({ error: "We couldn't add you just now. Please try again." }, { status: 502 });
  }
}
