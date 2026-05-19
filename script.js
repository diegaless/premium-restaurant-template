const panels = Array.from(document.querySelectorAll(".hero-panel"));
const dots = Array.from(document.querySelectorAll(".hero-dots button"));
let heroLabelButtons = [];
const previous = document.querySelector(".side-arrow-left");
const next = document.querySelector(".side-arrow-right");
const drawer = document.querySelector(".drawer");
const navToggle = document.querySelector(".nav-toggle");
const drawerClose = document.querySelector(".drawer-close");
const locationRail = document.querySelector("[data-carousel]");
const lightbox = document.querySelector("[data-lightbox]");
const locationDetailPage = document.querySelector("[data-location-detail-page]");
const cookieStorageKey = "mott32CookieChoice";
const vipStorageKey = "mott32VipSeen";
const vipStateStorageKey = "mott32VipState";
const locationStorageKey = "mott32PreferredLocation";
let cookieModal = null;
let vipModal = null;
let reserveModal = null;
let drawerLastActiveElement = null;
let reserveLastActiveElement = null;
let reserveDelegationReady = false;

const locationDetails = {
  "hong-kong": {
    name: "Hong Kong",
    han: "香港",
    region: "Asia",
    address: "Standard Chartered Bank Building",
    image: "/assets/loc-hk.jpg",
    reserve: "https://www.sevenrooms.com/reservations/mott32hk",
    intro:
      "Located inside the Standard Chartered Bank Building, Hong Kong is the original Mott 32 and the reference point for the global restaurant family.",
    copy:
      "A layered dining room, refined Cantonese cooking and Mott 32 signatures define the restaurant where the brand began.",
  },
  singapore: {
    name: "Singapore",
    han: "新加坡",
    region: "Asia",
    address: "Marina Bay Sands",
    image: "/assets/loc-singapore.jpg",
    reserve: "https://www.marinabaysands.com/restaurants/mott32/search.html",
    intro:
      "A dramatic Marina Bay Sands dining room with the same signature cuisine, cocktails and service rituals.",
    copy: "Singapore brings Mott 32's Cantonese, Beijing and Szechuan influences into one of the city's landmark resorts.",
  },
  bangkok: {
    name: "Bangkok",
    han: "曼谷",
    region: "Asia",
    address: "The Standard Bangkok Mahanakhon",
    image: "/assets/loc-bangkok.jpg",
    reserve:
      "https://www.tablecheck.com/en/shops/the-standard-bangkok-mahanakhon-mott32-bangkok/reserve?utm_source=Website&utm_medium=Brandweb",
    intro:
      "Set inside The Standard Bangkok Mahanakhon, this location pairs high-rise views with the brand's Cantonese and regional Chinese signatures.",
    copy: "The Bangkok restaurant carries the full Mott 32 experience into a high-energy dining room above the city.",
  },
  seoul: {
    name: "Seoul",
    han: "首爾",
    region: "Asia",
    address: "Central City",
    image: "/assets/loc-seoul.jpg",
    reserve: "https://www.josunhotel.com/resve/dining/step0.do?searchSysCode=JOSUNHOTEL&diningCode=006",
    intro:
      "Central City hosts a layered Mott 32 interior with private dining, rich materials and the same signature menu approach.",
    copy: "Mott 32 Seoul combines warm interiors, private dining and the restaurant's award-winning food and drinks.",
  },
  cebu: {
    name: "Cebu",
    han: "宿霧",
    region: "Asia",
    address: "Nustar Resort",
    image: "/assets/loc-cebu.jpg",
    reserve: "https://www.opentable.co.uk/r/mott32-cebu-city",
    intro:
      "A resort setting at Nustar Cebu with the familiar Mott 32 focus on dim sum, barbecue, seafood and cocktails.",
    copy: "Cebu adapts the restaurant's global signatures to a destination resort setting.",
  },
  "las-vegas": {
    name: "Las Vegas",
    han: "拉斯維加斯",
    region: "North America",
    address: "The Venetian Resort",
    image: "/assets/loc-vegas.jpg",
    reserve: "https://www.sevenrooms.com/reservations/mott32/brand-website",
    intro:
      "Located at The Venetian Resort, Las Vegas combines destination dining, theatrical interiors and Mott 32 signatures.",
    copy: "A richly detailed room for Peking duck, dim sum, cocktails and group dining on the Las Vegas Strip.",
  },
  vancouver: {
    name: "Vancouver",
    han: "溫哥華",
    region: "North America",
    address: "1161 W Georgia Street",
    image: "/assets/loc-vancouver.jpg",
    reserve: "https://www.opentable.ca/r/mott-32-vancouver-2",
    intro: "The Vancouver restaurant brings the brand's award-winning Chinese cuisine to the centre of the city.",
    copy: "Vancouver combines a polished dining room with the brand's signature approach to Cantonese barbecue and dim sum.",
  },
  toronto: {
    name: "Toronto",
    han: "多倫多",
    region: "North America",
    address: "190 University Avenue",
    image: "/assets/loc-toronto.jpg",
    reserve: "https://app.tablz.com/mott-32",
    intro: "Toronto carries the global Mott 32 menu into a polished bar, lounge and restaurant environment.",
    copy: "A city-centre location with a strong bar presence, refined dining and Mott 32's signature menu.",
  },
  "los-angeles": {
    name: "Los Angeles",
    han: "洛杉磯",
    region: "North America",
    address: "Opening 2026",
    image: "/assets/loc-los-angeles.jpg",
    reserve: "/reserve/",
    intro:
      "Los Angeles is planned as a forthcoming North American location, extending the restaurant family on the West Coast.",
    copy: "Opening details will follow as the new restaurant approaches launch.",
  },
  dubai: {
    name: "Dubai",
    han: "迪拜",
    region: "Middle East",
    address: "73rd Floor, Address Beach Resort",
    image: "/assets/loc-dubai.jpg",
    reserve: "https://www.sevenrooms.com/reservations/mott32dubai/ig",
    intro:
      "Mott 32 Dubai sits high inside Address Beach Resort with terrace dining and the brand's signature food and drinks.",
    copy: "A high-rise dining room and terrace setting for Mott 32 classics, cocktails and skyline views.",
  },
};

