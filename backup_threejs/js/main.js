/**
 * main.js — Entry point & loading screen
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  const loader    = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderLabel = document.getElementById('loader-label');

  // ── Simulate loading progress ─────────────────────────────
  function simulateLoad() {
    let progress = 0;

    function step() {
      // Ease into 90% quickly, then slow down
      const increment = progress < 70
        ? 2 + Math.random() * 4
        : 0.5 + Math.random() * 1;

      progress = Math.min(progress + increment, 99);

      if (loaderBar)   loaderBar.style.width  = `${progress}%`;
      if (loaderLabel) loaderLabel.textContent = String(Math.floor(progress)).padStart(2, '0');

      if (progress < 99) {
        setTimeout(step, 50 + Math.random() * 80);
      }
    }

    step();
  }

  // ── Complete loading ──────────────────────────────────────
  function completeLoad() {
    if (loaderBar)   loaderBar.style.width  = '100%';
    if (loaderLabel) loaderLabel.textContent = '100';

    setTimeout(() => {
      loader.classList.add('hidden');
      window.dispatchEvent(new CustomEvent('portfolioLoaded'));

      // Trigger hero animations after loader hides
      document.querySelectorAll('.hero__line').forEach((el) => {
        el.classList.add('in-view');
      });

      document.querySelectorAll('.hero .reveal-text').forEach((el) => {
        el.classList.add('in-view');
      });
    }, 600);
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
