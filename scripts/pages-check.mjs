import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { parseHTML } from "linkedom";
import { chromium } from "playwright";
import { seedPreferences, loadImages } from "./check-utils.mjs";

const server = spawn(process.execPath, ["scripts/serve.mjs", "dist-pages"], {
  env: { ...process.env, PORT: "4180" },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";
server.stdout.on("data", (data) => {
  logs += data;
});
server.stderr.on("data", (data) => {
  logs += data;
});
const base = "http://127.0.0.1:4180";
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) throw new Error(logs);
    try {
      ready = (await fetch(base)).ok;
    } catch {}
    if (ready) break;
    await delay(200);
  }
  assert.ok(ready, `Static preview failed: ${logs}`);
  const documents = new Map(),
    resources = new Set();
  async function documentAt(path) {
    if (!documents.has(path)) {
      const response = await fetch(base + path);
      assert.equal(response.status, 200, `Missing page ${path}`);
      documents.set(path, parseHTML(await response.text()).document);
    }
    return documents.get(path);
  }
  const portal = await documentAt("/");
  for (const mount of ["oliva", "mott32"])
    assert.ok(portal.querySelector(`a[href='/${mount}/']`));
  for (const mount of ["oliva", "mott32"]) {
    const prefix = `/${mount}/`;
    const runtime = await (
      await fetch(base + prefix + "site-runtime.json")
    ).json();
    assert.equal(runtime.basePath, prefix);
    for (const route of [
      ...runtime.routes,
      ...runtime.locations.map((slug) => `/location/${slug}/`),
    ]) {
      const path = prefix + route.slice(1),
        document = await documentAt(path);
      assert.equal(document.querySelectorAll("h1").length, 1, path);
      assert.ok(
        document
          .querySelector('link[rel="canonical"]')
          .href.startsWith("https://r1.diegoayala.com" + prefix),
        `Incorrect canonical on ${path}`,
      );
      assert.equal(
        document.querySelectorAll(".signup-form, [data-vip-open]").length,
        0,
        `Static hosting must not offer a subscription on ${path}`,
      );
      for (const link of document.querySelectorAll("a[href]")) {
        const target = new URL(link.getAttribute("href"), base + path);
        if (target.origin !== base) continue;
        assert.ok(
          target.pathname.startsWith(prefix),
          `Link escapes ${mount}: ${target.pathname}`,
        );
        if (/\.(pdf|svg|png|jpe?g|webp)$/.test(target.pathname)) {
          resources.add(target.pathname);
          continue;
        }
        const destination = await documentAt(target.pathname);
        if (target.hash)
          assert.ok(
            destination.getElementById(
              decodeURIComponent(target.hash.slice(1)),
            ),
            `Missing anchor ${target.href}`,
          );
      }
    }
  }
  for (const [path, document] of documents) {
    for (const element of document.querySelectorAll(
      "img[src], script[src], link[rel='stylesheet'], [data-lightbox-image]",
    )) {
      const value =
        element.getAttribute("src") ||
        element.getAttribute("href") ||
        element.getAttribute("data-lightbox-image");
      if (value) {
        const target = new URL(value, base + path);
        if (target.origin === base) resources.add(target.pathname);
      }
    }
    for (const image of document.querySelectorAll("img[srcset]"))
      for (const entry of image.getAttribute("srcset").split(","))
        resources.add(
          new URL(entry.trim().split(/\s+/)[0], base + path).pathname,
        );
  }
  for (const path of [...resources].filter((path) => path.endsWith(".css"))) {
    const css = await (await fetch(base + path)).text();
    for (const match of css.matchAll(/url\((?:["'])?([^\)"']+)(?:["'])?\)/g)) {
      const target = new URL(match[1], base + path);
      if (target.origin === base) resources.add(target.pathname);
    }
  }
  await Promise.all(
    [...resources].map(async (path) =>
      assert.equal(
        (await fetch(base + path, { method: "HEAD" })).status,
        200,
        `Missing asset ${path}`,
      ),
    ),
  );
  browser = await chromium.launch({ headless: true });
  for (const mount of ["oliva", "mott32"]) {
    const prefix = `/${mount}/`,
      runtime = await (await fetch(base + prefix + "site-runtime.json")).json();
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    await seedPreferences(context, runtime.slug);
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.url().startsWith(base) && response.status() >= 400)
        errors.push(response.url());
    });
    await page.goto(base + prefix, { waitUntil: "networkidle" });
    await loadImages(page);
    const sizes = await page
      .locator(".food-card img")
      .evaluateAll((images) =>
        images.map((image) => ({
          width: image.getBoundingClientRect().width,
          height: image.getBoundingClientRect().height,
          loaded: image.complete && image.naturalWidth > 0,
        })),
      );
    assert.ok(
      sizes.length > 0 &&
        sizes.every(
          (image) =>
            image.loaded &&
            Math.abs(image.width - sizes[0].width) < 1 &&
            Math.abs(image.height - sizes[0].height) < 1,
        ),
      `Uneven or missing gallery images: ${mount}`,
    );
    await page.locator(`.quick-actions a[href='${prefix}reserve/']`).click();
    assert.equal(
      await page.locator(".reserve-modal").getAttribute("aria-hidden"),
      "false",
    );
    await page
      .locator("[data-reserve-select]")
      .selectOption(runtime.locations.at(-1));
    assert.ok(
      (
        await page.locator(".reserve-full-link").getAttribute("href")
      ).startsWith(prefix),
    );
    await page.keyboard.press("Escape");
    await page.locator(".nav-toggle").click();
    await page.locator(`.drawer a[href^='${prefix}our-cuisine/']`).click();
    await page.waitForURL((url) => url.pathname === prefix + "our-cuisine/");
    await page
      .locator("[data-menu-location]")
      .selectOption(runtime.locations[0]);
    await page
      .locator(".menu-card:not([hidden]) [data-lightbox-trigger]")
      .first()
      .click();
    assert.equal(
      await page.locator("[data-lightbox]").getAttribute("aria-hidden"),
      "false",
    );
    await page.keyboard.press("Escape");
    const slug = mount === "oliva" ? "madrid" : "dubai";
    await page.goto(base + prefix + `location/${slug}/`, {
      waitUntil: "networkidle",
    });
    assert.match(
      await page.locator("h1").innerText(),
      mount === "oliva" ? /Madrid/i : /Dubai/i,
    );
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(base + prefix, { waitUntil: "networkidle" });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 2,
        ),
        `Horizontal overflow: ${mount} at ${width}`,
      );
    }
    assert.deepEqual(errors, [], `Browser errors in ${mount}`);
    await context.close();
  }
  console.log(
    `GitHub Pages checks passed: ${documents.size} pages, ${resources.size} assets, both subpaths, navigation, reservations, galleries and mobile layouts.`,
  );
} finally {
  await browser?.close();
  server.kill();
}
