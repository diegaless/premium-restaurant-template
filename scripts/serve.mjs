import { createServer } from "node:http";
import { readFile, stat, realpath } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { createNewsletterHandler } from "../server/newsletter.mjs";

const root = await realpath(resolve(process.argv[2] || "dist"));
const runtime = JSON.parse(
  await readFile(resolve(root, "site-runtime.json"), "utf8"),
);
const newsletter = createNewsletterHandler({ siteSlug: runtime.slug });
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api/newsletter") return newsletter(req, res);
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405);
    return res.end();
  }
  try {
    let path = resolve(root, "." + decodeURIComponent(url.pathname));
    if (path !== root && !path.startsWith(root + sep))
      throw new Error("outside_root");
    if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
    path = await realpath(path);
    if (!path.startsWith(root + sep)) throw new Error("outside_root");
    const content = await readFile(path);
    const immutable = /\/assets\/optimized\//.test(url.pathname);
    res.writeHead(200, {
      "Content-Type": mime[extname(path)] || "application/octet-stream",
      "Cache-Control": immutable
        ? "public,max-age=31536000,immutable"
        : "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(req.method === "HEAD" ? undefined : content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Page not found");
  }
});
server.listen(
  Number(process.env.PORT) || 4173,
  process.env.HOST || "127.0.0.1",
  () =>
    console.log(
      `Restaurant preview: http://${process.env.HOST || "127.0.0.1"}:${process.env.PORT || 4173}`,
    ),
);
