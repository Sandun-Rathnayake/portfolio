/**
 * nebula-particles.js — Volumetric Colorful Nebula Cloud & Twinkling Stars
 *
 * Self-contained module. Exposes window.NebulaParticles class.
 * Call:  new window.NebulaParticles(scene, settings)
 * Then call .update(elapsed, mouse, scrollY) each frame.
 *
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  class NebulaParticles {
    /**
     * @param {THREE.Scene}  scene    – The Three.js scene to add objects into.
     * @param {object}       settings – Reference to window.__nebulaSettings.
     */
    constructor(scene, settings) {
      this.scene    = scene;
      this.settings = settings;
      this._isDark  = true; // default: dark theme

      this._buildNebulaClouds();
      this._buildTwinkleStars();
    }

    // ─────────────────────────────────────────────────────────────
    //  1. VOLUMETRIC NEBULA CLOUD PARTICLES
    // ─────────────────────────────────────────────────────────────
    _buildNebulaClouds() {
      const NEBULA_COUNT = 18000;
      const positions = new Float32Array(NEBULA_COUNT * 3);
      const colors    = new Float32Array(NEBULA_COUNT * 3);
      const sizes     = new Float32Array(NEBULA_COUNT);
      const alphas    = new Float32Array(NEBULA_COUNT);

      // Ten colour-centre clusters spread through 3-D space
      const centers = [
        { pos: new THREE.Vector3( 30,  10, -10), color: new THREE.Color('#ff00aa') }, // Hot Magenta
        { pos: new THREE.Vector3(-35,  -5,   5), color: new THREE.Color('#00f0ff') }, // Stellar Cyan
        { pos: new THREE.Vector3(  5, -25, -20), color: new THREE.Color('#ffaa00') }, // Glowing Gold
        { pos: new THREE.Vector3(-10,  20, -15), color: new THREE.Color('#8a00ff') }, // Cosmic Purple
        { pos: new THREE.Vector3( 45, -30,  -5), color: new THREE.Color('#ff003c') }, // Crimson Red
        { pos: new THREE.Vector3(-45,  30, -25), color: new THREE.Color('#00ff66') }, // Emerald Green
        { pos: new THREE.Vector3(-15, -45,  20), color: new THREE.Color('#ff5a00') }, // Vivid Orange
        { pos: new THREE.Vector3( 25,  35, -30), color: new THREE.Color('#003cff') }, // Deep Cobalt Blue
        { pos: new THREE.Vector3(  0,   5,  30), color: new THREE.Color('#4b00ff') }, // Electric Indigo
        { pos: new THREE.Vector3(-55, -15, -35), color: new THREE.Color('#00ffd8') }, // Neon Teal
      ];

      for (let i = 0; i < NEBULA_COUNT; i++) {
        const centerIdx = i % centers.length;
        const center    = centers[centerIdx];

        // Exponential radial distribution → denser near centre
        const distFactor = Math.pow(Math.random(), 2.2);
        const radius     = distFactor * 54;
        const theta      = Math.random() * Math.PI * 2;
        const phi        = Math.acos(2 * Math.random() - 1);

        positions[i * 3]     = center.pos.x + radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = center.pos.y + radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = center.pos.z + radius * Math.cos(phi);

        // Blend neighbouring colour centres for smoother transitions
        const mixed = center.color.clone();
        if (Math.random() > 0.6) {
          mixed.lerp(centers[(centerIdx + 1) % centers.length].color, Math.random() * 0.45);
        }
        mixed.addScalar((Math.random() - 0.5) * 0.08);

        colors[i * 3]     = mixed.r;
        colors[i * 3 + 1] = mixed.g;
        colors[i * 3 + 2] = mixed.b;

        sizes[i]  = 0.4 + Math.random() * 1.5;
        alphas[i] = 0.15 + Math.random() * 0.7;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
      geo.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));
      geo.setAttribute('alpha',    new THREE.BufferAttribute(alphas,    1));

      this.nebulaMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime:               { value: 0 },
          uMouse:              { value: new THREE.Vector2(0, 0) },
          uScroll:             { value: 0 },
          uSwirlSpeed:         { value: this.settings.swirlSpeed },
          uTurbulenceSpeed:    { value: this.settings.turbulenceSpeed },
          uTurbulenceStrength: { value: this.settings.turbulenceStrength },
          uMouseParallax:      { value: this.settings.mouseParallax },
          uScrollPull:         { value: this.settings.scrollPull },
          uDarkMode:           { value: 1.0 },
        },
        vertexShader: `
          attribute float size;
          attribute float alpha;
          attribute vec3  color;

          uniform float uTime;
          uniform vec2  uMouse;
          uniform float uScroll;
          uniform float uSwirlSpeed;
          uniform float uTurbulenceSpeed;
          uniform float uTurbulenceStrength;
          uniform float uMouseParallax;
          uniform float uScrollPull;

          varying vec3  vColor;
          varying float vAlpha;

          void main() {
            vColor = color;
            vAlpha = alpha;
            vec3 pos = position;

            // Swirling vortex spiral
            float distFromCenter = length(pos.xy);
            float angle = uTime * (20.0 / (distFromCenter + 35.0)) * uSwirlSpeed;
            float cosA = cos(angle);
            float sinA = sin(angle);
            float rx = pos.x * cosA - pos.y * sinA;
            float ry = pos.x * sinA + pos.y * cosA;
            pos.x = rx;
            pos.y = ry;

            // Undulating cosmic-dust wind
            pos.x += sin(uTime * uTurbulenceSpeed + pos.y * 0.02) * uTurbulenceStrength;
            pos.y += cos(uTime * (uTurbulenceSpeed * 1.25) + pos.x * 0.02) * uTurbulenceStrength;
            pos.z += sin(uTime * (uTurbulenceSpeed * 0.75) + pos.z * 0.015) * (uTurbulenceStrength * 0.66);

            // Mouse parallax depth shift
            pos.x += uMouse.x * uMouseParallax;
            pos.y += uMouse.y * uMouseParallax;

            // Scroll pull
            pos.z -= uScroll * uScrollPull;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (230.0 / -mvPosition.z);
            gl_Position  = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3  vColor;
          varying float vAlpha;
          uniform float uDarkMode;

          void main() {
            float d = distance(gl_PointCoord, vec2(0.5));
            if (d > 0.5) discard;
            float strength = pow(1.0 - d * 2.0, 2.5);

            // Dark mode: additive glow. Light mode: dark saturated pigment on white
            vec3  col   = mix(vColor * 0.55, vColor, uDarkMode);  // darken for light bg
            float alpha = mix(vAlpha * strength * 1.4,            // more opaque on light
                              vAlpha * strength * 0.85,           // soft glow on dark
                              uDarkMode);
            gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
          }
        `,
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      });

      this.nebulaClouds = new THREE.Points(geo, this.nebulaMat);
      this.scene.add(this.nebulaClouds);
    }

    // ─────────────────────────────────────────────────────────────
    //  2. TWINKLING HIGHLIGHT STARS
    // ─────────────────────────────────────────────────────────────
    _buildTwinkleStars() {
      const STAR_COUNT   = 900;
      const starPositions = new Float32Array(STAR_COUNT * 3);
      const starSizes     = new Float32Array(STAR_COUNT);
      const starOffsets   = new Float32Array(STAR_COUNT);
      const starColors    = new Float32Array(STAR_COUNT * 3);

      const palette = [
        new THREE.Color('#ffffff'), // Pure white
        new THREE.Color('#aae6ff'), // Soft hot blue
        new THREE.Color('#fff0b2'), // Soft warm yellow
        new THREE.Color('#ffc1f0'), // Soft pink highlight
      ];

      for (let i = 0; i < STAR_COUNT; i++) {
        starPositions[i * 3]     = (Math.random() - 0.5) * 170;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 170;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 110;

        starSizes[i]   = 0.5 + Math.random() * 1.5;
        starOffsets[i] = Math.random() * 100.0;

        const c = palette[Math.floor(Math.random() * palette.length)];
        starColors[i * 3]     = c.r;
        starColors[i * 3 + 1] = c.g;
        starColors[i * 3 + 2] = c.b;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      geo.setAttribute('size',     new THREE.BufferAttribute(starSizes,     1));
      geo.setAttribute('offset',   new THREE.BufferAttribute(starOffsets,   1));
      geo.setAttribute('color',    new THREE.BufferAttribute(starColors,    3));

      this.starMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime:         { value: 0 },
          uMouse:        { value: new THREE.Vector2(0, 0) },
          uTwinkleSpeed: { value: this.settings.twinkleSpeed },
          uStarDrift:    { value: this.settings.driftSpeed },
          uStarParallax: { value: this.settings.starParallax },
          uDarkMode:     { value: 1.0 },
        },
        vertexShader: `
          attribute float size;
          attribute float offset;
          attribute vec3  color;

          uniform float uTime;
          uniform vec2  uMouse;
          uniform float uTwinkleSpeed;
          uniform float uStarDrift;
          uniform float uStarParallax;

          varying float vTwinkle;
          varying vec3  vColor;

          void main() {
            vColor = color;
            vec3 pos = position;

            // Subtle drift
            pos.x += sin(uTime * uStarDrift + offset) * 0.5;
            pos.y += cos(uTime * (uStarDrift * 0.62) + offset) * 0.5;

            // Mouse parallax
            pos.x += uMouse.x * uStarParallax;
            pos.y += uMouse.y * uStarParallax;

            // Twinkle intensity
            vTwinkle = 0.2 + (sin(uTime * uTwinkleSpeed + offset) * 0.5 + 0.5) * 0.8;

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (170.0 / -mv.z);
            gl_Position  = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying float vTwinkle;
          varying vec3  vColor;
          uniform float uDarkMode;

          void main() {
            float d = distance(gl_PointCoord, vec2(0.5));
            if (d > 0.5) discard;
            float s = 1.0 - d * 2.0;

            // Dark mode: bright white sparkles. Light mode: tiny dark ink dots
            vec3  col   = mix(vColor * 0.2, vColor, uDarkMode);
            float alpha = s * vTwinkle * mix(0.55, 0.8, uDarkMode);
            gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
          }
        `,
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      });

      this.starField = new THREE.Points(geo, this.starMat);
      this.scene.add(this.starField);
    }

    // ─────────────────────────────────────────────────────────────
    //  THEME SWITCH
    // ─────────────────────────────────────────────────────────────
    /**
     * Switch between dark (additive glow) and light (normal pigment) rendering.
     * @param {boolean} isDark
     */
    setTheme(isDark) {
      this._isDark = isDark;
      const darkVal = isDark ? 1.0 : 0.0;

      // Flip the uniform so shaders adjust colour & alpha
      this.nebulaMat.uniforms.uDarkMode.value = darkVal;
      this.starMat.uniforms.uDarkMode.value   = darkVal;

      // Swap blending: Additive glows on dark, Normal renders visible on light
      this.nebulaMat.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      this.starMat.blending   = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;

      this.nebulaMat.needsUpdate = true;
      this.starMat.needsUpdate   = true;
    }


    // ─────────────────────────────────────────────────────────────
    //  FRAME UPDATE  – call once per animation frame
    // ─────────────────────────────────────────────────────────────
    /**
     * @param {number}  elapsed – clock.getElapsedTime()
     * @param {{x,y}}   mouse   – smoothed normalised mouse coords
     * @param {number}  scrollY – current window.scrollY
     */
    update(elapsed, mouse, scrollY) {
      const s = this.settings;

      // --- Nebula cloud ---
      this.nebulaMat.uniforms.uTime.value               = elapsed;
      this.nebulaMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
      this.nebulaMat.uniforms.uScroll.value             = scrollY;
      this.nebulaMat.uniforms.uSwirlSpeed.value         = s.swirlSpeed;
      this.nebulaMat.uniforms.uTurbulenceSpeed.value    = s.turbulenceSpeed;
      this.nebulaMat.uniforms.uTurbulenceStrength.value = s.turbulenceStrength;
      this.nebulaMat.uniforms.uMouseParallax.value      = s.mouseParallax;
      this.nebulaMat.uniforms.uScrollPull.value         = s.scrollPull;
      this.nebulaClouds.rotation.y = elapsed * s.rotationSpeed;

      // --- Twinkling stars ---
      this.starMat.uniforms.uTime.value          = elapsed;
      this.starMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
      this.starMat.uniforms.uTwinkleSpeed.value  = s.twinkleSpeed;
      this.starMat.uniforms.uStarDrift.value     = s.driftSpeed;
      this.starMat.uniforms.uStarParallax.value  = s.starParallax;
      this.starField.rotation.y = elapsed * s.starRotationSpeed;
    }
  }

  window.NebulaParticles = NebulaParticles;
})();
