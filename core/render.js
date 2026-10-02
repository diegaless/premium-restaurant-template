import {
  asset,
  escapeHtml as e,
  imageMarkup,
  homeLocations,
  homeFood,
  label,
  locationPath,
  pagePath,
  requestedLocation,
  text,
  sitePath,
  localPath,
  siteSrcset,
} from "./config.js";
import { applySeo } from "./seo.js";
import { localizeInterface } from "./locale.js";

const link = (href, caption, className = "cut-button") =>
  `<a class="${className}" href="${e(href)}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ""}>${e(caption)}</a>`;
const heading = (title, eyebrow = "", level = 2) =>
  `<div class="section-heading compact-heading"><span class="knot" aria-hidden="true"></span><p class="eyebrow">${e(eyebrow)}</p><h${level}>${e(title)}</h${level}></div>`;

export function reservationCard(config, location, compact = false) {
  const canReserve = location.status === "open" && location.reserve;
  const status =
    location.status === "open"
      ? label(config, "open", "Open")
      : location.opening || label(config, "comingSoon", "Coming soon");
  return `<article class="reserve-card${compact ? " compact" : ""}" data-location="${e(location.slug)}" data-region="${e(location.region)}" data-status="${e(location.status)}">
    ${imageMarkup(config, location.image, `${config.brand.name} ${location.name}`, { eager: compact })}
    <div><p class="eyebrow">${e(location.region)}</p><h3>${e(location.name)} <span>${e(location.han)}</span></h3><p>${e(location.address)}</p>
    <dl><div><dt>${e(label(config, "status", "Status"))}</dt><dd>${e(status)}</dd></div><div><dt>${e(label(config, "hours", "Hours"))}</dt><dd>${e(location.hours)}</dd></div></dl>
    ${canReserve ? link(sitePath(config, text(config, location.reserve)), config.reservation.primaryLabel, "cut-button reserve-link") : `<span class="reserve-status">${e(status)}</span>`}</div></article>`;
}

function directory(config) {
  const regions = [...new Set(config.locations.map((place) => place.region))];
  const regionId = (index) => `region-${index}`;
  return (
    `<nav class="region-tabs" aria-label="${e(label(config, "regions", "Location regions"))}">${regions.map((region, index) => `<button type="button" data-scroll-target="#${regionId(index)}">${e(region)}</button>`).join("")}</nav>` +
    regions
      .map(
        (region, index) =>
          `<section class="region-section" id="${regionId(index)}" aria-labelledby="${regionId(index)}-title"><div class="region-divider" aria-hidden="true"><span></span></div><h2 id="${regionId(index)}-title">${e(region)}</h2><div class="location-grid">${config.locations
            .filter((place) => place.region === region)
            .map(
              (
                place,
              ) => `<article class="location-tile${place.status !== "open" ? " coming-soon" : ""}" data-location="${e(place.slug)}">
      ${imageMarkup(config, place.image, `${config.brand.name} ${place.name}`)}<h3>${e(place.name)} <span>${e(place.han)}</span></h3><p>${e(place.address)}</p>${link(locationPath(place), label(config, "visit", "Visit"))}</article>`,
            )
            .join("")}</div></section>`,
      )
      .join("")
  );
}

function menu(config, kind) {
  const items = config.menu.items.filter((item) => item.kind === kind);
  const categories = [...new Set(items.map((item) => item.category))];
  return `<div class="filter-tabs" role="tablist" aria-label="${e(label(config, "menuFilters", "Menu filters"))}"><button type="button" role="tab" class="is-active" data-filter="all">${e(label(config, "all", "All"))}</button>${categories.map((category) => `<button type="button" role="tab" data-filter="${e(category)}">${e(config.menu.categories?.[category] || category)}</button>`).join("")}</div>
    <div class="menu-grid">${items.map((item) => `<article class="menu-card" data-menu-id="${e(item.id)}" data-category="${e(item.category)}" data-locations="${e(item.locations.join(" "))}"><button class="menu-card-trigger" type="button" data-lightbox-trigger data-lightbox-title="${e(item.title)}" data-lightbox-copy="${e(item.description)}" data-lightbox-image="${e(asset(config, item.image))}">${imageMarkup(config, item.image, item.title)}<span>${e(item.categoryLabel || config.menu.categories?.[item.category] || item.category)}</span><strong>${e(item.title)}</strong></button></article>`).join("")}</div>`;
}

