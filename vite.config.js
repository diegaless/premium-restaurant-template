import { resolve, relative, dirname, sep } from "node:path";
import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build as bundleConfig } from "esbuild";
import { defineConfig, loadEnv } from "vite";
import { parseHTML } from "linkedom";
import { prepareMedia } from "./scripts/media.mjs";
import {
  validateConfig,
  locationPath,
  asset,
  homeLocations,
  homeFood,
  sitePath,
} from "./core/config.js";
import { renderDocument } from "./core/render.js";
import { createNewsletterHandler } from "./server/newsletter.mjs";

const root = fileURLToPath(new URL(".", import.meta.url));
const allRoutes = [
  "/",
  "/our-cuisine/",
  "/our-drinks/",
  "/locations/",
  "/location/",
  "/reserve/",
  "/awards-media/",
  "/founders/",
  "/sustainability/",
  "/careers/",
  "/privacy-policy/",
];

export default defineConfig(async ({ mode }) => {
  const env = { ...loadEnv(mode, root, ""), ...process.env };
  const file = resolve(
    root,
    env.SITE_CONFIG ||
      (mode === "template" ? "template/site-config.js" : "site-config.js"),
  );
  const bundled = await bundleConfig({
    entryPoints: [file],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
    metafile: true,
  });
  const imported = await import(
    `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`
  );
  const configFiles = Object.keys(bundled.metafile.inputs).map((path) =>
    resolve(root, path),
  );
  const config = structuredClone(imported.siteConfig);
  if (env.SITE_URL) config.seo.baseUrl = env.SITE_URL;
  config.basePath = env.SITE_BASE || "/";
  if (env.STATIC_HOSTING === "true") config.vip.enabled = false;
  validateConfig(config);
  const media = await prepareMedia(root);
  const configuredContent = JSON.stringify(config);
  config.media =
    config.content?.kind === "generic"
      ? Object.fromEntries(
          Object.entries(media).filter(([path]) =>
            configuredContent.includes(path),
          ),
        )
      : media;
  const routes = config.routes || allRoutes;
  const outDir =
    env.SITE_OUTPUT || (mode === "template" ? "dist-template" : "dist");
  const render = (html, url) => {
    const { document } = parseHTML(html);
    renderDocument(document, config, url);
    return document.toString();
  };
  const newsletter = createNewsletterHandler({
    siteSlug: config.brand.slug,
    file: env.NEWSLETTER_DATA_FILE,
  });
  const middleware = (server) => {
    server.middlewares.use((req, res, next) => {
      const url = new URL(req.url, "http://localhost");
      if (url.pathname === "/api/newsletter") return newsletter(req, res);
      const match = url.pathname.match(/^\/location\/([^/]+)\/?$/);
      if (match && match[1] !== "index.html") {
        if (!config.locations.some((place) => place.slug === match[1])) {
          res.statusCode = 404;
          return res.end("Location not found");
        }
        req.url = `/location/index.html?city=${match[1]}`;
      }
      next();
    });
  };
  return {
    base: config.basePath,
    appType: "mpa",
    server: { host: "127.0.0.1" },
    preview: { host: "127.0.0.1" },
    build: {
      outDir,
      rollupOptions: {
        input: Object.fromEntries(
          routes.map((route) => [
            route === "/" ? "main" : route.slice(1, -1),
            resolve(root, "." + route, "index.html"),
          ]),
        ),
      },
    },
    plugins: [
      {
        name: "restaurant-template",
        enforce: "pre",
        resolveId(id) {
          if (id === "virtual:restaurant-config") return "\0restaurant-config";
        },
        load(id) {
          if (id === "\0restaurant-config")
            return `export const siteConfig = ${JSON.stringify(config)};`;
        },
        transform(code, id) {
          if (!id.endsWith(".css")) return;
          return code.replace(
            /\/assets\/[\w-]+\.jpg/g,
            (path) =>
              config.media?.[
                config.content?.kind === "generic"
                  ? config.content.home.hero
                  : path
              ]?.src || path,
          );
        },
        transformIndexHtml: {
          order: "pre",
          handler(html, ctx) {
            let url = ctx.originalUrl || ctx.path;
            if (!url || url.startsWith(root))
              url = "/" + relative(root, ctx.filename).replaceAll("\\", "/");
            return render(html, url);
          },
        },
        configureServer(server) {
          middleware(server);
          server.watcher.add(configFiles);
        },
        handleHotUpdate({ file: changed, server }) {
          if (
            configFiles.includes(changed) ||
            changed.startsWith(resolve(root, "assets") + sep)
          ) {
            server.restart();
            return [];
          }
        },
        configurePreviewServer(server) {
          server.middlewares.use((req, res, next) =>
            new URL(req.url, "http://localhost").pathname === "/api/newsletter"
              ? newsletter(req, res)
              : next(),
          );
        },
        async closeBundle() {
          const output = resolve(root, outDir);
          let source;
          try {
            source = await readFile(
              resolve(output, "location/index.html"),
              "utf8",
            );
          } catch {
            return;
          }
          for (const place of config.locations) {
            const destination = resolve(
              output,
              "." + locationPath(place),
              "index.html",
            );
            await mkdir(dirname(destination), { recursive: true });
            await writeFile(destination, render(source, locationPath(place)));
          }
          const urls = [
            ...routes.filter((route) => route !== "/location/"),
            ...config.locations.map(locationPath),
          ];
          const xmlEscape = (value) =>
            value
              .replaceAll("&", "&amp;")
              .replaceAll("<", "&lt;")
              .replaceAll('"', "&quot;");
          await writeFile(
            resolve(output, "sitemap.xml"),
            `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => `<url><loc>${xmlEscape(new URL(sitePath(config, path), config.seo.baseUrl).href)}</loc></url>`).join("")}</urlset>`,
          );
          await writeFile(
            resolve(output, "robots.txt"),
            config.seo.indexable
              ? `User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap.xml", config.seo.baseUrl)}\n`
              : "User-agent: *\nDisallow: /\n",
          );
          await writeFile(
            resolve(output, "site-runtime.json"),
            JSON.stringify({
              slug: config.brand.slug,
              basePath: config.basePath,
              kind: config.content?.kind,
              homeLocations: homeLocations(config).map((place) => place.slug),
              homeFoodCount: homeFood(config).length,
              locations: config.locations.map((place) => place.slug),
              routes,
            }),
          );
          // Public assets use stable URLs; only ship files referenced by this build.
          const walk = async (directory) => {
            const entries = await readdir(directory, { withFileTypes: true });
            return (
              await Promise.all(
                entries.map((entry) =>
                  entry.isDirectory()
                    ? walk(resolve(directory, entry.name))
                    : [resolve(directory, entry.name)],
                ),
              )
            ).flat();
          };
          const builtFiles = await walk(output);
          const references = (
            await Promise.all(
              builtFiles
                .filter((path) => /\.(html|css|js)$/.test(path))
                .map((path) => readFile(path, "utf8")),
            )
          ).join("\n");
          for (const file of await walk(resolve(root, "public/assets"))) {
            const assetPath =
              "/assets/" +
              relative(resolve(root, "public/assets"), file).replaceAll(
                "\\",
                "/",
              );
            const target = resolve(output, "." + assetPath);
            if (
              !references.includes(assetPath) &&
              target.startsWith(output + sep)
            )
              await rm(target, { force: true });
          }
        },
      },
    ],
  };
});