Object.assign(locationDetails, {
  bali: {
    name: "Bali",
    han: "峇里島",
    region: "Asia",
    address: "Opening 2027",
    image: "/assets/loc-bali.jpg",
    reserve: "",
    intro: "Bali is planned as a future Mott 32 destination.",
    copy: "Opening details will follow closer to launch.",
  },
  scottsdale: {
    name: "Scottsdale",
    han: "斯科茨代爾",
    region: "North America",
    address: "Opening 2026",
    image: "/assets/loc-scottsdale.jpg",
    reserve: "",
    intro: "Scottsdale is planned as a future North American location.",
    copy: "Opening details will follow closer to launch.",
  },
  riyadh: {
    name: "Riyadh",
    han: "利雅德",
    region: "Middle East",
    address: "Opening 2027",
    image: "/assets/loc-riyadh.jpg",
    reserve: "",
    intro: "Riyadh is planned as a future Middle East location.",
    copy: "Opening details will follow closer to launch.",
  },
  melbourne: {
    name: "Melbourne",
    han: "墨爾本",
    region: "Australia",
    address: "Opening 2026",
    image: "/assets/loc-melbourne.jpg",
    reserve: "",
    intro: "Melbourne is planned as a future Australian location.",
    copy: "Opening details will follow closer to launch.",
  },
});

