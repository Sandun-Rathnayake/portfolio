/**
 * animations.js — Premium Scroll-reveal, Text Decryption, Magnetic Physics, Nav Spy
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. Text Scramble / Character Decryption Engine ─────────
  const GLYPHS = '01#[]/\\<>_+=*!~%&@$ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function scrambleText(element, duration = 300) {
    if (!element || element.dataset.scrambling === 'true') return;
    element.dataset.scrambling = 'true';

    const originalText = element.textContent.trim();
    const len = originalText.length;
    if (len === 0) return;

    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * len);

      let result = '';
      for (let i = 0; i < len; i++) {
        if (originalText[i] === ' ' || originalText[i] === '\n') {
          result += originalText[i];
        } else if (i < revealedCount) {
          result += originalText[i];
        } else {
          result += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      element.textContent = result;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = originalText;
        element.dataset.scrambling = 'false';
      }
    }

    requestAnimationFrame(update);
  }

  // ── 2. IntersectionObserver for Scroll-Reveal ───────────────
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');

          // Trigger text scramble if applicable
          if (
            entry.target.classList.contains('section-label') ||
            entry.target.hasAttribute('data-scramble')
          ) {
            scrambleText(entry.target, 350);
          }

          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  // ── SVG Signature Observer ─────────────────────────────────
  const svgObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('drawing');
          svgObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  // ── Work Cards Observer ────────────────────────────────────
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  // ── Experience Cards Observer ──────────────────────────────
  const clothObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          clothObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.02, rootMargin: '0px 0px 80px 0px' }
  );

  // ── 3. Initialize All Observers ────────────────────────────
  function initObservers() {
    if (REDUCED_MOTION) {
      document.querySelectorAll('.reveal-text, .reveal-line, .reveal-cloth, .reveal-card, .reveal-row')
        .forEach((el) => el.classList.add('in-view'));
      return;
    }

    // Text reveals
    document.querySelectorAll('.reveal-text').forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 0.04, 0.4)}s`;
      revealObserver.observe(el);
    });

    // Section Labels
    document.querySelectorAll('.section-label').forEach((el) => {
      revealObserver.observe(el);
    });

    // Hero / contact line reveals
    document.querySelectorAll('.reveal-line').forEach((el) => {
      revealObserver.observe(el);
    });

    // Experience cards
    document.querySelectorAll('.reveal-cloth').forEach((el) => {
      clothObserver.observe(el);
    });

    // Work cards
    document.querySelectorAll('.reveal-card').forEach((el) => {
      cardObserver.observe(el);
    });

    // Skills pyramid rows
    document.querySelectorAll('.reveal-row').forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.1}s`;
      revealObserver.observe(el);
    });

    // SVG signature
    const svg = document.querySelector('.svg-sign');
    if (svg) svgObserver.observe(svg);
  }

  // ── 4. Split Text for Hero Lines ───────────────────────────
  function setupHeroReveal() {
    const lines = document.querySelectorAll('.hero__line');
    lines.forEach((line, i) => {
      line.style.transitionDelay = `${0.15 + i * 0.12}s`;
    });
  }

  // ── 5. Smooth Scroll-To for Nav Links & CTAs ───────────────
  function setupNavScroll() {
    document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.dataset.scrollTo;
        const target = document.getElementById(targetId);
        if (target) {
          if (window.__lenis) window.__lenis.scrollTo(target, { offset: -70 });
          else target.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'start' });
          if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          history.replaceState(null, '', `#${targetId}`);
        }
      });
    });
  }

  // ── 6. Active Navigation Link Spy ──────────────────────────
  function setupNavSpy() {
    const sections = ['work', 'experience', 'skills', 'education', 'contact'];
    const navLinks = document.querySelectorAll('.nav__link[data-scroll-to]');

    function updateActiveNav() {
      const probe = 200;
      let currentSection = '';

      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= probe && rect.bottom > probe) {
            currentSection = sections[i];
            break;
          }
        }
      }

      navLinks.forEach((link) => {
        const target = link.dataset.scrollTo;
        if (target === currentSection) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }

  // ── 8. Unified Hero Scroll Fade ────────────────────────────
  function setupParallax() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const vh = window.innerHeight;
          if (y < vh) {
            const op = Math.max(0, 1 - y / (vh * 1.05));
            hero.style.opacity = op.toFixed(3);
          } else {
            hero.style.opacity = '0';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ── 11. Initialise ─────────────────────────────────────────
  function init() {
    initObservers();
    setupHeroReveal();
    setupNavScroll();
    setupNavSpy();
    setupParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
