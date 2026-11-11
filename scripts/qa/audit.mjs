// Captures each homepage section at desktop and mobile. node audit.mjs <outDir>
import { chromium } from "playwright";
const out = process.argv[2]; const b = await chromium.launch();
for (const [n, vp] of [["d", { width: 1440, height: 900 }], ["m", { width: 390, height: 844 }]]) {
  const p = await (await b.newContext({ viewport: vp })).newPage(); await p.goto("http://localhost:3000", { waitUntil: "networkidle" }); await p.waitForTimeout(2200);
  const shot = (name) => p.screenshot({ path: `${out}/${n}-${name}.jpg`, type: "jpeg", quality: 72 });
  const top = (id) => p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, id);
  const to = async (y) => { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(1300); };
  await shot("1hero");
  const s = await top("strips"); await to(s); await shot("2a-box"); await to(s + vp.height * 1.1); await shot("2b-sachet"); await to(s + vp.height * 2.3); await shot("2c-strip"); await to(s + vp.height * 3.25); await shot("2d-usage");
  const c = await top("campaign"); await to(c); await shot("3a-reel"); if (n === "d") { await to(c + 1500); await shot("3b-reel"); await to(c + 3000); await shot("3c-reel"); }
  const f = await top("formula"); await to(f); await shot("4formula"); if (n === "m") { await to(f + 700); await shot("4b-formula"); }
  const e = await top("early-access"); await to(e); await shot("5a-offer"); await to(e + vp.height * 0.8); await shot("5b-offer"); if (n === "m") { await to(e + vp.height * 1.6); await shot("5c-offer"); }
  const H = await p.evaluate(() => document.documentElement.scrollHeight); await to(H - vp.height * 1.6); await shot("6a-closing"); await to(H); await shot("6b-footer");
  await p.close(); }
await b.close();
