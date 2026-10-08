// Full-page screenshots for pixel comparison.
// Usage: node scripts/screenshot.mjs <baseUrl> <outDir> [paths...]
// e.g.   node scripts/screenshot.mjs https://seats-inc.com qa/live
//        node scripts/screenshot.mjs http://localhost:3000 qa/local
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [base, outDir, ...rest] = process.argv.slice(2);
const paths = rest.length
  ? rest
  : [
      "/", "/overview/", "/history/", "/philosophy-our-value/", "/ceo-message/",
      "/loka-japanese-foods-beverage/", "/nova-marketing/", "/pisa-food-retail/",
      "/news-event/", "/contact/", "/ja/", "/ja/overview/", "/ja/news-event/",
    ];
const widths = { desktop: 1440, mobile: 390 };

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const [device, width] of Object.entries(widths)) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const p of paths) {
    try {
      await page.goto(base + p, { waitUntil: "networkidle", timeout: 90000 });
    } catch {
      /* screenshot whatever loaded */
    }
    // Trigger lazy-loaded images / scroll animations
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    const name = (p.replace(/\//g, "_").replace(/^_|_$/g, "") || "home") + `.${device}.png`;
    await page.screenshot({ path: path.join(outDir, name), fullPage: true });
    console.log("shot", name);
  }
  await page.close();
}
await browser.close();
