/**
 * webgl-media.js — Project images rendered as WebGL planes
 * Sandun Rathnayake Portfolio
 *
 * Each .spatial-work-card__media box gets a plane in a transparent overlay
 * canvas that sits between the 3D scene and the page content. Planes follow
 * their DOM box every frame, bend with scroll speed, and ripple / split RGB
 * under the cursor. The DOM image stays as the fallback (no WebGL, reduced
 * motion, or texture still loading) and is only hidden once its plane is ready.
 */

(function () {
  'use strict';

  if (!window.THREE) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const VERT = `
    uniform float uVel;
    varying vec2 vUv;
    const float PI = 3.14159265;

    void main() {
      vUv = uv;
      vec3 p = position;
      // Centre leads, edges trail: the plane curls in the scroll direction
      p.y += sin(uv.x * PI) * uVel;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `;

  const FRAG = `
    uniform sampler2D uTex;
    uniform vec2 uRes;
    uniform vec2 uImg;
    uniform vec2 uMouse;
    uniform float uHover;
    uniform float uShift;
    uniform float uTime;
    uniform float uRadius;
    uniform float uReveal;
    uniform float uParallax;
    varying vec2 vUv;

    vec2 cover(vec2 uv) {
      float rp = uRes.x / uRes.y;
      float ri = uImg.x / uImg.y;
      vec2 s = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
      return (uv - 0.5) * s + 0.5;
    }

    void main() {
      vec2 uv = vUv;

      // Over-scan the image so it can drift inside its frame as the page scrolls
      uv = (uv - 0.5) / 1.14 + 0.5;
      uv.y += uParallax * 0.1;

      // Ease the image towards the cursor on hover
      uv = (uv - uMouse) * (1.0 - 0.07 * uHover) + uMouse;

      // Ripple rings spreading out from the cursor
      vec2 toMouse = (vUv - uMouse) * uRes / max(uRes.x, uRes.y);
      float d = length(toMouse);
      float ripple = sin(d * 38.0 - uTime * 3.2) * exp(-d * 5.0) * 0.007 * uHover;
      uv += normalize(toMouse + 1e-5) * ripple;

      vec2 c = cover(uv);
      float shift = uShift + uHover * 0.0035;
      vec3 col = vec3(
        texture2D(uTex, c + vec2(shift, 0.0)).r,
        texture2D(uTex, c).g,
        texture2D(uTex, c - vec2(shift, 0.0)).b
      );
      col *= mix(0.8, 1.04, uHover);

      // Rounded corners in pixels
      vec2 px = vUv * uRes;
      vec2 q = abs(px - uRes * 0.5) - (uRes * 0.5 - uRadius);
      float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
      float alpha = 1.0 - smoothstep(-1.0, 1.0, sd);

      // Wipe in from the bottom the first time the card is seen
      alpha *= 1.0 - smoothstep(uReveal - 0.08, uReveal, vUv.y);

      gl_FragColor = vec4(col, alpha);
    }
  `;

  function init() {
    const boxes = Array.from(document.querySelectorAll('.spatial-work-card'));
    if (!boxes.length) return;

    let renderer;
    const canvas = document.createElement('canvas');
    canvas.className = 'webgl-media';
    canvas.setAttribute('aria-hidden', 'true');
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch (err) {
      return; // DOM images stay visible
    }
    document.body.appendChild(canvas);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1000, 1000);
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    const loader = new THREE.TextureLoader();

    let W = 0;
    let H = 0;
    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      renderer.setSize(W, H, false);
      camera.left = -W / 2;
      camera.right = W / 2;
      camera.top = H / 2;
      camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    const items = boxes.map((card) => {
      const media = card.querySelector('.spatial-work-card__media');
      const bg = card.querySelector('.spatial-work-card__bg');
      const url = bg && (bg.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/) || [])[1];
      if (!media || !url) return null;

      const uniforms = {
        uTex: { value: null },
        uRes: { value: new THREE.Vector2(1, 1) },
        uImg: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uShift: { value: 0 },
        uVel: { value: 0 },
        uTime: { value: 0 },
        uRadius: { value: 14 },
        uReveal: { value: 0 },
        uParallax: { value: 0 },
      };
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      scene.add(mesh);

      const item = {
        card, media, mesh, uniforms,
        ready: false, hover: 0, hoverTarget: 0,
        mouse: new THREE.Vector2(0.5, 0.5),
        seen: false,
      };

      loader.load(url, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        uniforms.uTex.value = tex;
        uniforms.uImg.value.set(tex.image.width, tex.image.height);
        item.ready = true;
        card.classList.add('is-webgl');
      });

      card.addEventListener('mouseenter', () => { item.hoverTarget = 1; });
      card.addEventListener('mouseleave', () => { item.hoverTarget = 0; });
      card.addEventListener('mousemove', (e) => {
        const r = media.getBoundingClientRect();
        item.mouse.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      });
      // Keyboard focus gets the same treatment as hover
      card.addEventListener('focusin', () => { item.hoverTarget = 1; });
      card.addEventListener('focusout', () => { item.hoverTarget = 0; });

      return item;
    }).filter(Boolean);

    let lastSignature = '';
    let wasVisible = false;

    function frame(time) {
      const t = time * 0.001;
      const vel = Math.max(-60, Math.min(60, window.__scrollVelocity || 0));
      let anyVisible = false;
      // Anything that changes the picture; when it's unchanged, skip the redraw
      let signature = '';
      let animating = Math.abs(vel) > 0.05;

      for (const item of items) {
        if (!item.ready) continue;
        const r = item.media.getBoundingClientRect();
        const onScreen = r.bottom > -50 && r.top < H + 50 && r.width > 0;
        item.mesh.visible = onScreen;
        if (!onScreen) continue;
        anyVisible = true;

        if (!item.seen && r.top < H * 0.92) item.seen = true;

        // Zoom up from 84% as the image travels into view
        const enter = Math.min(1, Math.max(0, (H - r.top) / (H * 0.75)));
        const zoom = 0.84 + 0.16 * (1 - Math.pow(1 - enter, 3));
        const w = r.width * zoom;
        const h = r.height * zoom;
        item.mesh.scale.set(w, h, 1);
        item.mesh.position.set(r.left + r.width / 2 - W / 2, H / 2 - (r.top + r.height / 2), 0);

        item.hover += (item.hoverTarget - item.hover) * 0.08;
        const u = item.uniforms;
        u.uRes.value.set(w, h);
        u.uParallax.value = Math.max(-1, Math.min(1, (r.top + r.height / 2 - H / 2) / H));
        u.uMouse.value.lerp(item.mouse, 0.12);
        u.uHover.value = item.hover;
        u.uTime.value = t;
        // Bend is in unit-plane space; scale by height so tall and short planes curl alike
        u.uVel.value += ((-vel * 0.9) / h - u.uVel.value) * 0.15;
        u.uShift.value = Math.abs(vel) * 0.00045;
        u.uReveal.value += ((item.seen ? 1.08 : 0) - u.uReveal.value) * 0.05;

        signature += `${r.left | 0},${r.top | 0},${r.width | 0};`;
        if (item.hover > 0.002 || Math.abs(item.hoverTarget - item.hover) > 0.002) animating = true;
        if (item.seen && u.uReveal.value < 1.07) animating = true;
        if (Math.abs(u.uVel.value) > 0.0005) animating = true;
      }

      if (anyVisible) {
        if (animating || signature !== lastSignature) renderer.render(scene, camera);
      } else if (wasVisible) {
        renderer.clear();
      }
      lastSignature = signature;
      wasVisible = anyVisible;
    }

    if (window.__onFrame) window.__onFrame(frame);
    else (function loop(time) { frame(time); requestAnimationFrame(loop); })(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
