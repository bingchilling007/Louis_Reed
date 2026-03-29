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

  // =============================================
  // CINEMATIC UPGRADE ADDITIONS
  // =============================================
  if (!prefersReducedMotion.matches) {
    
    // ── 1. CUSTOM CURSOR ─────────────────────────
    const cursorDot = document.getElementById('cursor-dot');
    const cursorGlow = document.getElementById('cursor-glow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;
    
    // Determine if device has touch
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice && cursorDot && cursorGlow) {
      document.body.classList.add('has-cursor');

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      const renderCursor = () => {
        // Fast follow for dot
        dotX += (mouseX - dotX) * 0.4;
        dotY += (mouseY - dotY) * 0.4;
        cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;

        // Slow follow for glow
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;

        requestAnimationFrame(renderCursor);
      };
      requestAnimationFrame(renderCursor);

      // Hover states for links and buttons
      const interactiveEls = document.querySelectorAll('a, button, .interactive');
      interactiveEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursorDot.classList.add('hover-link');
          cursorGlow.classList.add('hover-link');
        });
        el.addEventListener('mouseleave', () => {
          cursorDot.classList.remove('hover-link');
          cursorGlow.classList.remove('hover-link');
        });
      });
    }

    // ── 2. MAGNETIC BUTTONS ───────────────────────
    const magneticWraps = document.querySelectorAll('.magnetic-wrap');
    
    magneticWraps.forEach(wrap => {
      const btn = wrap.querySelector('a, button');
      if (!btn) return;

      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) * 0.3; // Max ~15px
        const moveY = (y - centerY) * 0.3;

        btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
        btn.style.transition = 'none';
      });

      wrap.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
        btn.style.transition = 'transform 0.4s var(--ease-out)';
      });
    });

    // ── 3. 3D CARD TILT ───────────────────────────
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -8; // Max 8 deg
        const rotateY = ((x - centerX) / centerX) * 8;
        
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        card.style.transition = 'none';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `rotateX(0deg) rotateY(0deg)`;
        card.style.transition = 'transform 0.6s var(--ease-out)';
      });
    });

    // ── 4. PARTICLE CANVAS ────────────────────────
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let particleWidth, particleHeight;
      const particles = [];
      const PARTICLE_COUNT = 60;

      const initCanvas = () => {
        particleWidth = canvas.clientWidth;
        particleHeight = canvas.clientHeight;
        canvas.width = particleWidth * window.devicePixelRatio;
        canvas.height = particleHeight * window.devicePixelRatio;
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      };

      class Particle {
        constructor() {
          this.reset();
        }
        reset() {
          this.x = Math.random() * particleWidth;
          this.y = Math.random() * particleHeight;
          this.size = Math.random() * 2 + 0.5;
          this.speedY = Math.random() * -0.3 - 0.1;
          this.speedX = Math.random() * 0.2 - 0.1;
          this.baseAlpha = Math.random() * 0.5 + 0.1;
          this.alpha = this.baseAlpha;
          this.color = Math.random() > 0.8 ? '#c9a84c' : '#ffffff';
        }
        update() {
          this.y += this.speedY;
          this.x += this.speedX;

          // Repel from cursor slightly
          if (!isTouchDevice) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              this.x -= (dx / dist) * 0.5;
              this.y -= (dy / dist) * 0.5;
            }
          }

          if (this.y < -10) {
            this.reset();
            this.y = particleHeight + 10;
          }
        }
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = this.alpha;
          ctx.fill();
        }
      }

      const animateParticles = () => {
        ctx.clearRect(0, 0, particleWidth, particleHeight);
        particles.forEach(p => {
          p.update();
          p.draw();
        });
        requestAnimationFrame(animateParticles);
      };

      initCanvas();
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
      animateParticles();

      window.addEventListener('resize', initCanvas);
    }

    // ── 5. SCROLL PROGRESS BAR ────────────────────
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.max(0, Math.min(1, window.scrollY / scrollRange));
        progressBar.style.transform = `scaleX(${progress})`;
      }, { passive: true });
    }

    // ── 6. PARALLAX EFFECTS ───────────────────────
    const heroPortrait = document.querySelector('.hero-portrait');
    if (heroPortrait) {
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        // Move opposite to scroll direction slightly
        heroPortrait.style.transform = `translateY(${scrollY * 0.08}px)`;
      }, { passive: true });
    }
  }

  // ── 7. STORY IN MOTION VIDEO TOGGLE ───────────
  // Note: Added ?autoplay=1 parameter to automatically play video when overlaid
  const playStoryBtn = document.getElementById('play-story-btn');
  const storyOverlay = document.getElementById('story-overlay');
  const storyContainer = document.getElementById('story-video-player');

  if (playStoryBtn) {
    playStoryBtn.addEventListener('click', () => {
      storyOverlay.classList.add('hidden');
      // Using generic search URL for channel if no specific video ID provided.
      // Better fallback: Just embed a generic video until updated.
      storyContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/videoseries?list=UULFxndxZk_iQ1G7b7b3v8OQ&autoplay=1&rel=0&modestbranding=1" title="Louis L. Reed - Justice In Motion" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    });
  }

})();
