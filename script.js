import { initHomeCarousels } from "./core/carousels.js";
import { siteConfig } from "virtual:restaurant-config";
import { asset, escapeHtml, label, pagePath, requestedLocation, applyImage, sitePath } from "./core/config.js";
import { reservationCard } from "./core/render.js";
import { applySeo } from "./core/seo.js";
import { attachNewsletterForms } from "./core/newsletter.js";
import { localizeInterface } from "./core/locale.js";

const templateOverrideStorageKey = `${siteConfig.brand.slug}:templateOverrides`;

function readTemplateOverrides() {
  try {
    return JSON.parse(window.localStorage.getItem(templateOverrideStorageKey) || "{}");
  } catch {
    return {};
  }
}

const templateOverrides = siteConfig.seo.indexable ? {} : readTemplateOverrides();
const brand = {
  ...siteConfig.brand,
  ...(templateOverrides.brand || {}),
};
const activeThemeId = templateOverrides.themePreset || siteConfig.activePreset || "fine-dining";
const sourceBrandName = siteConfig.brand.name;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const sourceBrandPattern = new RegExp(escapeRegExp(sourceBrandName), "g");

function templateText(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .replaceAll("{brand}", brand.name)
    .replaceAll("{email}", brand.email)
    .replaceAll("{careersEmail}", brand.careersEmail)
    .replaceAll("{privacyEmail}", brand.privacyEmail)
    .replace(sourceBrandPattern, brand.name)
    .replaceAll("reservations@mott32.com", brand.email)
    .replaceAll("careers@mott32.com", brand.careersEmail)
    .replaceAll("info@mott32.com", brand.privacyEmail);
}

function templateObject(object) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, templateText(value)]));
}

function createConfiguredLocations() {
  return siteConfig.locations.map((location) => ({
    ...templateObject(location),
    slug: location.slug,
    image: asset(siteConfig, location.image),
    status: location.status,
    reserve: sitePath(siteConfig, templateText(location.reserve || "")),
    cuisinePdf: sitePath(siteConfig, location.cuisinePdf || ""),
    drinksPdf: sitePath(siteConfig, location.drinksPdf || ""),
    email: templateText(location.email || brand.email),
  }));
}

function formatRestaurantName(location) {
  return `${brand.name} ${location.name}`;
}

const panels = Array.from(document.querySelectorAll(".hero-panel"));
const dots = Array.from(document.querySelectorAll(".hero-dots button"));
let heroLabelButtons = [];
const previous = document.querySelector(".side-arrow-left");
const next = document.querySelector(".side-arrow-right");
const drawer = document.querySelector(".drawer");
const navToggle = document.querySelector(".nav-toggle");
const drawerClose = document.querySelector(".drawer-close");
const lightbox = document.querySelector("[data-lightbox]");
const locationDetailPage = document.querySelector("[data-location-detail-page]");
const cookieStorageKey = `${siteConfig.brand.slug}:cookieChoice`;
const vipStorageKey = `${siteConfig.brand.slug}:vipSeen`;
const vipStateStorageKey = `${siteConfig.brand.slug}:vipState`;
const locationStorageKey = `${siteConfig.brand.slug}:preferredLocation`;
const templateCookieEvent = `${siteConfig.brand.slug}:cookies-saved`;
let cookieModal = null;
let vipModal = null;
let reserveModal = null;
let drawerLastActiveElement = null;
let reserveLastActiveElement = null;
let reserveDelegationReady = false;

const configuredLocations = createConfiguredLocations();
const locationDetails = Object.fromEntries(configuredLocations.map((location) => [location.slug, location]));
const locationOrder = configuredLocations.map((location) => location.slug);
const menuItemsByTitle = new Map();

siteConfig.menu.items.forEach((item) => {
  menuItemsByTitle.set(item.title, item);
  item.aliases?.forEach((alias) => menuItemsByTitle.set(alias, item));
});

const menuAvailability = Object.fromEntries(
  Array.from(menuItemsByTitle.entries()).map(([title, item]) => [title, item.locations]),
);
const vipVariants = (siteConfig.vip.variants || []).map(templateObject);

let activePanel = 0;
let heroTimer = 0;
let lastActiveElement = null;
let cookieLastActiveElement = null;
let vipLastActiveElement = null;
let activeLightboxIndex = -1;
let activeLightboxZoomed = false;

const footerLinks = siteConfig.navigation.footer.map(templateObject);
const socialLinks = siteConfig.socialLinks.map(templateObject);
const drawerLinks = siteConfig.navigation.drawer.map(templateObject);

function getCurrentPath() { return pagePath(window.location.href, siteConfig); }

function createLink(link) {
  return `<a href="${escapeHtml(sitePath(siteConfig, link.href))}">${escapeHtml(link.label)}</a>`;
}

function applyTemplateTheme() {
  const theme = siteConfig.themePresets[activeThemeId] || siteConfig.themePresets["fine-dining"];

  document.documentElement.dataset.templatePreset = activeThemeId;
  Object.entries(theme?.cssVars || {}).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
}

function replaceBrandInDom(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;

      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }

      return node.nodeValue.includes(sourceBrandName) ||
        node.nodeValue.includes("reservations@mott32.com") ||
        node.nodeValue.includes("careers@mott32.com") ||
        node.nodeValue.includes("info@mott32.com")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((node) => {
    node.nodeValue = templateText(node.nodeValue);
  });
}

function replaceBrandInAttributes(root = document) {
  root.querySelectorAll("[alt], [aria-label], [content], [href]").forEach((element) => {
    ["alt", "aria-label", "content", "href"].forEach((attribute) => {
      const value = element.getAttribute(attribute);

      if (!value) {
        return;
      }

      const nextValue = templateText(value);
      if (nextValue !== value) {
        element.setAttribute(attribute, nextValue);
      }
    });
  });
}

function applyTemplateBranding() {
  applyTemplateTheme();
  document.body.dataset.brand = brand.name;

  document.querySelectorAll(".main-logo").forEach((logo) => {
    logo.src = asset(siteConfig, brand.logo);
    logo.alt = brand.name;
  });

  document.querySelectorAll(".footer > img").forEach((logo) => {
    logo.src = asset(siteConfig, brand.footerLogo || brand.logo);
    logo.alt = brand.name;
  });

  replaceBrandInDom();
  replaceBrandInAttributes();
}

function saveTemplateOverrides(overrides) {
  try {
    window.localStorage.setItem(templateOverrideStorageKey, JSON.stringify(overrides));
  } catch {
    return;
  }
}

function ensureTemplateEditor() {
  const params = new URLSearchParams(window.location.search);

  if (siteConfig.seo.indexable || !params.has("template") || document.querySelector(".template-editor")) {
    return;
  }

  const editor = document.createElement("aside");
  editor.className = "template-editor";
  editor.setAttribute("aria-label", "Template quick editor");
  editor.innerHTML = `
    <form>
      <strong>Template</strong>
      <label>
        <span>Brand name</span>
        <input name="brandName" value="${escapeHtml(brand.name)}" />
      </label>
      <label>
        <span>Reservations email</span>
        <input name="email" value="${escapeHtml(brand.email)}" />
      </label>
      <label>
        <span>Style</span>
        <select name="themePreset">
          ${Object.entries(siteConfig.themePresets)
            .map(
              ([id, preset]) =>
                `<option value="${id}"${id === activeThemeId ? " selected" : ""}>${preset.label}</option>`,
            )
            .join("")}
        </select>
      </label>
      <div>
        <button type="submit">Preview</button>
        <button type="button" data-template-reset>Reset</button>
      </div>
    </form>
  `;

  document.body.append(editor);
  editor.querySelector("form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    saveTemplateOverrides({
      themePreset: data.get("themePreset"),
      brand: {
        name: data.get("brandName") || siteConfig.brand.name,
        email: data.get("email") || siteConfig.brand.email,
      },
    });
    window.location.reload();
  });
  editor.querySelector("[data-template-reset]")?.addEventListener("click", () => {
    try {
      window.localStorage.removeItem(templateOverrideStorageKey);
    } catch {
      return;
    }
    window.location.reload();
  });
}

