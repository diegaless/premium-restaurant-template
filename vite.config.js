import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

const pageEntries = {
  main: resolve(rootDir, "index.html"),
  "our-cuisine": resolve(rootDir, "our-cuisine/index.html"),
  "our-drinks": resolve(rootDir, "our-drinks/index.html"),
  locations: resolve(rootDir, "locations/index.html"),
  location: resolve(rootDir, "location/index.html"),
  reserve: resolve(rootDir, "reserve/index.html"),
  "awards-media": resolve(rootDir, "awards-media/index.html"),
  founders: resolve(rootDir, "founders/index.html"),
  sustainability: resolve(rootDir, "sustainability/index.html"),
  careers: resolve(rootDir, "careers/index.html"),
  "privacy-policy": resolve(rootDir, "privacy-policy/index.html"),
};

export default defineConfig({
  build: {
    rollupOptions: {
      input: pageEntries,
    },
  },
});
