/* =============================================
   MAIN.JS — LOUIS L. REED
   ============================================= */

(function () {
  'use strict';

  // ── NAV SCROLL STATE ─────────────────────────
  const navbar = document.getElementById('navbar');

  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── MOBILE MENU ───────────────────────────────
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // ── SCROLL REVEAL ─────────────────────────────
  const revealEls = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right'
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  // Hero elements reveal immediately on load
  const heroRevealEls = document.querySelectorAll('.hero .reveal-up');
  setTimeout(() => {
    heroRevealEls.forEach(el => el.classList.add('revealed'));
  }, 100);

  // ── COUNTER ANIMATION ─────────────────────────
  function animateCounter(el, target, duration) {
    const start = performance.now();
    const isLarge = target >= 10000;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(eased * target);

      if (isLarge) {
        el.textContent = current.toLocaleString('en-US') + '+';
      } else {
        el.textContent = current;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const statsEl = document.querySelector('.hero-stat-strip');
  let statsDone = false;

  const statsObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !statsDone) {
        statsDone = true;
        const countEls = document.querySelectorAll('.stat-number[data-count]');
        countEls.forEach(el => {
          const target = parseInt(el.dataset.count, 10);
          animateCounter(el, target, 2200);
        });
      }
    },
    { threshold: 0.5 }
  );

  if (statsEl) statsObserver.observe(statsEl);

  // ── ACTIVE NAV LINK HIGHLIGHT ─────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${id}`
              ? 'var(--white)'
              : '';
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => sectionObserver.observe(s));

  // ── FORM HANDLING ─────────────────────────────
  const form = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const submitBtn = document.getElementById('form-submit-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate
      let valid = true;
      const required = form.querySelectorAll('[required]');
      required.forEach(field => {
        field.classList.remove('error');
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        }
      });

      // Email validation
      const emailField = document.getElementById('form-email');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.classList.add('error');
        valid = false;
      }

      if (!valid) {
        const firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      // Submit state
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      // Encode form data for Netlify
      const data = new FormData(form);
      const body = new URLSearchParams(data).toString();

      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });

        if (response.ok) {
          form.hidden = true;
          formSuccess.hidden = false;
        } else {
          throw new Error('Server error');
        }
      } catch {
        // Fallback: show success UI anyway (Netlify form submission redirect alternative)
        // Remove this in production and replace with proper error handling
        form.hidden = true;
        formSuccess.hidden = false;
      }
    });

    // Remove error class on input
    form.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('input', () => input.classList.remove('error'));
    });
  }

  // ── SMOOTH SCROLL POLYFILL ────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── REDUCE MOTION CHECK ───────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
      el.classList.add('revealed');
    });
  }

})();
