import assert from "node:assert/strict";
import { chromium } from "playwright";
import { getRuntime, seedPreferences, loadImages } from "./check-utils.mjs";

const base = process.env.CHECK_URL || "http://127.0.0.1:4173";
const runtime = await getRuntime(base);
const browser = await chromium.launch({ headless: true });
try {
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [768, 1024],
    [1366, 640],
    [1440, 900],
    [1920, 958],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    await seedPreferences(page, runtime.slug);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base, { waitUntil: "networkidle" });
    await loadImages(page);
    const metrics = await page
      .locator(".location-card img")
      .evaluateAll((images) =>
        images.map((image) => ({
          width: image.getBoundingClientRect().width,
          height: image.getBoundingClientRect().height,
        })),
      );
    for (const image of metrics)
      assert.ok(
        Math.abs(image.width / image.height - 300 / 460) < 0.005,
        `Location photo distorted at ${width}px: ${JSON.stringify(image)}`,
      );
    const centered = async () => {
      // Looping rails settle their DOM order on the next animation frames.
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      await page.waitForFunction(() => {
        const card = document
          .querySelector(".location-card.is-featured")
          .getBoundingClientRect();
        const rail = document
          .querySelector(".location-carousel")
          .getBoundingClientRect();
        return (
          Math.abs(card.left + card.width / 2 - rail.left - rail.width / 2) < 2
        );
      });
    };
    await centered();
    if (runtime.homeLocations.length > 1) {
      for (const index of [0, runtime.homeLocations.length - 1, 1]) {
        await page.locator("[data-location-dots] button").nth(index).click();
        await page.waitForFunction(
          (slug) =>
            document
              .querySelector(".location-card.is-featured")
              .getAttribute("href") === `/location/${slug}/`,
          runtime.homeLocations[index],
        );
        await centered();
      }
      if (width >= 992) {
        await page.locator("[data-location-dots] button").last().click();
        await page.waitForFunction(
          (slug) =>
            document
              .querySelector(".location-card.is-featured")
              .getAttribute("href") === `/location/${slug}/`,
          runtime.homeLocations.at(-1),
        );
        await centered();
        await page.locator("[data-location-next]").click();
        await page.waitForFunction(
          (slug) =>
            document
              .querySelector(".location-card.is-featured")
              .getAttribute("href") === `/location/${slug}/`,
          runtime.homeLocations[0],
        );
        await centered();
        await page.locator("[data-location-prev]").click();
        await page.waitForFunction(
          (slug) =>
            document
              .querySelector(".location-card.is-featured")
              .getAttribute("href") === `/location/${slug}/`,
          runtime.homeLocations.at(-1),
        );
        await centered();
      }
    }
    if (await page.locator(".food-card").count()) {
      assert.equal(
        await page.locator(".food-card").count(),
        runtime.homeFoodCount,
      );
      const food = await page.locator(".food-card img").evaluateAll((images) =>
        images.map((image) => ({
          width: image.getBoundingClientRect().width,
          height: image.getBoundingClientRect().height,
          top: image.getBoundingClientRect().top,
        })),
      );
      for (const image of food) {
        assert.ok(
          Math.abs(image.width / image.height - 2 / 3) < 0.005,
          `Food photo frame has the wrong proportion at ${width}px: ${JSON.stringify(image)}`,
        );
        assert.ok(
          Math.abs(image.width - food[0].width) < 1 &&
            Math.abs(image.height - food[0].height) < 1,
          `Food photographs have different sizes at ${width}px`,
        );
        if (width >= 768) {
          assert.ok(
            image.height <= Math.min(height * 0.6, 540) + 1,
            `Food photograph overwhelms the ${width}x${height}px view`,
          );
        }
        assert.ok(
          Math.abs(image.top - food[0].top) < 1,
          `Food photographs are not aligned at ${width}px`,
        );
      }
      if (width >= 992) {
        const readFoodState = () =>
          page.locator(".food-rail").evaluate((rail) => ({
            active: rail.swiper.realIndex,
            height: rail.getBoundingClientRect().height,
            loop: rail.swiper.params.loop,
          }));
        const start = await readFoodState();
        const stepFood = async (direction) => {
          const before = await readFoodState();
          await page.locator(`.food-strip [data-rail-${direction}]`).click();
          const index = before.active + (direction === "next" ? 1 : -1);
          const expected = before.loop
            ? (index + food.length) % food.length
            : Math.max(0, Math.min(index, food.length - 1));
          await page.waitForFunction(
            (index) =>
              document.querySelector(".food-rail").swiper.realIndex === index,
            expected,
          );
          await page.waitForFunction(() => {
            const rail = document
              .querySelector(".food-rail")
              .getBoundingClientRect();
            const active = document
              .querySelector(".food-rail .swiper-slide-active")
              .getBoundingClientRect();
            return (
              Math.abs(
                active.left + active.width / 2 - rail.left - rail.width / 2,
              ) < 2
            );
          });
          const after = await readFoodState();
          assert.ok(
            Math.abs(after.height - start.height) < 1,
            `Food gallery jumps in height at ${width}px`,
          );
        };
        if (start.loop) {
          for (const direction of ["next", "prev"])
            for (let step = 0; step < food.length; step++)
              await stepFood(direction);
        } else {
          for (const direction of ["prev", "next"]) {
            while (
              await page
                .locator(`.food-strip [data-rail-${direction}]`)
                .isEnabled()
            )
              await stepFood(direction);
            assert.equal(
              (await readFoodState()).active,
              direction === "prev" ? 0 : food.length - 1,
            );
          }
          while ((await readFoodState()).active > start.active)
            await stepFood("prev");
        }
        assert.equal((await readFoodState()).active, start.active);
      }
      await page
        .locator(".food-rail .swiper-slide-active [data-lightbox-trigger]")
        .focus();
      for (const [key, direction] of [
        ["ArrowLeft", -1],
        ["ArrowRight", 1],
      ]) {
        const before = await page
          .locator(".food-rail")
          .evaluate((rail) => rail.swiper.realIndex);
        await page.keyboard.press(key);
        const loop = await page
          .locator(".food-rail")
          .evaluate((rail) => rail.swiper.params.loop);
        const expected = loop
          ? (before + direction + food.length) % food.length
          : Math.max(0, Math.min(before + direction, food.length - 1));
        await page
          .waitForFunction(
            (index) => {
              const active = document.querySelector(
                ".food-rail .swiper-slide-active",
              );
              return (
                document.querySelector(".food-rail").swiper.realIndex ===
                  index &&
                document.activeElement ===
                  active.querySelector("[data-lightbox-trigger]")
              );
            },
            expected,
            { timeout: 10000 },
          )
          .catch(async (error) => {
            const state = await page.locator(".food-rail").evaluate((rail) => ({
              active: rail.swiper.realIndex,
              animating: rail.swiper.animating,
              focus: document.activeElement?.getAttribute("aria-label"),
              focusTag: document.activeElement?.tagName,
            }));
            throw new Error(
              `Food keyboard ${key} failed at ${width}x${height}: expected ${expected}, ${JSON.stringify(state)}`,
              { cause: error },
            );
          });
      }
      await page
        .locator(".food-rail .swiper-slide-active [data-lightbox-trigger]")
        .click();
      assert.equal(
        await page.locator("[data-lightbox]").getAttribute("aria-hidden"),
        "false",
      );
      await page.keyboard.press("Escape");
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    `Carousel checks passed: ${runtime.slug}, 6 viewports, uniform photo sizes and alignment, contained gallery height, centered locations, full loops or both endpoints, keyboard and photo viewer.`,
  );
} finally {
  await browser.close();
}
