export const escapeHtml = (value = "") =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

export function text(config, value = "") {
  return String(value ?? "").replace(
    /\{(brand|email|careersEmail|privacyEmail)\}/g,
    (_, key) => config.brand[key === "brand" ? "name" : key] || "",
  );
}

export function label(config, key, fallback) {
  return config.labels?.[key] || fallback;
}

export function sitePath(config, path = "") {
  const base = config.basePath || "/";
  if (base === "/" || !/^\/(?!\/)/.test(path) || path.startsWith(base))
    return path;
  return base + path.slice(1);
}

export function localPath(config, path = "") {
  const base = config?.basePath || "/";
  return base !== "/" && path.startsWith(base)
    ? "/" + path.slice(base.length)
    : path;
}

export function siteSrcset(config, value = "") {
  return value.replace(
    /(^|,\s*)(\/\S+)/g,
    (_, separator, path) => separator + sitePath(config, path),
  );
}

export function locationPath(location) {
  return `/location/${encodeURIComponent(location.slug)}/`;
}

export function homeLocations(config) {
  const featured = (config.content?.homeCarousels?.locations || [])
    .map((item) => {
      const location = config.locations.find(
        (place) => place.slug === item.slug,
      );
      return location ? { ...location, ...item } : null;
    })
    .filter(Boolean);
  return featured.length ? featured : config.locations;
}

export function homeFood(config) {
  return (
    config.content?.homeCarousels?.food ||
    (config.content?.kind === "generic" ? config.menu.items : [])
  );
}

export function requestedLocation(url, config) {
  const parsed = new URL(url, "http://localhost");
  const pathSlug = localPath(config, parsed.pathname).match(
    /^\/location\/([^/]+)\/?$/,
  )?.[1];
  const slug = pathSlug || parsed.searchParams.get("city");
  return (
    config.locations.find((location) => location.slug === slug) ||
    config.locations[0]
  );
}

export function pagePath(url, config) {
  const path = localPath(
    config,
    new URL(url, "http://localhost").pathname,
  ).replace(/index\.html$/, "");
  if (/^\/location\//.test(path)) return "/location/";
  return path.endsWith("/") ? path : `${path}/`;
}

export function asset(config, path) {
  return sitePath(
    config,
    config.media?.[localPath(config, path || "")]?.src || path || "",
  );
}

export function imageMarkup(
  config,
  path,
  alt = "",
  {
    eager = false,
    sizes = "(max-width: 700px) 100vw, 50vw",
    attributes = "",
  } = {},
) {
  const info =
    config.media?.[localPath(config, path)] ||
    Object.values(config.media || {}).find(
      (image) => image.src === localPath(config, path),
    );
  return `<img src="${escapeHtml(asset(config, path))}" alt="${escapeHtml(alt)}" ${info ? `width="${info.width}" height="${info.height}" srcset="${escapeHtml(siteSrcset(config, info.srcset))}" sizes="${sizes}"` : ""} loading="${eager ? "eager" : "lazy"}" decoding="async"${eager ? ' fetchpriority="high"' : ""} ${attributes}>`;
}

export function applyImage(element, config, path) {
  const info =
    config.media?.[localPath(config, path)] ||
    Object.values(config.media || {}).find(
      (image) => image.src === localPath(config, path),
    );
  element.src = asset(config, path);
  if (info) {
    element.srcset = siteSrcset(config, info.srcset);
    element.width = info.width;
    element.height = info.height;
  } else element.removeAttribute("srcset");
}

export function validateConfig(config) {
  const fail = (message) => {
    throw new Error(`Restaurant configuration: ${message}`);
  };
  if (config.basePath && !/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(config.basePath))
    fail("basePath must be a root-relative directory ending in /.");
  if (!config.brand?.name || !/^[a-z0-9-]+$/.test(config.brand?.slug || ""))
    fail("brand.name and a lowercase brand.slug are required.");
  if (!config.locations?.length) fail("at least one location is required.");
  const slugs = new Set();
  for (const location of config.locations) {
    if (!location.name || !/^[a-z0-9-]+$/.test(location.slug || ""))
      fail("each location needs a name and a lowercase slug.");
    if (slugs.has(location.slug))
      fail(`duplicate location slug: ${location.slug}`);
    if (!["open", "coming-soon"].includes(location.status))
      fail(`invalid status for ${location.slug}`);
    slugs.add(location.slug);
  }
  const ids = new Set();
  for (const item of config.menu?.items || []) {
    if (!item.id || ids.has(item.id))
      fail(`menu items need unique ids: ${item.id || item.title}`);
    if (!["food", "drinks"].includes(item.kind))
      fail(`menu item ${item.id} needs kind food or drinks.`);
    if (!item.title || !item.image)
      fail(`menu item ${item.id} needs a title and image.`);
    if (
      !Array.isArray(item.locations) ||
      item.locations.some((slug) => !slugs.has(slug))
    )
      fail(`unknown or missing locations for ${item.id}`);
    ids.add(item.id);
  }
  if (!config.seo?.baseUrl || !/^https?:\/\//.test(config.seo.baseUrl))
    fail("seo.baseUrl must be an absolute http(s) URL.");
  if (
    config.seo.indexable &&
    /\.example(\.com)?$|\.invalid$|localhost/.test(
      new URL(config.seo.baseUrl).hostname,
    )
  )
    fail("replace the example domain before enabling indexing.");
  const inspectUrls = (value, key = "") => {
    if (value && typeof value === "object")
      Object.entries(value).forEach(([k, v]) => inspectUrls(v, k));
    else if (
      typeof value === "string" &&
      /^(href|reserve|image|logo|footerLogo|endpoint|cuisinePdf|drinksPdf|src)$/.test(
        key,
      ) &&
      value
    ) {
      if (!/^(\/(?!\/)|https?:\/\/|mailto:|tel:|#)/i.test(value))
        fail(`unsupported URL in ${key}: ${value}`);
    }
  };
  inspectUrls(config);
  return config;
}
