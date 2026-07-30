/**
 * career-cloth.js — Three.js Cloth Physics for Career Cards
 *
 * Each experience card floats in from the right like a piece of
 * fabric being draped onto a surface:
 *   - Starts folded edge-on (rotated 90° around Y-axis), far to the right
 *   - Cloth waves organically while floating (wind simulation)
 *   - As it lands: bottom drags behind the top (gravity / surface drag)
 *   - Unfolds flat as it arrives at the card position
 *   - Subtle idle shimmer persists after settling (fabric breathing)
 *   - HTML card content fades in once cloth is ~90% settled
 *
 * Sandun Rathnayake Portfolio
 */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  /* ══════════════════════════════════════════════════════════════════
   *  VERTEX SHADER — cloth physics
   * ══════════════════════════════════════════════════════════════════ */
  var VERT = [
    'uniform float uTime;',
    'uniform float uProgress;',
    'uniform float uOffsetX;',
    'varying vec2  vUv;',
    'varying float vWave;',
    'void main() {',
    '  vUv = uv;',
    '  vec3 pos = position;',
    '  float unsettle = 1.0 - uProgress;',
    '  float t = uTime;',
    '  float w1 = sin(uv.x*5.2+t*1.9)*cos(uv.y*3.1+t*1.3);',
    '  float w2 = sin(uv.x*9.5-t*2.4)*sin(uv.y*5.7+t*0.85);',
    '  float w3 = cos(uv.x*3.3+uv.y*4.1+t*1.6)*0.5;',
    '  float idle = sin(t*0.65+uv.x*2.5+uv.y*1.8)*0.035;',
    '  float wave = (w1*0.5+w2*0.35+w3*0.15)*unsettle+idle;',
    '  vWave = wave;',
    '  pos.z += wave*26.0;',
    '  float lag = pow(1.0-uv.y,1.8)*unsettle;',
    '  pos.y -= lag*45.0;',
    '  float angle = unsettle*1.5707963;',
    '  float ca = cos(angle); float sa = sin(angle);',
    '  float rx = pos.x*ca - pos.z*sa;',
    '  float rz = pos.x*sa + pos.z*ca;',
    '  pos.x = rx; pos.z = rz;',
    '  pos.x += uOffsetX*unsettle;',
    '  gl_Position = projectionMatrix*modelViewMatrix*vec4(pos,1.0);',
    '}'
  ].join('\n');

  /* ══════════════════════════════════════════════════════════════════
   *  FRAGMENT SHADER — card surface + border + accent bar
   * ══════════════════════════════════════════════════════════════════ */
  var FRAG = [
    'uniform float uProgress;',
    'uniform vec3  uColor;',
    'uniform vec3  uAccent;',
    'varying vec2  vUv;',
    'varying float vWave;',
    'void main() {',
    '  vec3 col = uColor;',
    '  col += vWave*0.09;',
    '  float topBar = step(0.966,vUv.y);',
    '  col = mix(col,uAccent,topBar*0.88);',
    '  float ex = min(vUv.x,1.0-vUv.x);',
    '  float ey = min(vUv.y,1.0-vUv.y);',
    '  float edgeDist = min(ex,ey);',
    '  float border = 1.0-smoothstep(0.0,0.016,edgeDist);',
    '  col = mix(col,uAccent*0.5,border*0.7);',
    '  float edgeFade = smoothstep(0.0,0.03,edgeDist);',
    '  float alpha = uProgress*mix(0.86,0.94,edgeFade);',
    '  gl_FragColor = vec4(clamp(col,0.0,1.0),clamp(alpha,0.0,1.0));',
    '}'
  ].join('\n');

  /* ══════════════════════════════════════════════════════════════════
   *  CareerCloth — main controller
   * ══════════════════════════════════════════════════════════════════ */
  function CareerCloth() {
    this.section = document.getElementById('experience');
    if (!this.section) return;
    this.cards = Array.from(this.section.querySelectorAll('.exp-card'));
    if (!this.cards.length) return;

    this.cloths    = [];
    this.clock     = new THREE.Clock();
    this.triggered = false;
    this.triggerT  = 0;

    this._buildCanvas();
    this._buildScene();

    var self = this;
    requestAnimationFrame(function () {
      setTimeout(function () {
        self._buildCloths();
        self._observe();
      }, 100);
    });

    this._loop();
    window.addEventListener('resize', function () { self._onResize(); });
  }

  CareerCloth.prototype._buildCanvas = function () {
    this.canvas = document.createElement('canvas');
    var s = this.canvas.style;
    s.position = 'absolute'; s.top = '0'; s.left = '0';
    s.width = '100%'; s.height = '100%';
    s.pointerEvents = 'none'; s.zIndex = '0';
    this.section.style.position = 'relative';
    this.section.insertBefore(this.canvas, this.section.firstChild);
    var wrap = this.section.querySelector('.experience__cards');
    if (wrap) { wrap.style.position = 'relative'; wrap.style.zIndex = '1'; }
    var edu = this.section.querySelector('.experience__education');
    if (edu) { edu.style.position = 'relative'; edu.style.zIndex = '1'; }
  };

  CareerCloth.prototype._buildScene = function () {
    var sz = this._secSize(), w = sz.w, h = sz.h;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.setClearColor(0x000000, 0);
    this.camera = new THREE.OrthographicCamera(-w/2, w/2, h/2, -h/2, 1, 2000);
    this.camera.position.z = 500;
    this.scene = new THREE.Scene();
  };

  CareerCloth.prototype._buildCloths = function () {
    var isDark    = document.body.getAttribute('data-theme') !== 'light';
    var cardCol   = new THREE.Color(isDark ? '#0c0c0c' : '#f0eeea');
    var accentCol = new THREE.Color(isDark ? '#c8ff00' : '#5a00ff');
    var sW = this.section.offsetWidth;
    var self = this;

    this.cards.forEach(function (card, i) {
      var r = self._cardRect(card);
      if (!r.w || !r.h) return;

      var geo = new THREE.PlaneGeometry(r.w, r.h, 50, 30);
      var mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime:     { value: 0 },
          uProgress: { value: 0 },
          uOffsetX:  { value: sW * 1.15 },
          uColor:    { value: cardCol.clone() },
          uAccent:   { value: accentCol.clone() }
        },
        vertexShader:   VERT,
        fragmentShader: FRAG,
        transparent:    true,
        depthWrite:     false,
        side:           THREE.DoubleSide
      });

      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(r.x, r.y, 0);
      self.scene.add(mesh);
      self.cloths.push({ mesh: mesh, mat: mat, index: i,
                         progress: 0, target: 0, delay: i * 0.22, revealed: false });
    });
  };

  CareerCloth.prototype._observe = function () {
    var self = this;
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !self.triggered) {
        self.triggered = true;
        self.triggerT  = self.clock.getElapsedTime();
        self.cloths.forEach(function (c) { c.target = 1; });
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(this.section);
  };

  CareerCloth.prototype._loop = function () {
    var self = this;
    requestAnimationFrame(function () { self._loop(); });
    var t = this.clock.getElapsedTime();
    this.cloths.forEach(function (c) {
      c.mat.uniforms.uTime.value = t;
      if (self.triggered) {
        var elapsed = t - self.triggerT - c.delay;
        if (elapsed > 0) {
          c.progress += (c.target - c.progress) * 0.032;
          c.mat.uniforms.uProgress.value = c.progress;
          if (!c.revealed && c.progress > 0.90) {
            c.revealed = true;
            if (self.cards[c.index]) self.cards[c.index].classList.add('cloth-settled');
          }
        }
      }
    });
    this.renderer.render(this.scene, this.camera);
  };

  CareerCloth.prototype._onResize = function () {
    var sz = this._secSize(), w = sz.w, h = sz.h;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.left = -w/2; this.camera.right  =  w/2;
    this.camera.top  =  h/2; this.camera.bottom = -h/2;
    this.camera.updateProjectionMatrix();
    var self = this;
    this.cloths.forEach(function (c, i) {
      var r = self._cardRect(self.cards[i]);
      if (r.w) { c.mesh.position.set(r.x, r.y, 0); c.mat.uniforms.uOffsetX.value = w * 1.15; }
    });
  };

  CareerCloth.prototype._secSize = function () {
    return { w: this.section.offsetWidth || window.innerWidth,
             h: this.section.offsetHeight || 600 };
  };

  CareerCloth.prototype._cardRect = function (card) {
    if (!card) return { x: 0, y: 0, w: 0, h: 0 };
    var sr = this.section.getBoundingClientRect();
    var cr = card.getBoundingClientRect();
    var sW = this.section.offsetWidth;
    var sH = this.section.offsetHeight;
    var x =  (cr.left - sr.left) + cr.width  / 2 - sW / 2;
    var y = -((cr.top  - sr.top)  + cr.height / 2 - sH / 2);
    return { x: x, y: y, w: cr.width, h: cr.height };
  };

  function init() { new CareerCloth(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
