// Shopify-mode tests against the mock Storefront API. node shop.mjs <base> <mockBase>
import { chromium } from "playwright";
const base = process.argv[2], mock = process.argv[3]; const b = await chromium.launch(); const res = []; const errs = [];
const ok = (n, c, x = "") => res.push(`${c ? "PASS" : "FAIL"}  ${n}${x ? "  — " + x : ""}`);
const last = async () => (await fetch(mock + "/__last")).json();
const mk = async (vp) => { const p = await (await b.newContext({ viewport: vp })).newPage(); p.on("pageerror", e => errs.push(e.message)); return p; };
const D = { width: 1440, height: 900 }, M = { width: 390, height: 844 };
for (const [tag, path] of [["home", "/"], ["pdp", "/products/energy-strips"]]) {
  const p = await mk(D); await p.goto(base + path, { waitUntil: "load" }); await p.waitForTimeout(900); const o = p.locator('[data-testid="offers"]'); await o.scrollIntoViewIfNeeded();
  const prices = await o.evaluate(el => ["intro", "everyday", "stockup"].map(i => el.querySelector(`[data-price="${i}"]`).textContent.trim()).join(","));
  ok(`${tag}: prices come from Shopify ($41, $72, $93), not the preview config`, prices === "$41,$72,$93", prices);
  const total = () => o.locator('[data-testid="total"]').innerText();
  await o.locator('label:has-text("ON Repeat.")').click(); ok(`${tag}: Everyday ON Repeat. is Shopify's $65 per delivery`, await total() === "$65", await total());
  await o.locator('label[data-offer="stockup"]').click(); ok(`${tag}: Stockup ON Repeat. is $83`, await total() === "$83", await total());
  await o.locator('label[data-offer="intro"]').click(); ok(`${tag}: Intro stays one-time only`, await o.locator('[data-testid="one-time-only"]').count() === 1 && await total() === "$41");
  ok(`${tag}: unit prices derived from Shopify prices`, /\$1\.37 per strip/.test(await o.innerText()) && /\$1\.20 per strip/.test(await o.innerText()) && /\$1\.03 per strip/.test(await o.innerText()), "");
  ok(`${tag}: email form replaced by Checkout`, await o.locator("form").count() === 0 && await o.locator('[data-testid="shop-checkout"]').isVisible());
  ok(`${tag}: no preview-pricing disclaimer, Shopify checkout disclosure instead`, !/preview pricing/i.test(await o.innerText()) && /hosted securely by Shopify/i.test(await o.locator('[data-testid="disclosure"]').innerText()));
  if (tag === "home") {
    ok("header: CTA reads Get yours, no cart button", (await p.locator("header").innerText()).toLowerCase().includes("get yours") && await p.locator('[data-testid="cart-count"]').count() === 0);
    ok("hero and closing CTAs read Get yours", !/get early access/i.test(await p.locator("main").innerText()), "");
    ok("homepage has no early-access signup form", await p.locator("main form").count() === 0);
    // checkout one-time Everyday
    await o.locator('label[data-offer="everyday"]').click(); await o.locator('label:has-text("One-time")').click();
    const [r1] = await Promise.all([p.waitForRequest(r => r.url().includes("/checkout-mock/")), o.locator('[data-testid="shop-checkout"]').click()]); const c1 = await last(); await p.waitForTimeout(900);
    ok("checkout: Everyday one-time creates a cart for variant 102 with no selling plan", r1.url().includes("/checkout-mock/cart1") && c1.lines?.[0].merchandiseId === "gid://shopify/ProductVariant/102" && c1.lines[0].quantity === 1 && !("sellingPlanId" in c1.lines[0]), JSON.stringify(c1));
    await p.goto(base + "/", { waitUntil: "load" }); await p.waitForTimeout(700); const o2 = p.locator('[data-testid="offers"]'); await o2.scrollIntoViewIfNeeded();
    await o2.locator('label:has-text("ON Repeat.")').click(); await o2.locator('label:has-text("Every 60 days")').click();
    const [r2] = await Promise.all([p.waitForRequest(r => r.url().includes("/checkout-mock/")), o2.locator('[data-testid="shop-checkout"]').click()]); const c2 = await last(); await p.waitForTimeout(900);
    ok("checkout: Everyday ON Repeat. every 60 days sends selling plan 302", c2.lines?.[0].merchandiseId === "gid://shopify/ProductVariant/102" && c2.lines[0].sellingPlanId === "gid://shopify/SellingPlan/302", JSON.stringify(c2));
    await p.goto(base + "/", { waitUntil: "load" }); await p.waitForTimeout(700); const o3 = p.locator('[data-testid="offers"]'); await o3.scrollIntoViewIfNeeded();
    await o3.locator('label[data-offer="stockup"]').click(); await o3.locator('label:has-text("ON Repeat.")').click(); await o3.locator('label:has-text("Every 90 days")').click();
    await Promise.all([p.waitForRequest(r => r.url().includes("/checkout-mock/")), o3.locator('[data-testid="shop-checkout"]').click()]); const c3 = await last(); await p.waitForTimeout(900);
    ok("checkout: Stockup ON Repeat. every 90 days sends variant 103 + plan 303", c3.lines?.[0].merchandiseId === "gid://shopify/ProductVariant/103" && c3.lines[0].sellingPlanId === "gid://shopify/SellingPlan/303", JSON.stringify(c3));
    const api = async (data) => (await p.request.post(base + "/api/shopify/checkout", { data })).status();
    ok("checkout API: unknown bundle → 400", await api({ offer: "mega" }) === 400); ok("checkout API: ON Repeat. on The Intro → 400", await api({ offer: "intro", purchaseType: "repeat", interval: 30 }) === 400); ok("checkout API: repeat without a valid interval → 400", await api({ offer: "everyday", purchaseType: "repeat", interval: 45 }) === 400);
    const sh = await p.goto(base + "/shipping", { waitUntil: "load" }); ok("shipping page: calculated at checkout, not 'not shipping yet'", /calculated at checkout/i.test(await p.locator("article").innerText()) && !/not shipping yet/i.test(await p.locator("article").innerText()), String(sh.status()));
    await p.goto(base + "/faq", { waitUntil: "load" }); await p.waitForTimeout(500); await p.locator("#faq-b-7, button:has-text('Can I buy it now?')").first().click(); await p.waitForTimeout(500); ok("FAQ: 'Can I buy it now?' says yes in shop mode", /yes\. choose a bundle/i.test(await p.locator("#faq").innerText()));
  }
  await p.context().close(); }
{ const p = await mk(M); await p.goto(base + "/", { waitUntil: "load" }); await p.waitForTimeout(900); const w = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); ok("mobile: no horizontal overflow in shop mode", w[0] <= w[1], w.join(">")); const o = p.locator('[data-testid="offers"]'); await o.scrollIntoViewIfNeeded(); ok("mobile: three bundles and Checkout visible", await o.locator("[data-offer]").count() === 3 && await o.locator('[data-testid="shop-checkout"]').isVisible()); await p.context().close(); }
{ const p = await mk(D); await p.goto(base + "/", { waitUntil: "load" }); const y0 = await p.evaluate(() => Math.round(document.getElementById("strips").getBoundingClientRect().top)); await p.mouse.move(700, 500); for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 150); await p.waitForTimeout(80); } await p.waitForTimeout(600); ok("existing animation and navbar still run in shop mode", await p.evaluate(() => document.querySelector('[data-testid="nav-shell"]').dataset.hidden !== undefined && !!document.querySelector("[data-pin]")), String(y0)); await p.context().close(); }
console.log(res.join("\n")); console.log("FAILED:", res.filter(r => r.startsWith("FAIL")).length, "/", res.length); console.log("PAGE ERRORS:", errs.length ? [...new Set(errs)].slice(0, 5) : "none"); await b.close();
