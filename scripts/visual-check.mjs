import { chromium } from "playwright";

const baseUrl = process.env.CHECK_URL ?? "http://127.0.0.1:5173";
const browser = await chromium.launch({ headless: true });
const pages = [
  { path: "/", name: "home" },
  { path: "/our-cuisine/", name: "cuisine" },
  { path: "/our-drinks/", name: "drinks" },
  { path: "/locations/", name: "locations" },
  { path: "/location/?city=hong-kong", name: "location-detail" },
  { path: "/reserve/", name: "reserve" },
  { path: "/awards-media/", name: "awards" },
];

for (const viewport of [
  { width: 1440, height: 1100, name: "desktop" },
  { width: 390, height: 844, name: "mobile" },
]) {
  for (const pageInfo of pages) {
    const page = await browser.newPage({ viewport });
    const url = new URL(pageInfo.path, baseUrl).toString();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.screenshot({ path: `/tmp/mott32-clone-${pageInfo.name}-${viewport.name}.png`, fullPage: true });

    const metrics = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      return {
        scrollWidth: Math.max(body.scrollWidth, html.scrollWidth),
        clientWidth: html.clientWidth,
        images: [...document.images].map((img) => ({
          alt: img.alt,
          complete: img.complete,
          src: img.currentSrc || img.getAttribute("src") || "",
          naturalWidth: img.naturalWidth,
        })),
      };
    });

    const brokenImages = metrics.images.filter((image) => image.src && (!image.complete || image.naturalWidth === 0));
    if (brokenImages.length > 0) {
      throw new Error(`${pageInfo.name} ${viewport.name}: ${brokenImages.length} image(s) failed to load`);
    }

    if (metrics.scrollWidth > metrics.clientWidth + 2) {
      throw new Error(
        `${pageInfo.name} ${viewport.name}: horizontal overflow ${metrics.scrollWidth}px > ${metrics.clientWidth}px`,
      );
    }

    await page.close();
  }
}

await browser.close();
console.log(`Visual checks passed for ${pages.length} pages at ${baseUrl}`);
