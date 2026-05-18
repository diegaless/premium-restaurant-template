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
let cookieModal = null;
let vipModal = null;

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
let vipLastActiveElement = null;
let activeLightboxIndex = -1;

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
        cookieModal?.classList.contains("is-open") ||
        vipModal?.classList.contains("is-open"),
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
        <img src="/assets/vip.jpg" alt="Traditional banquet dish" />
      </figure>
      <div class="vip-modal-copy">
        <p class="eyebrow">Become</p>
        <h2>A Global VIP</h2>
        <p>Receive exclusive invitations to events and tastings before everyone else.</p>
        <form class="signup-form vip-modal-form">
          <label for="vip-email">Email</label>
          <div>
            <input id="vip-email" type="email" placeholder="you@example.com" autocomplete="email" required />
            <button type="submit">Sign up</button>
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

function openVipModal() {
  createVipModal();
  vipLastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  vipModal.classList.add("is-open");
  vipModal.setAttribute("aria-hidden", "false");
  updateBodyLock();
  vipModal.querySelector("[data-vip-close]")?.focus();

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

  vipModal.classList.remove("is-open");
  vipModal.setAttribute("aria-hidden", "true");
  updateBodyLock();

  if (vipLastActiveElement) {
    vipLastActiveElement.focus();
    vipLastActiveElement = null;
  }
}

function ensureVipControls() {
  createVipModal();
  document.querySelectorAll("[data-vip-open]").forEach((button) => {
    button.addEventListener("click", openVipModal);
  });

  window.setTimeout(() => {
    try {
      if (window.sessionStorage.getItem(vipStorageKey)) {
        return;
      }
    } catch {
      return;
    }

    if (!drawer?.classList.contains("is-open") && !lightbox?.classList.contains("is-open") && !cookieModal?.classList.contains("is-open")) {
      openVipModal();
    }
  }, 3600);
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
createHeroLabels();
ensureCookieControls();
ensureVipControls();
ensureScrollTop();

navToggle?.addEventListener("click", () => setDrawer(true));
drawerClose?.addEventListener("click", () => setDrawer(false));
drawer?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setDrawer(false)));

document.addEventListener("submit", (event) => {
  if (!event.target.matches(".signup-form")) {
    return;
  }

  event.preventDefault();
  event.target.querySelector("button").textContent = "Thank you";
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
        ".location-card",
        ".food-card",
        ".photo-link",
        ".award-box",
        ".award-tile",
        ".vip-copy",
        ".vip-signup figure",
        ".signature-block",
        ".menu-card",
        ".sample-panel",
        ".private-dining > *",
        ".wine-panel > div",
        ".reservation-panel > div",
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

  if (!open && lastActiveElement) {
    lastActiveElement.focus();
    lastActiveElement = null;
  }
}

const lightboxTriggers = Array.from(document.querySelectorAll("[data-lightbox-trigger]"));

function renderLightbox(trigger) {
  if (!lightbox || !trigger) {
    return;
  }

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
}

function showLightboxAt(index) {
  if (!lightboxTriggers.length) {
    return;
  }

  activeLightboxIndex = (index + lightboxTriggers.length) % lightboxTriggers.length;
  renderLightbox(lightboxTriggers[activeLightboxIndex]);
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
  `;
  lightbox.querySelector(".lightbox-panel")?.append(controls);

  controls.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => showLightboxAt(activeLightboxIndex - 1));
  controls.querySelector("[data-lightbox-next]")?.addEventListener("click", () => showLightboxAt(activeLightboxIndex + 1));
}

ensureLightboxControls();

lightboxTriggers.forEach((trigger, index) => {
  trigger.addEventListener("click", () => {
    if (!lightbox) {
      return;
    }

    lastActiveElement = trigger;
    activeLightboxIndex = index;
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
