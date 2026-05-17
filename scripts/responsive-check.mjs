import { chromium } from "playwright";

const baseUrl = process.env.CHECK_URL ?? "http://127.0.0.1:5173";

const pages = [
  { path: "/", name: "home" },
  { path: "/our-cuisine/", name: "cuisine" },
  { path: "/our-drinks/", name: "drinks" },
  { path: "/locations/", name: "locations" },
  { path: "/location/?city=hong-kong", name: "location-hk" },
  { path: "/location/?city=dubai", name: "location-dubai" },
  { path: "/reserve/", name: "reserve" },
  { path: "/awards-media/", name: "awards" },
];

const viewports = [
  { name: "iphone-se", width: 320, height: 568, mobile: true },
  { name: "iphone-8", width: 375, height: 667, mobile: true },
  { name: "iphone-13", width: 390, height: 844, mobile: true },
  { name: "iphone-15-pro-max", width: 430, height: 932, mobile: true },
  { name: "pixel-7", width: 412, height: 915, mobile: true },
  { name: "ipad-mini-portrait", width: 768, height: 1024, mobile: true },
  { name: "ipad-air-portrait", width: 820, height: 1180, mobile: true },
  { name: "ipad-landscape", width: 1024, height: 768, mobile: true },
  { name: "tablet-wide-landscape", width: 1180, height: 820, mobile: true },
  { name: "desktop-small", width: 1366, height: 768, mobile: false },
];

const screenshotTargets = new Set([
  "iphone-se/home",
  "iphone-se/locations",
  "iphone-se/reserve",
  "iphone-se/awards",
  "ipad-mini-portrait/home",
  "ipad-mini-portrait/locations",
  "ipad-landscape/reserve",
  "ipad-landscape/awards",
]);

const browser = await chromium.launch({ headless: true });
const failures = [];
const notes = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.mobile,
    hasTouch: viewport.mobile,
    deviceScaleFactor: viewport.mobile ? 2 : 1,
  });

  for (const pageInfo of pages) {
    const page = await context.newPage();
    const url = new URL(pageInfo.path, baseUrl).toString();
    await page.goto(url, { waitUntil: "networkidle" });

    const metrics = await page.evaluate(() => {
      const html = document.documentElement;
      const body = document.body;
      const viewportWidth = html.clientWidth;
      const scrollWidth = Math.max(body.scrollWidth, html.scrollWidth);
      const brokenImages = [...document.images]
        .filter((img) => {
          const rect = img.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (!img.complete || img.naturalWidth === 0);
        })
        .map((img) => img.currentSrc || img.getAttribute("src") || img.alt || "unknown image");

      const clippedControls = [...document.querySelectorAll("a, button, input")]
        .filter((el) => {
          if (el.closest(".image-rail, .location-carousel")) {
            return false;
          }

          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return rect.width > 1 && rect.height > 1 && style.visibility !== "hidden" && style.display !== "none";
        })
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.left < -2 || rect.right > viewportWidth + 2;
        })
        .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim()}"`);

      const oversizedText = [...document.querySelectorAll("h1, h2, h3, .photo-link span, .reserve-link")]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > viewportWidth + 2;
        })
        .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || "").trim()}"`);

      return {
        viewportWidth,
        scrollWidth,
        brokenImages,
        clippedControls,
        oversizedText,
      };
    });

    if (metrics.scrollWidth > metrics.viewportWidth + 2) {
      failures.push(`${viewport.name}/${pageInfo.name}: horizontal overflow ${metrics.scrollWidth}px > ${metrics.viewportWidth}px`);
    }

    if (metrics.brokenImages.length > 0) {
      failures.push(`${viewport.name}/${pageInfo.name}: broken images: ${metrics.brokenImages.join(", ")}`);
    }

    if (metrics.clippedControls.length > 0) {
      failures.push(`${viewport.name}/${pageInfo.name}: clipped controls: ${metrics.clippedControls.join("; ")}`);
    }

    if (metrics.oversizedText.length > 0) {
      failures.push(`${viewport.name}/${pageInfo.name}: oversized text: ${metrics.oversizedText.join("; ")}`);
    }

    if (screenshotTargets.has(`${viewport.name}/${pageInfo.name}`)) {
      const file = `/tmp/mott32-responsive-${pageInfo.name}-${viewport.name}.png`;
      await page.screenshot({ path: file, fullPage: true });
      notes.push(file);
    }

    await page.close();
  }

  await context.close();
}

await browser.close();

if (failures.length > 0) {
  console.error(`Responsive check failed across ${pages.length * viewports.length} page loads.`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Responsive check passed across ${pages.length} pages and ${viewports.length} viewports.`);
console.log(`Screenshots: ${notes.join(", ")}`);