function hydrateGlobalNavigation() {
  const footer = document.querySelector(".footer");
  const footerNav = document.querySelector(".footer nav");
  const drawerNav = drawer?.querySelector("nav");
  const currentPath = getCurrentPath();

  if (socialLinks.length && footer && !footer.querySelector(".footer-social")) {
    footer.querySelector("img, .footer-wordmark")?.insertAdjacentHTML(
      "afterend",
      `<div class="footer-social"><p>Social</p>${socialLinks
        .map((link) => `<a href="${escapeHtml(link.href)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>`)
        .join("")}</div>`,
    );
  }

  if (footerNav) {
    footerNav.innerHTML = `${footerLinks.map(createLink).join("")}${siteConfig.vip.enabled ? '<button class="footer-link-button" type="button" data-vip-open>Global VIP</button>' : ""}<button class="footer-link-button" type="button" data-cookie-settings>Cookie settings</button>`;
  }

  if (drawerNav) {
    drawerNav.innerHTML = drawerLinks.map(createLink).join("");
  }

  document.querySelectorAll(".footer nav a, .drawer nav a").forEach((link) => {
    const linkPath = pagePath(link.href, siteConfig);
    const normalisedLinkPath = linkPath === "/" ? "/" : `${linkPath.replace(/\/$/, "")}/`;

    if (normalisedLinkPath === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function ensureSkipLink() {
  if (document.querySelector(".skip-link")) {
    return;
  }

  const main = document.querySelector("#page-content") || document.querySelector("main");

  if (!main) {
    return;
  }

  if (!main.id) {
    main.id = "page-content";
  }

  const link = document.createElement("a");
  link.className = "skip-link";
  link.href = `#${main.id}`;
  link.textContent = "Skip to main content";
  document.body.prepend(link);
}

function getCookieChoice() {
  try {
    return JSON.parse(window.localStorage.getItem(cookieStorageKey) || "null");
  } catch {
    return null;
  }
}

function saveCookieChoice(choice) {
  try {
    window.localStorage.setItem(
      cookieStorageKey,
      JSON.stringify({
        ...choice,
        savedAt: new Date().toISOString(),
      }),
    );
  } catch {
    return;
  }
}

function getLocations(options = {}) {
  const { includeComingSoon = true } = options;

  return locationOrder
    .map((slug) => locationDetails[slug])
    .filter(Boolean)
    .filter((location) => includeComingSoon || location.status === "open");
}

function getLocationBySlug(slug) {
  return locationDetails[slug] || configuredLocations[0];
}

function isKnownLocation(slug, options = {}) {
  const { openOnly = false, allowAll = false } = options;

  if (allowAll && slug === "all") {
    return true;
  }

  const location = locationDetails[slug];
  return Boolean(location && (!openOnly || location.status === "open"));
}

function getStoredLocationSlug() {
  try {
    return window.localStorage.getItem(locationStorageKey) || "";
  } catch {
    return "";
  }
}

function savePreferredLocation(slug) {
  if (!isKnownLocation(slug, { allowAll: true })) {
    return;
  }

  try {
    if (slug === "all") {
      window.localStorage.removeItem(locationStorageKey);
    } else {
      window.localStorage.setItem(locationStorageKey, slug);
    }
  } catch {
    return;
  }
}

function getPreferredLocationSlug(options = {}) {
  const { allowAll = true, openOnly = true, fallback = "all" } = options;
  const params = new URLSearchParams(window.location.search);
  const city = params.get("city");
  const stored = getStoredLocationSlug();

  if (isKnownLocation(city, { allowAll, openOnly })) {
    return city;
  }

  if (isKnownLocation(stored, { allowAll, openOnly })) {
    return stored;
  }

  return allowAll ? fallback : isKnownLocation(fallback) ? fallback : configuredLocations[0].slug;
}

function getReservableLocations() {
  return getLocations({ includeComingSoon: false }).filter((location) => Boolean(location.reserve));
}

function getReservationHref(location) {
  return location.reserve || siteConfig.reservation.fallbackHref;
}

function isExternalHref(href) {
  return /^https?:\/\//i.test(href);
}

function getLocationStatusLabel(location) {
  if (location.status === "open") {
    return label(siteConfig, "open", "Open");
  }

  return location.opening || "Coming soon";
}

function getFocusableElements(root) {
  if (!root) {
    return [];
  }

  return Array.from(
    root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.offsetParent !== null || element === document.activeElement);
}

function trapFocus(event, root) {
  if (event.key !== "Tab" || !root) {
    return;
  }

  const focusable = getFocusableElements(root);

  if (!focusable.length) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function setDialogOpen(dialog, open, trigger, focusSelector) {
  if (!dialog) {
    return;
  }

  dialog.classList.toggle("is-open", open);
  dialog.setAttribute("aria-hidden", String(!open));
  updateBodyLock();

  if (open) {
    const focusTarget = focusSelector ? dialog.querySelector(focusSelector) : getFocusableElements(dialog)[0];
    focusTarget?.focus();
    return;
  }

  trigger?.focus?.();
}

function updateUrlParams(updates, options = {}) {
  const { replace = true } = options;
  const url = new URL(window.location.href);

  Object.entries(updates).forEach(([key, value]) => {
    if (!value || value === "all") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });

  const next = `${url.pathname}${url.search}${url.hash}`;

  if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history[replace ? "replaceState" : "pushState"]({}, "", next);
  }
}

function updateBodyLock() {
  document.body.classList.toggle(
    "modal-open",
    Boolean(
      drawer?.classList.contains("is-open") ||
        lightbox?.classList.contains("is-open") ||
        cookieModal?.classList.contains("is-open") ||
        vipModal?.classList.contains("is-open") ||
        reserveModal?.classList.contains("is-open"),
    ),
  );
}

function removeCookiePanel() {
  document.querySelector(".cookie-panel")?.remove();
}

function createCookiePanel() {
  if (getCookieChoice() || document.querySelector(".cookie-panel")) {
    return;
  }

  const panel = document.createElement("section");
  panel.className = "cookie-panel";
  panel.setAttribute("aria-label", "Cookie notice");
  panel.innerHTML = `
    <div>
      <p class="eyebrow">Cookies on our website</p>
      <p>We use essential cookies to run the site and optional cookies to understand visits and improve marketing.</p>
    </div>
    <div class="cookie-actions">
      <button type="button" data-cookie-accept>Accept recommended cookies</button>
      <button type="button" data-cookie-reject>Reject</button>
      <button type="button" data-cookie-settings>Edit settings</button>
    </div>
  `;

  document.body.append(panel);

  panel.querySelector("[data-cookie-accept]")?.addEventListener("click", () => {
    saveCookieChoice({ necessary: true, analytics: true, marketing: true });
    removeCookiePanel();
    document.dispatchEvent(new CustomEvent(templateCookieEvent));
  });

  panel.querySelector("[data-cookie-reject]")?.addEventListener("click", () => {
    saveCookieChoice({ necessary: true, analytics: false, marketing: false });
    removeCookiePanel();
    document.dispatchEvent(new CustomEvent(templateCookieEvent));
  });

  panel.querySelector("[data-cookie-settings]")?.addEventListener("click", openCookieModal);
}

function createCookieModal() {
  if (cookieModal) {
    return;
  }

  cookieModal = document.createElement("div");
  cookieModal.className = "cookie-modal";
  cookieModal.setAttribute("aria-hidden", "true");
  cookieModal.setAttribute("role", "dialog");
  cookieModal.setAttribute("aria-modal", "true");
  cookieModal.setAttribute("aria-label", "Cookie settings");
  cookieModal.innerHTML = `
    <div class="cookie-modal-panel">
      <button class="cookie-close" type="button" data-cookie-close aria-label="Close cookie settings">×</button>
      <p class="eyebrow">Cookie settings</p>
      <h2>Manage preferences</h2>
      <p>Choose which optional cookies ${brand.name} can use on this website.</p>
      <div class="cookie-preferences">
        <label>
          <input type="checkbox" checked disabled />
          <span>Necessary cookies</span>
          <small>Required for navigation, forms and basic page behaviour.</small>
        </label>
        <label>
          <input type="checkbox" data-cookie-preference="analytics" />
          <span>Analytics cookies</span>
          <small>Help measure which pages and features are used.</small>
        </label>
        <label>
          <input type="checkbox" data-cookie-preference="marketing" />
          <span>Marketing cookies</span>
          <small>Support tailored campaigns and event invitations.</small>
        </label>
      </div>
      <div class="cookie-modal-actions">
        <button type="button" data-cookie-save>Save choices</button>
        <button type="button" data-cookie-accept-all>Accept all</button>
      </div>
    </div>
  `;

  document.body.append(cookieModal);

  cookieModal.querySelector("[data-cookie-close]")?.addEventListener("click", closeCookieModal);
  cookieModal.addEventListener("click", (event) => {
    if (event.target === cookieModal) {
      closeCookieModal();
    }
  });

  cookieModal.querySelector("[data-cookie-save]")?.addEventListener("click", () => {
    const analytics = cookieModal.querySelector('[data-cookie-preference="analytics"]')?.checked || false;
    const marketing = cookieModal.querySelector('[data-cookie-preference="marketing"]')?.checked || false;

    saveCookieChoice({ necessary: true, analytics, marketing });
    removeCookiePanel();
    closeCookieModal();
    document.dispatchEvent(new CustomEvent(templateCookieEvent));
  });

  cookieModal.querySelector("[data-cookie-accept-all]")?.addEventListener("click", () => {
    saveCookieChoice({ necessary: true, analytics: true, marketing: true });
    removeCookiePanel();
    closeCookieModal();
    document.dispatchEvent(new CustomEvent(templateCookieEvent));
  });
}

function openCookieModal() {
  createCookieModal();

  const choice = getCookieChoice();
  const analytics = cookieModal.querySelector('[data-cookie-preference="analytics"]');
  const marketing = cookieModal.querySelector('[data-cookie-preference="marketing"]');

  if (analytics) {
    analytics.checked = Boolean(choice?.analytics);
  }

  if (marketing) {
    marketing.checked = Boolean(choice?.marketing);
  }

  cookieLastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  cookieModal.classList.add("is-open");
  cookieModal.setAttribute("aria-hidden", "false");
  updateBodyLock();
  cookieModal.querySelector("[data-cookie-close]")?.focus();
}

function closeCookieModal() {
  if (!cookieModal) {
    return;
  }

  cookieModal.classList.remove("is-open");
  cookieModal.setAttribute("aria-hidden", "true");
  updateBodyLock();

  if (cookieLastActiveElement) {
    cookieLastActiveElement.focus();
    cookieLastActiveElement = null;
  }
}

function ensureCookieControls() {
  createCookieModal();
  createCookiePanel();
  document.querySelectorAll("[data-cookie-settings]").forEach((button) => {
    button.addEventListener("click", openCookieModal);
  });
}

function createVipModal() {
  if (vipModal) {
    return;
  }

  vipModal = document.createElement("div");
  vipModal.className = "vip-modal";
  vipModal.setAttribute("aria-hidden", "true");
  vipModal.setAttribute("role", "dialog");
  vipModal.setAttribute("aria-modal", "true");
  vipModal.setAttribute("aria-label", "Global VIP signup");
  vipModal.innerHTML = `
    <div class="vip-modal-panel">
      <button class="vip-close" type="button" data-vip-close aria-label="Close Global VIP signup">×</button>
      <figure>
        <img data-vip-image src="${escapeHtml(asset(siteConfig, vipVariants[0]?.image || ""))}" alt="" loading="lazy" />
      </figure>
      <div class="vip-modal-copy">
        <p class="eyebrow" data-vip-eyebrow>Become</p>
        <h2 data-vip-title>A Global VIP</h2>
        <p data-vip-copy>Receive exclusive invitations to events and tastings before everyone else.</p>
        <form class="signup-form vip-modal-form">
          <label for="vip-email" data-vip-label>Email</label>
          <div>
            <input id="vip-email" type="email" placeholder="you@example.com" autocomplete="email" required />
            <button type="submit" data-vip-cta>Sign up</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.append(vipModal);

  vipModal.querySelector("[data-vip-close]")?.addEventListener("click", closeVipModal);
  vipModal.addEventListener("click", (event) => {
    if (event.target === vipModal) {
      closeVipModal();
    }
  });
}

function getVipState() {
  try {
    return JSON.parse(window.localStorage.getItem(vipStateStorageKey) || "null");
  } catch {
    return null;
  }
}

function saveVipState(state) {
  try {
    window.localStorage.setItem(vipStateStorageKey, JSON.stringify(state));
  } catch {
    return;
  }
}

function getNextVipVariant() {
  const state = getVipState();
  const currentIndex = vipVariants.findIndex((variant) => variant.id === state?.variant);
  return vipVariants[(currentIndex + 1 + vipVariants.length) % vipVariants.length];
}

function renderVipVariant(variant) {
  if (!vipModal || !variant) {
    return;
  }

  const image = vipModal.querySelector("[data-vip-image]");
  const eyebrow = vipModal.querySelector("[data-vip-eyebrow]");
  const title = vipModal.querySelector("[data-vip-title]");
  const copy = vipModal.querySelector("[data-vip-copy]");
  const label = vipModal.querySelector("[data-vip-label]");
  const cta = vipModal.querySelector("[data-vip-cta]");

  if (image) {
    applyImage(image, siteConfig, variant.image);
    image.alt = variant.title;
  }

  if (eyebrow) eyebrow.textContent = variant.eyebrow;
  if (title) title.textContent = variant.title;
  if (copy) copy.textContent = variant.copy;
  if (label) label.textContent = variant.fieldLabel;
  if (cta) cta.textContent = variant.cta;
}

function openVipModal(variant = getNextVipVariant()) {
  createVipModal();
  renderVipVariant(variant);
  vipLastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  setDialogOpen(vipModal, true, null, "[data-vip-close]");
  saveVipState({
    variant: variant.id,
    openedAt: new Date().toISOString(),
  });

  try {
    window.sessionStorage.setItem(vipStorageKey, "1");
  } catch {
    return;
  }
}

function closeVipModal() {
  if (!vipModal) {
    return;
  }

  setDialogOpen(vipModal, false, vipLastActiveElement);

  if (vipLastActiveElement) {
    vipLastActiveElement = null;
  }
}

function ensureVipControls() {
  if (!siteConfig.vip.enabled || !vipVariants.length) {
    return;
  }

  createVipModal();
  attachNewsletterForms(document, siteConfig);
  document.querySelectorAll("[data-vip-open]").forEach((button) => {
    button.addEventListener("click", () => openVipModal());
  });

  let queued = false;
  const canOpen = () => {
    try {
      if (window.sessionStorage.getItem(vipStorageKey)) {
        return false;
      }
    } catch {
      return false;
    }

    const savedAt = Date.parse(getVipState()?.openedAt || "");
    const reopenDelay = (siteConfig.vip.reopenDays || 7) * 24 * 60 * 60 * 1000;

    return (
      (!savedAt || Date.now() - savedAt > reopenDelay) &&
      !drawer?.classList.contains("is-open") &&
      !lightbox?.classList.contains("is-open") &&
      !cookieModal?.classList.contains("is-open") &&
      !reserveModal?.classList.contains("is-open") &&
      !document.querySelector(".cookie-panel")
    );
  };

  const maybeOpen = () => {
    if (queued || !canOpen()) {
      return;
    }

    queued = true;
    window.setTimeout(() => {
      queued = false;
      if (canOpen()) {
        openVipModal();
      }
    }, 900);
  };

  window.setTimeout(maybeOpen, siteConfig.vip.delayMs || 4200);
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > window.innerHeight * (siteConfig.vip.scrollRatio || 0.38)) {
        maybeOpen();
      }
    },
    { passive: true, once: true },
  );

  document.addEventListener(templateCookieEvent, () => {
    if (!window.sessionStorage.getItem(vipStorageKey)) {
      window.setTimeout(maybeOpen, 1200);
    }
  });
}

function createReserveCard(location, compact = false) {
  return reservationCard({ ...siteConfig, brand }, location, compact);
}

function createReserveModal() {
  if (reserveModal) {
    return;
  }

  const locations = getLocations();
  reserveModal = document.createElement("div");
  reserveModal.className = "reserve-modal";
  reserveModal.setAttribute("aria-hidden", "true");
  reserveModal.setAttribute("role", "dialog");
  reserveModal.setAttribute("aria-modal", "true");
  reserveModal.setAttribute("aria-label", `Choose a ${brand.name} reservation`);
  reserveModal.innerHTML = `
    <div class="reserve-modal-panel">
      <button class="reserve-close" type="button" data-reserve-close aria-label="Close reservations">×</button>
      <div class="section-heading compact-heading">
        <span class="crane-mark" aria-hidden="true"></span>
        <p class="eyebrow">Choose your ${brand.name}</p>
        <h2>Reservations</h2>
      </div>
      <label class="select-control">
        <span>Restaurant</span>
        <select data-reserve-select>
          ${locations
            .map((location) => `<option value="${location.slug}">${location.name} - ${getLocationStatusLabel(location)}</option>`)
            .join("")}
        </select>
      </label>
      <div class="reserve-modal-detail" data-reserve-detail></div>
      <a class="reserve-full-link" href="${sitePath(siteConfig, "/reserve/")}">View all reservations</a>
    </div>
  `;

  document.body.append(reserveModal);

  const select = reserveModal.querySelector("[data-reserve-select]");
  const detail = reserveModal.querySelector("[data-reserve-detail]");
  const render = () => {
    const location = getLocationBySlug(select.value);
    savePreferredLocation(location.slug);
    detail.innerHTML = createReserveCard(location, true);
    reserveModal.querySelector(".reserve-full-link").href = sitePath(siteConfig, `/reserve/?city=${location.slug}`);
  };

  const preferred = getPreferredLocationSlug({ allowAll: false, openOnly: false, fallback: configuredLocations[0].slug });
  if (select && isKnownLocation(preferred, { openOnly: false })) {
    select.value = preferred;
  }

  select?.addEventListener("change", render);
  render();

  reserveModal.querySelector("[data-reserve-close]")?.addEventListener("click", closeReserveModal);
  reserveModal.addEventListener("click", (event) => {
    if (event.target === reserveModal) {
      closeReserveModal();
    }
  });
}

function openReserveModal(event) {
  event?.preventDefault();
  createReserveModal();
  const select = reserveModal.querySelector("[data-reserve-select]");
  select.value = getPreferredLocationSlug({allowAll:false,openOnly:false,fallback:configuredLocations[0].slug});
  select.dispatchEvent(new Event("change"));
  reserveLastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  setDialogOpen(reserveModal, true, null, "[data-reserve-select]");
}

function closeReserveModal() {
  if (!reserveModal) {
    return;
  }

  setDialogOpen(reserveModal, false, reserveLastActiveElement);
  reserveLastActiveElement = null;
}

function ensureReserveControls() {
  const isReservePage = document.body.classList.contains("reserve-page");

  if (isReservePage || reserveDelegationReady) {
    return;
  }

  reserveDelegationReady = true;
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");

    if (!link || link.classList.contains("reserve-full-link")) {
      return;
    }
    if (new URL(link.href).origin !== window.location.origin || pagePath(link.href, siteConfig) !== "/reserve/") return;

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) {
      return;
    }

    openReserveModal(event);
  });
}

function renderReservePage() {
  const grid = document.querySelector(".reserve-grid");

  if (!grid) {
    return;
  }

  const locations = getLocations();
  grid.innerHTML = locations.map((location) => createReserveCard(location)).join("");

  const tools = document.createElement("div");
  tools.className = "reserve-page-tools";
  tools.innerHTML = `
    <label class="select-control">
      <span>Restaurant</span>
      <select data-reserve-city>
        <option value="all">All restaurants</option>
        ${locations.map((location) => `<option value="${location.slug}">${location.name}</option>`).join("")}
      </select>
    </label>
    <label class="select-control">
      <span>Region</span>
      <select data-reserve-region>
        <option value="all">All regions</option>
        ${Array.from(new Set(locations.map((location) => location.region)))
          .map((region) => `<option value="${region}">${region}</option>`)
          .join("")}
      </select>
    </label>
    <label class="select-control">
      <span>Status</span>
      <select data-reserve-status>
        <option value="all">All restaurants</option>
        <option value="open">Open now</option>
        <option value="coming-soon">Opening soon</option>
      </select>
    </label>
  `;

  grid.before(tools);

  const params = new URLSearchParams(window.location.search);
  const cityControl = tools.querySelector("[data-reserve-city]");
  const regionControl = tools.querySelector("[data-reserve-region]");
  const statusControl = tools.querySelector("[data-reserve-status]");
  const requestedCity = params.get("city");
  const requestedRegion = params.get("region");
  const requestedStatus = params.get("status");

  if (isKnownLocation(requestedCity, { allowAll: true, openOnly: false })) {
    cityControl.value = requestedCity;
  }

  if (requestedRegion && Array.from(regionControl.options).some((option) => option.value === requestedRegion)) {
    regionControl.value = requestedRegion;
  }

  if (requestedStatus && Array.from(statusControl.options).some((option) => option.value === requestedStatus)) {
    statusControl.value = requestedStatus;
  }

  const update = () => {
    const city = cityControl.value;
    const region = regionControl.value;
    const status = statusControl.value;

    grid.querySelectorAll(".reserve-card").forEach((card) => {
      const visible =
        (city === "all" || card.dataset.location === city) &&
        (region === "all" || card.dataset.region === region) &&
        (status === "all" || card.dataset.status === status);
      card.hidden = !visible;
      card.classList.toggle("is-highlighted", city !== "all" && card.dataset.location === city);
    });

    if (city !== "all") {
      savePreferredLocation(city);
    }

    updateUrlParams({ city, region, status });
  };

  tools.addEventListener("change", () => {
    update();
    grid.querySelector(".reserve-card:not([hidden])")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  update();
}

function normaliseLocationName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function hydrateLocationDirectory() {
  const locationsPage = document.querySelector(".locations-index");

  if (!locationsPage) {
    return;
  }

  const tiles = Array.from(locationsPage.querySelectorAll(".location-tile"));

  tiles.forEach((tile) => {
    const heading = tile.querySelector("h3")?.childNodes[0]?.textContent?.trim() || "";
    const slug = tile.dataset.location || normaliseLocationName(heading);
    const location = getLocationBySlug(slug);

    tile.dataset.location = location.slug;
    tile.dataset.region = location.region;
    tile.dataset.status = location.status;

    if (!tile.querySelector(".location-meta")) {
      tile.insertAdjacentHTML(
        "beforeend",
        `<dl class="location-meta">
          <div><dt>Status</dt><dd>${getLocationStatusLabel(location)}</dd></div>
          <div><dt>Hours</dt><dd>${location.hours}</dd></div>
          ${location.phone ? `<div><dt>Phone</dt><dd>${location.phone}</dd></div>` : ""}
        </dl>`,
      );
    }

    if (location.reserve && !tile.querySelector(".location-reserve-link")) {
      tile.insertAdjacentHTML(
        "beforeend",
        `<a class="cut-button location-reserve-link" href="${location.reserve}" target="_blank" rel="noopener">Reserve</a>`,
      );
    }
  });

  const tabs = locationsPage.querySelector(".region-tabs");
  const tools = document.createElement("div");
  tools.className = "location-directory-tools";
  tools.innerHTML = `
    <label class="search-control">
      <span>Search location</span>
      <input type="search" data-location-search placeholder="City, region or venue" autocomplete="off" />
    </label>
    <label class="select-control">
      <span>Status</span>
      <select data-location-status>
        <option value="all">All locations</option>
        <option value="open">Open now</option>
        <option value="coming-soon">Opening soon</option>
      </select>
    </label>
    <p data-location-summary></p>
  `;
  tabs?.after(tools);

  const mapPanel = document.createElement("section");
  mapPanel.className = "location-map-panel";
  mapPanel.setAttribute("aria-label", "Location overview");
  mapPanel.innerHTML = `
    <div>
      <p class="eyebrow">Global directory</p>
      <h2>Find ${brand.name} by region</h2>
    </div>
    <div class="map-region-list">
      ${Array.from(new Set(getLocations().map((location) => location.region)))
        .map((region) => {
          const count = getLocations().filter((location) => location.region === region).length;
          return `<button type="button" data-map-region="${region}"><span>${region}</span><strong>${count}</strong></button>`;
        })
        .join("")}
    </div>
  `;
  tools.after(mapPanel);

  const search = tools.querySelector("[data-location-search]");
  const status = tools.querySelector("[data-location-status]");
  const summary = tools.querySelector("[data-location-summary]");
  const params = new URLSearchParams(window.location.search);

  search.value = params.get("q") || "";

  if (params.get("status") && Array.from(status.options).some((option) => option.value === params.get("status"))) {
    status.value = params.get("status");
  }

  const update = () => {
    const query = search.value.trim().toLowerCase();
    const statusValue = status.value;
    let visibleCount = 0;

    tiles.forEach((tile) => {
      const text = `${tile.textContent} ${tile.dataset.region} ${tile.dataset.status}`.toLowerCase();
      const visible = (!query || text.includes(query)) && (statusValue === "all" || tile.dataset.status === statusValue);
      tile.hidden = !visible;
      visibleCount += visible ? 1 : 0;
    });

    locationsPage.querySelectorAll(".region-section").forEach((section) => {
      section.hidden = !section.querySelector(".location-tile:not([hidden])");
    });

    summary.textContent = `${visibleCount} ${visibleCount === 1 ? "location" : "locations"} shown`;
    updateUrlParams({ q: search.value.trim(), status: statusValue });
  };

  search.addEventListener("input", update);
  status.addEventListener("change", update);
  mapPanel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-map-region]");

    if (!button) {
      return;
    }

    search.value = button.dataset.mapRegion;
    update();
    locationsPage.querySelector(".region-section:not([hidden])")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  update();
}

function applySeoEnhancements() {
  applySeo(document, { ...siteConfig, brand }, window.location.href);
}

function ensureScrollTop() {
  const scrollTop = document.createElement("button");
  scrollTop.className = "scroll-top";
  scrollTop.type = "button";
  scrollTop.setAttribute("aria-label", "Scroll to top");
  document.body.append(scrollTop);

  const updateScrollTop = () => {
    scrollTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8);
  };

  scrollTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scroll", updateScrollTop, { passive: true });
  updateScrollTop();
}

if (locationDetailPage) {
  const requestedCity = requestedLocation(window.location.href, siteConfig).slug;
  const location = locationDetails[requestedCity] || configuredLocations[0];
  const heroImage = document.querySelector("[data-location-hero]");
  const detailImage = document.querySelector("[data-location-image]");
  const reserveLink = document.querySelector("[data-location-reserve]");

  savePreferredLocation(location.slug);

  document.title = `${location.name} | ${brand.name}`;
  document.querySelector("[data-location-name]").textContent = location.name;
  const locationHan = document.querySelector("[data-location-han]");
  if (locationHan) {
    locationHan.textContent = location.han;
    locationHan.hidden = !(location.han || "").trim();
  }
  document.querySelector("[data-location-region]").textContent = location.region;
  document.querySelector("[data-location-address]").textContent = location.address;
  document.querySelector("[data-location-intro]").textContent = location.intro;
  document.querySelector("[data-location-copy]").textContent = location.copy;

  [heroImage, detailImage].forEach((image) => {
    if (!image) {
      return;
    }

    applyImage(image, siteConfig, location.image);
    image.alt = `${formatRestaurantName(location)} interior`;
  });

  if (reserveLink) {
    reserveLink.textContent = location.status === "open" && location.reserve ? "Reserve" : getLocationStatusLabel(location);
    if (location.reserve) {
      reserveLink.href = location.reserve;
    } else {
      reserveLink.removeAttribute("href");
    }
    reserveLink.classList.toggle("is-disabled", !location.reserve);
    reserveLink.setAttribute("aria-disabled", String(!location.reserve));

    if (isExternalHref(location.reserve)) {
      reserveLink.target = "_blank";
      reserveLink.rel = "noopener";
    } else {
      reserveLink.removeAttribute("target");
      reserveLink.removeAttribute("rel");
    }
  }

  document.querySelectorAll(".location-menu-links a").forEach((link) => {
    const url = new URL(link.href, window.location.origin);
    if (["/our-cuisine/", "/our-drinks/"].includes(pagePath(url.href, siteConfig))) {
      url.searchParams.set("city", location.slug);
      link.href = `${url.pathname}?${url.searchParams.toString()}`;
    }
  });

  const detailCopy = document.querySelector(".location-detail-block .signature-copy");
  if (detailCopy && !detailCopy.querySelector(".location-facts")) {
    detailCopy.insertAdjacentHTML(
      "beforeend",
      `<dl class="location-facts">
        <div><dt>Status</dt><dd>${getLocationStatusLabel(location)}</dd></div>
        <div><dt>Hours</dt><dd>${location.hours}</dd></div>
        ${location.phone ? `<div><dt>Phone</dt><dd>${location.phone}</dd></div>` : ""}
        <div><dt>Contact</dt><dd><a href="mailto:${location.email}">${location.email}</a></dd></div>
      </dl>`,
    );
  }
}

function setPanel(index) {
  if (!panels.length) {
    return;
  }

  activePanel = (index + panels.length) % panels.length;
  panels.forEach((panel, panelIndex) => panel.classList.toggle("is-active", panelIndex === activePanel));
  dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === activePanel));
  heroLabelButtons.forEach((button, buttonIndex) => {
    const active = buttonIndex === activePanel;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function getSlideLabel(panel, index) {
  return panel.dataset.slideLabel || panel.querySelector("img")?.alt?.replace(new RegExp(`^${escapeRegExp(brand.name)}\\s*`, "i"), "") || `Slide ${index + 1}`;
}

function createHeroLabels() {
  if (panels.length < 2 || document.querySelector(".hero-labels")) {
    return;
  }

  const hero = panels[0].closest(".hero");

  if (!hero) {
    return;
  }

  const list = document.createElement("ol");
  list.className = "hero-labels";
  list.setAttribute("aria-label", "Named hero slide controls");

  panels.forEach((panel, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const label = getSlideLabel(panel, index);

    button.type = "button";
    button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span>${label}`;
    button.setAttribute("aria-label", `Show ${label}`);
    button.setAttribute("aria-pressed", String(index === activePanel));
    button.classList.toggle("is-active", index === activePanel);
    button.addEventListener("click", () => {
      setPanel(index);
      restartHero();
    });

    item.append(button);
    list.append(item);
  });

  hero.append(list);
  heroLabelButtons = Array.from(list.querySelectorAll("button"));
}

