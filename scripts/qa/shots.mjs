// Visual QA: node scripts/shots.mjs <outDir> [base]
import { chromium } from "playwright";
const out = process.argv[2]; const base = process.argv[3] ?? "http://localhost:3000";
const b = await chromium.launch();
const errors = [];
async function run(name, vp, path, steps) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: name.includes("rm") ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  p.on("console", (m) => m.type() === "error" && errors.push(`${name}: ${m.text()}`));
  p.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  await p.goto(base + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(2200);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (const [label, y] of steps(H, vp.height)) {
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await p.waitForTimeout(1300);
    await p.screenshot({ path: `${out}/${name}-${label}.jpg`, type: "jpeg", quality: 70 });
  }
  console.log(name, "height", H);
  await ctx.close();
}
const which = process.argv[4] ?? "all";
const D = { width: 1440, height: 900 }, M = { width: 390, height: 844 };
if (which === "all" || which === "home") {
  await run("d-home", D, "/", (H, v) => Array.from({ length: Math.ceil(H / v) }, (_, i) => [String(i).padStart(2, "0"), i * v]));
}
if (which === "all" || which === "mobile") {
  await run("m-home", M, "/", (H, v) => Array.from({ length: Math.ceil(H / (v * 1.5)) }, (_, i) => [String(i).padStart(2, "0"), i * v * 1.5]));
}
if (which === "all" || which === "pages") {
  await run("d-pdp", D, "/products/energy-strips", (H, v) => Array.from({ length: Math.ceil(H / v) }, (_, i) => [String(i).padStart(2, "0"), i * v]));
  await run("d-story", D, "/story", (H, v) => Array.from({ length: Math.ceil(H / v) }, (_, i) => [String(i).padStart(2, "0"), i * v]));
  await run("m-pdp", M, "/products/energy-strips", (H, v) => Array.from({ length: Math.min(6, Math.ceil(H / v)) }, (_, i) => [String(i).padStart(2, "0"), i * v]));
}
if (which === "rm") await run("d-rm-home", D, "/", (H, v) => Array.from({ length: Math.ceil(H / v) }, (_, i) => [String(i).padStart(2, "0"), i * v]));
console.log("ERRORS", errors.length ? errors : "none");
await b.close();
