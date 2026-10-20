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

  // ── Permanent Dark Theme ───────────────────────────────────
  function initTheme() {
    document.body.setAttribute('data-theme', 'dark');
    if (window.__threeScene) {
      if (window.__threeScene.setBackgroundColor) {
        window.__threeScene.setBackgroundColor('#080808');
      }
      if (window.__threeScene.setLiquidColor) {
        window.__threeScene.setLiquidColor('#fafbff');
      }
    }
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

  function initHudSpectrum() {
    const canvas = document.getElementById('hud-spectrum-canvas');
    const freqEl = document.getElementById('hud-freq-display');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let mouseInfluence = 0;
    let targetInfluence = 0;
    let animId = null;
    let isVisible = false;

    const barCount = 42;
    const barHeights = new Float32Array(barCount);
    const barTargets = new Float32Array(barCount);
    const peakHeights = new Float32Array(barCount);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resize);
    resize();

    const aboutSec = document.getElementById('about');
    if (aboutSec) {
      aboutSec.addEventListener('mousemove', (e) => {
        const rect = aboutSec.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width;
        targetInfluence = normX;
        if (freqEl) {
          const mhz = (1420.0 + normX * 8.8 + Math.sin(Date.now() * 0.003) * 0.405).toFixed(3);
          freqEl.textContent = `${mhz} MHz`;
        }
      });
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          render();
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      });
    }, { threshold: 0.05 });

    if (aboutSec) observer.observe(aboutSec);
    else observer.observe(canvas);

    let time = 0;

    function render() {
      if (!isVisible) {
        animId = null;
        return;
      }

      time += 0.04;
      mouseInfluence += (targetInfluence - mouseInfluence) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const barWidth = width / barCount;
      const gap = 2;
      const actualWidth = Math.max(1, barWidth - gap);

      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#8b38ff';

      for (let i = 0; i < barCount; i++) {
        const norm = i / barCount;
        const wave1 = Math.sin(time * 1.5 + norm * Math.PI * 4);
        const wave2 = Math.cos(time * 0.8 + norm * Math.PI * 2 + mouseInfluence * 4);
        const wave3 = Math.sin(time * 2.2 + norm * 8.0);

        const raw = (wave1 * 0.4 + wave2 * 0.35 + wave3 * 0.25 + 1) * 0.5;
        const shaped = Math.pow(raw, 1.4) * (0.35 + 0.65 * Math.sin(norm * Math.PI));

        barTargets[i] = Math.max(0.08, shaped);
        barHeights[i] += (barTargets[i] - barHeights[i]) * 0.15;

        const h = barHeights[i] * (height - 6);
        const x = i * barWidth;
        const y = height - h;

        if (h > peakHeights[i]) {
          peakHeights[i] = h;
        } else {
          peakHeights[i] = Math.max(0, peakHeights[i] - 0.4);
        }

        const grad = ctx.createLinearGradient(0, height, 0, y);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
        grad.addColorStop(0.6, accent);
        grad.addColorStop(1, '#ffffff');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, actualWidth, h);

        const peakY = height - peakHeights[i] - 2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, Math.max(0, peakY), actualWidth, 1.5);
      }

      animId = requestAnimationFrame(render);
    }

    render();
  }

  // ── Initialise ───────────────────────────────────────────
  function init() {
    initCursor();
    initClock();
    initMouseCoords();
    initNavScroll();
    initTheme();
    initKeyboard();
    initHudSpectrum();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