function restartHero() {
  if (panels.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  clearInterval(heroTimer);
  heroTimer = setInterval(() => setPanel(activePanel + 1), 5000);
}

function stopHero() {
  clearInterval(heroTimer);
}

function attachHeroInteractions() {
  const hero = panels[0]?.closest(".hero");

  if (!hero || panels.length < 2) {
    return;
  }

  let pointerStart = null;

  hero.addEventListener("pointerdown", (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });

  hero.addEventListener("pointerup", (event) => {
    if (!pointerStart) {
      return;
    }

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;

    if (Math.abs(deltaX) < 42 || Math.abs(deltaY) > 60) {
      return;
    }

    setPanel(deltaX < 0 ? activePanel + 1 : activePanel - 1);
    restartHero();
  });

  hero.addEventListener("mouseenter", stopHero);
  hero.addEventListener("mouseleave", restartHero);
  hero.addEventListener("focusin", stopHero);
  hero.addEventListener("focusout", restartHero);
}

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    setPanel(index);
    restartHero();
  });
});

previous?.addEventListener("click", () => {
  setPanel(activePanel - 1);
  restartHero();
});

next?.addEventListener("click", () => {
  setPanel(activePanel + 1);
  restartHero();
});

function setDrawer(open) {
  if (!drawer || !navToggle) {
    return;
  }

  if (open) {
    drawerLastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }

  drawer.classList.toggle("is-open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  navToggle.setAttribute("aria-expanded", String(open));
  updateBodyLock();

  if (open) {
    const focusTarget = drawer.querySelector("[aria-current='page']") || drawer.querySelector("a");
    focusTarget?.focus();
  } else if (drawerLastActiveElement) {
    drawerLastActiveElement.focus();
    drawerLastActiveElement = null;
  }
}

applyTemplateBranding();
hydrateGlobalNavigation();
ensureSkipLink();
applySeoEnhancements();
ensureTemplateEditor();
createHeroLabels();
attachHeroInteractions();
ensureCookieControls();
ensureVipControls();
ensureReserveControls();
renderReservePage();
hydrateLocationDirectory();
ensureScrollTop();

navToggle?.addEventListener("click", () => setDrawer(true));
drawerClose?.addEventListener("click", () => setDrawer(false));
drawer?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setDrawer(false)));
drawer?.addEventListener("click", (event) => {
  if (event.target === drawer) {
    setDrawer(false);
  }
});

