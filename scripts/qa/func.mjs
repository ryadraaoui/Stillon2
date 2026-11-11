// Functional QA against a running server. node func.mjs <base> <mode: prelaunch|live>
import { chromium } from "playwright";
const base = process.argv[2], mode = process.argv[3];
const b = await chromium.launch(); const res = []; const errs = [];
const ok = (name, cond, extra = "") => res.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
const page = async (vp, rm = false) => { const c = await b.newContext({ viewport: vp, reducedMotion: rm ? "reduce" : "no-preference" }); const p = await c.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text())); p.on("response", r => r.status() >= 400 && !r.url().includes("/nope") && !r.url().includes("/api/") && errs.push(r.status() + " " + r.url())); return p; };
const D = { width: 1440, height: 900 }, M = { width: 390, height: 844 };

// --- overflow + broken images + links on every page, both viewports
for (const [vn, vp] of [["small-mobile", { width: 320, height: 640 }], ["mobile", M], ["large-mobile", { width: 430, height: 932 }], ["tablet", { width: 820, height: 1180 }], ["desktop", D], ["wide", { width: 1920, height: 1080 }]]) for (const path of ["/", "/products/energy-strips", "/story", "/faq", "/privacy", "/terms", "/shipping", "/nope"]) {
  const p = await page(vp); const r = await p.goto(base + path, { waitUntil: "networkidle" });
  ok(`${vn} ${path} status`, path === "/nope" ? r.status() === 404 : r.status() === 200, String(r.status()));
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 700) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(120); }
  await p.waitForTimeout(800);
  const o = await p.evaluate(() => { const w = window.innerWidth; const bad = [...document.querySelectorAll("main *, footer *, header *")].filter(e => { if (e.closest(".hscroll, [data-pin], [data-row], .box3d, .sachet")) return false; const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > w + 2 || r.left < -2); }).slice(0, 4).map(e => e.tagName + "." + String(e.className).slice(0, 50)); return bad; });
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
  if (mode === "prelaunch") {
  await p.click('header a:has-text("Get early access")'); await p.waitForURL("**/#early-access"); await p.waitForTimeout(2500);
  const top = await p.evaluate(() => document.getElementById("early-access").getBoundingClientRect().top); ok("header CTA lands on the early-access form", top >= 0 && top < 260, String(Math.round(top)));
  const forms = await p.evaluate(() => document.querySelectorAll("main form").length); ok("homepage has exactly one signup form", forms === 1, String(forms));
  } else { await p.goto(base + "/", { waitUntil: "networkidle" }); }
  const secs = await p.evaluate(() => document.querySelectorAll("main section").length); ok("homepage has exactly six sections", secs === 6, String(secs));
  const ctas = await p.evaluate(() => [...document.querySelectorAll("a.btn, button.btn")].map(e => e.textContent.trim().toLowerCase())); if (mode === "prelaunch") ok("primary CTA wording is consistent", ctas.filter(c => c === "get early access").length >= 2 && !ctas.some(c => /buy now|shop now|launch list|tell me/.test(c)), ctas.join(" | "));
  await p.goto(base + "/faq", { waitUntil: "networkidle" }); const b2 = p.locator("#faq-b-2"); await b2.click(); ok("FAQ opens", await b2.getAttribute("aria-expanded") === "true"); ok("FAQ single-open", await p.locator("#faq-b-0").getAttribute("aria-expanded") === "false");
  // reveal pins and progresses
  await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(600);
  const y0 = await p.evaluate(() => Math.round(document.getElementById("strips").getBoundingClientRect().top)); await p.evaluate(y => window.scrollTo(0, y), y0 + 700); await p.waitForTimeout(1500);
  const st = await p.evaluate(() => ({ pinTop: Math.round(document.querySelector("[data-pin]").getBoundingClientRect().top), tf: document.querySelector("[data-sachet-holder]").style.transform }));
  ok("reveal is pinned mid-sequence", st.pinTop === 0, JSON.stringify(st)); ok("reveal animates with scroll", st.tf.length > 0 && !/78%|58%/.test(st.tf), st.tf.slice(0, 60));
  await p.evaluate(y => window.scrollTo(0, y), y0 + 900 * 3.6); await p.waitForTimeout(1200); const rel = await p.evaluate(() => Math.round(document.querySelector("[data-pin]").getBoundingClientRect().top)); ok("reveal releases after three screens", rel < 0, String(rel));
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(600);
  const c0 = await p.evaluate(() => Math.round(document.getElementById("campaign").getBoundingClientRect().top)); const dist = await p.evaluate(() => { const t = document.querySelector("[data-track]"); return t.scrollWidth - innerWidth; });
  await p.evaluate(y => window.scrollTo(0, y), c0 + dist * 0.5); await p.waitForTimeout(1500);
  const cg = await p.evaluate(() => ({ top: Math.round(document.getElementById("campaign").getBoundingClientRect().top), x: Math.round(new DOMMatrix(getComputedStyle(document.querySelector("[data-track]")).transform).m41) }));
  ok("campaign reel is pinned and moving horizontally", cg.top === 0 && cg.x < -200, JSON.stringify(cg));
  await p.evaluate(y => window.scrollTo(0, y), c0 + dist + 400); await p.waitForTimeout(1200); const crel = await p.evaluate(() => Math.round(document.getElementById("campaign").getBoundingClientRect().top)); ok("campaign reel releases at its end", crel < 0, String(crel));
  await p.context().close(); }
