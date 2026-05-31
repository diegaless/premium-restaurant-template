# Client Adaptation Checklist

Use this checklist when turning the preview into a client restaurant site.

## 1. Brand Safety

- Replace preview logos in `site-config.js`.
- Replace preview imagery in `assets/`.
- Replace all final public copy with client-approved text.
- Keep the premium layout language, but adjust colors, type and photography enough for the client's own identity.

## 2. Configuration

Edit `site-config.js` first:

- `brand`: name, emails, phone, cuisine, price range, logos.
- `activePreset`: `fine-dining`, `casual-modern` or `bar-night`.
- `locations`: status, hours, address, reservation provider and reservation link.
- `menu.items`: per-location availability, prices, allergens and tags.
- `seo.pages`: page titles, descriptions and Open Graph images.

Photos, logos and downloadable menus live in `assets/`. Replace the files there and point `site-config.js` to the new filenames.

The `/?template=1` editor is a browser-only sales preview. It is not a client CMS; restaurant staff would need either a developer editing `site-config.js`/`assets/`, or an added admin/CMS layer.

## 3. Reservation Providers

Each location can point to:

- SevenRooms
- OpenTable
- TheFork
- WhatsApp
- phone/email
- any custom booking URL

Use `status: "coming-soon"` to keep a location visible without a live booking action.

## 4. Menus

The menu browser supports:

- category filters
- location selector
- visible availability badges
- prices
- allergens
- dietary tags
- PDF links per location

## 5. SEO

Before launch, set:

- production domain in `seo.baseUrl`
- `brand.name`, `brand.phone`, `brand.cuisine`, `brand.priceRange`
- real location addresses
- `seo.sameAs` social profiles
- page-specific titles/descriptions

## 6. Deployment

Run:

```bash
npm run build
```

Deploy `dist/` to Vercel, Netlify, Cloudflare Pages or a traditional host.
