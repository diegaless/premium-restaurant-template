import {
  asset,
  locationPath,
  pagePath,
  requestedLocation,
  text,
  sitePath,
} from "./config.js";

export function seoData(config, url) {
  const path = pagePath(url, config);
  const location = requestedLocation(url, config);
  const isLocation = path === "/location/";
  const page = config.seo.pages[path] || config.seo.pages["/"];
  const canonical = new URL(
    sitePath(config, isLocation ? locationPath(location) : path),
    config.seo.baseUrl,
  ).href;
  const title = isLocation
    ? `${location.name} | ${config.brand.name}`
    : text(config, page.title);
  const description = text(
    config,
    isLocation ? location.intro : page.description,
  );
  const image = new URL(
    asset(config, isLocation ? location.image : page.image),
    config.seo.baseUrl,
  ).href;
  const restaurant = (place) => ({
    "@type": "Restaurant",
    name: `${config.brand.name} ${place.name}`,
    url: new URL(sitePath(config, locationPath(place)), config.seo.baseUrl)
      .href,
    image: new URL(asset(config, place.image), config.seo.baseUrl).href,
    address: {
      "@type": "PostalAddress",
      streetAddress: place.address,
      addressLocality: place.name,
      ...place.postalAddress,
    },
    ...(place.phone ? { telephone: place.phone } : {}),
    email: text(config, place.email || config.brand.email),
    servesCuisine: config.brand.cuisine,
    priceRange: config.brand.priceRange,
    ...(config.seo.sameAs?.length ? { sameAs: config.seo.sameAs } : {}),
    ...(place.status === "open" && place.reserve
      ? { acceptsReservations: text(config, place.reserve) }
      : {}),
  });
  let schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonical,
    primaryImageOfPage: image,
    isPartOf: {
      "@type": "WebSite",
      name: config.brand.name,
      url: config.seo.baseUrl,
    },
  };
  if (isLocation) schema = { ...schema, ...restaurant(location) };
  else if (["/locations/", "/reserve/"].includes(path))
    schema.mainEntity = {
      "@type": "ItemList",
      itemListElement: config.locations.map((place, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: restaurant(place),
      })),
    };
  return { title, description, image, canonical, schema };
}

export function applySeo(document, config, url) {
  const data = seoData(config, url);
  document.title = data.title;
  const meta = (key, content, property = false) => {
    const attribute = property ? "property" : "name";
    let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!element) {
      element = document.createElement("meta");
      document.head.append(element);
    }
    element.setAttribute(attribute, key);
    element.setAttribute("content", content);
  };
  meta("description", data.description);
  meta("robots", config.seo.indexable ? "index,follow" : "noindex,nofollow");
  for (const [key, value] of Object.entries({
    title: data.title,
    description: data.description,
    image: data.image,
    url: data.canonical,
    site_name: config.brand.name,
    locale: config.brand.locale,
    type: "website",
  }))
    meta(`og:${key}`, value, true);
  meta("twitter:card", "summary_large_image");
  meta("twitter:title", data.title);
  meta("twitter:description", data.description);
  meta("twitter:image", data.image);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = data.canonical;
  let schema = document.querySelector("#restaurant-schema");
  if (!schema) {
    schema = document.createElement("script");
    schema.id = "restaurant-schema";
    schema.type = "application/ld+json";
    document.head.append(schema);
  }
  schema.textContent = JSON.stringify(data.schema).replace(/</g, "\\u003c");
  return data;
}
