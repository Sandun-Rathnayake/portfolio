/**
 * main.js — Entry point & loading screen
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  const loader      = document.getElementById('loader');
  const loaderLabel = document.getElementById('loader-label');

  function syncSphereSize() {
    const fovRad = (55 * Math.PI) / 360;
    const frustumH = 2 * 42 * Math.tan(fovRad);
    const sphereD = 2 * (2.4 * (2.4 / 2.2));
    const pixelD = (sphereD / frustumH) * window.innerHeight;
    document.documentElement.style.setProperty('--sphere-size', `${pixelD.toFixed(2)}px`);
  }
  syncSphereSize();
  window.addEventListener('resize', syncSphereSize);

  // ── Simulate loading progress ─────────────────────────────
  function simulateLoad() {
    let progress = 0;

    function step() {
      const increment = progress < 70
        ? 2.5 + Math.random() * 4
        : 0.6 + Math.random() * 1.2;

      progress = Math.min(progress + increment, 99);

      if (loaderLabel) loaderLabel.textContent = `${Math.floor(progress)}%`;

      if (progress < 99) {
        setTimeout(step, 45 + Math.random() * 70);
      }
    }

    step();
  }

  // ── Complete loading ──────────────────────────────────────
  function completeLoad() {
    if (loaderLabel) loaderLabel.textContent = '100%';

    setTimeout(() => {
      if (loader) loader.classList.add('loaded');

      setTimeout(() => {
        if (loader) loader.classList.add('hidden');
        window.dispatchEvent(new CustomEvent('portfolioLoaded'));

        // Trigger hero animations after loader hides
        document.querySelectorAll('.hero__line').forEach((el) => {
          el.classList.add('in-view');
        });

        document.querySelectorAll('.hero .reveal-text').forEach((el) => {
          el.classList.add('in-view');
        });
      }, 450);
    }, 250);
  }

  // ── Page load sequence ────────────────────────────────────
  function init() {
    simulateLoad();

    // Complete once everything is ready
    if (document.readyState === 'complete') {
      setTimeout(completeLoad, 800);
    } else {
      window.addEventListener('load', () => {
        setTimeout(completeLoad, 800);
      });
    }
  }

  // ── Prevent flash of unstyled content ────────────────────
  document.documentElement.style.visibility = 'hidden';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.style.visibility = '';
    });
  });

  // ── Page transition on nav logo click ────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    init();

    // Add active section highlight to nav
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('[data-scroll-to]');

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              link.style.color =
                link.dataset.scrollTo === entry.target.id
                  ? 'var(--text-primary)'
                  : '';
            });
          }
        });
      },
      { threshold: 0.4 }
    );

    sections.forEach((sec) => sectionObserver.observe(sec));
  });
})();