const locationMeta = {
  "hong-kong": {
    status: "open",
    hours: "Lunch and dinner daily",
    phone: "+852 2885 8688",
    email: "reservations@mott32.com",
    menuNote: "Full signature menu, wine list and cocktail programme.",
    cuisinePdf: "",
    drinksPdf: "https://mott32.com/fileadmin/content/Hong_Kong/Menu_PDFs/MTHK_Menu_Wine_260309.pdf",
  },
  singapore: {
    status: "open",
    hours: "Lunch and dinner daily",
    phone: "+65 6688 9922",
    email: "reservations@mott32.com",
    menuNote: "Marina Bay Sands menus and reservations are handled by the resort.",
  },
  bangkok: {
    status: "open",
    hours: "Dinner daily",
    phone: "+66 2 085 8888",
    email: "reservations@mott32.com",
    menuNote: "Bangkok signatures and high-rise dining.",
  },
  seoul: {
    status: "open",
    hours: "Lunch and dinner daily",
    phone: "+82 2 6282 0320",
    email: "reservations@mott32.com",
    menuNote: "Seoul menu and booking are handled by Josun Hotel.",
  },
  cebu: {
    status: "open",
    hours: "Lunch and dinner daily",
    phone: "+63 32 888 8282",
    email: "reservations@mott32.com",
    menuNote: "Resort dining with signature food and cocktail selections.",
  },
  "las-vegas": {
    status: "open",
    hours: "Dinner daily",
    phone: "+1 702 607 3232",
    email: "reservations@mott32.com",
    menuNote: "Las Vegas reservations are handled through SevenRooms.",
  },
  vancouver: {
    status: "open",
    hours: "Dinner daily",
    phone: "+1 604 979 8886",
    email: "reservations@mott32.com",
    menuNote: "Vancouver reservations are handled through OpenTable.",
  },
  toronto: {
    status: "open",
    hours: "Dinner daily",
    phone: "+1 416 555 0032",
    email: "reservations@mott32.com",
    menuNote: "Toronto reservations are handled through Tablz.",
  },
  dubai: {
    status: "open",
    hours: "Lunch and dinner daily",
    phone: "+971 4 278 4832",
    email: "reservations@mott32.com",
    menuNote: "Dubai offers terrace dining, cocktails and skyline views.",
  },
  "los-angeles": {
    status: "coming-soon",
    opening: "Opening 2026",
    hours: "Coming soon",
    phone: "",
    email: "reservations@mott32.com",
    menuNote: "Menus will be announced closer to opening.",
  },
  bali: {
    status: "coming-soon",
    opening: "Opening 2027",
    hours: "Coming soon",
    phone: "",
    email: "reservations@mott32.com",
    menuNote: "Menus will be announced closer to opening.",
  },
  scottsdale: {
    status: "coming-soon",
    opening: "Opening 2026",
    hours: "Coming soon",
    phone: "",
    email: "reservations@mott32.com",
    menuNote: "Menus will be announced closer to opening.",
  },
  riyadh: {
    status: "coming-soon",
    opening: "Opening 2027",
    hours: "Coming soon",
    phone: "",
    email: "reservations@mott32.com",
    menuNote: "Menus will be announced closer to opening.",
  },
  melbourne: {
    status: "coming-soon",
    opening: "Opening 2026",
    hours: "Coming soon",
    phone: "",
    email: "reservations@mott32.com",
    menuNote: "Menus will be announced closer to opening.",
  },
};

Object.entries(locationMeta).forEach(([slug, meta]) => {
  if (locationDetails[slug]) {
    Object.assign(locationDetails[slug], meta, { slug });
  }
});

const locationOrder = [
  "hong-kong",
  "las-vegas",
  "vancouver",
  "singapore",
  "dubai",
  "toronto",
  "bangkok",
  "seoul",
  "cebu",
  "los-angeles",
  "scottsdale",
  "bali",
  "riyadh",
  "melbourne",
];

const menuAvailability = {
  "Applewood Roasted Peking Duck": ["hong-kong", "las-vegas", "vancouver", "singapore", "dubai", "bangkok", "seoul"],
  "Crispy Sugar Coated Peking Duck Bun": ["hong-kong", "las-vegas", "vancouver", "dubai", "cebu"],
  "Signature Iberico Pluma Char Siu": ["hong-kong", "vancouver", "singapore", "dubai", "toronto", "bangkok"],
  "Prawn & Crab Claw Dumpling": ["hong-kong", "las-vegas", "singapore", "dubai", "cebu", "seoul"],
  "Prawn and Crab Claw Dumpling": ["hong-kong", "las-vegas", "singapore", "dubai", "cebu", "seoul"],
  "Matsutake Mushroom": ["hong-kong", "singapore", "dubai", "seoul"],
  "Soft Quail Egg, Iberico Pork, Black Truffle Siu Mai": ["hong-kong", "las-vegas", "vancouver", "singapore", "dubai"],
  Hanami: ["hong-kong", "las-vegas", "vancouver", "singapore", "dubai", "bangkok"],
  "Forbidden Rose": ["hong-kong", "las-vegas", "vancouver", "singapore", "dubai", "toronto"],
  "Hong Kong Iced Tea": ["hong-kong", "vancouver", "singapore", "dubai", "cebu"],
  "Old Harbour": ["hong-kong", "las-vegas", "dubai", "bangkok", "seoul"],
  "Anna Wong": ["hong-kong", "vancouver", "singapore", "toronto"],
  "Group Restaurant Champion Wine by the Glass": ["hong-kong", "las-vegas", "vancouver", "singapore", "dubai"],
  "Sake Selection": ["hong-kong", "las-vegas", "singapore", "seoul"],
  "Joe's Elixir": ["hong-kong", "las-vegas", "dubai", "toronto"],
};

