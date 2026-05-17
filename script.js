const panels = Array.from(document.querySelectorAll(".hero-panel"));
const dots = Array.from(document.querySelectorAll(".hero-dots button"));
const previous = document.querySelector(".side-arrow-left");
const next = document.querySelector(".side-arrow-right");
const drawer = document.querySelector(".drawer");
const navToggle = document.querySelector(".nav-toggle");
const drawerClose = document.querySelector(".drawer-close");
const locationRail = document.querySelector("[data-carousel]");
const lightbox = document.querySelector("[data-lightbox]");
const locationDetailPage = document.querySelector("[data-location-detail-page]");
const cookieStorageKey = "mott32CookieChoice";
let cookieModal = null;

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

let activePanel = 0;
let heroTimer = 0;
let lastActiveElement = null;
let cookieLastActiveElement = null;

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
  const footerNav = document.querySelector(".footer nav");
  const drawerNav = drawer?.querySelector("nav");
  const currentPath = getCurrentPath();

  if (footerNav) {
    footerNav.innerHTML = `${footerLinks.map(createLink).join("")}<button class="footer-link-button" type="button" data-cookie-settings>Cookie settings</button>`;
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

function updateBodyLock() {
  document.body.classList.toggle(
    "modal-open",
    Boolean(
      drawer?.classList.contains("is-open") ||
        lightbox?.classList.contains("is-open") ||
        cookieModal?.classList.contains("is-open"),
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
  });

  panel.querySelector("[data-cookie-reject]")?.addEventListener("click", () => {
    saveCookieChoice({ necessary: true, analytics: false, marketing: false });
    removeCookiePanel();
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
  });

  cookieModal.querySelector("[data-cookie-accept-all]")?.addEventListener("click", () => {
    saveCookieChoice({ necessary: true, analytics: true, marketing: true });
    removeCookiePanel();
    closeCookieModal();
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

if (locationDetailPage) {
  const requestedCity = new URLSearchParams(window.location.search).get("city") || "hong-kong";
  const location = locationDetails[requestedCity] || locationDetails["hong-kong"];
  const heroImage = document.querySelector("[data-location-hero]");
  const detailImage = document.querySelector("[data-location-image]");
  const reserveLink = document.querySelector("[data-location-reserve]");

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
    reserveLink.href = location.reserve;

    if (location.reserve.startsWith("http")) {
      reserveLink.target = "_blank";
      reserveLink.rel = "noopener";
    } else {
      reserveLink.removeAttribute("target");
      reserveLink.removeAttribute("rel");
    }
  }
}

function setPanel(index) {
  if (!panels.length) {
    return;
  }

  activePanel = (index + panels.length) % panels.length;
  panels.forEach((panel, panelIndex) => panel.classList.toggle("is-active", panelIndex === activePanel));
  dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === activePanel));
}

function restartHero() {
  if (panels.length < 2) {
    return;
  }

  clearInterval(heroTimer);
  heroTimer = setInterval(() => setPanel(activePanel + 1), 5000);
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

  drawer.classList.toggle("is-open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  navToggle.setAttribute("aria-expanded", String(open));
  updateBodyLock();
}

hydrateGlobalNavigation();
ensureCookieControls();

navToggle?.addEventListener("click", () => setDrawer(true));
drawerClose?.addEventListener("click", () => setDrawer(false));
drawer?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setDrawer(false)));

document.querySelector(".signup-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.querySelector("button").textContent = "Thank you";
});

if (locationRail) {
  locationRail.scrollLeft = Math.max(0, locationRail.scrollWidth * 0.12);
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

document.querySelectorAll("[data-menu-browser]").forEach((browser) => {
  const filters = Array.from(browser.querySelectorAll("[data-filter]"));
  const cards = Array.from(browser.querySelectorAll(".menu-card"));

  filters.forEach((filterButton) => {
    filterButton.setAttribute("aria-selected", filterButton.classList.contains("is-active") ? "true" : "false");

    filterButton.addEventListener("click", () => {
      const filter = filterButton.dataset.filter;

      filters.forEach((button) => {
        const active = button === filterButton;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
      });

      cards.forEach((card) => {
        const categories = (card.dataset.category || "").split(/\s+/);
        card.hidden = filter !== "all" && !categories.includes(filter);
      });
    });
  });
});

function setLightbox(open) {
  if (!lightbox) {
    return;
  }

  lightbox.classList.toggle("is-open", open);
  lightbox.setAttribute("aria-hidden", String(!open));
  updateBodyLock();

  if (!open && lastActiveElement) {
    lastActiveElement.focus();
    lastActiveElement = null;
  }
}

document.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!lightbox) {
      return;
    }

    lastActiveElement = trigger;
    const image = lightbox.querySelector("[data-lightbox-image]");
    const title = lightbox.querySelector("[data-lightbox-title]");
    const copy = lightbox.querySelector("[data-lightbox-copy]");
    const kicker = lightbox.querySelector("[data-lightbox-kicker]");
    const label = trigger.querySelector("span")?.textContent?.trim() || "Menu";

    image.src = trigger.dataset.lightboxImage;
    image.alt = trigger.dataset.lightboxTitle || "";
    title.textContent = trigger.dataset.lightboxTitle || "";
    copy.textContent = trigger.dataset.lightboxCopy || "";
    kicker.textContent = label;
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
  if (event.key !== "Escape") {
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
