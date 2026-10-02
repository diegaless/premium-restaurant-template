import sharp from "sharp";
import {
  readdir,
  mkdir,
  readFile,
  writeFile,
  stat,
  copyFile,
  access,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";

export async function prepareMedia(root) {
  const source = resolve(root, "assets"),
    target = resolve(root, "public/assets"),
    cachePath = resolve(root, ".cache/media.json");
  await mkdir(join(target, "optimized"), { recursive: true });
  await mkdir(resolve(root, ".cache"), { recursive: true });
  let previous = {};
  try {
    previous = JSON.parse(await readFile(cachePath, "utf8"));
  } catch {}
  const manifest = {};
  const files = await readdir(source);
  for (const name of files) {
    const file = join(source, name),
      info = await stat(file);
    if (!info.isFile()) continue;
    if (!/\.jpe?g$/i.test(name)) {
      await copyFile(file, join(target, name));
      continue;
    }
    const key = `/assets/${name}`,
      signature = `v1:${info.size}:${info.mtimeMs}`;
    const cached = previous[key];
    if (cached?.signature === signature) {
      try {
        await Promise.all(
          cached.outputs.map((path) => access(resolve(root, "public" + path))),
        );
        manifest[key] = cached;
        continue;
      } catch {}
    }
    const buffer = await readFile(file);
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 10);
    const metadata = await sharp(buffer).metadata();
    const widths = [
      ...new Set([
        Math.min(640, metadata.width),
        Math.min(1600, metadata.width),
      ]),
    ];
    const outputs = [];
    let large;
    for (const width of widths) {
      const relative = `/assets/optimized/${name.replace(/\.jpe?g$/i, "")}-${hash}-${width}.webp`;
      large = await sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80, effort: 5 })
        .toFile(resolve(root, "public" + relative));
      outputs.push(relative);
    }
    manifest[key] = {
      signature,
      src: outputs.at(-1),
      srcset: outputs
        .map((path, index) => `${path} ${widths[index]}w`)
        .join(", "),
      width: large.width,
      height: large.height,
      outputs,
    };
  }
  await writeFile(cachePath, JSON.stringify(manifest));
  return manifest;
}
