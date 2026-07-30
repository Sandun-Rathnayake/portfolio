/**
 * three-scene.js — Scene Orchestrator
 *
 * Boots the WebGL renderer, wires up mouse-fluid.js and
 * particle-system.js, then runs the animation loop.
 *
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  // ── Canvas guard ─────────────────────────────────────────────
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ── Renderer ─────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha:     false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const initDark = document.body.getAttribute('data-theme') !== 'light';
  renderer.setClearColor(initDark ? 0x120206 : 0xfcf4f4, 1);
  // No tone-mapping — additive blending handles the HDR-like glow naturally

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.5, 600);
  camera.position.set(0, 0, 32);
  camera.lookAt(0, 0, 0);

  // ── Mouse-Fluid Post-Processing (mouse-fluid.js) ─────────────
  let fluidEffect = null;
  if (window.MouseFluidEffect) {
    fluidEffect = new window.MouseFluidEffect(renderer, scene, camera);
  }

  // ── Cinematic Particle System (particle-system.js) ───────────
  let particles = null;
  if (window.CinematicParticleSystem) {
    particles = new window.CinematicParticleSystem(scene, camera, renderer);
  }

  // ── Resize Handler ───────────────────────────────────────────
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (fluidEffect && fluidEffect.resize) {
      fluidEffect.resize();
    }
    if (particles && particles.resize) {
      particles.resize();
    }
  }
  onResize();
  window.addEventListener('resize', onResize);

  // ── Animation Loop ───────────────────────────────────────────
  const clock = new THREE.Clock();
  let lastTime = 0;

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    const delta   = elapsed - lastTime;
    lastTime = elapsed;

    // Update particle system (GPGPU sim + camera dolly)
    if (particles) {
      particles.update(elapsed, delta);
    }

    // Render main WebGL scene directly
    renderer.render(scene, camera);
  }

  animate();

  // ── Public API for theme-switching ───────────────────────────
  window.__threeScene = {
    setBackgroundColor(hex) {
      renderer.setClearColor(hex, 1);
    },
    setLiquidColor(hex) {
      if (fluidEffect && fluidEffect.setLiquidColor) {
        fluidEffect.setLiquidColor(hex);
      }
    },
    setNebulaTheme(isDark) {
      if (particles) particles.setTheme(isDark);
    },
  };
})();
