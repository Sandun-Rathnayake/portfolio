/**
 * animations.js — Premium Scroll-reveal, Text Decryption, Magnetic Physics, Nav Spy
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

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

    // Manifesto words
    document.querySelectorAll('.reveal-manifesto').forEach((el, i) => {
      el.style.setProperty('--i', i);
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
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ── 6. Active Navigation Link Spy ──────────────────────────
  function setupNavSpy() {
    const sections = ['hero', 'about', 'skills', 'experience', 'work', 'contact'];
    const navLinks = document.querySelectorAll('.nav__link[data-scroll-to]');

    function updateActiveNav() {
      const scrollPos = window.scrollY + 200;
      let currentSection = '';

      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
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

  // ── 7. Magnetic Button Physics Hover ───────────────────────
  function setupMagneticButtons() {
    // Only apply on fine-pointer devices (mouse)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const magnetics = document.querySelectorAll(
      '.hero__cta, .hero__cta--secondary, .nav__link, .project-drawer__close'
    );

    magnetics.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate3d(${x * 0.22}px, ${y * 0.22}px, 0)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      });

      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'none';
      });
    });
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
            const op = Math.max(0, 1 - y / (vh * 0.75));
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

  // ── 9. Hover Cursor Effects ────────────────────────────────
  function setupCursorEffects() {
    const hoverEls = document.querySelectorAll(
      'a, button, .work__link, .contact__email, .contact__social, .nav__link, .skills__badge, .exp-card'
    );
    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ── 10. 3D Card Interactive Gyroscopic Mouse Tilt ──────────
  function setup3DCardTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const tiltCards = document.querySelectorAll('[data-tilt-3d]');
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // ── 11. Initialise ─────────────────────────────────────────
  function init() {
    initObservers();
    setupHeroReveal();
    setupNavScroll();
    setupNavSpy();
    setupMagneticButtons();
    setup3DCardTilt();
    setupParallax();
    setupCursorEffects();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