function genericMain(config, path) {
  const page = config.seo.pages[path] || config.seo.pages["/"];
  const content = config.content;
  const title =
    content.titles?.[path] || text(config, page.title).split("|")[0].trim();
  if (path === "/")
    return `<section class="hero generic-hero" aria-label="${e(config.brand.name)}"><figure class="hero-panel is-active">${imageMarkup(config, content.home.hero, config.brand.name, { eager: true, sizes: "100vw" })}</figure><div class="generic-hero-copy"><p class="eyebrow">${e(content.home.eyebrow)}</p><h1>${e(config.brand.name)}</h1><p>${e(content.home.tagline)}</p>${link("/reserve/", config.reservation.primaryLabel)}</div></section>
    <section class="intro patterned" id="experience"><div class="section-copy"><p class="eyebrow">${e(content.home.introEyebrow)}</p><h2>${e(content.home.title)}</h2>${content.home.paragraphs.map((p) => `<p>${e(p)}</p>`).join("")}</div></section>
    <section class="locations patterned" id="locations">${heading(label(config, "ourLocations", "Our locations"), content.home.locationsEyebrow)}<div class="location-carousel" data-carousel></div><div class="location-dots" data-location-dots aria-label="Location carousel controls"></div></section>
    ${homeFood(config).length ? `<section class="generic-gallery-heading patterned">${heading(content.home.galleryTitle || label(config, "exploreMenu", "Explore the menu"), content.home.galleryEyebrow)}</section><section class="food-strip" id="cuisine-gallery" data-rail-section aria-label="Cuisine and drinks"><button class="rail-arrow rail-arrow-left" type="button" data-rail-prev aria-label="Previous dish"></button><div class="food-rail" data-rail></div><button class="rail-arrow rail-arrow-right" type="button" data-rail-next aria-label="Next dish"></button></section>` : ""}
    <section class="feature-links patterned"><a class="photo-link" href="/our-cuisine/">${imageMarkup(config, content.food.image, content.food.title)}<span class="photo-link-copy"><span class="photo-kicker">${e(content.food.eyebrow || content.food.title)}</span><span class="photo-title">${e(content.food.title)}</span><small>${e(label(config, "viewMenu", "View menu"))}</small></span></a><a class="photo-link" href="/our-drinks/">${imageMarkup(config, content.drinks.image, content.drinks.title)}<span class="photo-link-copy"><span class="photo-kicker">${e(content.drinks.eyebrow || content.drinks.title)}</span><span class="photo-title">${e(content.drinks.title)}</span><small>${e(label(config, "viewDrinks", "View drinks"))}</small></span></a></section>
    ${genericInvitation(config)}
    <section class="vip-signup" id="vip"><figure>${imageMarkup(config, content.home.hero, config.brand.name)}</figure><div class="vip-copy">${heading(config.vip.variants[0]?.title || "", config.vip.variants[0]?.eyebrow || "")}<p>${e(config.vip.variants[0]?.copy)}</p><form class="signup-form"><label for="email">Email</label><div><input id="email" type="email" required autocomplete="email"><button type="submit">${e(config.vip.variants[0]?.cta)}</button></div></form></div></section>`;
  if (path === "/locations/")
    return `<section class="locations-index earth-pattern" id="page-content">${heading(title, "", 1)}</section>`;
  if (path === "/reserve/")
    return `<section class="reserve-page-section patterned" id="page-content">${heading(title, "", 1)}<div class="reserve-grid"></div></section>`;
  if (path === "/location/")
    return `<section class="hero page-hero location-detail-hero"><figure class="hero-panel is-active"><img data-location-hero alt=""></figure></section><section class="intro earth-pattern" id="page-content"><div class="section-copy"><p class="eyebrow" data-location-region></p><h1 data-location-name></h1><h2 data-location-han></h2><p data-location-intro></p></div></section><section class="signature-block location-detail-block"><figure class="signature-image"><img data-location-image alt=""></figure><div class="signature-copy"><h2 data-location-address></h2><p data-location-copy></p><div class="button-row"><a class="cut-button" data-location-reserve></a>${link("/locations/", label(config, "allLocations", "All locations"))}</div></div></section><section class="location-menu-links patterned">${link("/our-cuisine/", content.food.title)} ${link("/our-drinks/", content.drinks.title)}</section>`;
  if (["/our-cuisine/", "/our-drinks/"].includes(path)) {
    const part = path === "/our-cuisine/" ? content.food : content.drinks;
    return `<section class="generic-menu-hero" id="page-content"><div class="generic-menu-copy"><p class="eyebrow">${e(part.eyebrow || config.brand.name)}</p><h1>${e(part.title)}</h1><p>${e(part.description)}</p>${link("#menu", label(config, path === "/our-cuisine/" ? "viewMenu" : "viewDrinks", "View menu"))}</div><figure>${imageMarkup(config, part.image, part.title, { eager: true, sizes: "(min-width: 768px) 45vw, 100vw" })}</figure></section><section class="menu-browser patterned" id="menu" data-menu-browser>${heading(label(config, "exploreMenu", "Explore the menu"))}</section>${genericInvitation(config)}`;
  }
  return `<section class="legal-intro patterned" id="page-content">${heading(title, "", 1)}</section><section class="legal-content patterned"><article>${(content.editorial?.[path] || [{ title, body: page.description }]).map((block) => `<h2>${e(block.title)}</h2><p>${e(text(config, block.body))}</p>`).join("")}</article></section>`;
}

