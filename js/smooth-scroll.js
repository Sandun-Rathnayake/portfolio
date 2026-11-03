/**
 * smooth-scroll.js — Inertial page scroll (Lenis) + shared frame ticker
 * Sandun Rathnayake Portfolio
 *
 * Other scripts register per-frame work with window.__onFrame(fn). Running
 * everything in one rAF, after Lenis has moved the page, keeps the WebGL
 * planes glued to their DOM boxes with no one-frame lag.
 */

(function () {
  'use strict';

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const callbacks = [];

  window.__onFrame = function (fn) {
    callbacks.push(fn);
  };

  let lenis = null;
  if (!REDUCED_MOTION && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    window.__lenis = lenis;
  }

  let lastY = window.scrollY;
  let velocity = 0;

  function frame(time) {
    if (lenis) lenis.raf(time);

    // Smoothed scroll speed in px/frame, shared by the WebGL effects
    const y = window.scrollY;
    velocity += ((y - lastY) - velocity) * 0.2;
    lastY = y;
    window.__scrollVelocity = REDUCED_MOTION ? 0 : velocity;

    for (let i = 0; i < callbacks.length; i++) callbacks[i](time);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
