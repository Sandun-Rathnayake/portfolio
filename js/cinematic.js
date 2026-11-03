/**
 * cinematic.js — Scroll-scrubbed content motion
 * Sandun Rathnayake Portfolio
 *
 * Everything here is tied to scroll position, not to one-off triggers, so it
 * plays forwards and rewinds with the page, in step with the camera journey
 * in three-scene.js. Runs on the shared frame ticker from smooth-scroll.js.
 *
 *   [data-split]         Letters rise and rotate into place as the title arrives
 *   [data-reveal-words]  Words light up one by one as the text is read
 *   [data-scrub-tilt]    Card tilts back in depth, settling flat at screen centre
 *   [data-depth="n"]     Parallax layer; positive n drifts slower than the page
 *   .hero__line          The name splits apart and pushes towards the viewer
 *   [data-pin-scene]     Pinned scene: its [data-reveal-words] text lights up over
 *                        the first half, then [data-scene-fade] and each
 *                        [data-scene-credit] roll in one after another
 */

(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  // Wrap every word in a span, and optionally every character inside it.
  function split(el, withChars) {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const pieces = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '));
          return;
        }
        const word = document.createElement('span');
        word.className = 'cine-word';
        if (withChars) {
          for (const ch of part) {
            const c = document.createElement('span');
            c.className = 'cine-char';
            c.textContent = ch;
            word.appendChild(c);
            pieces.push(c);
          }
        } else {
          word.textContent = part;
          pieces.push(word);
        }
        frag.appendChild(word);
      });
      node.replaceWith(frag);
    });

    // Letter-split text would be read one letter at a time, so screen readers
    // get the whole phrase as the element's name instead. A hidden text copy
    // was used before, but it got duplicated when visitors copied the text.
    // Word-split text is still ordinary words, so it's left as is.
    if (withChars) {
      el.setAttribute('aria-label', label);
      Array.from(el.children).forEach((child) => child.setAttribute('aria-hidden', 'true'));
    }
    return pieces;
  }

  // Only touch the DOM when a value actually changes
  function setStyle(el, key, value) {
    const cache = el.__cine || (el.__cine = {});
    if (cache[key] === value) return;
    cache[key] = value;
    el.style[key] = value;
  }

  function init() {
    let H = window.innerHeight;
    window.addEventListener('resize', () => { H = window.innerHeight; });

    const titles = Array.from(document.querySelectorAll('[data-split]')).map((el) => ({
      el, chars: split(el, true),
    }));

    const statements = Array.from(document.querySelectorAll('[data-reveal-words]')).map((el) => ({
      el, words: split(el, false),
    }));

    const tilts = Array.from(document.querySelectorAll('[data-scrub-tilt]'));
    const layers = Array.from(document.querySelectorAll('[data-depth]')).map((el) => ({
      el, depth: parseFloat(el.dataset.depth) || 0,
    }));

    const scene = document.querySelector('[data-pin-scene]');
    const sceneFades = scene ? Array.from(scene.querySelectorAll('[data-scene-fade]')) : [];
    const sceneCredits = scene ? Array.from(scene.querySelectorAll('[data-scene-credit]')) : [];
    // Must match the media query that makes .about-scene sticky in style.css
    const pinQuery = window.matchMedia('(min-width: 769px) and (min-height: 561px)');

    const hero = document.getElementById('hero');
    const heroLines = Array.from(document.querySelectorAll('.hero__line'));

    // Page-coordinate boxes, measured once and again whenever layout changes.
    // Per frame we only do maths and style writes, never layout reads, so the
    // browser never has to stop and recalculate layout mid-frame.
    const boxes = new Map();
    function measure() {
      const y = window.scrollY;
      // Tilted cards are measured without their transform so the motion
      // doesn't feed back into its own input
      [...tilts, ...sceneFades, ...sceneCredits].forEach((el) => {
        el.style.transform = '';
        if (el.__cine) el.__cine.transform = undefined;
      });
      const targets = [
        ...titles.map((t) => t.el),
        ...statements.map((t) => t.el),
        ...tilts,
        ...layers.map((l) => l.el.parentElement),
        ...(scene ? [scene] : []),
        ...sceneFades,
        ...sceneCredits,
      ];
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        boxes.set(el, { top: r.top + y, height: r.height });
      });
    }
    function box(el) {
      const b = boxes.get(el);
      const top = b.top - window.scrollY;
      return { top, bottom: top + b.height, height: b.height };
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(document.body);

    // How far through the pinned scene we are (0..1), or -1 when it isn't pinned
    function sceneProgress() {
      if (!scene || !pinQuery.matches) return -1;
      const b = box(scene);
      return clamp(-b.top / Math.max(1, b.height - H), 0, 1);
    }

    // Elements rise in once their top passes 85% of the screen (unpinned layouts)
    function enterProgress(el) {
      return clamp((H * 0.95 - box(el).top) / (H * 0.25), 0, 1);
    }

    function frame() {
      const sp = sceneProgress();

      // ── Pinned scene: bio, then the credits one by one
      if (scene) {
        sceneFades.forEach((el) => {
          const t = easeOut(sp >= 0 ? clamp((sp - 0.42) / 0.14, 0, 1) : enterProgress(el));
          setStyle(el, 'opacity', t.toFixed(2));
          setStyle(el, 'transform', `translate3d(0, ${((1 - t) * 24).toFixed(1)}px, 0)`);
        });
        sceneCredits.forEach((el, i) => {
          const t = easeOut(sp >= 0
            ? clamp((sp - (0.55 + i * 0.09)) / 0.12, 0, 1)
            : enterProgress(el));
          setStyle(el, 'opacity', t.toFixed(2));
          setStyle(el, 'transform', `translate3d(0, ${((1 - t) * 48).toFixed(1)}px, 0)`);
        });
      }

      // ── Titles: letters rise and unfold as the title travels up the screen
      titles.forEach(({ el, chars }) => {
        const r = box(el);
        if (r.bottom < -200 || r.top > H + 200) return;
        const enter = clamp((H - r.top) / (H * 0.55), 0, 1);
        const n = chars.length;
        chars.forEach((c, i) => {
          const t = easeOut(clamp(enter * 1.7 - (i / n) * 0.7, 0, 1));
          const y = ((1 - t) * 105).toFixed(1);
          const rot = ((1 - t) * -75).toFixed(1);
          setStyle(c, 'transform', `translate3d(0, ${y}%, 0) rotateX(${rot}deg)`);
          setStyle(c, 'opacity', t.toFixed(3));
        });
      });

      // ── Statements: words light up from dim to full as they're read
      statements.forEach(({ el, words }) => {
        const r = box(el);
        const pinned = sp >= 0 && scene.contains(el);
        if (!pinned && (r.bottom < -200 || r.top > H + 200)) return;
        const p = pinned
          ? clamp(sp / 0.45, 0, 1)
          : clamp((H * 0.82 - r.top) / (r.height + H * 0.3), 0, 1);
        const n = words.length;
        words.forEach((w, i) => {
          const t = clamp((p * n - i) * 0.9, 0, 1);
          setStyle(w, 'opacity', (0.22 + t * 0.78).toFixed(2));
        });
      });

      // ── Cards: lean back in depth away from centre, flat when centred
      tilts.forEach((el) => {
        const r = box(el);
        if (r.bottom < -100 || r.top > H + 100) return;
        const c = clamp((r.top + r.height / 2 - H / 2) / H, -0.75, 0.75);
        const rot = (c * 18).toFixed(2);
        const y = (c * 60).toFixed(1);
        const s = (1 - Math.abs(c) * 0.08).toFixed(4);
        setStyle(el, 'transform', `perspective(1400px) translate3d(0, ${y}px, 0) rotateX(${rot}deg) scale(${s})`);
        setStyle(el, 'opacity', clamp(1.3 - Math.abs(c) * 1.6, 0.35, 1).toFixed(2));
      });

      // ── Parallax layers (single-column layouts have no room for columns to slide)
      const parallaxOn = window.innerWidth > 768;
      layers.forEach(({ el, depth }) => {
        if (!parallaxOn) {
          setStyle(el, 'transform', '');
          return;
        }
        const parent = box(el.parentElement);
        if (parent.bottom < -200 || parent.top > H + 200) return;
        const offset = (parent.top + parent.height / 2 - H / 2) * depth;
        setStyle(el, 'transform', `translate3d(0, ${offset.toFixed(1)}px, 0)`);
      });

      // ── Hero: the name splits apart and rushes past as you scroll in
      if (hero) {
        const p = clamp(window.scrollY / (H * 0.9), 0, 1);
        if (p < 1 || !hero.__cineDone) {
          hero.__cineDone = p >= 1;
          const e = p * p;
          heroLines.forEach((line, i) => {
            const dir = i === 0 ? -1 : 1;
            const x = (dir * e * 38).toFixed(2);
            const z = (e * 320).toFixed(1);
            setStyle(line, 'transform', `perspective(900px) translate3d(${x}vw, 0, ${z}px)`);
            // Blur on huge type is costly on the GPU; keep it light
            setStyle(line, 'filter', e > 0.01 ? `blur(${(e * 6).toFixed(1)}px)` : '');
          });
        }
      }
    }

    if (window.__onFrame) window.__onFrame(frame);
    else (function loop() { frame(); requestAnimationFrame(loop); })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