function genericInvitation(config) {
  const content = config.content.events;
  if (!content) return "";
  return `<section class="generic-invitation"><figure>${imageMarkup(config, content.image || config.content.home.hero, config.brand.name)}</figure><div><p class="eyebrow">${e(content.eyebrow)}</p><h2>${e(content.title)}</h2><p>${e(content.copy)}</p><div class="button-row">${link("/reserve/", config.reservation.primaryLabel)}${link(text(config, content.href), content.label)}</div></div></section>`;
}

export function renderDocument(document, config, url) {
  const path = pagePath(url, config);
  const generic = config.content?.kind === "generic";
  document.documentElement.lang = config.brand.language || "en";
  document.documentElement.dataset.templatePreset = config.activePreset;
  document.body.dataset.siteKind = generic ? "generic" : "example";
  document.body.dataset.locationCount = String(config.locations.length);
  for (const [name, value] of Object.entries(
    config.themePresets[config.activePreset]?.cssVars || {},
  ))
    document.documentElement.style.setProperty(name, value);
  if (generic) {
    document.querySelector("main").innerHTML =
      `<header class="generic-topline"><a class="generic-brand-anchor" href="/">${config.brand.logo ? imageMarkup(config, config.brand.logo, config.brand.name, { eager: true }) : e(config.brand.name)}</a><a class="generic-header-link" href="/our-cuisine/">${e(label(config, "viewMenu", "View menu"))}</a></header>${genericMain(config, path)}`;
    document.querySelector('link[href*="typekit.net"]')?.remove();
  }
  document.querySelectorAll(".main-logo, .footer > img").forEach((logo) => {
    const isFooter = logo.parentElement.classList.contains("footer");
    const src = isFooter
      ? config.brand.footerLogo || config.brand.logo
      : config.brand.logo;
    if (src) {
      logo.setAttribute("src", src);
      logo.setAttribute("alt", config.brand.name);
    } else {
      const wordmark = document.createElement("a");
      wordmark.className = isFooter
        ? "footer-wordmark"
        : "main-logo brand-wordmark";
      wordmark.href = "/";
      wordmark.textContent = config.brand.name;
      logo.replaceWith(wordmark);
    }
  });
  const rail = document.querySelector("[data-carousel]");
  if (rail) {
    const places = homeLocations(config);
    const section = rail.closest(".locations");
    section.querySelector("[data-location-dots]")?.remove();
    rail.outerHTML = `<div class="location-carousel-frame"><div class="location-carousel swiper" data-carousel aria-label="${e(label(config, "ourLocations", "Our locations"))}"><div class="swiper-wrapper">${places.map((place, index) => `<div class="location-slide swiper-slide"><a class="location-card${index === Math.min(1, places.length - 1) ? " is-featured" : ""}" href="${locationPath(place)}">${imageMarkup(config, place.image, `${place.name} ${config.brand.name}`, { sizes: "(min-width: 1200px) 28vw, (min-width: 768px) 45vw, 70vw" })}<div class="location-card-copy"><div class="location-title"><h3>${e(place.name)}</h3><p class="han">${e(place.han)}</p></div><p class="location-caption">${e(place.caption || place.address)}</p></div></a></div>`).join("")}</div></div><button class="rail-arrow rail-arrow-left" data-location-prev type="button" aria-label="Previous location"></button><button class="rail-arrow rail-arrow-right" data-location-next type="button" aria-label="Next location"></button><div class="location-dots" data-location-dots aria-label="Location carousel controls"></div></div><div class="locations-all-link">${link("/locations/", label(config, "allLocations", "All Locations"))}</div>`;
  }
  const foodRail = document.querySelector(".food-rail");
  const food = homeFood(config);
  if (foodRail && food?.length) {
    foodRail.classList.add("swiper");
    foodRail.innerHTML = `<div class="swiper-wrapper">${food.map((item) => `<div class="food-slide swiper-slide"><figure class="food-card"><button class="food-image-trigger" type="button" data-lightbox-trigger data-lightbox-title="${e(item.title)}" data-lightbox-copy="${e(item.description || "")}" data-lightbox-image="${e(asset(config, item.image))}" aria-label="${e(item.title)}">${imageMarkup(config, item.image, item.title, { sizes: "(min-width: 1125px) 360px, (min-width: 768px) 32vw, 85vw" })}</button><figcaption>${e(item.title)}</figcaption></figure></div>`).join("")}</div>`;
  }
  const directoryElement = document.querySelector(".locations-index");
  if (directoryElement) {
    directoryElement
      .querySelectorAll(
        ".region-tabs,.region-section,.location-directory-tools,.location-map-panel",
      )
      .forEach((el) => el.remove());
    directoryElement.insertAdjacentHTML("beforeend", directory(config));
  }
  document.querySelectorAll("[data-menu-browser]").forEach((browser) => {
    browser
      .querySelectorAll(
        ".filter-tabs,.menu-grid,.menu-location-controls,.menu-empty-state",
      )
      .forEach((el) => el.remove());
    browser.insertAdjacentHTML(
      "beforeend",
      menu(config, path === "/our-drinks/" ? "drinks" : "food"),
    );
  });
  const reserveGrid = document.querySelector(".reserve-grid");
  if (reserveGrid)
    reserveGrid.innerHTML = config.locations
      .map((place) => reservationCard(config, place))
      .join("");
  if (path === "/location/") {
    document.body.setAttribute("data-location-detail-page", "");
    const location = requestedLocation(url, config);
    const fields = {
      name: "name",
      han: "han",
      region: "region",
      address: "address",
      intro: "intro",
      copy: "copy",
    };
    for (const [field, key] of Object.entries(fields)) {
      const el = document.querySelector(`[data-location-${field}]`);
      if (el) {
        el.textContent = text(config, location[key]);
        if (field === "han")
          el.toggleAttribute("hidden", !el.textContent.trim());
      }
    }
    for (const field of ["hero", "image"]) {
      const el = document.querySelector(`[data-location-${field}]`);
      if (el) {
        el.setAttribute("src", location.image);
        el.setAttribute("alt", `${config.brand.name} ${location.name}`);
      }
    }
    const booking = document.querySelector("[data-location-reserve]");
    if (booking) {
      booking.textContent =
        location.status === "open"
          ? config.reservation.primaryLabel
          : location.opening || label(config, "comingSoon", "Coming soon");
      if (location.status === "open" && location.reserve)
        booking.href = text(config, location.reserve);
      else {
        booking.removeAttribute("href");
        booking.setAttribute("aria-disabled", "true");
      }
    }
    document.querySelectorAll(".location-menu-links a").forEach((el) => {
      el.href = `${el.getAttribute("href").split("?")[0]}?city=${location.slug}`;
    });
  }
  for (const [selector, items] of [
    [".footer nav", config.navigation.footer],
    [".drawer nav", config.navigation.drawer],
  ]) {
    const element = document.querySelector(selector);
    if (element)
      element.innerHTML = items
        .map((item) =>
          link(text(config, item.href), text(config, item.label), ""),
        )
        .join("");
  }
  const quick = document.querySelector(".quick-actions");
  if (quick) {
    quick.querySelector(`a[href="/reserve/"], a[href="${sitePath(config, "/reserve/")}"]`).textContent =
      config.reservation.primaryLabel;
    quick.querySelector(`a[href="/locations/"], a[href="${sitePath(config, "/locations/")}"]`).textContent = label(
      config,
      "allLocations",
      "All locations",
    );
  }
  if (!config.vip.enabled) document.querySelector(".vip-signup")?.remove();
  const visit = (node) => {
    if (["SCRIPT", "STYLE"].includes(node.nodeName)) return;
    if (node.nodeType === 3)
      node.nodeValue = text(config, node.nodeValue)
        .replaceAll(config.brand.sourceName || "Mott 32", config.brand.name)
        .replaceAll("reservations@mott32.com", config.brand.email)
        .replaceAll("careers@mott32.com", config.brand.careersEmail)
        .replaceAll("info@mott32.com", config.brand.privacyEmail);
    else for (const child of [...(node.childNodes || [])]) visit(child);
  };
  visit(document.body);
  document.querySelectorAll("a[href^='/location/?city=']").forEach((el) => {
    const location = requestedLocation(el.getAttribute("href"), config);
    el.href = locationPath(location);
  });
  document.querySelectorAll("img[src]").forEach((image) => {
    const original = image.getAttribute("src"),
      info = config.media?.[localPath(config, original)];
    if (info) {
      image.setAttribute("src", info.src);
      image.setAttribute("srcset", info.srcset);
      image.setAttribute("width", info.width);
      image.setAttribute("height", info.height);
      image.setAttribute(
        "sizes",
        image.closest(".hero") ? "100vw" : "(max-width: 700px) 100vw, 50vw",
      );
    }
    const eager =
      !!image.closest(".hero-panel.is-active") ||
      image.classList.contains("main-logo");
    image.setAttribute("loading", eager ? "eager" : "lazy");
    image.setAttribute("decoding", "async");
    if (eager) image.setAttribute("fetchpriority", "high");
  });
  document.querySelectorAll("[data-lightbox-image]").forEach((el) => {
    const original = el.getAttribute("data-lightbox-image");
    if (original)
      el.setAttribute("data-lightbox-image", asset(config, original));
  });
  if (
    !document.querySelector("[data-lightbox]") &&
    document.querySelector("[data-lightbox-trigger]")
  )
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="lightbox" data-lightbox aria-hidden="true" role="dialog" aria-modal="true" aria-label="${e(label(config, "menuItem", "Menu item"))}"><button class="lightbox-close" type="button" data-lightbox-close aria-label="${e(label(config, "close", "Close"))}">×</button><div class="lightbox-panel"><img data-lightbox-image alt=""><div><p class="eyebrow" data-lightbox-kicker></p><h2 data-lightbox-title></h2><p data-lightbox-copy></p></div></div></div>`,
    );
  applySeo(document, config, url);
  localizeInterface(document, config, { observe: false });
  for (const element of document.querySelectorAll(
    "a[href], img[src], [data-lightbox-image]",
  )) {
    for (const attribute of ["href", "src", "data-lightbox-image"])
      if (element.hasAttribute(attribute))
        element.setAttribute(
          attribute,
          sitePath(config, element.getAttribute(attribute)),
        );
  }
  for (const image of document.querySelectorAll("img[srcset]"))
    image.setAttribute(
      "srcset",
      siteSrcset(config, image.getAttribute("srcset")),
    );
}
