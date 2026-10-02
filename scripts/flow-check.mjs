import assert from "node:assert/strict";
import { chromium } from "playwright";
import { getRuntime, seedPreferences } from "./check-utils.mjs";

const base = process.env.CHECK_URL || "http://127.0.0.1:4173";
const runtime = await getRuntime(base);
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await seedPreferences(context, runtime.slug);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().startsWith(base) && response.status() === 404)
      errors.push(`Missing: ${response.url()}`);
  });
  await page.goto(base, { waitUntil: "networkidle" });
  assert.equal(
    await page.locator(".cookie-panel").count(),
    0,
    "cookie preferences must use the configured brand key",
  );
  assert.equal(
    await page.locator(".location-card").count(),
    runtime.homeLocations.length,
  );
  await page.locator(".nav-toggle").click();
  assert.equal(
    await page.locator(".drawer").getAttribute("aria-hidden"),
    "false",
  );
  await page.keyboard.press("Escape");
  await page.locator('.quick-actions a[href="/reserve/"]').click();
  assert.equal(
    await page.locator("[data-reserve-select] option").count(),
    runtime.locations.length,
  );
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    const metrics = await page
      .locator(".reserve-modal-panel")
      .evaluate((element) => ({
        client: element.clientWidth,
        scroll: element.scrollWidth,
        titleClient: element.querySelector("h2").clientWidth,
        titleScroll: element.querySelector("h2").scrollWidth,
      }));
    assert.ok(
      metrics.scroll <= metrics.client + 2,
      `Reservation dialog overflows at ${width}px: ${JSON.stringify(metrics)}`,
    );
    assert.ok(
      metrics.titleScroll <= metrics.titleClient + 2,
      `Reservation title is clipped at ${width}px`,
    );
  }
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator("[data-vip-open]").click();
  await page.locator("#vip-email").fill(`flow-${runtime.slug}@example.invalid`);
  await page.locator('.vip-modal-form input[name="consent"]').check();
  await page.route("**/api/newsletter", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"storage_unavailable"}',
    }),
  );
  await page.locator('.vip-modal-form button[type="submit"]').click();
  await page.waitForFunction(
    () => !document.querySelector(".vip-modal-form").dataset.pending,
  );
  const failure = await page
    .locator(".vip-modal-form .newsletter-status")
    .innerText();
  assert.match(failure, /could not|No hemos podido/);
  assert.equal(
    await page.locator("#vip-email").inputValue(),
    `flow-${runtime.slug}@example.invalid`,
    "failed submissions must preserve input",
  );
  await page.unroute("**/api/newsletter");
  await page.locator('.vip-modal-form button[type="submit"]').click();
  await page.waitForFunction(
    () => !document.querySelector(".vip-modal-form").dataset.pending,
  );
  assert.match(
    await page.locator(".vip-modal-form .newsletter-status").innerText(),
    /on the list|en la lista/,
  );
  assert.equal(await page.locator("#vip-email").inputValue(), "");
  await page.keyboard.press("Escape");
  await page.goto(`${base}/reserve/`, { waitUntil: "networkidle" });
  if (await page.locator(".generic-topline").count()) {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      const layout = await page.evaluate(() => {
        const title = document.querySelector("h1").getBoundingClientRect();
        const header = document
          .querySelector(".generic-topline")
          .getBoundingClientRect();
        const actions = document
          .querySelector(".quick-actions")
          .getBoundingClientRect();
        return {
          titleTop: title.top,
          titleBottom: title.bottom,
          headerBottom: header.bottom,
          actionsTop: actions.top,
          actionsBottom: actions.bottom,
        };
      });
      assert.ok(
        layout.titleTop >= layout.headerBottom,
        `Reservation heading overlaps the header at ${width}px`,
      );
      assert.ok(
        layout.actionsTop >= layout.titleBottom ||
          layout.actionsBottom <= layout.titleTop,
        `Quick actions obscure the reservation heading at ${width}px`,
      );
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  const city = runtime.locations[0];
  await page.goto(`${base}/locations/`, { waitUntil: "networkidle" });
  const name = await page
    .locator(`.location-tile[data-location="${city}"] h3`)
    .innerText();
  await page.locator("[data-location-search]").fill(
    name
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .split("\n")[0]
      .trim(),
  );
  assert.equal(await page.locator(".location-tile:not([hidden])").count(), 1);
  await page.goto(`${base}/our-cuisine/?city=${city}`, {
    waitUntil: "networkidle",
  });
  assert.equal(await page.locator("[data-menu-location]").inputValue(), city);
  assert.ok((await page.locator(".menu-card:not([hidden])").count()) > 0);
  await page
    .locator(".menu-card:not([hidden]) [data-lightbox-trigger]")
    .first()
    .click();
  assert.equal(
    await page.locator("[data-lightbox]").getAttribute("aria-hidden"),
    "false",
  );
  await page.keyboard.press("Escape");
  for (const route of ["/our-cuisine/", "/our-drinks/"]) {
    await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    if (!(await page.locator(".image-rail").count())) continue;
    await page.setViewportSize({ width: 390, height: 844 });
    const photograph = page
      .locator(".image-rail [data-lightbox-trigger]")
      .first();
    await photograph.click();
    assert.equal(
      await page.locator("[data-lightbox]").getAttribute("aria-hidden"),
      "false",
      `Gallery photograph must open on ${route}`,
    );
    await page.keyboard.press("Escape");
    await photograph.scrollIntoViewIfNeeded();
    const bounds = await photograph.boundingBox();
    const rail = page.locator(".image-rail");
    const before = await rail.evaluate((element) => element.scrollLeft);
    await page.mouse.move(
      bounds.x + bounds.width * 0.8,
      bounds.y + bounds.height * 0.5,
    );
    await page.mouse.down();
    await page.mouse.move(
      bounds.x + bounds.width * 0.2,
      bounds.y + bounds.height * 0.5,
      { steps: 8 },
    );
    await page.mouse.up();
    await page.waitForFunction(
      (initial) =>
        document.querySelector(".image-rail").scrollLeft > initial + 40,
      before,
    );
    assert.equal(
      await page.locator("[data-lightbox]").getAttribute("aria-hidden"),
      "true",
      `Dragging must not open a photograph on ${route}`,
    );
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const slug of runtime.locations) {
    const response = await page.goto(`${base}/location/${slug}/`, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200);
    assert.ok((await page.locator("h1").innerText()).trim());
    const headings = await page
      .locator("h1:visible, h2:visible, h3:visible")
      .allTextContents();
    assert.ok(
      headings.every((title) => title.trim()),
      `Empty heading on ${slug}`,
    );
    const html = await response.text();
    assert.match(html, /property="og:title"/);
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    assert.ok(canonical.endsWith(`/location/${slug}/`));
  }
  assert.deepEqual(errors, [], "no browser errors or missing assets");
  console.log(
    `Functional checks passed: ${runtime.slug}, ${runtime.locations.length} location pages, mobile dialogs, gallery clicks and dragging, filters, signup failure and persistent signup.`,
  );
} finally {
  await browser.close();
}