// --- reduced motion
{ const p = await page(D, true); await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  const r = await p.evaluate(() => ({ pin: getComputedStyle(document.querySelector("[data-pin]")).display, lenis: document.documentElement.classList.contains("lenis"), h1: getComputedStyle(document.querySelector("h1 span span")).transform, curtain: getComputedStyle(document.querySelector("[data-h-curtain]")).display, track: getComputedStyle(document.querySelector("[data-track]")).overflowX }));
  ok("reduced motion: pinned reveal replaced by stills", r.pin === "none", r.pin); ok("reduced motion: no smooth-scroll hijack", !r.lenis); ok("reduced motion: hero shows immediately", r.curtain === "none", r.curtain); ok("reduced motion: campaign is a native scroll row", r.track === "auto", r.track);
  await p.context().close(); }
// --- floating nav: material, layout, auto-hide, tone
for (const [vn, vp] of [["desktop", D], ["tablet", { width: 820, height: 1180 }], ["mobile", M], ["small-mobile", { width: 320, height: 640 }]]) { const p = await page(vp); await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(900); await p.mouse.move(vp.width / 2, vp.height - 80);
  const m = () => p.evaluate(() => { const sh = document.querySelector('[data-testid="nav-shell"]'); const el = document.querySelector('[data-testid="nav-capsule"]'); const c = el.getBoundingClientRect(); const l = document.querySelector(".nav-logo img").getBoundingClientRect(); const cs = getComputedStyle(el); const kids = [...el.querySelectorAll("a, button")].filter(e => e.getBoundingClientRect().width > 0).map(e => e.getBoundingClientRect()); const overlap = kids.some((a, i) => kids.some((b, j) => i < j && a.left < b.right - 1 && b.left < a.right - 1)); const small = kids.filter(k => k.height < 38).length; const al = parseFloat((cs.backgroundColor.match(/[\d.]+\)$/) || ["1"])[0]); return { hidden: sh.dataset.hidden, pe: getComputedStyle(sh).pointerEvents, top: Math.round(c.top), bottom: Math.round(c.bottom), h: Math.round(c.height), off: Math.round(Math.abs((l.left + l.right) / 2 - innerWidth / 2)), blur: cs.backdropFilter || cs.webkitBackdropFilter, radius: cs.borderTopLeftRadius, alpha: al, tone: el.dataset.tone, zones: [...el.querySelectorAll("[data-zone]")].map(z => z.dataset.tone).join(","), overlap, small, sy: Math.round(scrollY) }; });
  const wheel = async (dy) => { for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, dy / 6); await p.waitForTimeout(80); } await p.waitForTimeout(700); };
  const a = await m(); ok(`nav ${vn}: wordmark on the viewport centre line`, a.off <= 1, `${a.off}px`);
  ok(`nav ${vn}: real translucency (alpha ≤ 0.4 + backdrop blur), full pill, slim`, a.alpha <= 0.4 && /blur\(22px\)/.test(a.blur) && parseFloat(a.radius) > 100 && a.h <= 76, `${a.alpha} ${a.blur} ${a.h}px`);
  ok(`nav ${vn}: items do not collide, targets ≥ 38px`, !a.overlap && a.small === 0, JSON.stringify(a)); ok(`nav ${vn}: visible at the top`, a.hidden === "false" && a.top > 0);
  await wheel(40); const tiny = await m(); ok(`nav ${vn}: stays visible within 60px of the top`, tiny.hidden === "false", JSON.stringify([tiny.sy, tiny.hidden]));
  await wheel(900); const dn = await m(); ok(`nav ${vn}: hides completely on scroll down, not clickable`, dn.hidden === "true" && dn.bottom < -20 && dn.pe === "none", JSON.stringify([dn.sy, dn.hidden, dn.bottom, dn.pe]));
  await p.mouse.wheel(0, -4); await p.waitForTimeout(500); const jit = await m(); ok(`nav ${vn}: ignores a tiny upward nudge`, jit.hidden === "true", jit.hidden);
  await wheel(-120); const up = await m(); ok(`nav ${vn}: returns on scroll up, same size`, up.hidden === "false" && up.top === a.top && up.h === a.h && up.sy > 100, JSON.stringify([up.sy, up.hidden, up.top]));
  await wheel(600); await p.keyboard.press("Tab"); await p.keyboard.press("Tab"); await p.waitForTimeout(600); const fo = await m(); const inNav = await p.evaluate(() => !!document.activeElement.closest('[data-testid="nav-shell"]')); ok(`nav ${vn}: keyboard focus brings a hidden nav back`, inNav && fo.hidden === "false", JSON.stringify([inNav, fo.hidden]));
  await p.evaluate(() => { document.activeElement.blur(); window.scrollTo(0, 0); }); await p.waitForTimeout(900); const tp = await m(); ok(`nav ${vn}: always visible back at the top`, tp.hidden === "false" && tp.sy === 0);
  if (vn === "desktop") { const order = await p.evaluate(() => [...document.querySelectorAll('[data-testid="nav-capsule"] a')].map(e => e.getAttribute("aria-label") || e.textContent.trim())); ok("nav desktop: Shop, Our story | logo | FAQ, Get early access", order.join("|").startsWith("Shop|Our story|Still ON. — home|FAQ|Get early access"), order.join("|"));
    const y0 = await p.evaluate(() => Math.round(document.getElementById("strips").getBoundingClientRect().top)); await p.evaluate(y => window.scrollTo(0, y), y0 + 900 * 2.7); await p.waitForTimeout(1200); await wheel(-60); const pk = await m(); ok("nav desktop: light type over the pink world", pk.hidden === "false" && pk.tone === "dark" && pk.zones === "dark,dark,dark", JSON.stringify([pk.hidden, pk.tone, pk.zones]));
    const f0 = await p.evaluate(() => Math.round(document.getElementById("formula").getBoundingClientRect().top + scrollY)); await p.evaluate(y => window.scrollTo(0, y + 200), f0); await p.waitForTimeout(900); await wheel(-60); const iv = await m(); ok("nav desktop: ink type over ivory", iv.tone === "light" && iv.zones === "light,light,light", iv.zones); }
  if (vp.width < 1024) { await p.evaluate(() => window.scrollTo(0, 500)); await p.waitForTimeout(500); await wheel(-80); const t = p.locator('button[aria-controls="mobile-menu"]'); await t.click(); await p.waitForTimeout(500); const lock = await p.evaluate(() => ({ o: document.documentElement.style.overflow, f: document.activeElement.textContent.trim(), n: document.querySelectorAll("#mobile-menu a").length, hid: document.querySelector('[data-testid="nav-shell"]').dataset.hidden })); ok(`nav ${vn}: menu locks scroll, moves focus, has 4 links, nav stays visible`, lock.o === "hidden" && lock.f.startsWith("Shop") && lock.n === 4 && lock.hid === "false", JSON.stringify(lock)); await p.keyboard.press("Escape"); await p.waitForTimeout(300); const back = await p.evaluate(() => ({ o: document.documentElement.style.overflow, f: document.activeElement.getAttribute("aria-controls") })); ok(`nav ${vn}: Escape closes, unlocks, returns focus`, back.o === "" && back.f === "mobile-menu", JSON.stringify(back)); }
  await p.context().close(); }
{ const c = await b.newContext({ viewport: D, reducedMotion: "reduce" }); const p = await c.newPage(); await p.goto(base + "/", { waitUntil: "networkidle" }); const d = await p.evaluate(() => getComputedStyle(document.querySelector('[data-testid="nav-shell"]')).transitionDuration); ok("nav: reduced motion makes hide/show immediate", d === "0s", d); await c.close(); }
// --- touch: campaign is a native swipe row, not pinned
{ const p = await page(M); await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => { const t = document.querySelector("[data-track]"); t.scrollIntoView(); t.scrollLeft = 600; await new Promise(x => setTimeout(x, 400)); return { ox: getComputedStyle(t).overflowX, snap: getComputedStyle(t).scrollSnapType, left: t.scrollLeft, pinned: !!t.closest(".pin-spacer") }; });
  ok("mobile: campaign swipes natively with snap, no pin", r.ox === "auto" && r.snap.includes("x") && r.left > 100 && !r.pinned, JSON.stringify(r));
  await p.context().close(); }
