(function () {
  "use strict";

  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("nav-hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-link");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");
  const revealEls = document.querySelectorAll(
    ".reveal-up, .reveal-left, .reveal-right",
  );

  function syncNavbar() {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 24);
  }

  function openMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
    mobileMenu.classList.add("open");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.classList.contains("open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  mobileLinks.forEach((link) => link.addEventListener("click", closeMenu));

  window.addEventListener("scroll", syncNavbar, { passive: true });
  syncNavbar();

  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const targetId = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${targetId}`,
            );
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 },
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const top =
        target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({ top, behavior: "smooth" });
      closeMenu();
    });
  });

  const form = document.getElementById("contact-form");
  const formSuccess = document.getElementById("form-success");
  const submitBtn = document.getElementById("form-submit-btn");
  const staticHostnames = [
    "vercel.app",
    "louislreed.org",
    "www.louislreed.org",
  ];

  let formErrorEl = document.getElementById("form-error-msg");

  if (!formErrorEl && form) {
    formErrorEl = document.createElement("p");
    formErrorEl.id = "form-error-msg";
    formErrorEl.setAttribute("role", "alert");
    formErrorEl.style.cssText =
      "display:none;color:#b02d2d;font-weight:500;margin:2px 0 0;";
    form.appendChild(formErrorEl);
  }

  function showFormError(message) {
    if (!formErrorEl) return;
    formErrorEl.textContent = message;
    formErrorEl.style.display = "block";
  }

  function hideFormError() {
    if (!formErrorEl) return;
    formErrorEl.style.display = "none";
    formErrorEl.textContent = "";
  }

  function useStaticFormFallback() {
    const hostname = window.location.hostname;

    if (!hostname) return false;
    if (hostname === "localhost" || hostname === "127.0.0.1") return false;

    return staticHostnames.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  }

  if (form && submitBtn) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideFormError();

      let isValid = true;
      const requiredFields = form.querySelectorAll("[required]");

      requiredFields.forEach((field) => {
        field.classList.remove("error");
        if (!field.value.trim()) {
          field.classList.add("error");
          isValid = false;
        }
      });

      const emailField = document.getElementById("form-email");
      if (
        emailField &&
        emailField.value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)
      ) {
        emailField.classList.add("error");
        isValid = false;
      }

      if (!isValid) {
        const firstError = form.querySelector(".error");
        if (firstError) firstError.focus();
        showFormError("Please complete the required fields correctly.");
        return;
      }

      const originalButtonText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      try {
        if (useStaticFormFallback()) {
          const formData = new FormData(form);
          const name = formData.get("name") || "";
          const organization = formData.get("organization") || "";
          const email = formData.get("email") || "";
          const inquiryType = formData.get("inquiry_type") || "";
          const message = formData.get("message") || "";

          const subject = encodeURIComponent(
            `New Inquiry from ${name}${organization ? ` (${organization})` : ""}`,
          );
          const body = encodeURIComponent(
            [
              `Name: ${name}`,
              `Organization: ${organization || "-"}`,
              `Email: ${email}`,
              `Inquiry Type: ${inquiryType}`,
              "",
              "Project details:",
              message,
            ].join("\n"),
          );

          window.location.href = `mailto:lreed@louislreed.org?subject=${subject}&body=${body}`;
        } else {
          const response = await fetch("contact.php", {
            method: "POST",
            body: new FormData(form),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(
              data.message || "Unable to send your message right now.",
            );
          }
        }

        form.hidden = true;
        if (formSuccess) {
          const successMessage = formSuccess.querySelector("p");
          if (successMessage && useStaticFormFallback()) {
            successMessage.textContent =
              "Your email app should open with the message draft ready to send.";
          }
          formSuccess.hidden = false;
        }
      } catch (error) {
        showFormError(
          error.message ||
            "Something went wrong while sending your message. Please try again.",
        );
        submitBtn.disabled = false;
        submitBtn.textContent = originalButtonText;
      }
    });

    form.querySelectorAll(".form-input").forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("error");
        hideFormError();
      });
    });
  }
})();
