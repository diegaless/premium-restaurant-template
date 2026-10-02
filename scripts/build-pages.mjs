import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = resolve(root, "dist-pages");
const origin = new URL(process.env.PAGES_ORIGIN || "https://r1.diegoayala.com");
if (origin.protocol !== "https:" || origin.pathname !== "/")
  throw new Error("PAGES_ORIGIN must be an HTTPS origin.");
if (dirname(output) !== resolve(root))
  throw new Error("Unexpected output directory.");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const [mode, mount] of [
  ["production", "mott32"],
  ["template", "oliva"],
]) {
  process.env.SITE_BASE = `/${mount}/`;
  process.env.SITE_URL = new URL(`/${mount}/`, origin).href;
  process.env.SITE_OUTPUT = `dist-pages/${mount}`;
  process.env.STATIC_HOSTING = "true";
  await build({ root, mode });
}
const media = JSON.parse(
  await readFile(resolve(root, ".cache/media.json"), "utf8"),
);
const olivaImage = "/oliva" + media["/assets/oliva-interior.jpg"].src;
const mottImage = "/mott32" + media["/assets/hero-hk.jpg"].src;
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Restaurantes · Dos formas de vivir la mesa</title><meta name="description" content="Descubre Casa Oliva y el ejemplo inspirado en Mott 32."><meta name="robots" content="noindex,nofollow"><link rel="canonical" href="${origin.href}"><meta property="og:title" content="Restaurantes · Dos formas de vivir la mesa"><meta property="og:image" content="${new URL(olivaImage, origin).href}"><style>
*{box-sizing:border-box}body{margin:0;color:#f3f0e7;background:#101c17;font-family:Arial,sans-serif}main{max-width:1320px;margin:auto;padding:66px 36px}header{max-width:780px;margin-bottom:42px}.eyebrow{font-size:12px;color:#c6b875;letter-spacing:.23em;text-transform:uppercase}h1{font:normal clamp(40px,5vw,70px)/1.08 Georgia,serif;margin:20px 0}header>p:last-child{color:#c7cec7;line-height:1.7;font-size:17px}.cards{display:grid;grid-template-columns:1fr 1fr;gap:28px}.card{position:relative;display:block;min-height:440px;overflow:hidden;border:1px solid #667055;color:inherit;text-decoration:none}.card img{position:absolute;width:100%;height:100%;object-fit:cover;transition:transform .5s}.card:before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(0deg,rgba(0,0,0,.86),transparent 88%)}.card:hover img{transform:scale(1.025)}.copy{position:absolute;bottom:0;z-index:2;padding:32px}.copy h2{font:normal 40px Georgia,serif;margin:12px 0}.copy p{line-height:1.65;max-width:430px;color:#e0e4dc}.cta{display:inline-block;margin-top:10px;padding-bottom:8px;border-bottom:1px solid #c6b875;font-size:14px}.card:focus-visible{outline:3px solid #dec882;outline-offset:5px}footer{color:#9fab9f;font-size:12px;line-height:1.7;margin-top:32px}footer a{color:inherit}@media(max-width:700px){main{padding:40px 20px}.cards{grid-template-columns:1fr}.card{min-height:380px}.copy{padding:24px}.copy h2{font-size:34px}}@media(prefers-reduced-motion:reduce){.card img{transition:none}}
</style></head><body><main><header><p class="eyebrow">Dos formas de vivir la mesa</p><h1>Elige tu próxima experiencia.</h1><p>Dos propuestas de diseño para restaurantes. Entra, descubre sus espacios y explora la carta.</p></header><section class="cards" aria-label="Restaurantes"><a class="card" href="/oliva/"><img src="${olivaImage}" alt="Comedor de Casa Oliva" width="1600" height="900"><div class="copy"><span class="eyebrow">Cocina mediterránea · Temporada</span><h2>Casa Oliva</h2><p>Una mesa compartida, sabores de temporada y el placer de alargar la sobremesa.</p><span class="cta">Descubrir Casa Oliva ↗</span></div></a><a class="card" href="/mott32/"><img src="${mottImage}" alt="Interior del ejemplo Mott 32" width="1600" height="900"><div class="copy"><span class="eyebrow">Cocina china · Diseño editorial</span><h2>Mott 32</h2><p>Un recorrido visual por sus restaurantes, platos y bebidas, inspirado en la web original.</p><span class="cta">Explorar el ejemplo ↗</span></div></a></section><footer>Demostraciones de diseño. Casa Oliva es un restaurante ficticio; Mott 32 es un ejercicio visual inspirado en su web oficial. <a href="https://github.com/diegaless/premium-restaurant-template">Ver el proyecto</a>.</footer></main></body></html>`;
await Promise.all([
  writeFile(resolve(output, "index.html"), html),
  writeFile(
    resolve(output, "404.html"),
    `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Página no encontrada</title><body><h1>Página no encontrada</h1><p><a href="/">Volver a los restaurantes</a></p></body></html>`,
  ),
  writeFile(resolve(output, ".nojekyll"), ""),
  writeFile(resolve(output, "CNAME"), origin.hostname + "\n"),
  writeFile(resolve(output, "robots.txt"), "User-agent: *\nDisallow: /\n"),
  writeFile(
    resolve(output, "site-runtime.json"),
    JSON.stringify({
      slug: "restaurant-demos",
      static: true,
      routes: ["/", "/oliva/", "/mott32/"],
      locations: [],
    }),
  ),
]);
console.log(`Both websites prepared for ${origin.href}`);
