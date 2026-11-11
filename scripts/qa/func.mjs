// Functional QA against a running server. node func.mjs <base> <mode: prelaunch|live>
import { chromium } from "playwright";
const base = process.argv[2], mode = process.argv[3];
const b = await chromium.launch(); const res = []; const errs = [];
const ok = (name, cond, extra = "") => res.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
const page = async (vp, rm = false) => { const c = await b.newContext({ viewport: vp, reducedMotion: rm ? "reduce" : "no-preference" }); const p = await c.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text())); p.on("response", r => r.status() >= 400 && !r.url().includes("/nope") && !r.url().includes("/api/") && errs.push(r.status() + " " + r.url())); return p; };
const D = { width: 1440, height: 900 }, M = { width: 390, height: 844 };

// --- overflow + broken images + links on every page, both viewports
for (const [vn, vp] of [["desktop", D], ["mobile", M]]) for (const path of ["/", "/products/energy-strips", "/story", "/nope"]) {
  const p = await page(vp); const r = await p.goto(base + path, { waitUntil: "networkidle" });
  ok(`${vn} ${path} status`, path === "/nope" ? r.status() === 404 : r.status() === 200, String(r.status()));
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 700) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(120); }
  await p.waitForTimeout(800);
  const o = await p.evaluate(() => { const w = window.innerWidth; const bad = [...document.querySelectorAll("main *, footer *, header *")].filter(e => { if (e.closest(".hscroll, .marquee-track, [data-pin], #campaign, .box3d, .sachet")) return false; const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > w + 2 || r.left < -2); }).slice(0, 4).map(e => e.tagName + "." + String(e.className).slice(0, 50)); return bad; });
  ok(`${vn} ${path} no horizontal overflow`, o.length === 0, o.join(" | "));
  const imgs = await p.evaluate(async () => { const u = [...new Set([...document.images].map(i => i.currentSrc || i.src).filter(Boolean))]; const bad = []; for (const x of u) { const r = await fetch(x); if (!r.ok) bad.push(x + " " + r.status); } return bad; });
  ok(`${vn} ${path} images loaded`, imgs.length === 0, imgs.join(","));
  if (vn === "desktop" && path !== "/nope") {
    const hrefs = await p.evaluate(() => [...new Set([...document.querySelectorAll("a[href]")].map(a => a.getAttribute("href")))]);
    for (const h of hrefs) { if (!h.startsWith("/") && !h.startsWith("#")) { ok(`link ${h} is internal`, false); continue; }
      const [pp, hash] = h.split("#"); const q = await b.newContext().then(c => c.newPage()); const rr = await q.goto(base + (pp || path)); let good = rr.status() === 200;
      if (good && hash) good = await q.evaluate(id => !!document.getElementById(id), hash); ok(`link ${h} resolves`, good); await q.context().close(); }
    const h1 = await p.evaluate(() => document.querySelectorAll("h1").length); ok(`${path} single h1`, h1 === 1, String(h1));
    const alt = await p.evaluate(() => [...document.images].filter(i => !i.hasAttribute("alt")).length); ok(`${path} all images have alt`, alt === 0);
  }
  await p.context().close();
}
// --- desktop nav + anchor
{ const p = await page(D); await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.click('nav[aria-label="Primary"] a:has-text("Our story")'); await p.waitForURL("**/story"); ok("nav → story", true);
  await p.click('nav[aria-label="Primary"] a:has-text("Formula")'); await p.waitForURL("**/#formula"); await p.waitForTimeout(2500);
  const top = await p.evaluate(() => document.getElementById("formula").getBoundingClientRect().top); ok("anchor nav scrolls to #formula", Math.abs(top) < 200, String(Math.round(top)));
  // FAQ
  await p.goto(base + "/#faq", { waitUntil: "networkidle" }); const b2 = p.locator("#faq-b-2"); await b2.scrollIntoViewIfNeeded(); await b2.click(); ok("FAQ opens", await b2.getAttribute("aria-expanded") === "true"); ok("FAQ single-open", await p.locator("#faq-b-0").getAttribute("aria-expanded") === "false");
  // reveal pins and progresses
  await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  const y0 = await p.evaluate(() => document.getElementById("reveal").getBoundingClientRect().top + scrollY);
  await p.evaluate(y => window.scrollTo(0, y + 900 * 2.4), y0); await p.waitForTimeout(1500);
  const st = await p.evaluate(() => ({ pinTop: Math.round(document.querySelector("[data-pin]").getBoundingClientRect().top), rot: document.querySelector("[data-pin] [data-sachet-3d]").style.transform }));
  ok("reveal is pinned mid-sequence", st.pinTop === 0, JSON.stringify(st)); ok("reveal sachet is rotating", /rotateY|matrix3d/.test(st.rot), st.rot.slice(0, 60));
  await p.context().close(); }
// --- reduced motion
{ const p = await page(D, true); await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  const r = await p.evaluate(() => ({ pin: getComputedStyle(document.querySelector("[data-pin]")).display, lenis: document.documentElement.classList.contains("lenis"), h1: getComputedStyle(document.querySelector("h1 span span")).transform, mq: getComputedStyle(document.querySelector(".marquee-track")).animationName, track: getComputedStyle(document.querySelector("[data-track]")).overflowX }));
  ok("reduced motion: pinned reveal replaced by stills", r.pin === "none", r.pin); ok("reduced motion: no smooth-scroll hijack", !r.lenis); ok("reduced motion: marquee stopped", r.mq === "none", r.mq); ok("reduced motion: gallery is native scroll", r.track === "auto", r.track);
  await p.context().close(); }
