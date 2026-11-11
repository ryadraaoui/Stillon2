import { NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Launch-list signup.
 * - NOTIFY_WEBHOOK_URL set: forwards { email, source, ts } as JSON (Klaviyo/Zapier/Make/your own endpoint).
 * - Not set, outside production: appends to .data/launch-list.jsonl so the form works locally.
 * - Not set, in production: fails honestly with 503 rather than pretending to subscribe anyone.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: { email?: unknown; source?: unknown; company?: unknown };
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
  const entry = { email, source: typeof body.source === "string" ? body.source.slice(0, 40) : "site", ts: new Date().toISOString() };
  const hook = process.env.NOTIFY_WEBHOOK_URL;
  try {
    if (hook) {
      const res = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
    } else if (process.env.NODE_ENV !== "production" || process.env.NOTIFY_ALLOW_FILE === "true") {
      const dir = path.join(process.cwd(), ".data");
      await mkdir(dir, { recursive: true });
      await appendFile(path.join(dir, "launch-list.jsonl"), JSON.stringify(entry) + "\n");
    } else {
      return NextResponse.json({ error: "The launch list isn't connected yet. Please check back soon." }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[notify]", e);
    return NextResponse.json({ error: "We couldn't add you just now. Please try again." }, { status: 502 });
  }
}
