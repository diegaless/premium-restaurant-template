import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { getRuntime } from "./check-utils.mjs";

const base = new URL(process.env.CHECK_URL || "http://127.0.0.1:4173");
const runtime = await getRuntime(base);
const routes = new Set([
  ...runtime.routes,
  ...runtime.locations.map((slug) => `/location/${slug}/`),
]);
const documents = new Map();
async function readPage(url) {
  const path = url.pathname;
  if (!documents.has(path)) {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, 200, `Broken page: ${path}`);
    assert.match(
      response.headers.get("content-type"),
      /text\/html/,
      `Not a page: ${path}`,
    );
    documents.set(path, parseHTML(await response.text()).document);
  }
  return documents.get(path);
}
const resources = new Set();
let links = 0;
for (const route of routes) {
  const pageUrl = new URL(route, base);
  const document = await readPage(pageUrl);
  assert.equal(
    document.querySelectorAll("h1").length,
    1,
    `Expected one main heading: ${route}`,
  );
  for (const element of document.querySelectorAll(
    "a[href], [data-scroll-target]",
  )) {
    const value =
      element.getAttribute("href") ||
      element.getAttribute("data-scroll-target");
    if (!value || value === "#") continue;
    const target = new URL(value, pageUrl);
    if (target.origin !== base.origin) continue;
    links++;
    if (/\.(pdf|jpg|webp|svg|png)$/i.test(target.pathname)) {
      resources.add(target.pathname);
      continue;
    }
    const destination = await readPage(target);
    if (target.hash)
      assert.ok(
        destination.getElementById(decodeURIComponent(target.hash.slice(1))),
        `Missing anchor ${value} on ${route}`,
      );
  }
  for (const element of document.querySelectorAll(
    "img[src], script[src], link[rel='stylesheet'], [data-lightbox-image]",
  )) {
    const value =
      element.getAttribute("src") ||
      element.getAttribute("href") ||
      element.getAttribute("data-lightbox-image");
    if (!value) continue;
    const target = new URL(value, pageUrl);
    if (target.origin === base.origin) resources.add(target.pathname);
  }
}
await Promise.all(
  [...resources].map(async (path) => {
    const response = await fetch(new URL(path, base), { method: "HEAD" });
    assert.equal(response.status, 200, `Missing asset: ${path}`);
  }),
);
console.log(
  `Link checks passed: ${runtime.slug}, ${documents.size} pages, ${links} internal links and anchors, ${resources.size} assets.`,
);
