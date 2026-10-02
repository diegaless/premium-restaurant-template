import Swiper from "swiper";
import { A11y, Autoplay, Navigation, Keyboard } from "swiper/modules";
import "swiper/css";

// Match the reference's centered, looping rails without cloning links or photos.
export function initHomeCarousels(document) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mount = (element, options) => {
    const focusTarget =
      element.closest(".location-carousel-frame, .food-strip") || element;
    const swiper = new Swiper(element, {
      modules: [A11y, Autoplay, Navigation, Keyboard],
      speed: motion.matches ? 0 : 300,
      centeredSlides: true,
      initialSlide: 1,
      watchOverflow: true,
      lazyPreloadPrevNext: 2,
      keyboard: { enabled: true, onlyInViewport: true },
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      ...options,
    });
    let visible = false;
    const updateMotion = () => {
      swiper.params.speed = motion.matches ? 0 : 300;
      if (
        motion.matches ||
        !visible ||
        document.hidden ||
        focusTarget.contains(document.activeElement)
      )
        swiper.autoplay.stop();
      else if (swiper.slides.length > 1) swiper.autoplay.start();
    };
    swiper.autoplay.stop();
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        updateMotion();
      },
      { threshold: 0.2 },
    ).observe(element);
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateMotion);
    focusTarget.addEventListener("focusin", updateMotion);
    focusTarget.addEventListener("focusout", () =>
      requestAnimationFrame(updateMotion),
    );
    return swiper;
  };

  const locations = document.querySelector("[data-carousel]");
  if (locations) {
    const frame = locations.closest(".location-carousel-frame");
    const cards = [...locations.querySelectorAll(".location-card")];
    const dots = frame.querySelector("[data-location-dots]");
    const buttons = cards.map((card, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute(
        "aria-label",
        `Show ${card.querySelector("h3").textContent}`,
      );
      button.addEventListener("click", () =>
        swiper.params.loop ? swiper.slideToLoop(index) : swiper.slideTo(index),
      );
      dots.append(button);
      return button;
    });
    const activate = (swiper) => {
      cards.forEach((card, index) => {
        const active = index === swiper.realIndex;
        card.classList.toggle("is-featured", active);
        if (active) card.setAttribute("aria-current", "true");
        else card.removeAttribute("aria-current");
        buttons[index].classList.toggle("is-active", active);
        buttons[index].setAttribute("aria-current", String(active));
      });
    };
    const swiper = mount(locations, {
      initialSlide: Math.min(1, cards.length - 1),
      loop: cards.length >= 6,
      slidesPerView: cards.length === 1 ? 1 : 1.5,
      spaceBetween: 40,
      navigation: {
        prevEl: frame.querySelector("[data-location-prev]"),
        nextEl: frame.querySelector("[data-location-next]"),
      },
      breakpoints:
        cards.length === 1
          ? {}
          : {
              480: { slidesPerView: 2, spaceBetween: 40 },
              992: { slidesPerView: 3.5, spaceBetween: 40 },
              1200: { slidesPerView: 3.75, spaceBetween: 40 },
              1400: { slidesPerView: 4, spaceBetween: 60 },
              1700: { slidesPerView: 4, spaceBetween: 80 },
            },
      on: { init: activate, realIndexChange: activate },
    });
    cards.forEach((card, index) =>
      card.addEventListener("focus", () => {
        if (swiper.realIndex !== index)
          swiper.params.loop
            ? swiper.slideToLoop(index)
            : swiper.slideTo(index);
      }),
    );
    frame.classList.toggle("is-single", cards.length === 1);
  }

  const food = document.querySelector(".food-rail");
  if (food) {
    const section = food.closest(".food-strip");
    const count = food.querySelectorAll(".food-card").length;
    const previous = section.querySelector("[data-rail-prev]");
    const next = section.querySelector("[data-rail-next]");
    const syncControls = (swiper) => {
      previous.disabled =
        swiper.isLocked || (!swiper.params.loop && swiper.isBeginning);
      next.disabled = swiper.isLocked || (!swiper.params.loop && swiper.isEnd);
    };
    const swiper = mount(food, {
      loop: count >= 6,
      slidesPerView: 1.2,
      spaceBetween: 20,
      keyboard: { enabled: false },
      breakpoints: { 768: { slidesPerView: "auto", spaceBetween: 30 } },
      on: {
        init: syncControls,
        slideChange: syncControls,
        lock: syncControls,
        unlock: syncControls,
      },
    });
    let keyboardFocusIndex = null;
    swiper.on("slideChangeTransitionEnd", () => {
      if (swiper.realIndex !== keyboardFocusIndex) return;
      keyboardFocusIndex = null;
      requestAnimationFrame(() => {
        // Moving a slide to the other end of a loop can blur its button.
        // Keep keyboard navigation on the newly centered photograph.
        if (
          document.activeElement === document.body ||
          food.contains(document.activeElement)
        )
          food
            .querySelector(".swiper-slide-active .food-image-trigger")
            ?.focus({ preventScroll: true });
      });
    });
    const move = (direction, fromKeyboard = false) => {
      if (swiper.animating || swiper.isLocked) return;
      // Looping rails can reorder the snap grid. Target the photo's stable
      // index so going backwards cannot jump to a different group of photos.
      const index = swiper.realIndex + direction;
      const target = swiper.params.loop
        ? (index + count) % count
        : Math.max(0, Math.min(index, count - 1));
      if (target === swiper.realIndex) return;
      if (fromKeyboard && food.contains(document.activeElement))
        keyboardFocusIndex = target;
      if (swiper.params.loop) swiper.slideToLoop(target);
      else swiper.slideTo(target);
    };
    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    section.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1, true);
    });
  }
}