// --- mobile menu
{ const p = await page(M); await p.goto(base + "/", { waitUntil: "networkidle" });
  const t = p.locator('button[aria-controls="mobile-menu"]'); await t.click(); await p.waitForTimeout(900);
  ok("mobile menu opens", await t.getAttribute("aria-expanded") === "true"); await p.keyboard.press("Escape"); await p.waitForTimeout(300); ok("mobile menu closes on ESC", await t.getAttribute("aria-expanded") === "false");
  await t.click(); await p.waitForTimeout(900); await p.click('#mobile-menu a:has-text("The strips")'); await p.waitForURL("**/products/energy-strips"); await p.waitForTimeout(600);
  ok("mobile menu navigates + closes", await t.getAttribute("aria-expanded") === "false");
  await p.context().close(); }
// --- PDP gallery
{ const p = await page(D); await p.goto(base + "/products/energy-strips", { waitUntil: "networkidle" });
  await p.click('[role="tab"][aria-label="Torn open"]'); ok("PDP gallery tab selects", await p.locator('[role="tab"][aria-label="Torn open"]').getAttribute("aria-selected") === "true");
  await p.keyboard.press("ArrowRight"); ok("PDP gallery arrow keys", await p.locator('[role="tab"][aria-label="To scale"]').getAttribute("aria-selected") === "true");
  await p.context().close(); }
if (mode === "prelaunch") {
  const p = await page(D); await p.goto(base + "/products/energy-strips", { waitUntil: "networkidle" });
  ok("prelaunch: no price shown", await p.locator('[data-testid="price"]').count() === 0); ok("prelaunch: header shows Launch list, no cart", await p.locator('[data-testid="cart-count"]').count() === 0);
  const f = p.locator("main form").first(); await f.locator('input[type=email]').fill("not-an-email"); await f.locator("button[type=submit]").click(); await p.waitForTimeout(400);
  ok("notify: browser blocks invalid email", await p.locator('[role="status"]').count() === 0);
  await f.locator('input[type=email]').fill("qa-test@example.com"); await f.locator("button[type=submit]").click(); await p.waitForSelector('main [role="status"]', { timeout: 8000 }).catch(() => {});
  ok("notify: valid email accepted", await p.locator('main [role="status"]').count() === 1, await p.locator('main [role="status"], main [role="alert"]').first().innerText().catch(() => "none"));
  const api = await p.request.post(base + "/api/notify", { data: { email: "bad" } }); ok("notify API rejects bad email (400)", api.status() === 400);
  const co = await p.request.post(base + "/api/checkout", { data: { quantity: 1 } }); ok("checkout API refuses without Stripe (503)", co.status() === 503);
  await p.goto(base + "/checkout/success?session_id=cs_test_fake"); ok("success page does not confirm unverified order", (await p.locator("h1").innerText()).toLowerCase().includes("can’t confirm"));
  await p.context().close();
} else {
  const p = await page(D); await p.goto(base + "/products/energy-strips", { waitUntil: "networkidle" });
  ok("live: price from Stripe shown", (await p.locator('[data-testid="price"]').first().innerText()).includes("$"), await p.locator('[data-testid="price"]').first().innerText());
  await p.click('button[aria-label="Increase quantity"]'); await p.click('button:has-text("Add to cart")'); await p.waitForTimeout(900);
  ok("cart drawer opens", await p.locator('[role="dialog"][aria-label="Your cart"]').isVisible()); ok("cart count = 2", await p.locator('[data-testid="cart-count"]').innerText() === "2");
  const sub1 = await p.locator('[data-testid="subtotal"]').innerText(); await p.locator('[role="dialog"] button[aria-label="Increase quantity"]').click(); const sub2 = await p.locator('[data-testid="subtotal"]').innerText(); ok("subtotal updates with quantity", sub1 !== sub2, `${sub1} → ${sub2}`);
  await p.keyboard.press("Escape"); await p.waitForTimeout(700); await p.reload({ waitUntil: "networkidle" }); ok("cart persists across reload", await p.locator('[data-testid="cart-count"]').innerText() === "3");
  await p.click('header button:has-text("Cart")'); await p.waitForTimeout(700);
  const [req] = await Promise.all([p.waitForRequest(r => r.url().includes("/checkout-mock/")), p.click('[role="dialog"] button:has-text("Checkout")')]).catch(() => [null]);
  ok("checkout redirects to the session URL returned by Stripe", !!req, req?.url());
  const bad = await p.request.post(base + "/api/checkout", { data: { quantity: 99 } }); ok("checkout API validates quantity (400)", bad.status() === 400);
  await p.goto(base + "/checkout/success?session_id=cs_test_paid", { waitUntil: "networkidle" }); await p.waitForTimeout(500); ok("success page confirms a paid session", (await p.locator("h1").innerText()).toLowerCase().includes("you’re on")); ok("cart cleared after paid order", await p.locator('[data-testid="cart-count"]').innerText() === "0");
  await p.goto(base + "/checkout/success?session_id=cs_test_unpaid"); ok("success page refuses an unpaid session", (await p.locator("h1").innerText()).toLowerCase().includes("can’t confirm"));
  await p.goto(base + "/products/energy-strips?checkout=cancelled"); ok("cancel notice shown", await p.locator('text=Checkout cancelled').count() === 1);
  await p.context().close();
}
console.log(res.join("\n")); console.log("FAILED:", res.filter(r => r.startsWith("FAIL")).length, "/", res.length); console.log("CONSOLE ERRORS:", errs.length ? [...new Set(errs)].slice(0, 8) : "none");
await b.close();
