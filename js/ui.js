/**
 * ui.js — Nav scroll state, theme, copy-email button
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  // ── Nav Scroll Effect ─────────────────────────────────────
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    const threshold = 80;

    function update() {
      nav.classList.toggle('scrolled', window.scrollY > threshold);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
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

  // ── Copy Email Button ─────────────────────────────────────
  function initCopyEmail() {
    const btn = document.getElementById('contact-copy');
    const status = document.getElementById('contact-copy-status');
    if (!btn) return;

    let resetTimer;

    btn.addEventListener('click', async () => {
      const email = btn.dataset.email;
      let copied = false;
      try {
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch (err) {
        copied = false;
      }

      btn.textContent = copied ? 'Copied' : 'Copy email';
      if (status) {
        status.textContent = copied
          ? 'Email address copied to clipboard.'
          : `Couldn't copy automatically. The address is ${email}.`;
      }

      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        btn.textContent = 'Copy email';
        if (status) status.textContent = '';
      }, 2500);
    });
  }

  // ── Initialise ───────────────────────────────────────────
  function init() {
    initNavScroll();
    initTheme();
    initCopyEmail();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
