/**
 * main.js — Entry point & loading screen
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  const loader = document.getElementById('loader');

  function syncSphereSize() {
    const fovRad = (55 * Math.PI) / 360;
    const frustumH = 2 * 42 * Math.tan(fovRad);
    const sphereD = 2 * (2.4 * (2.4 / 2.2));
    const pixelD = (sphereD / frustumH) * window.innerHeight;
    document.documentElement.style.setProperty('--sphere-size', `${pixelD.toFixed(2)}px`);
  }
  syncSphereSize();
  window.addEventListener('resize', syncSphereSize);

  // ── Hide the loader ───────────────────────────────────────
  // Content is ready once the DOM is parsed; the 3D scene fades in behind it,
  // so there's no reason to hold visitors on the loader until every asset loads.
  let done = false;
  function completeLoad() {
    if (done) return;
    done = true;

    if (loader) loader.classList.add('loaded');

    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
      window.dispatchEvent(new CustomEvent('portfolioLoaded'));

      document.querySelectorAll('.hero__line').forEach((el) => {
        el.classList.add('in-view');
      });

      document.querySelectorAll('.hero .reveal-text').forEach((el) => {
        el.classList.add('in-view');
      });
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(completeLoad, 150));
  } else {
    setTimeout(completeLoad, 150);
  }
})();
