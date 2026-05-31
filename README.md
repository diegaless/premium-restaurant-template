# Premium Restaurant Website Template

Static HTML, CSS and JavaScript restaurant template designed for premium hospitality clients.

The current content and images are preview placeholders. Before selling or deploying for a real client, replace the brand, copy, images, PDFs and reservation links in `site-config.js` and the `assets/` folder.

## What Is Configurable

- Brand name, logo, footer logo, emails, phone, cuisine type and price range.
- Three commercial style presets: `fine-dining`, `casual-modern`, `bar-night`.
- Locations, regions, opening status, hours, phone, reservation URL and provider.
- Food/drink availability by location, prices, allergens, dietary tags and PDFs.
- VIP popup variants, timing and persistence.
- SEO titles, descriptions, canonical URLs, Open Graph/Twitter metadata and Restaurant schema.
- Navigation, footer links and social links.

## Run Locally

```bash
npm install
npm run start
```

Open `http://localhost:5173/`.

## Quick Client Preview

Open:

```text
http://localhost:5173/?template=1
```

That enables a small preview editor for brand name, reservations email and visual preset. It stores changes in browser localStorage only; permanent client changes should go in `site-config.js`.

## Build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

The build also copies `assets/` into `dist/assets/` with original filenames. That is intentional: client-editable values in `site-config.js` use stable paths such as `/assets/loc-hk.jpg`, while Vite still creates hashed assets for static HTML references.

The Vite config is multipage, so the build includes every route folder:

```text
/
/our-cuisine/
/our-drinks/
/locations/
/location/
/reserve/
/awards-media/
/founders/
/sustainability/
/careers/
/privacy-policy/
```

## Deploy

Recommended platforms:

- Vercel: build command `npm run build`, output directory `dist`.
- Netlify: build command `npm run build`, publish directory `dist`.
- Cloudflare Pages: build command `npm run build`, output directory `dist`.
- Traditional hosting: run `npm run build` and upload the contents of `dist/`.

## Sales Packages

- Fine Dining / Luxury: dark editorial layout, galleries, VIP signup, multiple locations.
- Casual Modern: same structure with warmer palette and simpler positioning for cafes, brunch or bistros.
- Bar / Cocktail / Night: drinks-first preset for cocktail bars, lounges and nightlife venues.

## Checks

```bash
npm run check
npm run check:responsive
```

These verify broken images and horizontal overflow across the static pages and responsive viewports.