const vipVariants = [
  {
    id: "global",
    image: "/assets/vip.jpg",
    eyebrow: "Become",
    title: "A Global VIP",
    copy: "Receive exclusive invitations to events and tastings before everyone else.",
    fieldLabel: "Email",
    cta: "Sign up",
  },
  {
    id: "tastings",
    image: "/assets/cuisine-hero-platter.jpg",
    eyebrow: "Private tastings",
    title: "First access to seasonal menus",
    copy: "Be notified about chef tastings, wine dinners and limited menus across the Mott 32 family.",
    fieldLabel: "Email",
    cta: "Join the list",
  },
  {
    id: "events",
    image: "/assets/drinks-hero-forbidden.jpg",
    eyebrow: "Cocktails & events",
    title: "Invitations before release",
    copy: "Join the Global VIP list for cocktail previews, openings and special event announcements.",
    fieldLabel: "Email",
    cta: "Become VIP",
  },
];

let activePanel = 0;
let heroTimer = 0;
let lastActiveElement = null;
let cookieLastActiveElement = null;
let vipLastActiveElement = null;
let activeLightboxIndex = -1;
let activeLightboxZoomed = false;

const footerLinks = [
  { href: "/locations/", label: "All Locations" },
  { href: "/sustainability/", label: "Sustainability" },
  { href: "/careers/", label: "Careers" },
  { href: "/founders/", label: "Founders" },
  { href: "/our-cuisine/", label: "Our Food" },
  { href: "/our-drinks/", label: "Our Drinks" },
  { href: "/awards-media/", label: "Awards & Media" },
  { href: "/privacy-policy/", label: "Privacy policy" },
  { href: "mailto:reservations@mott32.com", label: "reservations@mott32.com" },
];

const socialLinks = [
  { href: "https://www.facebook.com/MaximalConcepts/", label: "Facebook" },
  { href: "https://www.instagram.com/maximalconcepts/?hl=en", label: "Instagram" },
  { href: "https://xhslink.com/m/ADL46x0Ge5F", label: "Xiaohongshu" },
];

const drawerLinks = [
  { href: "/", label: "Home" },
  { href: "/our-cuisine/", label: "Our Cuisine" },
  { href: "/our-drinks/", label: "Our Drinks" },
  { href: "/locations/", label: "Locations" },
  { href: "/reserve/", label: "Reserve" },
  { href: "/awards-media/", label: "Awards & Media" },
  { href: "/founders/", label: "Founders" },
  { href: "/sustainability/", label: "Sustainability" },
  { href: "/careers/", label: "Careers" },
];

function getCurrentPath() {
  if (window.location.pathname === "/") {
    return "/";
  }

  return window.location.pathname.endsWith("/") ? window.location.pathname : `${window.location.pathname}/`;
}

function createLink(link) {
  return `<a href="${link.href}">${link.label}</a>`;
}

