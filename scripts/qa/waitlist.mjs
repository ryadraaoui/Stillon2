// /waitlist tests. node waitlist.mjs <base> <klaviyoMockBase>
import { chromium } from "playwright";
const base = process.argv[2], mock = process.argv[3];
const b = await chromium.launch(); const res = []; const errs = [];
const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"}  ${n}${x ? "  — " + x : ""}`);
const mk = async (vp, rm = false) => { const p = await (await b.newContext({ viewport: vp, reducedMotion: rm ? "reduce" : "no-preference" })).newPage(); p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && !m.text().includes("502") && errs.push(m.text())); return p; };
const calls = async () => (await fetch(mock + "/__calls")).json();
const sizes = [["320", { width: 320, height: 640 }], ["390", { width: 390, height: 844 }], ["820", { width: 820, height: 1180 }], ["1440", { width: 1440, height: 900 }], ["1920", { width: 1920, height: 1080 }]];
for (const [n, vp] of sizes) {
  const p = await mk(vp); const r = await p.goto(base + "/waitlist?utm_source=instagram&utm_campaign=dept", { waitUntil: "networkidle" });
  ok(`${n} status 200`, r.status() === 200);
  const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); ok(`${n} no horizontal scroll`, over <= 0, String(over));
  const form = await p.locator('[data-testid="waitlist-form"]').first().boundingBox(); ok(`${n} hero form above the fold`, form && form.y + 60 < vp.height + (vp.width < 400 ? 220 : 0), JSON.stringify(form && Math.round(form.y)));
  const broken = await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.loading !== "lazy").length); ok(`${n} no broken images`, broken === 0, String(broken));
  await p.context().close();
}
{ const p = await mk({ width: 1440, height: 900 });
  await p.goto(base + "/waitlist?utm_source=instagram&utm_campaign=dept", { waitUntil: "networkidle" });
  ok("countdown shows", await p.locator('[data-testid="countdown"]').count() === 1);
  ok("real count shown (412 from Klaviyo)", /412 people already in line/.test(await p.locator('[data-testid="waitlist-count"]').innerText().catch(() => "")));
  ok("header CTA says Join the list", await p.locator('header a:has-text("Join the list")').count() === 1);
  const f = p.locator('[data-testid="waitlist-form"]').first();
  await f.locator('input[type=email]').fill("bad"); await f.locator("button[type=submit]").click();
  ok("browser blocks a bad email", await p.locator('[data-testid="waitlist-done"]').count() === 0);
  await f.locator('input[type=email]').fill("Test@Example.com"); await f.locator("button[type=submit]").click(); await p.waitForTimeout(300);
  ok("consent required before submit", await p.locator('[data-testid="waitlist-done"]').count() === 0);
  await f.locator('input[type=checkbox]').check(); await f.locator("button[type=submit]").click();
  await p.waitForSelector('[data-testid="waitlist-done"]', { timeout: 8000 }).catch(() => null);
  ok("success state shows", await p.locator('[data-testid="waitlist-done"]').count() >= 1);
  ok("both forms switch to success", await p.locator('[data-testid="waitlist-form"]').count() === 0);
  const c = await calls(); const imp = c.find((x) => x.url === "/api/profile-import"); const sub = c.find((x) => x.url === "/api/profile-subscription-bulk-create-jobs");
  ok("Klaviyo profile created with lowercased email", imp?.body.data.attributes.email === "test@example.com");
  ok("profile carries source + utm", imp?.body.data.attributes.properties.stillon_source === "waitlist-hero" && imp?.body.data.attributes.properties.utm_source === "instagram" && imp?.body.data.attributes.properties.utm_campaign === "dept", JSON.stringify(imp?.body.data.attributes.properties));
  ok("subscribed to list L123 with consent", sub?.body.data.relationships.list.data.id === "L123" && sub?.body.data.attributes.profiles.data[0].attributes.subscriptions.email.marketing.consent === "SUBSCRIBED");
  await p.screenshot({ path: "/tmp/claude-0/wl-done.png" });
  await p.context().close(); }
{ const r = await fetch(base + "/api/waitlist/count"); const j = await r.json(); ok("count endpoint returns the real number", j.count === 412 && j.source === "klaviyo", JSON.stringify(j)); }
{ const r = await fetch(base + "/api/notify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "x@y.co", consent: false, source: "waitlist" }) }); ok("API refuses without consent", r.status === 400); }
{ const p = await mk({ width: 390, height: 844 }); await p.goto(base + "/waitlist", { waitUntil: "networkidle" });
  await p.mouse.wheel(0, 2500); await p.waitForTimeout(900); ok("mobile join bar appears after the hero", await p.evaluate(() => document.querySelector(".wl-sticky").classList.contains("is-on")));
  await p.click(".wl-sticky a"); await p.waitForTimeout(1600); const top = await p.evaluate(() => document.getElementById("join").getBoundingClientRect().top); ok("join bar scrolls back to the form", top > -40 && top < 400, String(Math.round(top)));
  await p.context().close(); }
{ const p = await mk({ width: 1440, height: 900 }, true); await p.goto(base + "/waitlist", { waitUntil: "networkidle" }); ok("reduced motion: headline visible", await p.locator("h1").isVisible()); await p.context().close(); }
{ const p = await mk({ width: 1440, height: 900 }); await p.goto(base + "/", { waitUntil: "networkidle" }); ok("homepage still renders", (await p.locator("h1").innerText()).toLowerCase().includes("day")); await p.context().close(); }
ok("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
console.log(res.join("\n")); console.log(`\n${res.filter((r) => r.startsWith("PASS")).length}/${res.length} pass`);
await b.close();