attachNewsletterForms(document, siteConfig);

initHomeCarousels(document);

const featureLinksSection = document.querySelector(".feature-links");

if (featureLinksSection) {
  const setFeatureLinksVisible = (isVisible) => {
    document.body.classList.toggle("feature-links-active", isVisible);
  };

  if ("IntersectionObserver" in window) {
    const featureObserver = new IntersectionObserver(
      ([entry]) => {
        setFeatureLinksVisible(entry.isIntersecting && entry.intersectionRatio > 0.38);
      },
      { threshold: [0, 0.38, 0.7] },
    );

    featureObserver.observe(featureLinksSection);
  } else {
    setFeatureLinksVisible(true);
  }
}

document.querySelectorAll("[data-rail-section]").forEach((section) => {
  const rail = section.querySelector("[data-rail]");
  const previousRail = section.querySelector("[data-rail-prev]");
  const nextRail = section.querySelector("[data-rail-next]");

  if (!rail || rail.classList.contains("food-rail")) {
    return;
  }

  const scrollByPage = (direction) => {
    rail.scrollBy({
      left: direction * Math.min(rail.clientWidth * 0.78, 520),
      behavior: "smooth",
    });
  };

  previousRail?.addEventListener("click", () => scrollByPage(-1));
  nextRail?.addEventListener("click", () => scrollByPage(1));

  rail.tabIndex = 0;
  rail.setAttribute("role", rail.getAttribute("role") || "region");
  rail.setAttribute("aria-label", section.getAttribute("aria-label") || "Carousel");

  let startX = 0;
  let startY = 0;
  let startScroll = 0;
  let trackingPointer = false;
  let dragging = false;
  let dragged = false;
  let railVisible = false;
  let railTimer = 0;
  const railMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const stopRail = () => window.clearInterval(railTimer);
  const startRail = () => {
    stopRail();

    if (railMotion.matches || !railVisible || document.hidden || section.contains(document.activeElement) || rail.scrollWidth <= rail.clientWidth + 1) {
      return;
    }

    railTimer = window.setInterval(() => {
      const atEnd = Math.ceil(rail.scrollLeft + rail.clientWidth) >= rail.scrollWidth - 4;
      rail.scrollTo({
        left: atEnd ? 0 : rail.scrollLeft + Math.min(rail.clientWidth * 0.72, 460),
        behavior: "smooth",
      });
    }, 5200);
  };

  // Browser image dragging would cancel the pointer gesture used to scroll.
  rail.addEventListener("dragstart", (event) => event.preventDefault());

  rail.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    trackingPointer = true;
    dragged = false;
    startX = event.clientX;
    startY = event.clientY;
    startScroll = rail.scrollLeft;
    stopRail();
  });

  rail.addEventListener("pointermove", (event) => {
    if (!trackingPointer) return;
    const delta = event.clientX - startX;
    const vertical = event.clientY - startY;
    if (!dragging) {
      if (Math.abs(vertical) >= 8 && Math.abs(vertical) > Math.abs(delta)) {
        trackingPointer = false;
        return;
      }
      if (Math.abs(delta) < 8) return;
      dragging = true;
      dragged = true;
      rail.classList.add("is-dragging");
      rail.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
    rail.scrollLeft = startScroll - delta;
  });

  rail.addEventListener("pointerup", (event) => {
    trackingPointer = false;
    dragging = false;
    rail.classList.remove("is-dragging");
    if (rail.hasPointerCapture?.(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    startRail();
  });

  rail.addEventListener("pointercancel", () => {
    trackingPointer = false;
    dragging = false;
    dragged = false;
    rail.classList.remove("is-dragging");
    startRail();
  });

  rail.addEventListener("click", (event) => {
    if (!dragged) return;
    dragged = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  rail.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByPage(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByPage(1);
    }
  });

  section.addEventListener("mouseenter", stopRail);
  section.addEventListener("mouseleave", startRail);
  section.addEventListener("focusin", stopRail);
  section.addEventListener("focusout", () => requestAnimationFrame(startRail));
  railMotion.addEventListener("change", startRail);
  document.addEventListener("visibilitychange", startRail);
  new IntersectionObserver(([entry]) => {
    railVisible = entry.isIntersecting;
    startRail();
  }, { threshold: 0.2 }).observe(rail);
});

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.scrollTarget);

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function setSectionNavActive(nav, targetSelector, options = {}) {
  const { behavior = "smooth" } = options;
  const activeButton = nav.querySelector(`[data-scroll-target="${targetSelector}"]`);

  nav.querySelectorAll("[data-scroll-target]").forEach((button) => {
    const active = button === activeButton;

    button.classList.toggle("is-active", active);

    if (active) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  if (activeButton && nav.scrollWidth > nav.clientWidth) {
    const left = activeButton.offsetLeft - nav.clientWidth / 2 + activeButton.clientWidth / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior });
  }
}

