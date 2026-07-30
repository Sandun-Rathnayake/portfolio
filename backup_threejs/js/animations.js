/**
 * animations.js — Scroll-reveal, text animations, SVG draw
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  // ── IntersectionObserver for scroll-reveal ────────────────
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // Once revealed, stop observing (persist state)
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  // ── SVG Signature Observer ───────────────────────────────
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

  // ── Stagger work cards ───────────────────────────────────────
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  // ── Cloth-unfurl for experience cards ─────────────────────────
  const clothObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          clothObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );

  // ── Initialize all observers ─────────────────────────────
  function initObservers() {
    // Text reveals
    document.querySelectorAll('.reveal-text').forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.05}s`;
      revealObserver.observe(el);
    });

    // Hero / contact line reveals
    document.querySelectorAll('.reveal-line').forEach((el) => {
      revealObserver.observe(el);
    });

    // Manifesto words
    document.querySelectorAll('.reveal-manifesto').forEach((el, i) => {
      el.style.setProperty('--i', i);
      revealObserver.observe(el);
    });

    // Experience cards — cloth unfurl from right
    document.querySelectorAll('.reveal-cloth').forEach((el) => {
      clothObserver.observe(el);
    });

    // Work cards
    document.querySelectorAll('.reveal-card').forEach((el) => {
      cardObserver.observe(el);
    });

    // Skills pyramid rows cascading reveal
    document.querySelectorAll('.reveal-row').forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.12}s`;
      revealObserver.observe(el);
    });

    // SVG signature
    const svg = document.querySelector('.svg-sign');
    if (svg) svgObserver.observe(svg);
  }

  // ── Split text for char-by-char animation (hero lines) ───
  function setupHeroReveal() {
    const lines = document.querySelectorAll('.hero__line');
    lines.forEach((line, i) => {
      line.style.transitionDelay = `${0.15 + i * 0.12}s`;
    });
  }

  // ── Smooth scroll-to for nav links ───────────────────────
  function setupNavScroll() {
    document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.scrollTo;
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ── Parallax on hero headline ────────────────────────────
  function setupParallax() {
    const headline = document.querySelector('.hero__headline');
    const heroBio  = document.querySelector('.hero__bio');
    if (!headline) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const speed = 0.25;
          headline.style.transform = `translateY(${y * speed}px)`;
          if (heroBio) heroBio.style.transform = `translateY(${y * speed * 0.5}px)`;
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ── Hover cursor effects on interactive elements ─────────
  function setupCursorEffects() {
    const hoverEls = document.querySelectorAll(
      'a, button, .work__link, .contact__email, .contact__social, .nav__link'
    );
    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ── Initialise ───────────────────────────────────────────
  function init() {
    initObservers();
    setupHeroReveal();
    setupNavScroll();
    setupParallax();
    setupCursorEffects();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
