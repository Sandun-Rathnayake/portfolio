/**
 * ui.js — Clock, cursor tracking, mouse coords, theme toggle, nav scroll
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  // ── Custom Cursor ─────────────────────────────────────────
  function initCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor || window.matchMedia('(hover: none)').matches) return;

    const dot  = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');

    let raf;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      dotX = mouseX;
      dotY = mouseY;

      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;

      dot.style.transform  = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

      raf = requestAnimationFrame(animateCursor);
    }

    animateCursor();
  }

  // ── Live Clock ────────────────────────────────────────────
  function initClock() {
    const el = document.getElementById('live-clock');
    if (!el) return;

    function tick() {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      el.textContent = `${hh}:${mm}:${ss}`;
    }

    tick();
    setInterval(tick, 1000);
  }

  // ── Mouse Coordinates Display ─────────────────────────────
  function initMouseCoords() {
    const el = document.getElementById('mouse-coords');
    if (!el) return;

    document.addEventListener('mousemove', (e) => {
      const x = String(e.clientX).padStart(4, '0');
      const y = String(e.clientY).padStart(4, '0');
      el.textContent = `${x} X / ${y} Y`;
    });
  }

  // ── Nav Scroll Effect ─────────────────────────────────────
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    const threshold = 80;
    let last = 0;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > threshold) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      last = y;
    });
  }

  // ── Theme Toggle ──────────────────────────────────────────
  function initTheme() {
    const btn   = document.getElementById('theme-toggle');
    const label = document.querySelector('.nav__theme-label');
    if (!btn) return;

    let isDark = true;

    function applyThemeToScene(dark) {
      if (window.__threeScene) {
        if (window.__threeScene.setAccentColor) {
          window.__threeScene.setAccentColor(dark ? '#c8ff00' : '#5a00ff');
        }
        window.__threeScene.setBackgroundColor(dark ? '#080808' : '#f5f4f0');
        window.__threeScene.setLiquidColor(dark ? '#fafbff' : '#000000');
        if (window.__threeScene.setNebulaTheme) {
          window.__threeScene.setNebulaTheme(dark);
        }
      }
    }

    // Respect system preference on first load
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      isDark = false;
      document.body.setAttribute('data-theme', 'light');
      if (label) label.textContent = 'THEME[L]';
      applyThemeToScene(false);
    }

    btn.addEventListener('click', () => {
      isDark = !isDark;
      document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
      if (label) label.textContent = isDark ? 'THEME[D]' : 'THEME[L]';
      applyThemeToScene(isDark);
    });
  }

  // ── Keyboard navigation ───────────────────────────────────
  function initKeyboard() {
    document.addEventListener('keydown', (e) => {
      const sections = ['hero', 'about', 'skills', 'work', 'manifesto', 'contact'];
      const current = sections.findIndex((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top >= -200 && rect.top < window.innerHeight * 0.5;
      });

      if (e.key === 'ArrowDown' && current < sections.length - 1) {
        const next = document.getElementById(sections[current + 1]);
        if (next) next.scrollIntoView({ behavior: 'smooth' });
      }
      if (e.key === 'ArrowUp' && current > 0) {
        const prev = document.getElementById(sections[current - 1]);
        if (prev) prev.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ── Initialise ───────────────────────────────────────────
  function init() {
    initCursor();
    initClock();
    initMouseCoords();
    initNavScroll();
    initTheme();
    initKeyboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