function ensureSectionNavState() {
  document.querySelectorAll(".page-section-nav").forEach((nav) => {
    const buttons = Array.from(nav.querySelectorAll("[data-scroll-target]"));
    const sections = buttons
      .map((button) => document.querySelector(button.dataset.scrollTarget))
      .filter((section) => section?.id);

    if (!sections.length) {
      return;
    }

    const getCurrentSection = () => {
      const activationLine = Math.max(130, window.innerHeight * 0.24);

      return sections.reduce((active, section) => {
        return section.getBoundingClientRect().top <= activationLine ? section : active;
      }, sections[0]);
    };

    const updateActiveSection = () => {
      setSectionNavActive(nav, `#${getCurrentSection().id}`, { behavior: "auto" });
    };

    let frame = 0;
    const queueUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateActiveSection();
      });
    };

    setSectionNavActive(nav, `#${sections[0].id}`, { behavior: "auto" });

    nav.addEventListener("click", (event) => {
      const button = event.target.closest("[data-scroll-target]");

      if (button) {
        setSectionNavActive(nav, button.dataset.scrollTarget);
      }
    });

    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    updateActiveSection();
  });
}

function ensureScrollReveal() {
  const targets = Array.from(
    document.querySelectorAll(
      [
        ".section-copy",
        ".section-heading",
        ".photo-link",
        ".award-box",
        ".award-tile",
        ".vip-copy",
        ".vip-signup figure",
        ".signature-block",
        ".menu-card",
        ".menu-location-controls",
        ".sample-panel",
        ".private-dining > *",
        ".wine-panel > div",
        ".reservation-panel > div",
        ".reserve-card",
        ".location-map-panel",
        ".founder-card",
        ".principle-grid article",
        ".career-panel",
        ".privacy-content",
        ".location-detail-block > *",
      ].join(", "),
    ),
  );

  if (!targets.length) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  targets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 80}ms`);
  });

  if (reducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.14,
    },
  );

  targets.forEach((target) => observer.observe(target));
}

ensureSectionNavState();
ensureScrollReveal();

document.querySelectorAll("[data-menu-browser]").forEach((browser) => {
  const filters = Array.from(browser.querySelectorAll("[data-filter]"));
  const cards = Array.from(browser.querySelectorAll(".menu-card"));
  const isDrinkPage = document.body.classList.contains("drinks-page");
  const params = new URLSearchParams(window.location.search);
  const requestedFilter = params.get("filter");
  let activeLocation = getPreferredLocationSlug({ allowAll: true, openOnly: true, fallback: "all" });

  function getCardTitle(card) {
    return card.querySelector("[data-lightbox-title]")?.dataset.lightboxTitle || card.querySelector("strong")?.textContent?.trim() || "";
  }

  function getMenuItem(card) {
    return siteConfig.menu.items.find(item => item.id === card.dataset.menuId) || menuItemsByTitle.get(getCardTitle(card));
  }

  function getCardLocations(card) {
    const title = getCardTitle(card);
    const explicit = card.dataset.locations?.split(/\s+/).filter(Boolean);

    if (explicit?.length) {
      return explicit;
    }

    return menuAvailability[title] || getReservableLocations().map((location) => location.slug);
  }

  function createMenuLocationControls() {
    if (browser.querySelector(".menu-location-controls")) {
      return;
    }

    const heading = browser.querySelector(".section-heading");
    const controls = document.createElement("div");
    controls.className = "menu-location-controls";
    controls.innerHTML = `
      <label class="select-control">
        <span>Location</span>
        <select data-menu-location>
          <option value="all">All open locations</option>
          ${getReservableLocations()
            .map((location) => `<option value="${location.slug}">${location.name}</option>`)
            .join("")}
        </select>
      </label>
      <p data-menu-location-note>Showing signature items across open locations.</p>
      <div class="menu-pdf-links" data-menu-links></div>
    `;

    heading?.insertAdjacentElement("afterend", controls);
    controls.querySelector("[data-menu-location]").value = activeLocation;
  }

  function updateMenuLocationNote() {
    const controls = browser.querySelector(".menu-location-controls");
    const note = controls?.querySelector("[data-menu-location-note]");
    const links = controls?.querySelector("[data-menu-links]");
    const selected = activeLocation === "all" ? null : getLocationBySlug(activeLocation);

    if (note) {
      note.textContent = selected
        ? `${selected.name}: ${selected.menuNote}`
        : "Showing signature items across open locations.";
    }

    if (links) {
      const winePdf = sitePath(siteConfig, selected?.drinksPdf || (activeLocation === "all" ? siteConfig.menu.drinksPdf : ""));
      const cuisinePdf = selected?.cuisinePdf;
      links.innerHTML = isDrinkPage
        ? (winePdf ? `<a class="cut-button small-button" href="${escapeHtml(winePdf)}" target="_blank" rel="noopener">Wine List</a>` : "")
        : `${cuisinePdf ? `<a class="cut-button small-button" href="${cuisinePdf}" target="_blank" rel="noopener">Menu PDF</a>` : ""}<a class="cut-button small-button" href="${sitePath(siteConfig, "/reserve/")}">Reserve selected location</a>`;
    }
  }

  function renderMenuExtras(card, locations) {
    let badge = card.querySelector(".menu-availability");
    let details = card.querySelector(".menu-item-details");
    const item = getMenuItem(card);
    const selected = activeLocation === "all" ? null : getLocationBySlug(activeLocation);
    const text = selected
      ? locations.includes(activeLocation)
        ? `Available in ${selected.name}`
        : `Not listed in ${selected.name}`
      : `${locations.length} locations`;

    if (!badge) {
      badge = document.createElement("small");
      badge.className = "menu-availability";
      card.querySelector(".menu-card-trigger")?.append(badge);
    }

    badge.textContent = text;

    if (!item) {
      return;
    }

    if (!details) {
      details = document.createElement("small");
      details.className = "menu-item-details";
      card.querySelector(".menu-card-trigger")?.append(details);
    }

    const pieces = [
      item.price,
      item.dietary?.length ? item.dietary.join(", ") : "",
      item.allergens?.length ? `Allergens: ${item.allergens.join(", ")}` : "",
    ].filter(Boolean);

    details.textContent = pieces.join(" · ");
  }

  function updateMenuCards() {
    const activeFilter = filters.find((button) => button.classList.contains("is-active"))?.dataset.filter || "all";
    let visibleCount = 0;

    cards.forEach((card) => {
      const categories = (card.dataset.category || "").split(/\s+/);
      const locations = getCardLocations(card);
      const matchesFilter = activeFilter === "all" || categories.includes(activeFilter);
      const matchesLocation = activeLocation === "all" || locations.includes(activeLocation);

      card.dataset.locations = locations.join(" ");
      renderMenuExtras(card, locations);
      card.hidden = !(matchesFilter && matchesLocation);
      visibleCount += card.hidden ? 0 : 1;
    });

    let empty = browser.querySelector(".menu-empty-state");
    if (!empty) {
      empty = document.createElement("p");
      empty.className = "menu-empty-state";
      empty.textContent = "No matching items are listed for this location yet.";
      browser.querySelector(".menu-grid")?.after(empty);
    }

    empty.hidden = visibleCount > 0;
    updateMenuLocationNote();
    updateUrlParams({ city: activeLocation, filter: activeFilter });
  }

  if (params.has("city")) savePreferredLocation(activeLocation);
  createMenuLocationControls();

  if (requestedFilter && filters.some((button) => button.dataset.filter === requestedFilter)) {
    filters.forEach((button) => {
      const active = button.dataset.filter === requestedFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  filters.forEach((filterButton) => {
    filterButton.setAttribute("aria-selected", filterButton.classList.contains("is-active") ? "true" : "false");

    filterButton.addEventListener("click", () => {
      filters.forEach((button) => {
        const active = button === filterButton;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
      });
      updateMenuCards();
    });
  });

  browser.querySelector("[data-menu-location]")?.addEventListener("change", (event) => {
    activeLocation = event.target.value;
    savePreferredLocation(activeLocation);
    updateMenuCards();
  });

  updateMenuCards();
});

document.querySelectorAll("[data-accordion]").forEach((accordion) => {
  const panels = Array.from(accordion.querySelectorAll(".sample-panel"));

  panels.forEach((panel) => {
    const button = panel.querySelector("button");
    const content = panel.querySelector("div");

    button?.addEventListener("click", () => {
      const isOpen = panel.classList.contains("is-open");

      panels.forEach((item) => {
        const itemButton = item.querySelector("button");
        const itemContent = item.querySelector("div");
        const shouldOpen = item === panel && !isOpen;

        item.classList.toggle("is-open", shouldOpen);
        itemButton?.setAttribute("aria-expanded", String(shouldOpen));

        if (itemContent) {
          itemContent.hidden = !shouldOpen;
        }
      });
    });

    if (content) {
      content.hidden = !panel.classList.contains("is-open");
    }
  });
});

function setLightbox(open) {
  if (!lightbox) {
    return;
  }

  lightbox.classList.toggle("is-open", open);
  lightbox.setAttribute("aria-hidden", String(!open));
  updateBodyLock();

  if (!open) {
    activeLightboxZoomed = false;
    lightbox.classList.remove("is-zoomed");

    if (lastActiveElement) {
      lastActiveElement.focus();
      lastActiveElement = null;
    }
  }
}

const lightboxTriggers = Array.from(document.querySelectorAll("[data-lightbox-trigger]"));

function getActiveLightboxTriggers() {
  return lightboxTriggers.filter((trigger) => !trigger.closest("[hidden]"));
}

function renderLightbox(trigger) {
  if (!lightbox || !trigger) {
    return;
  }

  const image = lightbox.querySelector("[data-lightbox-image]");
  const title = lightbox.querySelector("[data-lightbox-title]");
  const copy = lightbox.querySelector("[data-lightbox-copy]");
  const kicker = lightbox.querySelector("[data-lightbox-kicker]");
  const counter = lightbox.querySelector("[data-lightbox-counter]");
  const label = trigger.querySelector("span")?.textContent?.trim() || "Menu";
  const activeTriggers = getActiveLightboxTriggers();
  const activeIndex = activeTriggers.indexOf(trigger);

  image.src = trigger.dataset.lightboxImage;
  image.alt = trigger.dataset.lightboxTitle || "";
  title.textContent = trigger.dataset.lightboxTitle || "";
  copy.textContent = trigger.dataset.lightboxCopy || "";
  kicker.textContent = label;

  if (counter) {
    counter.textContent = activeIndex >= 0 ? `${activeIndex + 1} / ${activeTriggers.length}` : "";
  }

  lightbox.querySelectorAll("[data-lightbox-thumb]").forEach((button) => {
    const active = Number(button.dataset.lightboxThumb) === activeIndex;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "true" : "false");
  });
}

function showLightboxAt(index) {
  const activeTriggers = getActiveLightboxTriggers();

  if (!activeTriggers.length) {
    return;
  }

  activeLightboxIndex = (index + activeTriggers.length) % activeTriggers.length;
  activeLightboxZoomed = false;
  lightbox?.classList.remove("is-zoomed");
  renderLightbox(activeTriggers[activeLightboxIndex]);
}

function renderLightboxThumbs() {
  if (!lightbox) {
    return;
  }

  const activeTriggers = getActiveLightboxTriggers();
  const thumbs = lightbox.querySelector("[data-lightbox-thumbs]");

  if (!thumbs) {
    return;
  }

  thumbs.innerHTML = activeTriggers
    .map(
      (trigger, index) => `
        <button type="button" data-lightbox-thumb="${index}" aria-label="Show ${trigger.dataset.lightboxTitle || `item ${index + 1}`}">
          <img src="${trigger.dataset.lightboxImage}" alt="" />
        </button>
      `,
    )
    .join("");

  thumbs.querySelectorAll("[data-lightbox-thumb]").forEach((button) => {
    button.addEventListener("click", () => showLightboxAt(Number(button.dataset.lightboxThumb)));
  });
}

function ensureLightboxControls() {
  if (!lightbox || lightbox.querySelector(".lightbox-nav")) {
    return;
  }

  const controls = document.createElement("div");
  controls.className = "lightbox-nav";
  controls.innerHTML = `
    <button type="button" data-lightbox-prev aria-label="Previous item">Previous</button>
    <button type="button" data-lightbox-next aria-label="Next item">Next</button>
    <button type="button" data-lightbox-zoom aria-label="Toggle image zoom">Zoom</button>
  `;
  const counter = document.createElement("p");
  counter.className = "lightbox-counter";
  counter.setAttribute("data-lightbox-counter", "");
  const thumbs = document.createElement("div");
  thumbs.className = "lightbox-thumbs";
  thumbs.setAttribute("data-lightbox-thumbs", "");

  lightbox.querySelector(".lightbox-panel")?.append(counter);
  lightbox.querySelector(".lightbox-panel")?.append(controls);
  lightbox.querySelector(".lightbox-panel")?.append(thumbs);

  controls.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => showLightboxAt(activeLightboxIndex - 1));
  controls.querySelector("[data-lightbox-next]")?.addEventListener("click", () => showLightboxAt(activeLightboxIndex + 1));
  controls.querySelector("[data-lightbox-zoom]")?.addEventListener("click", () => {
    activeLightboxZoomed = !activeLightboxZoomed;
    lightbox.classList.toggle("is-zoomed", activeLightboxZoomed);
  });
}

ensureLightboxControls();

lightboxTriggers.forEach((trigger, index) => {
  trigger.addEventListener("click", () => {
    if (!lightbox) {
      return;
    }

    lastActiveElement = trigger;
    renderLightboxThumbs();
    activeLightboxIndex = getActiveLightboxTriggers().indexOf(trigger);
    activeLightboxZoomed = false;
    lightbox.classList.remove("is-zoomed");
    renderLightbox(trigger);
    setLightbox(true);
    lightbox.querySelector("[data-lightbox-close]")?.focus();
  });
});

lightbox?.querySelector("[data-lightbox-close]")?.addEventListener("click", () => setLightbox(false));
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    setLightbox(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (reserveModal?.classList.contains("is-open")) {
    trapFocus(event, reserveModal);
  } else if (vipModal?.classList.contains("is-open")) {
    trapFocus(event, vipModal);
  } else if (cookieModal?.classList.contains("is-open")) {
    trapFocus(event, cookieModal);
  } else if (lightbox?.classList.contains("is-open")) {
    trapFocus(event, lightbox);
  } else if (drawer?.classList.contains("is-open")) {
    trapFocus(event, drawer);
  }

  if (lightbox?.classList.contains("is-open") && event.key === "ArrowLeft") {
    showLightboxAt(activeLightboxIndex - 1);
    return;
  }

  if (lightbox?.classList.contains("is-open") && event.key === "ArrowRight") {
    showLightboxAt(activeLightboxIndex + 1);
    return;
  }

  if (event.key !== "Escape") {
    return;
  }

  if (reserveModal?.classList.contains("is-open")) {
    closeReserveModal();
    return;
  }

  if (vipModal?.classList.contains("is-open")) {
    closeVipModal();
    return;
  }

  if (cookieModal?.classList.contains("is-open")) {
    closeCookieModal();
    return;
  }

  if (lightbox?.classList.contains("is-open")) {
    setLightbox(false);
    return;
  }

  if (drawer?.classList.contains("is-open")) {
    setDrawer(false);
  }
});

restartHero();

localizeInterface(document, siteConfig);
