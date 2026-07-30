/**
 * particle-system.js — Lusion-Style 3D Curl Noise Flow Field (Red / Crimson Theme)
 *
 * Implements a high-performance 3D Curl-Noise particle flow field:
 *  - 35,000 glowing particles animated on GPU via 3D Simplex Curl Noise
 *  - Rich crimson/red background & warm neon red-coral particle stream
 *  - Responsive mouse repulsion / fluid ripple forces
 *  - High DPI scaling & theme support
 *
 * Sandun Rathnayake Portfolio
 */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var PARTICLE_COUNT = 35000;

  /* ═══════════════════════════════════════════════════════════════════
   *  VERTEX SHADER (GPU 3D Curl Noise)
   * ═══════════════════════════════════════════════════════════════════ */
  var PT_VERT = [
    'precision highp float;',
    'uniform float uTime;',
    'uniform float uDark;',
    'uniform vec2  uMouse;',
    'uniform float uPixelRatio;',
    'attribute float aSize;',
    'attribute float aSpeed;',
    'attribute vec3  aColor;',
    'varying vec3  vColor;',
    'varying float vAlpha;',

    // 3D Simplex Noise implementation
    'vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }',
    'vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }',
    'vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }',
    'vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }',

    'float snoise(vec3 v) {',
    '  const vec2 C = vec2(1.0/6.0, 1.0/3.0);',
    '  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);',
    '  vec3 i  = floor(v + dot(v, C.yyy));',
    '  vec3 x0 = v - i + dot(i, C.xxx);',
    '  vec3 g = step(x0.yzx, x0.xyz);',
    '  vec3 l = 1.0 - g;',
    '  vec3 i1 = min(g.xyz, l.zxy);',
    '  vec3 i2 = max(g.xyz, l.zxy);',
    '  vec3 x1 = x0 - i1 + C.xxx;',
    '  vec3 x2 = x0 - i2 + C.yyy;',
    '  vec3 x3 = x0 - D.yyy;',
    '  i = mod289(i);',
    '  vec4 p = permute(permute(permute(',
    '            i.z + vec4(0.0, i1.z, i2.z, 1.0))',
    '          + i.y + vec4(0.0, i1.y, i2.y, 1.0))',
    '          + i.x + vec4(0.0, i1.x, i2.x, 1.0));',
    '  float n_ = 0.142857142857;',
    '  vec3 ns = n_ * D.wyz - D.xzx;',
    '  vec4 j = p - 49.0 * floor(p * ns.z);',
    '  vec4 x_ = floor(j * ns.z);',
    '  vec4 y_ = floor(j - 7.0 * x_);',
    '  vec4 x = x_ * ns.x + ns.yyyy;',
    '  vec4 y = y_ * ns.x + ns.yyyy;',
    '  vec4 h = 1.0 - abs(x) - abs(y);',
    '  vec4 b0 = vec4(x.xy, y.xy);',
    '  vec4 b1 = vec4(x.zw, y.zw);',
    '  vec4 s0 = floor(b0)*2.0 + 1.0;',
    '  vec4 s1 = floor(b1)*2.0 + 1.0;',
    '  vec4 sh = -step(h, vec4(0.0));',
    '  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;',
    '  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;',
    '  vec3 p0 = vec3(a0.xy, h.x);',
    '  vec3 p1 = vec3(a0.zw, h.y);',
    '  vec3 p2 = vec3(a1.xy, h.z);',
    '  vec3 p3 = vec3(a1.zw, h.w);',
    '  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));',
    '  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;',
    '  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);',
    '  m = m * m;',
    '  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));',
    '}',

    'vec3 curlNoise(vec3 p) {',
    '  float e = 0.1;',
    '  float n1 = snoise(vec3(p.x, p.y + e, p.z));',
    '  float n2 = snoise(vec3(p.x, p.y - e, p.z));',
    '  float dFdy = (n1 - n2) / (2.0 * e);',
    '  n1 = snoise(vec3(p.x, p.y, p.z + e));',
    '  n2 = snoise(vec3(p.x, p.y, p.z - e));',
    '  float dFdz = (n1 - n2) / (2.0 * e);',
    '  n1 = snoise(vec3(p.x + e, p.y, p.z));',
    '  n2 = snoise(vec3(p.x - e, p.y, p.z));',
    '  float dFdx = (n1 - n2) / (2.0 * e);',
    '  return vec3(dFdy - dFdz, dFdz - dFdx, dFdx - dFdy);',
    '}',

    'void main() {',
    '  vec3 p = position;',
    '  float t = uTime * 0.08 * aSpeed;',
    '  vec3 flow1 = curlNoise(p * 0.05 + vec3(t, t * 0.7, t * 0.5)) * 7.5;',
    '  vec3 flow2 = curlNoise(p * 0.12 - vec3(t * 0.8, t * 0.4, t * 0.6)) * 3.0;',
    '  vec3 finalPos = p + flow1 + flow2;',

    '  // Mouse repulsion field in 3D space',
    '  vec3 mouseWorld = vec3(uMouse.x * 20.0, uMouse.y * 12.0, 0.0);',
    '  vec3 dirToMouse = finalPos - mouseWorld;',
    '  float distToMouse = length(dirToMouse);',
    '  if (distToMouse < 15.0) {',
    '    float force = (15.0 - distToMouse) / 15.0;',
    '    finalPos += normalize(dirToMouse + vec3(0.001)) * force * 6.5;',
    '  }',

    '  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);',
    '  gl_Position = projectionMatrix * mvPosition;',

    '  // Point size attenuation with High DPI ratio',
    '  float pointSize = aSize * (280.0 / -mvPosition.z) * uPixelRatio;',
    '  gl_PointSize = clamp(pointSize, 2.0, 64.0);',

    '  // Red/Crimson Color palette interpolation',
    '  vec3 darkCol = mix(aColor, vec3(1.0, 0.35, 0.2), sin(uTime * 0.5 + p.x * 0.1) * 0.4 + 0.4);',
    '  vec3 lightCol = mix(vec3(0.45, 0.1, 0.12), vec3(0.65, 0.12, 0.28), aColor.r);',
    '  vColor = mix(lightCol, darkCol, uDark);',

    '  vAlpha = (0.55 + 0.45 * sin(uTime * aSpeed * 1.5 + p.y));',
    '}'
  ].join('\n');

  /* ═══════════════════════════════════════════════════════════════════
   *  FRAGMENT SHADER (Glowing Point Sprite)
   * ═══════════════════════════════════════════════════════════════════ */
  var PT_FRAG = [
    'precision highp float;',
    'varying vec3 vColor;',
    'varying float vAlpha;',
    'uniform float uDark;',

    'void main() {',
    '  vec2 coord = gl_PointCoord - vec2(0.5);',
    '  float dist = length(coord);',
    '  if (dist > 0.5) discard;',

    '  // Soft radial glow halo',
    '  float glow = smoothstep(0.5, 0.0, dist);',
    '  glow = pow(glow, 1.2);',

    '  // Bright core',
    '  float core = smoothstep(0.2, 0.0, dist);',
    '  vec3 finalColor = mix(vColor, vec3(1.0, 0.9, 0.8), core * 0.8 * uDark);',

    '  float alpha = vAlpha * glow;',
    '  gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));',
    '}'
  ].join('\n');

  /* ═══════════════════════════════════════════════════════════════════
   *  CinematicParticleSystem Class
   * ═══════════════════════════════════════════════════════════════════ */
  function CinematicParticleSystem(scene, camera, renderer) {
    this.scene     = scene;
    this.camera    = camera;
    this.renderer  = renderer;
    this._ready    = false;
    this._isDark   = document.body.getAttribute('data-theme') !== 'light';
    this._mouse    = new THREE.Vector2(0, 0);
    this._mouseTgt = new THREE.Vector2(0, 0);

    try {
      this._build();
      this._ready = true;
    } catch (e) {
      console.error('[CPS] Build error:', e);
    }

    var self = this;
    setTimeout(function () {
      self.setTheme(self._isDark);
    }, 100);

    window.addEventListener('mousemove', function (e) {
      self._mouseTgt.x =  (e.clientX / window.innerWidth  - 0.5) * 2.0;
      self._mouseTgt.y = -(e.clientY / window.innerHeight - 0.5) * 2.0;
    }, { passive: true });
  }

  CinematicParticleSystem.prototype._build = function () {
    var positions = new Float32Array(PARTICLE_COUNT * 3);
    var sizes     = new Float32Array(PARTICLE_COUNT);
    var speeds    = new Float32Array(PARTICLE_COUNT);
    var colors    = new Float32Array(PARTICLE_COUNT * 3);

    // Red / Crimson / Coral / Ruby palette
    var palette = [
      new THREE.Color(0xff0044), // Crimson Red
      new THREE.Color(0xff1a1a), // Neon Red
      new THREE.Color(0xff5500), // Flame Coral
      new THREE.Color(0xd90429), // Carmine Ruby
      new THREE.Color(0xff8800), // Warm Orange-Red Accent
    ];

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var i3 = i * 3;
      var u = Math.random();
      var v = Math.random();
      var theta = u * 2.0 * Math.PI;
      var phi = Math.acos(2.0 * v - 1.0);
      var r = 4.0 + Math.pow(Math.random(), 0.5) * 26.0;

      positions[i3]     = r * Math.sin(phi) * Math.cos(theta) * 1.4;
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.9;
      positions[i3 + 2] = r * Math.cos(phi) * 0.8;

      sizes[i]  = 1.2 + Math.random() * 2.2;
      speeds[i] = 0.5 + Math.random() * 1.0;

      var col = palette[Math.floor(Math.random() * palette.length)];
      colors[i3]     = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aSpeed',   new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3));

    var pr = this.renderer ? this.renderer.getPixelRatio() : 1.0;

    this._material = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uDark:       { value: this._isDark ? 1.0 : 0.0 },
        uMouse:      { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: pr },
      },
      vertexShader:   PT_VERT,
      fragmentShader: PT_FRAG,
      transparent:    true,
      depthWrite:     false,
      blending:       THREE.AdditiveBlending,
    });

    this._points = new THREE.Points(geometry, this._material);
    this._points.frustumCulled = false;
    this.scene.add(this._points);

    // Red/Crimson dark background (0x120206)
    var bgHex = this._isDark ? 0x120206 : 0xfcf4f4;
    this.scene.background = new THREE.Color(bgHex);
    this.renderer.setClearColor(bgHex, 1);
  };

  CinematicParticleSystem.prototype.setTheme = function (isDark) {
    if (!this._ready) return;
    this._isDark = isDark;
    var darkVal = isDark ? 1.0 : 0.0;
    var bgHex   = isDark ? 0x120206 : 0xfcf4f4;

    if (this._material) {
      this._material.uniforms.uDark.value = darkVal;
      this._material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      this._material.needsUpdate = true;
    }

    var bgColor = new THREE.Color(bgHex);
    this.scene.background = bgColor;
    this.renderer.setClearColor(bgHex, 1);
  };

  CinematicParticleSystem.prototype.resize = function () {
    if (this._material && this.renderer) {
      this._material.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
    }
  };

  CinematicParticleSystem.prototype.update = function (time, delta) {
    if (!this._ready) return;

    this._mouse.x += (this._mouseTgt.x - this._mouse.x) * 0.05;
    this._mouse.y += (this._mouseTgt.y - this._mouse.y) * 0.05;

    if (this._material) {
      this._material.uniforms.uTime.value = time;
      this._material.uniforms.uMouse.value.copy(this._mouse);
    }

    if (this._points) {
      this._points.rotation.y = time * 0.025;
      this._points.rotation.x = Math.sin(time * 0.015) * 0.08;
    }
  };

  CinematicParticleSystem.prototype.dispose = function () {
    if (this._points) {
      this._points.geometry.dispose();
      this._points.material.dispose();
    }
  };

  window.CinematicParticleSystem = CinematicParticleSystem;
})();
