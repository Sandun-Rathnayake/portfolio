/**
 * three-scene.js — CINEMATIC SOLAR ECLIPSE + BAIT BALL  [Config-driven]
 * All physics/visual parameters live in CFG — the control panel can mutate it.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── renderer ── */
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: false, alpha: false, powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 1);

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.Fog(0x060c24, 2.0, 50.0);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
  camera.position.z = 42;

  /* ══════════════════════════════════════════════════════════════
     LIVE CONFIG — every knob the control panel can change
  ══════════════════════════════════════════════════════════════ */
  const CFG = {
    /* ── sphere / corona ── */
    sphereR:      2.4,
    shieldR:      6.2,
    lightR:       23.0,
    pulseSpeed:   0.65,
    pulseAmt:     0.075,
    coronaScale:  .95,        // Corona overall size scale
    coronaGlow:   3.0,        // Corona glow opacity
    coronaRim:    3.0,        // Eclipse rim ring intensity

    /* ── rectangles ── */
    particleCount: 20000,      // 500–5000 (requires rebuildCount)
    minLen:        0.60,
    maxLen:        7.5,
    minWid:        0.066,
    maxWid:        0.120,
    stripFlex:     1.0,        // Snake-like bending flexibility (0.0=rigid, 1.0=curved, 2.0=snake)

    /* ── flow physics ── */
    upward:        0.0078,
    damping:       0.865,
    swirlK:        0.027,
    noiseF:        0.0180,
    noiseS:        0.048,
    noiseT:        0.09,
    alignK:        0.012,
    cohereK:       0.018,
    shieldK:       0.52,
    slowZone:      3.5,

    /* ── 3D Spreading & Depth (X, Y, Z) ── */
    xSpread:       90.0,      // X width range
    ySpread:       52.0,      // Y height range
    zSpread:       9.0,      // Z depth range
    zBias:        -0.80,      // Depth bias: negative = more particles at the BACK, fewer in FRONT

    /* ── lighting ── */
    briBoost:      0.5,
    falloffPow:    5.0,       // 1=linear 2=sqr 3=cubic 4=quartic
    colorWarm:     0.0,       // 0=cool blue 1=warm white

    /* ── atmospheric fog & background colors ── */
    fogEnable:     1,          // 1 = Enabled, 0 = Disabled
    fogDensity:    0.50,       // Fog intensity (0.0 to 3.0)
    fogNear:       2.0,        // Depth behind sphere where fog starts
    fogFar:        25.0,       // Depth behind sphere for max fog
    fogColor:      '#0b009e',  // Fog color (customizable from control panel)
    bgColor:       '#040714',  // Full screen background color (customizable)
  };

  /* ══════════════════════════════════════════════════════════════
     NOISE
  ══════════════════════════════════════════════════════════════ */
  function hash21(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }
  function vnoise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    return hash21(ix,iy) + (hash21(ix+1,iy)-hash21(ix,iy))*ux
         + (hash21(ix,iy+1)-hash21(ix,iy))*uy
         + (hash21(ix+1,iy+1)-hash21(ix+1,iy)-hash21(ix,iy+1)+hash21(ix,iy))*ux*uy;
  }
  function curl2(x, y, t) {
    const e = 0.08;
    const n0 = vnoise(x, y+t), nx = vnoise(x+e, y+t), ny = vnoise(x, y+e+t);
    return { cx: (ny-n0)/e, cy: -(nx-n0)/e };
  }

  /* ══════════════════════════════════════════════════════════════
     CORONA / ECLIPSE SPHERE
     ─────────────────────────────────────────────────────────────
     makeEclipseTex: single gradient from centre (r=0) to edge (r=1).
     Stops MUST start transparent — this is what creates the dark
     black centre that makes it look like an eclipse, not a sun.
     The black sphere mesh (renderOrder=10) hides the centre too,
     but the texture itself must already be dark there so the seam
     is invisible and the rim glow is only at the sphere edge.
  ══════════════════════════════════════════════════════════════ */
  function makeEclipseTex(res, stops) {
    const c = document.createElement('canvas');
    c.width = c.height = res;
    const ctx = c.getContext('2d');
    const half = res / 2;
    ctx.clearRect(0, 0, res, res);               // fully transparent background
    const g = ctx.createRadialGradient(half, half, 0, half, half, half);
    stops.forEach(([t, col]) => g.addColorStop(Math.max(0, Math.min(1, t)), col));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, res, res);
    return new THREE.CanvasTexture(c);
  }

  /* ── Directional Rim Texture for Top-Left (-135°) & Bottom-Right (45°) Crescent Shine ── */
  function makeAsymmetricRimTex(res, stops) {
    const c = document.createElement('canvas');
    c.width = c.height = res;
    const ctx = c.getContext('2d');
    const half = res / 2;
    ctx.clearRect(0, 0, res, res);

    const g = ctx.createRadialGradient(half, half, 0, half, half, half);
    stops.forEach(([t, col]) => g.addColorStop(Math.max(0, Math.min(1, t)), col));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, res, res);

    /* Crescent directional mask: Top-Left (-135°) and Bottom-Right (45°) */
    const imgData = ctx.getImageData(0, 0, res, res);
    const data = imgData.data;

    for (let y = 0; y < res; y++) {
      const dy = y - half;
      for (let x = 0; x < res; x++) {
        const dx = x - half;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 0) {
          const theta = Math.atan2(dy, dx);
          // Angle -135° (Top-Left) & 45° (Bottom-Right) crescent arc
          const angleFactor = Math.pow(Math.abs(Math.cos(theta - (-2.35619))), 2.2);

          const idx = (y * res + x) * 4;
          data[idx + 3] = Math.floor(data[idx + 3] * angleFactor);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return new THREE.CanvasTexture(c);
  }

  const coronaGroup = new THREE.Group();
  scene.add(coronaGroup);

  const SR = CFG.sphereR; // 2.4

  function addCoronaLayer(planeHalf, stops, order, isAsymmetric) {
    const tex = isAsymmetric ? makeAsymmetricRimTex(1024, stops) : makeEclipseTex(1024, stops);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(planeHalf * 2, planeHalf * 2),
      new THREE.MeshBasicMaterial({
        map: tex, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
      })
    );
    m.renderOrder = order;
    coronaGroup.add(m);
    return m;
  }

  const PH0 = SR * 3.2, SF0 = 1 / 3.2;  // Thin bright white-cyan rim
  const PH1 = SR * 7.5, SF1 = 1 / 7.5;  // Inner soft blue bloom
  const PH2 = SR * 18.0, SF2 = 1 / 18.0; // Outer atmosphere haze

  const coronaMeshes = [
    /* 0 — Tight bright white-cyan crescent rim ring (Top-Left & Bottom-Right) */
    addCoronaLayer(PH0, [
      [0.00,           'rgba(  0,  0,  0, 0.00)'],
      [SF0 * 0.88,     'rgba(  0,  0,  0, 0.00)'],
      [SF0 * 0.96,     'rgba(215,240,255, 0.40)'],
      [SF0,            'rgba(255,255,255, 1.00)'],  // ← BRIGHT pure white crescent rim at sphere edge
      [SF0 * 1.08,     'rgba(195,230,255, 0.82)'],
      [SF0 * 1.25,     'rgba(145,200,255, 0.50)'],
      [SF0 * 1.55,     'rgba( 85,160,255, 0.22)'],
      [SF0 * 2.20,     'rgba( 40,110,230, 0.06)'],
      [1.00,           'rgba(  0,  0,  0, 0.00)'],
    ], 4, true),

    /* 1 — Inner soft violet-blue crescent bloom (Top-Left & Bottom-Right) */
    addCoronaLayer(PH1, [
      [0.00,           'rgba(  0,  0,  0, 0.00)'],
      [SF1 * 0.88,     'rgba(  0,  0,  0, 0.00)'],
      [SF1,            'rgba(165,200,255, 0.45)'],
      [SF1 * 1.35,     'rgba(125,170,255, 0.28)'],
      [SF1 * 2.00,     'rgba( 75,130,240, 0.12)'],
      [SF1 * 3.20,     'rgba( 35, 80,200, 0.04)'],
      [1.00,           'rgba(  0,  0,  0, 0.00)'],
    ], 3, true),

    /* 2 — Outer atmosphere haze */
    addCoronaLayer(PH2, [
      [0.00,           'rgba(  0,  0,  0, 0.00)'],
      [SF2 * 0.85,     'rgba(  0,  0,  0, 0.00)'],
      [SF2,            'rgba(110,150,240, 0.18)'],
      [SF2 * 2.0,      'rgba( 45, 90,200, 0.08)'],
      [SF2 * 4.0,      'rgba( 18, 45,140, 0.02)'],
      [1.00,           'rgba(  0,  0,  0, 0.00)'],
    ], 2, false),
  ];

  /* ── 2. DARK NAVY SPHERE WITH RADIAL GRADIENT & FRESNEL ── */
  const sphereMat = new THREE.ShaderMaterial({
    uniforms: {
      uCameraPos: { value: camera.position },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec3 vViewPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vec4 mvPosition = viewMatrix * worldPos;
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec3 vViewPosition;

      void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vViewPosition);

        // 1. Radial Gradient (#060B2A center -> #101E50 edge) exactly like the image!
        float rFrac = length(vWorldPos.xy) / 2.4;
        vec3 centerColor = vec3(0.024, 0.043, 0.165); // #060B2A dark navy center
        vec3 edgeColor   = vec3(0.063, 0.118, 0.314); // #101E50 edge navy
        vec3 baseColor   = mix(centerColor, edgeColor, clamp(rFrac * rFrac, 0.0, 1.0));

        // 2. Subtle White-Blue Fresnel Rim (#F0F6FF, power 4.5, intensity 0.16)
        float NdotV = max(0.0, dot(N, V));
        float fresnel = pow(1.0 - NdotV, 4.5);
        vec3 fresnelColor = vec3(0.94, 0.96, 1.0) * fresnel * 0.16;

        vec3 finalColor = baseColor + fresnelColor;
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.FrontSide,
  });

  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(SR, 128, 128),
    sphereMat
  );
  sphereMesh.renderOrder = 10;
  scene.add(sphereMesh);


  /* ══════════════════════════════════════════════════════════════
     RECTANGLE SWARM — filled quads, up to MAX_P particles
  ══════════════════════════════════════════════════════════════ */
  const MAX_P = 35000;
  const VPR   = 24; // verts per strip (4 quad segments = 8 triangles = 24 verts)

  const posArr  = new Float32Array(MAX_P * VPR * 3);
  const colArr  = new Float32Array(MAX_P * VPR * 3);
  const normArr = new Float32Array(MAX_P * VPR * 3);

  const rectGeo = new THREE.BufferGeometry();
  rectGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3).setUsage(THREE.DynamicDrawUsage));
  rectGeo.setAttribute('color',    new THREE.BufferAttribute(colArr, 3).setUsage(THREE.DynamicDrawUsage));
  rectGeo.setAttribute('normal',   new THREE.BufferAttribute(normArr, 3).setUsage(THREE.DynamicDrawUsage));

  /* ── SOLID METALLIC SHADER MATERIAL ───────────────────────────────
     Solid (transparent: false, depthWrite: true) metallic shader
     with specular reflection from central eclipse and Fresnel rim shine. */
  const rectMat = new THREE.ShaderMaterial({
    uniforms: {
      uLightPos:   { value: new THREE.Vector3(0, 0, 0) },
      uCameraPos:  { value: camera.position },
      uFogEnable:  { value: CFG.fogEnable  !== undefined ? CFG.fogEnable  : 1.0 },
      uFogNear:    { value: CFG.fogNear    || 2.0 },
      uFogFar:     { value: CFG.fogFar     || 25.0 },
      uFogDensity: { value: CFG.fogDensity || 0.80 },
      uFogColor:   { value: new THREE.Color(CFG.fogColor || '#0e1b40') },
    },
    vertexShader: `
      attribute vec3 color;
      varying vec3 vColor;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      void main() {
        vColor = color;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      uniform vec3 uLightPos;
      uniform vec3 uCameraPos;
      uniform float uFogEnable;
      uniform float uFogNear;
      uniform float uFogFar;
      uniform float uFogDensity;
      uniform vec3 uFogColor;

      void main() {
        vec3 N = normalize(vNormal);
        if (!gl_FrontFacing) N = -N;

        vec3 V = normalize(uCameraPos - vWorldPos);
        vec3 L = normalize(uLightPos - vWorldPos);
        vec3 H = normalize(L + V);

        // Overall light intensity from distance falloff (vColor)
        float lightIntensity = max(vColor.r, max(vColor.g, vColor.b));
        float atten = smoothstep(0.001, 0.06, lightIntensity);

        vec3 ambientMetal = vColor * 0.35;
        float NdotL = max(dot(N, L), 0.0);
        vec3 diffuseMetal = vColor * (0.35 + 0.65 * NdotL);

        float NdotH = max(dot(N, H), 0.0);
        float spec = pow(NdotH, 36.0);
        vec3 specColor = vec3(1.0, 0.96, 0.92) * spec * 2.2 * lightIntensity;

        float NdotV = max(dot(N, V), 0.0);
        float fresnel = pow(1.0 - NdotV, 3.5);
        vec3 fresnelColor = mix(vColor, vec3(0.85, 0.92, 1.0), 0.75) * fresnel * 1.0;

        vec3 finalColor = (ambientMetal + diffuseMetal + specColor + fresnelColor) * atten;

        // ── LIGHT-ILLUMINATED ATMOSPHERIC FOG ──
        if (uFogEnable > 0.5) {
          float depthBehind = max(0.0, -vWorldPos.z + 1.0);
          float dFactor = depthBehind / max(0.1, uFogFar);
          float expFog = 1.0 - exp(-2.5 * uFogDensity * dFactor * dFactor);

          // Distance from central solar eclipse light source
          float rDist = length(vWorldPos.xyz);
          float lightScatter = exp(-0.07 * rDist) * (0.3 + 0.7 * lightIntensity);

          vec3 darkSpaceFog    = uFogColor * 0.45;
          vec3 shiningLightFog = mix(uFogColor * 1.8, vec3(0.85, 0.94, 1.0), 0.45); // Glowing light!

          vec3 activeFogColor = mix(darkSpaceFog, shiningLightFog, clamp(lightScatter * 1.6, 0.0, 1.0));
          float fogAmount     = clamp(expFog, 0.0, 0.90);

          finalColor = mix(finalColor, activeFogColor, fogAmount);
        }

        // 100% SOLID OPAQUE (no transparency)
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.DoubleSide,
    transparent: false,
    depthWrite: true,
    depthTest: true,
  });

  const rectMesh = new THREE.Mesh(rectGeo, rectMat);
  rectMesh.renderOrder = 1;
  rectMesh.frustumCulled = false;
  scene.add(rectMesh);

  /* ── Background Volumetric Light-Illuminated Fog Plane ── */
  const bgFogMat = new THREE.ShaderMaterial({
    uniforms: {
      uFogEnable:     { value: CFG.fogEnable  !== undefined ? CFG.fogEnable  : 1.0 },
      uFogDensity:    { value: CFG.fogDensity || 0.80 },
      uFogColor:      { value: new THREE.Color(CFG.fogColor || '#0e1b40') },
      uPulse:         { value: 1.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      uniform float uFogEnable;
      uniform float uFogDensity;
      uniform vec3 uFogColor;
      uniform float uPulse;

      void main() {
        if (uFogEnable < 0.5) discard;

        // Distance from central eclipse light core
        float rDist = length(vWorldPos.xy);
        
        // Volumetric light scattering beam from central eclipse
        float lightScatter = exp(-0.045 * rDist) * uPulse;
        float outerHaze    = exp(-0.012 * rDist);

        vec3 darkVoidFog      = uFogColor * 0.35;
        vec3 brightShiningFog = mix(uFogColor * 2.0, vec3(0.88, 0.95, 1.0), 0.50);

        vec3 finalFogColor = mix(darkVoidFog, brightShiningFog, clamp(lightScatter * 1.5, 0.0, 1.0));
        float alpha   = clamp((outerHaze * 0.35 + lightScatter * 0.65) * uFogDensity, 0.0, 0.88);

        gl_FragColor = vec4(finalFogColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });

  const bgFogMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 160),
    bgFogMat
  );
  bgFogMesh.position.z = -30.0;
  bgFogMesh.renderOrder = 0;
  scene.add(bgFogMesh);

  /* Per-particle state (allocated for MAX_P) */
  const px    = new Float32Array(MAX_P);
  const py    = new Float32Array(MAX_P);
  const pz    = new Float32Array(MAX_P);
  const pvx   = new Float32Array(MAX_P);
  const pvy   = new Float32Array(MAX_P);
  const pvz   = new Float32Array(MAX_P);
  const pLen  = new Float32Array(MAX_P);
  const pWid  = new Float32Array(MAX_P);
  const pSeed = new Float32Array(MAX_P);
  /* smoothed velocity & orientation direction per particle (for 0 shaking + 4-joint snake bending) */
  const svx   = new Float32Array(MAX_P);
  const svy   = new Float32Array(MAX_P);
  const pdx   = new Float32Array(MAX_P);
  const pdy   = new Float32Array(MAX_P);
  const ptx   = new Float32Array(MAX_P);
  const pty   = new Float32Array(MAX_P);

  /* Spawn a single particle anywhere across the full screen, starting below.
     On initial fill we distribute across the full height so the screen
     isn't empty at the beginning.                                          */
  function spawn(i, fullHeight) {
    const { minLen, maxLen, minWid, maxWid, xSpread, ySpread, zSpread, zBias } = CFG;
    /* full viewport width xSpread */
    px[i] = (Math.random() - 0.5) * xSpread;
    /* normal respawn: enter from below; initial fill: anywhere on screen */
    py[i] = fullHeight
      ? -24 + Math.random() * ySpread
      : -24 - Math.random() * (ySpread * 0.25);
    /* 3D depth zSpread & zBias: negative zBias shifts particles to the BACK (behind ball) */
    const zOffset = (zBias || 0.0) * (zSpread * 0.5);
    pz[i] = (Math.random() - 0.5) * zSpread + zOffset;

    pvx[i] = (Math.random() - 0.5) * 0.04;
    pvy[i] =  0.02 + Math.random() * 0.05;   // upward
    pvz[i] = (Math.random() - 0.5) * 0.015;

    pLen[i]  = minLen + Math.random() * (maxLen - minLen);
    pWid[i]  = minWid + Math.random() * (maxWid - minWid);
    pSeed[i] = Math.random() * 600;
    svx[i]   = pvx[i];
    svy[i]   = pvy[i];
    pdx[i]   = 0;   // head direction (starts pointing up)
    pdy[i]   = 1;
    ptx[i]   = 0;   // tail direction
    pty[i]   = 1;
  }
  function rebuildSizes() {
    const N = CFG.particleCount;
    for (let i = 0; i < N; i++) {
      pLen[i] = CFG.minLen + Math.random() * (CFG.maxLen - CFG.minLen);
      pWid[i] = CFG.minWid + Math.random() * (CFG.maxWid - CFG.minWid);
    }
  }
  function rebuildCount() {
    const N = CFG.particleCount;
    for (let i = 0; i < N; i++) spawn(i, true);
    /* clear unused slots */
    posArr.fill(0, N * VPR * 3);
    colArr.fill(0, N * VPR * 3);
    normArr.fill(0, N * VPR * 3);
  }

  /* Initial fill — spread across entire screen height so it's not empty */
  for (let i = 0; i < CFG.particleCount; i++) spawn(i, true);

  /* ── resize ── */
  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  onResize();
  window.addEventListener('resize', onResize);

  /* ── 4-segment multi-joint ribbon writer for continuous snake-like bending ── */
  function writeSnakeRibbon(base, n0x,n0y, n1x,n1y, n2x,n2y, n3x,n3y, n4x,n4y, d0x,d0y, d1x,d1y, d2x,d2y, d3x,d3y, d4x,d4y, W, cz, r, g, b, td) {
    /* Perpendicular vectors at all 5 nodes */
    const p0x = -d0y * W, p0y =  d0x * W;
    const p1x = -d1y * W, p1y =  d1x * W;
    const p2x = -d2y * W, p2y =  d2x * W;
    const p3x = -d3y * W, p3y =  d3x * W;
    const p4x = -d4y * W, p4y =  d4x * W;

    /* Left and Right positions at all 5 nodes */
    const L0x = n0x + p0x, L0y = n0y + p0y, R0x = n0x - p0x, R0y = n0y - p0y;
    const L1x = n1x + p1x, L1y = n1y + p1y, R1x = n1x - p1x, R1y = n1y - p1y;
    const L2x = n2x + p2x, L2y = n2y + p2y, R2x = n2x - p2x, R2y = n2y - p2y;
    const L3x = n3x + p3x, L3y = n3y + p3y, R3x = n3x - p3x, R3y = n3y - p3y;
    const L4x = n4x + p4x, L4y = n4y + p4y, R4x = n4x - p4x, R4y = n4y - p4y;

    /* Segment 1: Node 0 -> Node 1 */
    posArr[base]    = L0x; posArr[base+1]  = L0y; posArr[base+2]  = cz;
    posArr[base+3]  = R0x; posArr[base+4]  = R0y; posArr[base+5]  = cz;
    posArr[base+6]  = R1x; posArr[base+7]  = R1y; posArr[base+8]  = cz;

    posArr[base+9]  = L0x; posArr[base+10] = L0y; posArr[base+11] = cz;
    posArr[base+12] = R1x; posArr[base+13] = R1y; posArr[base+14] = cz;
    posArr[base+15] = L1x; posArr[base+16] = L1y; posArr[base+17] = cz;

    /* Segment 2: Node 1 -> Node 2 */
    posArr[base+18] = L1x; posArr[base+19] = L1y; posArr[base+20] = cz;
    posArr[base+21] = R1x; posArr[base+22] = R1y; posArr[base+23] = cz;
    posArr[base+24] = R2x; posArr[base+25] = R2y; posArr[base+26] = cz;

    posArr[base+27] = L1x; posArr[base+28] = L1y; posArr[base+29] = cz;
    posArr[base+30] = R2x; posArr[base+31] = R2y; posArr[base+32] = cz;
    posArr[base+33] = L2x; posArr[base+34] = L2y; posArr[base+35] = cz;

    /* Segment 3: Node 2 -> Node 3 */
    posArr[base+36] = L2x; posArr[base+37] = L2y; posArr[base+38] = cz;
    posArr[base+39] = R2x; posArr[base+40] = R2y; posArr[base+41] = cz;
    posArr[base+42] = R3x; posArr[base+43] = R3y; posArr[base+44] = cz;

    posArr[base+45] = L2x; posArr[base+46] = L2y; posArr[base+47] = cz;
    posArr[base+48] = R3x; posArr[base+49] = R3y; posArr[base+50] = cz;
    posArr[base+51] = L3x; posArr[base+52] = L3y; posArr[base+53] = cz;

    /* Segment 4: Node 3 -> Node 4 */
    posArr[base+54] = L3x; posArr[base+55] = L3y; posArr[base+56] = cz;
    posArr[base+57] = R3x; posArr[base+58] = R3y; posArr[base+59] = cz;
    posArr[base+60] = R4x; posArr[base+61] = R4y; posArr[base+62] = cz;

    posArr[base+63] = L3x; posArr[base+64] = L3y; posArr[base+65] = cz;
    posArr[base+66] = R4x; posArr[base+67] = R4y; posArr[base+68] = cz;
    posArr[base+69] = L4x; posArr[base+70] = L4y; posArr[base+71] = cz;

    /* Normals across the 4 segments */
    const rNx0 = -d1y * 0.40, rNy0 = d1x * 0.40, inv0 = 1.0 / Math.sqrt(rNx0*rNx0 + rNy0*rNy0 + 0.8281);
    const nx0 = rNx0 * inv0, ny0 = rNy0 * inv0, nz0 = 0.91 * inv0;

    const rNx1 = -d3y * 0.40, rNy1 = d3x * 0.40, inv1 = 1.0 / Math.sqrt(rNx1*rNx1 + rNy1*rNy1 + 0.8281);
    const nx1 = rNx1 * inv1, ny1 = rNy1 * inv1, nz1 = 0.91 * inv1;

    for (let k = 0; k < 12; k++) {
      const idx = base + k * 3;
      normArr[idx] = nx0; normArr[idx+1] = ny0; normArr[idx+2] = nz0;
    }
    for (let k = 12; k < 24; k++) {
      const idx = base + k * 3;
      normArr[idx] = nx1; normArr[idx+1] = ny1; normArr[idx+2] = nz1;
    }

    /* Metallic colors gradient along the 5 nodes */
    const tSide = td, tSpec = td * 3.0, hOpp = 0.55, hSpec = 1.00;

    /* Seg 1 (Tail) */
    colArr[base]    = r*tSpec;     colArr[base+1]  = g*tSpec;     colArr[base+2]  = b*tSpec;
    colArr[base+3]  = r*tSide;     colArr[base+4]  = g*tSide;     colArr[base+5]  = b*tSide;
    colArr[base+6]  = r*hOpp*0.4;  colArr[base+7]  = g*hOpp*0.4;  colArr[base+8]  = b*hOpp*0.4;

    colArr[base+9]  = r*tSpec;     colArr[base+10] = g*tSpec;     colArr[base+11] = b*tSpec;
    colArr[base+12] = r*hOpp*0.4;  colArr[base+13] = g*hOpp*0.4;  colArr[base+14] = b*hOpp*0.4;
    colArr[base+15] = r*hSpec*0.4; colArr[base+16] = g*hSpec*0.4; colArr[base+17] = b*hSpec*0.4;

    /* Seg 2 */
    colArr[base+18] = r*hSpec*0.4; colArr[base+19] = g*hSpec*0.4; colArr[base+20] = b*hSpec*0.4;
    colArr[base+21] = r*hOpp*0.4;  colArr[base+22] = g*hOpp*0.4;  colArr[base+23] = b*hOpp*0.4;
    colArr[base+24] = r*hOpp*0.65; colArr[base+25] = g*hOpp*0.65; colArr[base+26] = b*hOpp*0.65;

    colArr[base+27] = r*hSpec*0.4; colArr[base+28] = g*hSpec*0.4; colArr[base+29] = b*hSpec*0.4;
    colArr[base+30] = r*hOpp*0.65; colArr[base+31] = g*hOpp*0.65; colArr[base+32] = b*hOpp*0.65;
    colArr[base+33] = r*hSpec*0.65;colArr[base+34] = g*hSpec*0.65;colArr[base+35] = b*hSpec*0.65;

    /* Seg 3 */
    colArr[base+36] = r*hSpec*0.65;colArr[base+37] = g*hSpec*0.65;colArr[base+38] = b*hSpec*0.65;
    colArr[base+39] = r*hOpp*0.65; colArr[base+40] = g*hOpp*0.65; colArr[base+41] = b*hOpp*0.65;
    colArr[base+42] = r*hOpp*0.85; colArr[base+43] = g*hOpp*0.85; colArr[base+44] = b*hOpp*0.85;

    colArr[base+45] = r*hSpec*0.65;colArr[base+46] = g*hSpec*0.65;colArr[base+47] = b*hSpec*0.65;
    colArr[base+48] = r*hOpp*0.85; colArr[base+49] = g*hOpp*0.85; colArr[base+50] = b*hOpp*0.85;
    colArr[base+51] = r*hSpec*0.85;colArr[base+52] = g*hSpec*0.85;colArr[base+53] = b*hSpec*0.85;

    /* Seg 4 (Head) */
    colArr[base+54] = r*hSpec*0.85;colArr[base+55] = g*hSpec*0.85;colArr[base+56] = b*hSpec*0.85;
    colArr[base+57] = r*hOpp*0.85; colArr[base+58] = g*hOpp*0.85; colArr[base+59] = b*hOpp*0.85;
    colArr[base+60] = r*hOpp;      colArr[base+61] = g*hOpp;      colArr[base+62] = b*hOpp;

    colArr[base+63] = r*hSpec*0.85;colArr[base+64] = g*hSpec*0.85;colArr[base+65] = b*hSpec*0.85;
    colArr[base+66] = r*hOpp;      colArr[base+67] = g*hOpp;      colArr[base+68] = b*hOpp;
    colArr[base+69] = r*hSpec;     colArr[base+70] = g*hSpec;     colArr[base+71] = b*hSpec;
  }

  /* ══════════════════════════════════════════════════════════════
     ANIMATION LOOP
  ══════════════════════════════════════════════════════════════ */
  let clock  = 0;
  let avgVX  = 0, avgVY = 0.06, avgVZ = 0;

  function animate() {
    requestAnimationFrame(animate);
    clock += 0.007;

    /* snapshot config into locals (avoids repeated property lookups) */
    const {
      sphereR, shieldR, lightR,
      pulseSpeed, pulseAmt,
      particleCount,
      upward, damping: DAMP, swirlK, noiseF, noiseS, noiseT,
      alignK, shieldK, slowZone,
      falloffPow, briBoost, colorWarm,
    } = CFG;

    /* draw only live particles */
    rectGeo.setDrawRange(0, particleCount * VPR);

    /* update atmospheric fog & background color uniforms from Control Panel */
    const fOn   = CFG.fogEnable  !== undefined ? CFG.fogEnable  : 1.0;
    const fNear = CFG.fogNear    !== undefined ? CFG.fogNear    : 2.0;
    const fFar  = CFG.fogFar     !== undefined ? CFG.fogFar     : 25.0;
    const fDens = CFG.fogDensity !== undefined ? CFG.fogDensity : 0.80;
    const fColorHex = CFG.fogColor || '#0e1b40';
    const bColorHex = CFG.bgColor  || '#040714';

    const fogColorObj = new THREE.Color(fColorHex);
    rectMat.uniforms.uFogEnable.value  = fOn;
    rectMat.uniforms.uFogNear.value    = fNear;
    rectMat.uniforms.uFogFar.value     = fFar;
    rectMat.uniforms.uFogDensity.value = fDens;
    rectMat.uniforms.uFogColor.value.copy(fogColorObj);

    bgFogMat.uniforms.uFogEnable.value  = fOn;
    bgFogMat.uniforms.uFogDensity.value = fDens;
    bgFogMat.uniforms.uFogColor.value.copy(fogColorObj);

    /* Full screen background canvas clear color */
    renderer.setClearColor(new THREE.Color(bColorHex), 1.0);

    /* corona billboard */
    coronaGroup.quaternion.copy(camera.quaternion);

    /* pulse calculation */
    const pulse = 1.0
      + Math.sin(clock * pulseSpeed)        * pulseAmt
      + Math.sin(clock * pulseSpeed * 2.92) * pulseAmt * 0.4
      + Math.sin(clock * pulseSpeed * 6.80) * pulseAmt * 0.13;

    /* scale both central ball sphere & corona glow in 100% synchronized pulse */
    const sr = sphereR / 2.2;
    sphereMesh.scale.setScalar(pulse * sr);

    /* update background volumetric light-illuminated fog plane */
    bgFogMat.uniforms.uFogEnable.value  = fOn;
    bgFogMat.uniforms.uFogDensity.value = fDens;
    bgFogMat.uniforms.uPulse.value      = pulse;

    coronaMeshes.forEach((m, idx) => {
      const isRim = (idx === 0);
      const cScale = CFG.coronaScale || 1.0;
      const cGlow  = CFG.coronaGlow !== undefined ? CFG.coronaGlow : 1.0;
      const cRim   = CFG.coronaRim  !== undefined ? CFG.coronaRim  : 1.0;

      m.scale.setScalar((pulse + idx * 0.010) * sr * cScale);
      m.material.opacity = isRim ? cRim : cGlow;
      if (idx >= 2) {
        m.rotation.z += (idx%2===0?1:-1) * 0.00035 * (idx+1);
      }
    });

    /* alignment accumulator */
    let sumVX=0, sumVY=0, sumVZ=0;
    for (let i=0; i<particleCount; i++) { sumVX+=pvx[i]; sumVY+=pvy[i]; sumVZ+=pvz[i]; }
    avgVX = avgVX*0.97 + (sumVX/particleCount)*0.03;
    avgVY = avgVY*0.97 + (sumVY/particleCount)*0.03;
    avgVZ = avgVZ*0.97 + (sumVZ/particleCount)*0.03;

    const posAttr = rectGeo.attributes.position;
    const colAttr = rectGeo.attributes.color;

    for (let i=0; i<particleCount; i++) {
      const x=px[i], y=py[i], z=pz[i];
      const dist = Math.sqrt(x*x+y*y+z*z) || 1e-5;

      /* upward + noise */
      pvy[i] += upward;
      const { cx, cy } = curl2(x*noiseS + clock*noiseT, y*noiseS, i*0.00015);
      pvx[i] += cx * noiseF;
      pvy[i] += cy * noiseF * 0.35;

      /* alignment */
      pvx[i] += (avgVX - pvx[i]) * alignK;
      pvy[i] += (avgVY - pvy[i]) * alignK * 0.5;


      /* ── PROACTIVE 3D LOOK-AHEAD AVOIDANCE ──────────────────────────────
         Each particle casts a 3D ray along its velocity and checks if the path
         will intersect the 3D shield sphere.
         If a particle passes IN FRONT (z > shieldR + 0.5) or BEHIND (z < -shieldR - 0.5),
         its 3D ray NEVER intersects the sphere, so it flows smoothly directly in front
         or behind the ball without being pushed away!                */

      const spd3D = Math.sqrt(pvx[i]*pvx[i] + pvy[i]*pvy[i] + pvz[i]*pvz[i]) || 1e-5;
      const dvx = pvx[i] / spd3D;
      const dvy = pvy[i] / spd3D;
      const dvz = pvz[i] / spd3D;

      const Lx = -x,  Ly = -y,  Lz = -z;             /* particle → sphere (0,0,0) */
      const tc = Lx*dvx + Ly*dvy + Lz*dvz;          /* 3D closest-approach param */

      if (tc > 0) {                                  /* sphere is AHEAD in 3D */
        const d2c   = Math.max(0, (Lx*Lx + Ly*Ly + Lz*Lz) - tc*tc);
        const AVODR = shieldR + 2.5;                 /* 3D collision radius */

        if (d2c < AVODR * AVODR) {
          const closestD = Math.sqrt(d2c);
          const strength = Math.pow((AVODR - closestD) / AVODR, 1.2);
          const urgency  = Math.max(0, 1.0 - tc / 18.0);

          /* 2D lateral direction perpendicular to current XY velocity */
          const spd2D = Math.sqrt(pvx[i]*pvx[i] + pvy[i]*pvy[i]) || 1e-5;
          const perpX = -pvy[i] / spd2D, perpY = pvx[i] / spd2D;
          const Lperp    = Lx*perpX + Ly*perpY;
          const steerDir = Lperp >= 0 ? -1 : 1;

          const STEER_K = 0.026;
          pvx[i] += perpX * steerDir * strength * (1.0 + urgency * 0.9) * STEER_K;
          pvy[i] += perpY * steerDir * strength * (1.0 + urgency * 0.9) * STEER_K;
        }
      }

      /* ── 3D hard safety net — only fires if particle's 3D distance < shieldR ── */
      if (dist < shieldR) {
        const nx = x/dist, ny = y/dist, nz = z/dist;
        const vDotN = pvx[i]*nx + pvy[i]*ny + pvz[i]*nz;
        if (vDotN < 0) {          /* cancel inward 3D velocity component */
          pvx[i] -= vDotN * nx;
          pvy[i] -= vDotN * ny;
          pvz[i] -= vDotN * nz;
        }
        pvx[i] += nx * 0.04;     /* steady gentle push outward */
        pvy[i] += ny * 0.04;
        pvz[i] += nz * 0.04;
      }

      /* ── respawn: particle exits top of screen → re-enter from bottom ── */
      if (py[i] > 28) {
        spawn(i, false);
        const base = i * VPR * 3;
        posArr.fill(0, base, base + VPR * 3);
        colArr.fill(0, base, base + VPR * 3);
        normArr.fill(0, base, base + VPR * 3);
        continue;
      }

      /* integrate */
      pvx[i]*=DAMP; pvy[i]*=DAMP; pvz[i]*=DAMP;
      px[i]+=pvx[i]; py[i]+=pvy[i]; pz[i]+=pvz[i];

      /* lighting */
      const d2=Math.sqrt(px[i]*px[i]+py[i]*py[i]+pz[i]*pz[i])||1e-5;
      const traw=(lightR-d2)/(lightR-shieldR);
      const t=Math.max(0,Math.min(1,traw));
      const bri = Math.pow(t, falloffPow) * briBoost;

      const nearF=Math.max(0,1-(d2-shieldR)/4.0);
      const briP=bri*(1+(pulse-1)*nearF*1.4);

      const closeT = Math.max(0, Math.min(1, (shieldR + 4.0 - d2) / 4.0));
      const cw = colorWarm;

      /* ── METALLIC chrome/steel palette ──────────────────────────────────
         Metal is characterised by:
           • very high specular at the bright point → near pure white
           • rapid drop to dark → high contrast
           • neutral steel-blue tint in mid tones
           • slight warm gold tinge at the very hottest point (like polished steel)

         gamma:   compress mid-tones, lift highlights (metal response curve)
         spec:    pure white spike that fires only at peak brightness       */
      const gamma  = Math.pow(Math.max(0, briP), 0.65);   // metal gamma curve
      const spec   = Math.pow(Math.max(0, briP - 0.55) / 0.45, 2.5); // specular spike

      /* steel-silver base + optional warm tint from control panel */
      const rC = Math.min(1, gamma * (0.48 + closeT * 0.52 + cw * 0.28) + spec * 0.50);
      const gC = Math.min(1, gamma * (0.65 + closeT * 0.35 + cw * 0.12) + spec * 0.48);
      const bC = Math.min(1, gamma * (0.95 - cw * 0.18)                  + spec * 0.44);

      /* ── 0 SHAKING VELOCITY & MULTI-JOINT SNAKE BENDING ── */
      /* Filter out high-frequency noise from velocity direction */
      svx[i] = svx[i] * 0.88 + pvx[i] * 0.12;
      svy[i] = svy[i] * 0.88 + pvy[i] * 0.12;

      const sSpd = Math.sqrt(svx[i]*svx[i] + svy[i]*svy[i]) || 1e-5;
      const tvx = svx[i] / sSpd, tvy = svy[i] / sSpd;

      /* Low-pass filter for head direction (eliminates shaking/jitter 100%) */
      pdx[i] += (tvx - pdx[i]) * 0.045;
      pdy[i] += (tvy - pdy[i]) * 0.045;

      const dMag = Math.sqrt(pdx[i]*pdx[i] + pdy[i]*pdy[i]) || 1e-5;
      const d4x = pdx[i] / dMag, d4y = pdy[i] / dMag; // Head direction (Node 4)

      /* Tail direction (Node 0) lags behind head direction */
      const sFlex = (CFG.stripFlex !== undefined ? CFG.stripFlex : 1.0);
      const flexRate = 0.035 * sFlex;
      ptx[i] += (d4x - ptx[i]) * flexRate;
      pty[i] += (d4y - pty[i]) * flexRate;

      const tMag = Math.sqrt(ptx[i]*ptx[i] + pty[i]*pty[i]) || 1e-5;
      const d0x = ptx[i] / tMag, d0y = pty[i] / tMag; // Tail direction (Node 0)

      /* Smooth slerp interpolation across the 5 nodes (Nodes 0, 1, 2, 3, 4) */
      const u1x = d0x * 0.75 + d4x * 0.25, u1y = d0y * 0.75 + d4y * 0.25, m1 = Math.sqrt(u1x*u1x + u1y*u1y)||1e-5;
      const d1x = u1x / m1, d1y = u1y / m1; // Quarter direction (Node 1)

      const u2x = d0x * 0.50 + d4x * 0.50, u2y = d0y * 0.50 + d4y * 0.50, m2 = Math.sqrt(u2x*u2x + u2y*u2y)||1e-5;
      const d2x = u2x / m2, d2y = u2y / m2; // Mid direction (Node 2)

      const u3x = d0x * 0.25 + d4x * 0.75, u3y = d0y * 0.25 + d4y * 0.75, m3 = Math.sqrt(u3x*u3x + u3y*u3y)||1e-5;
      const d3x = u3x / m3, d3y = u3y / m3; // Three-Quarter direction (Node 3)

      /* Compute 5 node positions along the curved spine */
      const totalL = pLen[i], segL = totalL * 0.25, W = pWid[i], cz = pz[i];
      const n2x = px[i], n2y = py[i];                // Center Node 2
      const n1x = n2x - d1x * segL, n1y = n2y - d1y * segL; // Node 1
      const n0x = n1x - d0x * segL, n0y = n1y - d0y * segL; // Tail Node 0
      const n3x = n2x + d3x * segL, n3y = n2y + d3y * segL; // Node 3
      const n4x = n3x + d4x * segL, n4y = n3y + d4y * segL; // Head Node 4

      const base = i * VPR * 3;
      writeSnakeRibbon(
        base,
        n0x,n0y, n1x,n1y, n2x,n2y, n3x,n3y, n4x,n4y,
        d0x,d0y, d1x,d1y, d2x,d2y, d3x,d3y, d4x,d4y,
        W, cz, rC, gC, bC, 0.022
      );
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    rectGeo.attributes.normal.needsUpdate = true;
    renderer.render(scene, camera);
  }

  animate();

  /* ── public API ── */
  window.__threeControls = {
    cfg: CFG,
    rebuildSizes,
    rebuildCount,
    getDefaults() {
      return {
        sphereR:2.2, shieldR:6.2, lightR:15.0,
        pulseSpeed:0.65, pulseAmt:0.075,
        coronaScale:1.0, coronaGlow:1.0, coronaRim:1.0,
        particleCount:3000,
        minLen:0.30, maxLen:0.70, minWid:0.010, maxWid:0.025,
        upward:0.0048, damping:0.92, swirlK:0.009, noiseF:0.0065,
        noiseS:0.048, noiseT:0.09, alignK:0.012, cohereK:0.018,
        shieldK:0.52, slowZone:3.5,
        xSpread:90.0, ySpread:52.0, zSpread:16.0, zBias:-0.45,
        falloffPow:3.0, briBoost:1.0, colorWarm:0.0,
        fogEnable:1, fogDensity:0.80, fogNear:2.0, fogFar:25.0, fogHue:0.60,
      };
    },
  };

  window.__threeScene = {
    setBackgroundColor(hex) { renderer.setClearColor(new THREE.Color(hex),1); },
    setNebulaTheme() {},
  };

})();
