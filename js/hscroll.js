/**
 * Horizontal Scroll Zone Driver
 * Maps vertical scroll through #hscroll-zone into horizontal translation of #hscroll-track.
 */

(function () {
  'use strict';

  function initHScroll() {
    var zone = document.getElementById('hscroll-zone');
    var track = document.getElementById('hscroll-track');
    var nav = zone ? zone.querySelector('.hscroll-nav') : null;
    var pills = nav ? Array.from(nav.querySelectorAll('.hscroll-pill, .hscroll-nav__dot')) : [];
    var sticky = zone ? zone.querySelector('.hscroll-sticky') : null;

    if (!zone || !track) return;

    var PANELS = 4;

    function update() {
      // If mobile width, do not translate
      if (window.innerWidth <= 768) {
        track.style.transform = '';
        if (nav) nav.classList.remove('visible');
        return;
      }

      var rect = zone.getBoundingClientRect();
      var zoneH = zone.offsetHeight;
      var viewH = window.innerHeight;
      var maxScroll = zoneH - viewH;

      if (maxScroll <= 0) return;

      // Check if zone is currently in view
      var insideZone = rect.top <= 100 && rect.bottom >= 100;
      if (nav) nav.classList.toggle('visible', insideZone);

      var scrolled = -rect.top;
      var progress = Math.max(0, Math.min(1, scrolled / maxScroll));

      // Translate track horizontally
      var translateX = progress * (PANELS - 1) * window.innerWidth;
      track.style.transform = 'translateX(-' + translateX + 'px)';

      // ── Sync with Three.js 3D Camera & Cosmic Flow ──
      if (window.__threeScene && typeof window.__threeScene.setHScrollProgress === 'function') {
        window.__threeScene.setHScrollProgress(progress);
      }

      // Update progress bar variable
      if (sticky) {
        sticky.style.setProperty('--hscroll-progress', (progress * 100).toFixed(2) + '%');
      }

      // Update active navigation pill and trigger 3D cosmic pulse on panel shift
      var active = Math.min(PANELS - 1, Math.round(progress * (PANELS - 1)));
      if (active !== lastActivePanel) {
        lastActivePanel = active;
        if (window.__threeControls && window.__threeControls.cfg) {
          var cfg = window.__threeControls.cfg;
          var baseNoise = 0.048;
          cfg.noiseS = 0.14;
          setTimeout(function () {
            cfg.noiseS = baseNoise;
          }, 380);
        }
      }

      pills.forEach(function (pill, i) {
        pill.classList.toggle('active', i === active);
      });
    }

    var lastActivePanel = 0;


    // Pill navigation clicks
    pills.forEach(function (pill, i) {
      pill.addEventListener('click', function () {
        var zoneRect = zone.getBoundingClientRect();
        var zoneTopDoc = zoneRect.top + window.scrollY;
        var maxSc = zone.offsetHeight - window.innerHeight;
        var fraction = i / (PANELS - 1);
        var targetY = zoneTopDoc + fraction * maxSc;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      });
    });

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    // Initial update
    update();
    setTimeout(update, 100);
    setTimeout(update, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHScroll);
  } else {
    initHScroll();
  }
  window.addEventListener('load', initHScroll);
})();