function hydrateGlobalNavigation() {
  const footer = document.querySelector(".footer");
  const footerNav = document.querySelector(".footer nav");
  const drawerNav = drawer?.querySelector("nav");
  const currentPath = getCurrentPath();

  if (footer && !footer.querySelector(".footer-social")) {
    footer.querySelector("img")?.insertAdjacentHTML(
      "afterend",
      `<div class="footer-social"><p>Social</p>${socialLinks
        .map((link) => `<a href="${link.href}" target="_blank" rel="noopener">${link.label}</a>`)
        .join("")}</div>`,
    );
  }

  if (footerNav) {
    footerNav.innerHTML = `${footerLinks.map(createLink).join("")}<button class="footer-link-button" type="button" data-vip-open>Global VIP</button><button class="footer-link-button" type="button" data-cookie-settings>Cookie settings</button>`;
  }

  if (drawerNav) {
    drawerNav.innerHTML = drawerLinks.map(createLink).join("");
  }

  document.querySelectorAll(".footer nav a, .drawer nav a").forEach((link) => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
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
  return locationDetails[slug] || locationDetails["hong-kong"];
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

  return allowAll ? fallback : fallback === "all" ? "hong-kong" : fallback;
}

function getReservableLocations() {
  return getLocations({ includeComingSoon: false }).filter((location) => Boolean(location.reserve));
}

function getLocationStatusLabel(location) {
  if (location.status === "open") {
    return "Reserve";
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
    document.dispatchEvent(new CustomEvent("mott32:cookies-saved"));
  });

  panel.querySelector("[data-cookie-reject]")?.addEventListener("click", () => {
    saveCookieChoice({ necessary: true, analytics: false, marketing: false });
    removeCookiePanel();
    document.dispatchEvent(new CustomEvent("mott32:cookies-saved"));
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
      <p>Choose which optional cookies Mott 32 can use on this recreation.</p>
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
    document.dispatchEvent(new CustomEvent("mott32:cookies-saved"));
  });

  cookieModal.querySelector("[data-cookie-accept-all]")?.addEventListener("click", () => {
    saveCookieChoice({ necessary: true, analytics: true, marketing: true });
    removeCookiePanel();
    closeCookieModal();
    document.dispatchEvent(new CustomEvent("mott32:cookies-saved"));
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
        <img data-vip-image src="/assets/vip.jpg" alt="Traditional banquet dish" />
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
    image.src = variant.image;
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
  createVipModal();
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
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    return (
      (!savedAt || Date.now() - savedAt > sevenDays) &&
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

  window.setTimeout(maybeOpen, 4200);
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > window.innerHeight * 0.38) {
        maybeOpen();
      }
    },
    { passive: true, once: true },
  );

  document.addEventListener("mott32:cookies-saved", () => {
    if (!window.sessionStorage.getItem(vipStorageKey)) {
      window.setTimeout(maybeOpen, 1200);
    }
  });
}

function createReserveCard(location, compact = false) {
  const statusLabel = getLocationStatusLabel(location);
  const isOpen = location.status === "open" && location.reserve;
  const action = isOpen
    ? `<a class="cut-button reserve-link" href="${location.reserve}" target="_blank" rel="noopener">Reserve</a>`
    : `<span class="reserve-status">${statusLabel}</span>`;

  return `
    <article class="reserve-card${compact ? " compact" : ""}" data-location="${location.slug}" data-region="${location.region}" data-status="${location.status}">
      <img src="${location.image}" alt="Mott 32 ${location.name}" />
      <div>
        <p class="eyebrow">${location.region}</p>
        <h3>${location.name} <span>${location.han}</span></h3>
        <p>${location.address}</p>
        <dl>
          <div><dt>Status</dt><dd>${statusLabel}</dd></div>
          <div><dt>Hours</dt><dd>${location.hours}</dd></div>
        </dl>
        ${action}
      </div>
    </article>
  `;
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
  reserveModal.setAttribute("aria-label", "Choose a Mott 32 reservation");
  reserveModal.innerHTML = `
    <div class="reserve-modal-panel">
      <button class="reserve-close" type="button" data-reserve-close aria-label="Close reservations">×</button>
      <div class="section-heading compact-heading">
        <span class="crane-mark" aria-hidden="true"></span>
        <p class="eyebrow">Choose your Mott 32</p>
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
      <a class="reserve-full-link" href="/reserve/">View all reservations</a>
    </div>
  `;

  document.body.append(reserveModal);

  const select = reserveModal.querySelector("[data-reserve-select]");
  const detail = reserveModal.querySelector("[data-reserve-detail]");
  const render = () => {
    const location = getLocationBySlug(select.value);
    savePreferredLocation(location.slug);
    detail.innerHTML = createReserveCard(location, true);
    reserveModal.querySelector(".reserve-full-link").href = `/reserve/?city=${location.slug}`;
  };

  const preferred = getPreferredLocationSlug({ allowAll: false, openOnly: false, fallback: "hong-kong" });
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
    const link = event.target.closest('a[href="/reserve/"], a[href="/reserve"]');

    if (!link || link.classList.contains("reserve-full-link")) {
      return;
    }

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
    const slug = normaliseLocationName(heading);
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
      <h2>Find Mott 32 by region</h2>
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

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.append(element);
  }

  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

