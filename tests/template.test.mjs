import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseHTML } from "linkedom";
import { siteConfig as example } from "../examples/mott32.config.js";
import { siteConfig as generic } from "../template/site-config.js";
import {
  validateConfig,
  pagePath,
  requestedLocation,
  sitePath,
} from "../core/config.js";
import { renderDocument } from "../core/render.js";
import { seoData } from "../core/seo.js";

async function render(config, path, url = path) {
  const html = await readFile(
    new URL(`..${path}index.html`, import.meta.url),
    "utf8",
  );
  const { document } = parseHTML(html);
  renderDocument(document, config, url);
  return document;
}

test("example and generic configurations are complete", () => {
  assert.equal(validateConfig(example), example);
  assert.equal(validateConfig(generic), generic);
});

test("replacing every example location works with no Hong Kong fallback", async () => {
  const config = structuredClone(example);
  config.locations = structuredClone(generic.locations);
  config.menu.items = config.menu.items.map((item) => ({
    ...item,
    locations: ["madrid"],
  }));
  const home = await render(config, "/");
  assert.equal(home.querySelectorAll(".location-card").length, 1);
  assert.match(
    home.querySelector(".location-card").href,
    /\/location\/madrid\//,
  );
  const directory = await render(config, "/locations/");
  assert.equal(directory.querySelectorAll(".location-tile").length, 1);
  assert.equal(
    directory.querySelector(".location-tile h3").textContent.trim(),
    "Madrid",
  );
  const detail = await render(config, "/location/");
  assert.equal(detail.querySelector("h1").textContent, "Madrid");
});

test("adding, renaming and removing menu items changes the generated cards", async () => {
  const config = structuredClone(generic);
  config.menu.items = [
    {
      ...config.menu.items[0],
      id: "new-dish",
      title: "Chef’s special <seasonal>",
      category: "chef",
    },
  ];
  const document = await render(config, "/our-cuisine/");
  assert.equal(document.querySelectorAll(".menu-card").length, 1);
  assert.equal(
    document.querySelector(".menu-card strong").textContent,
    "Chef’s special <seasonal>",
  );
  assert.equal(document.querySelectorAll("seasonal").length, 0);
  assert.equal(
    document.querySelector('[data-filter="chef"]').textContent,
    "chef",
  );
});

test("generic routes contain no example branding and have metadata before JavaScript", async () => {
  for (const route of generic.routes) {
    const document = await render(generic, route);
    assert.doesNotMatch(
      document.toString(),
      /Mott 32|mott32\.com|Hong Kong|mott32-main-logo/,
    );
    assert.equal(document.documentElement.lang, "es");
    assert.equal(document.querySelectorAll("h1").length, 1);
    assert.equal(document.querySelector('[aria-label="Open menu"]'), null);
    assert.ok(document.querySelector('[aria-label="Abrir menú"]'));
    assert.ok(document.querySelector('meta[property="og:title"]'));
    assert.ok(document.querySelector('meta[property="og:image"]'));
    assert.equal(document.querySelectorAll("#restaurant-schema").length, 1);
    assert.equal(
      document.querySelector('meta[name="robots"]').content,
      "noindex,nofollow",
    );
  }
});

test("generic homepage gallery follows its menu and preserves Spanish controls", async () => {
  const config = structuredClone(generic);
  config.menu.items = [
    { ...config.menu.items[0], title: "Nueva propuesta de temporada" },
  ];
  const document = await render(config, "/");
  assert.equal(document.querySelectorAll(".food-card").length, 1);
  assert.equal(
    document.querySelector(".food-card figcaption").textContent,
    "Nueva propuesta de temporada",
  );
  assert.equal(
    document.querySelector("[data-rail-next]").getAttribute("aria-label"),
    "Plato siguiente",
  );
  assert.doesNotMatch(
    document.querySelector("#experience").textContent,
    /Sustituye|punto de partida/,
  );
});

test("location SEO uses its own country and configured canonical origin", () => {
  const data = seoData(example, "http://preview.invalid/location/dubai/");
  assert.equal(data.schema.address.addressCountry, "AE");
  assert.equal(data.schema.address.addressRegion, undefined);
  assert.equal(
    data.canonical,
    "https://restaurant.example.com/location/dubai/",
  );
  assert.equal(
    seoData(example, "/location/?city=dubai").canonical,
    data.canonical,
  );
  assert.equal(
    seoData(generic, "/location/madrid/").schema.acceptsReservations,
    "mailto:hola@example.com?subject=Reserva",
  );
});

test("invalid configuration fails early with useful errors", () => {
  const config = structuredClone(generic);
  config.locations = [];
  assert.throws(() => validateConfig(config), /at least one/);
  config.locations = structuredClone(generic.locations);
  config.menu.items[0].locations = ["missing"];
  assert.throws(() => validateConfig(config), /unknown or missing locations/);
  config.menu.items[0].locations = ["madrid"];
  config.locations[0].reserve = "javascript:alert(1)";
  assert.throws(() => validateConfig(config), /unsupported URL/);
});

test("both demos keep links, media and location SEO inside their Pages subpath", async () => {
  for (const [source, mount] of [
    [generic, "oliva"],
    [example, "mott32"],
  ]) {
    const config = structuredClone(source);
    config.basePath = `/${mount}/`;
    config.seo.baseUrl = `https://r1.diegoayala.com/${mount}/`;
    config.vip.enabled = false;
    const slug = config.locations.at(-1).slug;
    const url = `${config.basePath}location/${slug}/`;
    assert.equal(pagePath(url, config), "/location/");
    assert.equal(requestedLocation(url, config).slug, slug);
    assert.equal(
      seoData(config, url).canonical,
      `https://r1.diegoayala.com${url}`,
    );
    assert.equal(
      sitePath(config, sitePath(config, "/assets/a.jpg")),
      `${config.basePath}assets/a.jpg`,
    );
    const home = await render(config, "/");
    for (const element of home.querySelectorAll("a[href], img[src]")) {
      const value = element.getAttribute("href") || element.getAttribute("src");
      if (value.startsWith("/"))
        assert.ok(value.startsWith(config.basePath), value);
    }
    assert.equal(home.querySelector(".signup-form"), null);
  }
});