// --- mobile menu
{ const p = await page(M); await p.goto(base + "/", { waitUntil: "networkidle" });
  const t = p.locator('button[aria-controls="mobile-menu"]'); await t.click(); await p.waitForTimeout(900);
  ok("mobile menu opens", await t.getAttribute("aria-expanded") === "true"); await p.keyboard.press("Escape"); await p.waitForTimeout(300); ok("mobile menu closes on ESC", await t.getAttribute("aria-expanded") === "false");
  await t.click(); await p.waitForTimeout(900); await p.click('#mobile-menu a:has-text("Shop")'); await p.waitForURL("**/products/energy-strips"); await p.waitForTimeout(600);
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
  ok("prelaunch status is shown", (await p.locator('[data-testid="status"]').first().innerText()).toLowerCase().includes("prelaunch"));
  for (const path of ["/", "/products/energy-strips"]) { await p.goto(base + path, { waitUntil: "networkidle" }); const o = p.locator('[data-testid="offers"]'); await o.scrollIntoViewIfNeeded(); const tag = path === "/" ? "home" : "pdp";
    const prices = await o.evaluate(el => ["intro", "everyday", "stockup"].map(i => el.querySelector(`[data-price="${i}"]`).textContent.trim()).join(",")); ok(`offers ${tag}: Intro $39, Everyday $69, Stockup $89`, prices === "$39,$69,$89", prices);
    const total = () => o.locator('[data-testid="total"]').innerText(); const sum = () => o.locator('[data-testid="summary"]').innerText();
    ok(`offers ${tag}: Everyday preselected at $69, one-time by default`, await total() === "$69" && /one-time/i.test(await sum()));
    ok(`offers ${tag}: unit prices are derived`, /\$1\.30 per strip/.test(await o.innerText()) && /\$1\.15 per strip/.test(await o.innerText()) && /\$0\.99 per strip/.test(await o.innerText()));
    await o.locator('label:has-text("ON Repeat.")').click(); ok(`offers ${tag}: Everyday ON Repeat. is $62 per delivery`, await total() === "$62" && /per delivery/i.test(await sum()), await sum());
    ok(`offers ${tag}: tag note explains first order and refills`, /ON Tag included with your first order\. Refills only after your first delivery\./.test(await sum()));
    await o.locator('label:has-text("Every 60 days")').click(); ok(`offers ${tag}: interval updates`, /every 60 days/i.test(await sum()));
    await o.locator('label[data-offer="stockup"]').click(); ok(`offers ${tag}: Stockup ON Repeat. is $80`, await total() === "$80", await total());
    await o.locator('label:has-text("One-time")').click(); ok(`offers ${tag}: Stockup one-time is $89`, await total() === "$89");
    await o.locator('label:has-text("ON Repeat.")').click(); await o.locator('label[data-offer="intro"]').click(); await p.waitForTimeout(300);
    ok(`offers ${tag}: Intro is $39, one-time only, no ON Repeat., no tag`, await total() === "$39" && await o.locator('[data-testid="one-time-only"]').count() === 1 && await o.locator('label:has-text("ON Repeat.")').count() === 0 && await o.locator('[data-testid="tag-note"]').count() === 0, await sum());
    if (tag === "home") { await p.waitForTimeout(800); const t1 = await o.evaluate(el => getComputedStyle(el.querySelector('[data-testid="on-tag"]').parentElement).opacity); await o.locator('label[data-offer="everyday"]').click(); await p.waitForTimeout(700); const t2 = await o.evaluate(el => getComputedStyle(el.querySelector('[data-testid="on-tag"]').parentElement).opacity); ok("offers home: ON Tag shown only for eligible bundles", t1 === "0" && t2 === "1", `${t1} ${t2}`); await o.locator('label[data-offer="intro"]').click(); }
    await o.locator('label[data-offer="intro"] input').focus(); await p.keyboard.press("ArrowDown"); ok(`offers ${tag}: arrow keys change the offer (ON Repeat. choice is remembered)`, await total() === "$62", await total());
    ok(`offers ${tag}: preview disclosure present`, /Preview pricing in USD\. Subject to change\./.test(await o.locator('[data-testid="disclosure"]').innerText())); }
  await p.goto(base + "/", { waitUntil: "networkidle" }); const o = p.locator('[data-testid="offers"]'); await o.scrollIntoViewIfNeeded();
  const mail = `qa-${Date.now()}@example.com`; const f = o.locator("form"); let sent = null; p.on("request", r => { if (r.url().includes("/api/notify") && r.method() === "POST") sent = r.postDataJSON(); });
  await o.locator('label[data-offer="stockup"]').click(); await o.locator('label:has-text("ON Repeat.")').click(); await o.locator('label:has-text("Every 90 days")').click();
  await f.locator('input[type=email]').fill("not-an-email"); await f.locator("button[type=submit]").click(); await p.waitForTimeout(300); ok("signup: invalid email blocked", await o.locator('[data-testid="confirmation"]').count() === 0 && sent === null);
  await f.locator('input[type=email]').fill(mail); await f.locator("button[type=submit]").click(); await p.waitForTimeout(400); ok("signup: blocked without consent", sent === null);
  await f.locator('input[type=checkbox]').check(); await p.route("**/api/notify", async r => { await new Promise(x => setTimeout(x, 600)); r.continue(); }); await f.locator("button[type=submit]").click(); await p.waitForTimeout(150); ok("signup: button disabled with loading text while submitting", await f.locator("button[type=submit]").isDisabled().catch(() => false) && /adding/i.test(await f.locator("button[type=submit]").innerText().catch(() => "")));
  await p.waitForSelector('[data-testid="confirmation"]', { timeout: 8000 }).catch(() => {}); const m1 = await o.locator('[data-testid="confirmation"]').innerText().catch(() => "none"); ok("signup: confirmation reads You're on the list", /you’re on the list/i.test(m1) && /neither are we/i.test(m1), m1);
  ok("signup: captures offer, purchase type, interval, source, consent", sent && sent.offer === "stockup" && sent.purchaseType === "repeat" && sent.interval === 90 && sent.source === "home" && sent.consent === true, JSON.stringify(sent));
  await p.unroute("**/api/notify"); await p.reload({ waitUntil: "networkidle" }); const o2 = p.locator('[data-testid="offers"]'); await o2.scrollIntoViewIfNeeded(); await o2.locator('input[type=email]').fill(mail); await o2.locator('input[type=checkbox]').check(); await o2.locator("form button[type=submit]").click(); await p.waitForSelector('[data-testid="confirmation"]', { timeout: 8000 }).catch(() => {});
  const m2 = await o2.locator('[data-testid="confirmation"]').innerText().catch(() => "none"); ok("signup: duplicate handled", /already on it/i.test(m2), m2);
  const api = await p.request.post(base + "/api/notify", { data: { email: "bad", consent: true } }); ok("signup API rejects bad email (400)", api.status() === 400);
  const api2 = await p.request.post(base + "/api/notify", { data: { email: "ok@example.com" } }); ok("signup API requires consent (400)", api2.status() === 400);
  const api3 = await p.request.post(base + "/api/notify", { data: { email: "ok@example.com", consent: true, offer: "intro", purchaseType: "repeat", interval: 30 } }); ok("signup API refuses ON Repeat. on The Intro (400)", api3.status() === 400);
  const api4 = await p.request.post(base + "/api/notify", { data: { email: "ok@example.com", consent: true, offer: "mega" } }); ok("signup API refuses an unknown offer (400)", api4.status() === 400);
  await p.route("**/api/notify", r => r.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: "We couldn't add you just now. Please try again." }) })); await p.reload({ waitUntil: "networkidle" }); const o3 = p.locator('[data-testid="offers"]'); await o3.scrollIntoViewIfNeeded(); await o3.locator('input[type=email]').fill("x@example.com"); await o3.locator('input[type=checkbox]').check(); await o3.locator("form button[type=submit]").click(); await p.waitForSelector('[data-testid="offers"] [role="alert"]', { timeout: 5000 }).catch(() => {}); ok("signup: server error is shown, form stays usable", await o3.locator('[role="alert"]').count() === 1 && await o3.locator("form button[type=submit]").isEnabled()); await p.unroute("**/api/notify");
  const ev = await p.evaluate(async () => { const got = []; window.addEventListener("stillon:track", e => got.push(e.detail)); document.querySelector('label[data-offer="intro"]').click(); await new Promise(r => setTimeout(r, 100)); return got; }); ok("analytics: offer_select fires with no personal data", ev.some(e => e.event === "offer_select" && e.offer === "intro") && !JSON.stringify(ev).includes("@"), JSON.stringify(ev));
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