function applySeoEnhancements() {
  const path = getCurrentPath();
  const pageData = {
    "/": {
      title: "Mott 32 | Award-winning Chinese Restaurant",
      description:
        "World-class Chinese restaurants with signature cuisine, cocktails, wine, design-led dining rooms and global locations.",
      image: "/assets/loc-dubai.jpg",
    },
    "/our-cuisine/": {
      title: "Our Cuisine | Mott 32",
      description:
        "Authentic Asian cuisine, dim sum, barbecue, seafood and the signature applewood roasted Peking duck.",
      image: "/assets/cuisine-hero-duck.jpg",
    },
    "/our-drinks/": {
      title: "Our Drinks | Mott 32",
      description: "Innovative cocktails, sake selection and an award-winning wine list at Mott 32.",
      image: "/assets/drinks-hero-forbidden.jpg",
    },
    "/locations/": {
      title: "All Locations | Mott 32",
      description: "Find Mott 32 restaurants, reservation links, opening-soon locations and regional details.",
      image: "/assets/loc-hk.jpg",
    },
    "/reserve/": {
      title: "Reserve | Mott 32",
      description: "Choose your Mott 32 restaurant and reserve directly with each location.",
      image: "/assets/reserve-bg.jpg",
    },
  };
  let selected = pageData[path] || pageData["/"];

  if (locationDetailPage) {
    const requestedCity = new URLSearchParams(window.location.search).get("city") || "hong-kong";
    const location = getLocationBySlug(requestedCity);
    selected = {
      title: `${location.name} | Mott 32`,
      description: `${location.intro} ${location.address}. ${getLocationStatusLabel(location)}.`,
      image: location.image,
    };
  }
  const imageUrl = new URL(selected.image, window.location.origin).href;
  const canonicalUrl = new URL(path, window.location.origin);

  if (locationDetailPage) {
    const requestedCity = new URLSearchParams(window.location.search).get("city") || "hong-kong";
    canonicalUrl.searchParams.set("city", getLocationBySlug(requestedCity).slug);
  }

  const canonical = canonicalUrl.href;

  document.title = document.title || selected.title;
  upsertMeta('meta[name="description"]', { name: "description", content: selected.description });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: selected.title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: selected.description });
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });

  if (!document.head.querySelector('link[rel="canonical"]')) {
    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = canonical;
    document.head.append(link);
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: selected.title,
    description: selected.description,
    url: canonical,
    primaryImageOfPage: imageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Mott 32",
      url: window.location.origin,
    },
  };

  if (path === "/locations/" || path === "/reserve/") {
    schema.mainEntity = {
      "@type": "ItemList",
      itemListElement: getLocations().map((location, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Restaurant",
          name: `Mott 32 ${location.name}`,
          image: new URL(location.image, window.location.origin).href,
          address: location.address,
          servesCuisine: "Chinese",
          url: new URL(`/location/?city=${location.slug}`, window.location.origin).href,
        },
      })),
    };
  }

  if (locationDetailPage) {
    const requestedCity = new URLSearchParams(window.location.search).get("city") || "hong-kong";
    const location = getLocationBySlug(requestedCity);
    schema["@type"] = "Restaurant";
    schema.name = `Mott 32 ${location.name}`;
    schema.image = new URL(location.image, window.location.origin).href;
    schema.address = location.address;
    schema.telephone = location.phone || undefined;
    schema.servesCuisine = "Chinese";
  }

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.append(script);
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
  const requestedCity = new URLSearchParams(window.location.search).get("city") || "hong-kong";
  const location = locationDetails[requestedCity] || locationDetails["hong-kong"];
  const heroImage = document.querySelector("[data-location-hero]");
  const detailImage = document.querySelector("[data-location-image]");
  const reserveLink = document.querySelector("[data-location-reserve]");

  savePreferredLocation(location.slug);

  document.title = `${location.name} | Mott 32`;
  document.querySelector("[data-location-name]").textContent = location.name;
  document.querySelector("[data-location-han]").textContent = location.han;
  document.querySelector("[data-location-region]").textContent = location.region;
  document.querySelector("[data-location-address]").textContent = location.address;
  document.querySelector("[data-location-intro]").textContent = location.intro;
  document.querySelector("[data-location-copy]").textContent = location.copy;

  [heroImage, detailImage].forEach((image) => {
    if (!image) {
      return;
    }

    image.src = location.image;
    image.alt = `Mott 32 ${location.name} interior`;
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

    if (location.reserve.startsWith("http")) {
      reserveLink.target = "_blank";
      reserveLink.rel = "noopener";
    } else {
      reserveLink.removeAttribute("target");
      reserveLink.removeAttribute("rel");
    }
  }

  document.querySelectorAll(".location-menu-links a").forEach((link) => {
    const url = new URL(link.href, window.location.origin);
    if (url.pathname === "/our-cuisine/" || url.pathname === "/our-drinks/") {
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
  return panel.dataset.slideLabel || panel.querySelector("img")?.alt?.replace(/^Mott 32\s*/i, "") || `Slide ${index + 1}`;
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
  if (panels.length < 2) {
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

hydrateGlobalNavigation();
ensureSkipLink();
applySeoEnhancements();
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

document.addEventListener("submit", (event) => {
  if (!event.target.matches(".signup-form")) {
    return;
  }

  event.preventDefault();
  event.target.querySelector("button").textContent = "Thank you";
});

if (locationRail) {
  const locationCards = Array.from(locationRail.querySelectorAll(".location-card"));
  const locationDots = document.querySelector("[data-location-dots]");
  const locationsSection = locationRail.closest(".locations");
  const dotButtons = [];
  let activeLocationIndex = Math.max(
    0,
    locationCards.findIndex((card) => card.classList.contains("is-featured")),
  );
  let locationScrollAnimation = 0;
  let locationScrollIdleTimer = 0;

  const locationScrollEase = (progress) => 1 - Math.pow(1 - progress, 2);

  const scrollLocationRailTo = (left, behavior = "smooth") => {
    const targetLeft = Math.max(0, Math.min(left, locationRail.scrollWidth - locationRail.clientWidth));

    window.cancelAnimationFrame(locationScrollAnimation);

    if (behavior === "auto" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      locationRail.classList.remove("is-programmatic");
      locationRail.scrollLeft = targetLeft;
      locationScrollAnimation = 0;
      return;
    }

    const startLeft = locationRail.scrollLeft;
    const distance = targetLeft - startLeft;
    const duration = Math.min(1180, Math.max(820, Math.abs(distance) * 0.46));
    let startTime = 0;
    locationRail.classList.add("is-programmatic");

    const animate = (time) => {
      if (!startTime) {
        startTime = time;
      }

      const progress = Math.min(1, (time - startTime) / duration);
      locationRail.scrollLeft = startLeft + distance * locationScrollEase(progress);

      if (progress < 1) {
        locationScrollAnimation = window.requestAnimationFrame(animate);
      } else {
        locationRail.scrollLeft = targetLeft;
        locationRail.classList.remove("is-programmatic");
        locationScrollAnimation = 0;
      }
    };

    locationScrollAnimation = window.requestAnimationFrame(animate);
  };

  const centerLocationCard = (card, behavior = "smooth") => {
    if (!card) {
      return;
    }

    const left = card.offsetLeft + card.offsetWidth / 2 - locationRail.clientWidth / 2;
    scrollLocationRailTo(left, behavior);
  };

  const setActiveLocationCard = (index, options = {}) => {
    const nextIndex = Math.max(0, Math.min(index, locationCards.length - 1));
    activeLocationIndex = nextIndex;

    locationCards.forEach((card, cardIndex) => {
      const isActive = cardIndex === nextIndex;
      card.classList.toggle("is-featured", isActive);
      card.classList.toggle("is-active", isActive);

      if (isActive) {
        card.setAttribute("aria-current", "true");
      } else {
        card.removeAttribute("aria-current");
      }
    });

    dotButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === nextIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });

    if (options.center) {
      window.requestAnimationFrame(() => {
        centerLocationCard(locationCards[nextIndex], options.behavior || "smooth");
      });
    }
  };

  const updateActiveLocationFromScroll = () => {
    const viewportCenter = locationRail.scrollLeft + locationRail.clientWidth / 2;
    const nearestIndex = locationCards.reduce((nearest, card, cardIndex) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      return distance < nearest.distance ? { index: cardIndex, distance } : nearest;
    }, { index: activeLocationIndex, distance: Number.POSITIVE_INFINITY }).index;

    if (nearestIndex !== activeLocationIndex) {
      setActiveLocationCard(nearestIndex);
    }
  };

  locationCards.forEach((card, cardIndex) => {
    const title = card.querySelector("h3")?.textContent?.trim() || `location ${cardIndex + 1}`;

    if (locationDots) {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `Show ${title}`);
      button.addEventListener("click", () => setActiveLocationCard(cardIndex, { center: true }));
      locationDots.append(button);
      dotButtons.push(button);
    }

    card.addEventListener("focus", () => setActiveLocationCard(cardIndex, { center: true }), true);
  });

  locationRail.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(locationScrollIdleTimer);

      if (!locationScrollAnimation) {
        locationScrollIdleTimer = window.setTimeout(() => {
          window.requestAnimationFrame(updateActiveLocationFromScroll);
        }, 90);
      }
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(() => {
      centerLocationCard(locationCards[activeLocationIndex], "auto");
    });
  });

  if (locationDots && locationsSection) {
    const setLocationCarouselVisible = (isVisible) => {
      locationsSection.classList.toggle("is-carousel-visible", isVisible);
      document.body.classList.toggle("location-carousel-active", isVisible);
    };

    if ("IntersectionObserver" in window) {
      const locationObserver = new IntersectionObserver(
        ([entry]) => {
          setLocationCarouselVisible(entry.isIntersecting && entry.intersectionRatio > 0.32);
        },
        { threshold: [0, 0.32, 0.62] },
      );

      locationObserver.observe(locationsSection);
    } else {
      setLocationCarouselVisible(true);
    }
  }

  setActiveLocationCard(activeLocationIndex, { center: true, behavior: "auto" });
}

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

  if (!rail) {
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
  let startScroll = 0;
  let dragging = false;
  let railTimer = 0;

  const stopRail = () => window.clearInterval(railTimer);
  const startRail = () => {
    stopRail();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

  rail.addEventListener("pointerdown", (event) => {
    dragging = true;
    startX = event.clientX;
    startScroll = rail.scrollLeft;
    rail.classList.add("is-dragging");
    rail.setPointerCapture?.(event.pointerId);
    stopRail();
  });

  rail.addEventListener("pointermove", (event) => {
    if (!dragging) {
      return;
    }

    rail.scrollLeft = startScroll - (event.clientX - startX);
  });

  rail.addEventListener("pointerup", (event) => {
    dragging = false;
    rail.classList.remove("is-dragging");
    rail.releasePointerCapture?.(event.pointerId);
    startRail();
  });

  rail.addEventListener("pointercancel", () => {
    dragging = false;
    rail.classList.remove("is-dragging");
    startRail();
  });

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
  section.addEventListener("focusout", startRail);
  startRail();
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
        ".food-card",
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
      const winePdf = selected?.drinksPdf || locationDetails["hong-kong"].drinksPdf;
      links.innerHTML = isDrinkPage
        ? `<a class="cut-button small-button" href="${winePdf}" target="_blank" rel="noopener">Wine List</a>`
        : `<a class="cut-button small-button" href="/reserve/">Reserve selected location</a>`;
    }
  }

  function renderAvailabilityBadge(card, locations) {
    let badge = card.querySelector(".menu-availability");
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
      renderAvailabilityBadge(card, locations);
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
