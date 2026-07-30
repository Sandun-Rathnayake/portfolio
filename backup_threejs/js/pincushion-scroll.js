/**
 * pincushion-scroll.js — Cinematic Pincushion Distortion on Scroll (Flat 2D / No Rotation)
 *
 * Implements a dynamic pincushion distortion effect for selected work items.
 * Exposes a global configuration object `window.__pincushionSettings` and
 * launches a dedicated "Pincushion Controls" panel via lil-gui.
 *
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  // Expose global settings for the control panel
  window.__pincushionSettings = {
    enabled: true,
    stretchX: 0.12,      // Horizontal expansion factor at extremes
    compressY: 0.04,     // Vertical compression factor at extremes
    separation: 180,     // Column push-apart factor in pixels
    edgeBow: 12,         // Max inward edge bowing in pixels (clip-path curve)
    depth: -30,          // Depth translation back into the screen in pixels
    triggerUpdate: null  // Holds the update trigger for live rendering
  };

  function initPincushionScroll() {
    const workItems = document.querySelectorAll('.work__item');
    if (workItems.length === 0) return;

    const workGrid = document.querySelector('.work__grid');
    if (workGrid) {
      workGrid.style.perspective = '1200px';
      workGrid.style.transformStyle = 'preserve-3d';
    }

    let ticking = false;

    function updateDistortion() {
      const p = window.__pincushionSettings;

      // If effect is disabled, reset all styles immediately
      if (!p.enabled) {
        workItems.forEach((item) => {
          item.style.transform = 'none';
          item.style.opacity = '1.0';
          item.style.clipPath = 'none';
        });
        return;
      }

      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;

      // Calculate grid container center to determine which column each item belongs to
      const gridRect = workGrid ? workGrid.getBoundingClientRect() : { left: 0, width: window.innerWidth };
      const gridWidth = gridRect.width || window.innerWidth;
      const gridCenterX = gridRect.left + gridWidth / 2;

      workItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const itemHeight = rect.height;
        const itemWidth = rect.width;
        const itemCenterY = rect.top + itemHeight / 2;
        const itemCenterX = rect.left + itemWidth / 2;

        // Calculate normalized vertical distance from screen center (-1 to 1)
        const distanceToCenter = (itemCenterY - viewportCenter) / viewportCenter;
        const absDistance = Math.min(Math.abs(distanceToCenter), 1.5);

        // --- PINCUSHION DISTORTION FORMULA ---
        // 1. Scale/Stretch outward to the sides at the extremes
        const scaleX = 1.0 + absDistance * absDistance * p.stretchX;

        // 2. Vertical compression to enhance the bowing effect
        const scaleY = 1.0 - absDistance * absDistance * p.compressY;

        // 3. Subtle center-focused opacity shift
        const opacity = 1.0 - absDistance * 0.15;

        // --- COLUMN SEPARATION TO SIDES ---
        const offsetFromCenter = itemCenterX - gridCenterX;
        const translateX = (offsetFromCenter / gridWidth) * absDistance * absDistance * p.separation;

        // Apply transformations (Strictly flat - no rotation on X, Y, or Z axis)
        item.style.transform = `translate3d(${translateX}px, 0, ${absDistance * p.depth}px) scale(${scaleX}, ${scaleY})`;
        item.style.opacity = opacity;
        item.style.transformOrigin = 'center center';
        item.style.transition = 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s var(--ease-out)';

        // 4. Dynamic Clip Path (Bowing the edges inward)
        const curveFactor = absDistance * absDistance * p.edgeBow;

        if (curveFactor > 0.5) {
          item.style.clipPath = `polygon(
            0% 0%,
            50% ${curveFactor}px,
            100% 0%,
            calc(100% - ${curveFactor}px) 50%,
            100% 100%,
            50% calc(100% - ${curveFactor}px),
            0% 100%,
            ${curveFactor}px 50%
          )`;
        } else {
          item.style.clipPath = 'none';
        }
      });

      ticking = false;
    }

    // Expose the update function globally so the control panel can trigger immediate updates
    window.__pincushionSettings.triggerUpdate = updateDistortion;

    // --- Dedicated GUI Panel for Pincushion Distortion ---
    function initPincushionGUI() {
      const GUI = window.lil?.GUI;
      if (!GUI) return;

      const gui = new GUI({ title: 'Pincushion Controls' });

      // Position this panel side-by-side with Fluid Controls (Fluid sits at right: 20px)
      gui.domElement.style.position = 'fixed';
      gui.domElement.style.top = '80px';
      gui.domElement.style.right = '280px';
      gui.domElement.style.zIndex = '9999';

      const p = window.__pincushionSettings;
      const redraw = () => {
        if (p.triggerUpdate) p.triggerUpdate();
      };

      gui.add(p, 'enabled').name('Enabled').onChange(redraw);
      gui.add(p, 'stretchX', 0.0, 0.4, 0.01).name('Horiz Stretch').onChange(redraw);
      gui.add(p, 'compressY', 0.0, 0.15, 0.005).name('Vert Compress').onChange(redraw);
      gui.add(p, 'separation', 0, 500, 10).name('Separation (px)').onChange(redraw);
      gui.add(p, 'edgeBow', 0, 40, 1).name('Edge Bowing (px)').onChange(redraw);
      gui.add(p, 'depth', -150, 0, 5).name('3D Perspective Depth').onChange(redraw);

      gui.close();
    }

    // Run on scroll
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateDistortion);
        ticking = true;
      }
    });

    // Run on resize / orientation change
    window.addEventListener('resize', () => {
      if (!ticking) {
        requestAnimationFrame(updateDistortion);
        ticking = true;
      }
    });

    // Initial runs
    updateDistortion();
    initPincushionGUI();
  }

  // Wait for load sequence to complete or DOM to be ready
  if (document.readyState === 'complete') {
    initPincushionScroll();
  } else {
    window.addEventListener('load', initPincushionScroll);
  }
})();
