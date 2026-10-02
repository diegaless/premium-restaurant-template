export function attachNewsletterForms(document, config) {
  const settings = config.newsletter || {};
  document.querySelectorAll(".signup-form").forEach((form, index) => {
    if (form.dataset.newsletterReady) return;
    form.dataset.newsletterReady = "true";
    const email = form.querySelector('input[type="email"]'),
      button = form.querySelector('button[type="submit"]');
    if (!email || !button) return;
    email.name = "email";
    email.required = true;
    email.maxLength = 254;
    const consent = document.createElement("label");
    consent.className = "newsletter-consent";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "consent";
    checkbox.required = true;
    const copy = document.createElement("span");
    copy.textContent =
      settings.consentLabel ||
      "I agree to receive news and invitations by email.";
    const privacy = document.createElement("a");
    privacy.href = "/privacy-policy/";
    privacy.textContent = settings.privacyLabel || "Privacy policy";
    copy.append(" ", privacy);
    consent.append(checkbox, copy);
    const trap = document.createElement("input");
    trap.name = "website";
    trap.type = "text";
    trap.hidden = true;
    trap.tabIndex = -1;
    trap.autocomplete = "off";
    trap.className = "newsletter-honeypot";
    trap.setAttribute("aria-hidden", "true");
    const status = document.createElement("p");
    status.className = "newsletter-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.id = `newsletter-status-${index}`;
    form.append(consent, trap, status);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (form.dataset.pending || !form.reportValidity()) return;
      if (!settings.endpoint) {
        status.textContent =
          settings.unavailableMessage || "Registration is unavailable.";
        return;
      }
      form.dataset.pending = "true";
      button.disabled = true;
      status.textContent = settings.pendingMessage || "Saving…";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(settings.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.value.trim(),
            consent: checkbox.checked,
            site: config.brand.slug,
            website: trap.value,
          }),
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok || result.ok !== true)
          throw new Error("Subscription was not accepted");
        status.textContent =
          settings.successMessage || "You are on the list. Thank you!";
        form.reset();
      } catch {
        status.textContent =
          settings.errorMessage ||
          "We could not save your email. Please try again.";
      } finally {
        clearTimeout(timeout);
        delete form.dataset.pending;
        button.disabled = false;
      }
    });
  });
}
