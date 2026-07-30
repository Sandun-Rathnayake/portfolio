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
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
  camera.position.z = 42;

  /* ══════════════════════════════════════════════════════════════
     LIVE CONFIG — every knob the control panel can change
  ══════════════════════════════════════════════════════════════ */
  const CFG = {
    /* ── sphere / corona ── */
    sphereR:      2.2,
    shieldR:      5.0,
    lightR:       23.0,
    pulseSpeed:   0.65,
    pulseAmt:     0.075,

    /* ── rectangles ── */
    particleCount: 20000,      // 500–5000 (requires rebuildCount)
    minLen:        0.60,
    maxLen:        5.04,
    minWid:        0.066,
    maxWid:        0.120,

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

    /* ── lighting ── */
    briBoost:      0.5,
    falloffPow:    2.25,       // 1=linear 2=sqr 3=cubic 4=quartic
    colorWarm:     0.0,       // 0=cool blue 1=warm white
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

  const coronaGroup = new THREE.Group();
  scene.add(coronaGroup);

  /* Each plane has a different world-space half-size.
     The sphere edge sits at fraction  SF = SPHERE_R / planeHalf
     inside the texture, so stops before SF must be transparent.   */
  const SR = CFG.sphereR;   // 2.2

  function addCoronaLayer(planeHalf, stops, order) {
    const tex = makeEclipseTex(1024, stops);
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

  /* ── Layer 0: sharp white-blue RIM ring  (tight plane = SR*4.5)
       SF = 1/4.5 ≈ 0.222  →  transparent from 0–0.20, bright at 0.222   */
  const PH0 = SR * 4.5, SF0 = 1 / 4.5;
  /* ── Layer 1: inner blue corona bloom    (SR*10)   SF = 0.100           */
  const PH1 = SR * 10,  SF1 = 1 / 10;
  /* ── Layer 2: mid corona scatter         (SR*22)   SF = 0.045           */
  const PH2 = SR * 22,  SF2 = 1 / 22;
  /* ── Layer 3: far atmospheric haze       (SR*45)   SF = 0.022           */
  const PH3 = SR * 45,  SF3 = 1 / 45;

  const coronaMeshes = [
    /* 0 — tight bright white rim  (the "diamond ring" of the eclipse) */
    addCoronaLayer(PH0, [
      [0.00,           'rgba(  0,  0,  0, 0.00)'],  // ← dark centre
      [SF0 * 0.82,     'rgba(  0,  0,  0, 0.00)'],  // dark up to just inside rim
      [SF0 * 0.95,     'rgba(200,230,255, 0.35)'],   // soft approach glow
      [SF0,            'rgba(255,255,255, 1.00)'],   // ← BRIGHT white ring at sphere edge
      [SF0 * 1.10,     'rgba(220,240,255, 0.92)'],   // inner corona
      [SF0 * 1.30,     'rgba(170,215,255, 0.70)'],
      [SF0 * 1.65,     'rgba(110,185,255, 0.42)'],
      [SF0 * 2.20,     'rgba( 55,140,255, 0.18)'],
      [SF0 * 3.20,     'rgba( 20, 75,220, 0.06)'],
      [1.00,           'rgba(  0,  0,  0, 0.00)'],
    ], 4),

    /* 1 — inner blue corona bloom */
    addCoronaLayer(PH1, [
      [0.00,           'rgba(  0,  0,  0, 0.00)'],  // dark centre
      [SF1 * 0.85,     'rgba(  0,  0,  0, 0.00)'],
      [SF1,            'rgba(160,210,255, 0.55)'],   // ring glow at sphere edge
      [SF1 * 1.20,     'rgba(120,190,255, 0.38)'],
      [SF1 * 1.70,     'rgba( 70,155,255, 0.20)'],
      [SF1 * 2.80,     'rgba( 30, 90,220, 0.08)'],
      [SF1 * 4.50,     'rgba( 10, 35,140, 0.02)'],
      [1.00,           'rgba(  0,  0,  0, 0.00)'],
    ], 3),

    /* 2 — mid corona scatter */
    addCoronaLayer(PH2, [
      [0.00,           'rgba(  0,  0,  0, 0.00)'],  // dark centre
      [SF2 * 0.80,     'rgba(  0,  0,  0, 0.00)'],
      [SF2,            'rgba( 60,130,220, 0.20)'],
      [SF2 * 2.0,      'rgba( 25, 75,180, 0.10)'],
      [SF2 * 4.0,      'rgba( 10, 35,120, 0.04)'],
      [1.00,           'rgba(  0,  0,  0, 0.00)'],
    ], 2),

    /* 3 — far atmospheric haze */
    addCoronaLayer(PH3, [
      [0.00,           'rgba(  0,  0,  0, 0.00)'],  // dark centre
      [SF3 * 0.80,     'rgba(  0,  0,  0, 0.00)'],
      [SF3,            'rgba( 20, 55,130, 0.08)'],
      [SF3 * 3.0,      'rgba(  8, 22, 70, 0.03)'],
      [1.00,           'rgba(  0,  0,  0, 0.00)'],
    ], 1),
  ];

  /* ── BLACK SPHERE — the "moon" that covers the sun.
     Must render AFTER all corona planes (renderOrder 10)
     so it cuts a perfectly dark circle through the glow.          */
  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(SR, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  sphereMesh.renderOrder = 10;
  scene.add(sphereMesh);


  /* ══════════════════════════════════════════════════════════════
     RECTANGLE SWARM — filled quads, up to MAX_P particles
  ══════════════════════════════════════════════════════════════ */
  const MAX_P = 35000;
  const VPR   = 6;  // verts per rect (2 triangles)

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
      uLightPos:  { value: new THREE.Vector3(0, 0, 0) },
      uCameraPos: { value: camera.position },
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

      void main() {
        vec3 N = normalize(vNormal);
        if (!gl_FrontFacing) N = -N;

        vec3 V = normalize(uCameraPos - vWorldPos);
        vec3 L = normalize(uLightPos - vWorldPos);
        vec3 H = normalize(L + V);

        // Overall light intensity from distance falloff (vColor)
        float lightIntensity = max(vColor.r, max(vColor.g, vColor.b));

        // Smooth distance attenuation mask: far-away particles fade to 0.0 (pitch black)
        float atten = smoothstep(0.001, 0.06, lightIntensity);

        // Metallic diffuse & ambient base tone (scaled by distance)
        vec3 ambientMetal = vColor * 0.35;
        float NdotL = max(dot(N, L), 0.0);
        vec3 diffuseMetal = vColor * (0.35 + 0.65 * NdotL);

        // Specular chrome highlight from central solar eclipse
        float NdotH = max(dot(N, H), 0.0);
        float spec = pow(NdotH, 36.0);
        vec3 specColor = vec3(1.0, 0.96, 0.92) * spec * 2.2 * lightIntensity;

        // Metallic Fresnel edge reflection (also fades with distance)
        float NdotV = max(dot(N, V), 0.0);
        float fresnel = pow(1.0 - NdotV, 3.5);
        vec3 fresnelColor = mix(vColor, vec3(0.85, 0.92, 1.0), 0.75) * fresnel * 1.0;

        // Combined SOLID METALLIC color — pitch black when far from sphere!
        vec3 finalColor = (ambientMetal + diffuseMetal + specColor + fresnelColor) * atten;

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
  /* smoothed orientation direction per particle (avoids flip on shield hit) */
  const pdx   = new Float32Array(MAX_P);
  const pdy   = new Float32Array(MAX_P);

  /* Spawn a single particle anywhere across the full screen, starting below.
     On initial fill we distribute across the full height so the screen
     isn't empty at the beginning.                                          */
  function spawn(i, fullHeight) {
    const { minLen, maxLen, minWid, maxWid } = CFG;
    /* full viewport width ~±45 world-units, height ~±22 */
    px[i] = (Math.random() - 0.5) * 90;
    /* normal respawn: enter from below; initial fill: anywhere on screen */
    py[i] = fullHeight
      ? -24 + Math.random() * 52          // spread across full height
      : -24 - Math.random() * 14;         // enter from below viewport
    pz[i] = (Math.random() - 0.5) * 6;

    pvx[i] = (Math.random() - 0.5) * 0.04;
    pvy[i] =  0.02 + Math.random() * 0.05;   // upward
    pvz[i] = (Math.random() - 0.5) * 0.01;

    pLen[i]  = minLen + Math.random() * (maxLen - minLen);
    pWid[i]  = minWid + Math.random() * (maxWid - minWid);
    pSeed[i] = Math.random() * 600;
    pdx[i]   = 0;   // smoothed X direction (starts pointing up)
    pdy[i]   = 1;   // smoothed Y direction
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

  /* ── quad writer ── */
  function writeQuad(base, ax,ay,az, bx,by,bz, cx,cy,cz, dx,dy,dz, r,g,b, td, dnx, dny) {
    /* tri 1: a(tail-L) b(tail-R) c(head-R) */
    posArr[base]    =ax; posArr[base+1] =ay; posArr[base+2] =az;
    posArr[base+3]  =bx; posArr[base+4] =by; posArr[base+5] =bz;
    posArr[base+6]  =cx; posArr[base+7] =cy; posArr[base+8] =cz;
    /* tri 2: a(tail-L) c(head-R) d(head-L) */
    posArr[base+9]  =ax; posArr[base+10]=ay; posArr[base+11]=az;
    posArr[base+12] =cx; posArr[base+13]=cy; posArr[base+14]=cz;
    posArr[base+15] =dx; posArr[base+16]=dy; posArr[base+17]=dz;

    // Normal calculation: quad faces camera + tilted along movement direction
    const rawNx = -dny * 0.40;
    const rawNy =  dnx * 0.40;
    const rawNz =  0.91;
    const invLen = 1.0 / Math.sqrt(rawNx*rawNx + rawNy*rawNy + rawNz*rawNz);
    const nx = rawNx * invLen;
    const ny = rawNy * invLen;
    const nz = rawNz * invLen;

    for (let k = 0; k < 6; k++) {
      const idx = base + k * 3;
      normArr[idx]   = nx;
      normArr[idx+1] = ny;
      normArr[idx+2] = nz;
    }

    const tSide = td;           // tail side edges — dark
    const tSpec = td * 3.0;     // tail specular edge
    const hOpp  = 0.55;         // head opposing edge
    const hSpec = 1.00;         // head specular edge

    /* a = tail-left */
    colArr[base]   = r*tSpec; colArr[base+1]  = g*tSpec; colArr[base+2]  = b*tSpec;
    /* b = tail-right */
    colArr[base+3] = r*tSide; colArr[base+4]  = g*tSide; colArr[base+5]  = b*tSide;
    /* c = head-right */
    colArr[base+6] = r*hOpp;  colArr[base+7]  = g*hOpp;  colArr[base+8]  = b*hOpp;
    /* tri 2 repeats a and c */
    colArr[base+9] = r*tSpec; colArr[base+10] = g*tSpec; colArr[base+11] = b*tSpec;
    colArr[base+12]= r*hOpp;  colArr[base+13] = g*hOpp;  colArr[base+14] = b*hOpp;
    /* d = head-left */
    colArr[base+15]= r*hSpec; colArr[base+16] = g*hSpec; colArr[base+17] = b*hSpec;
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

    /* corona billboard */
    coronaGroup.quaternion.copy(camera.quaternion);

    /* scale sphere mesh if sphereR changed */
    const sr = sphereR / 2.2;
    sphereMesh.scale.setScalar(sr);

    /* pulse */
    const pulse = 1.0
      + Math.sin(clock * pulseSpeed)        * pulseAmt
      + Math.sin(clock * pulseSpeed * 2.92) * pulseAmt * 0.4
      + Math.sin(clock * pulseSpeed * 6.80) * pulseAmt * 0.13;

    coronaMeshes.forEach((m, idx) => {
      m.scale.setScalar((pulse + idx * 0.010) * sr);
      m.rotation.z += (idx%2===0?1:-1) * 0.00035 * (idx+1);
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


      /* ── PROACTIVE LOOK-AHEAD AVOIDANCE ──────────────────────────────────
         Each particle casts a ray along its velocity and checks if the path
         will intersect the shield sphere.  If yes → steer SIDEWAYS before
         arriving, like a driver going around a parked car.
         No crash, no reversal, no flip.

         Ray-sphere math (sphere at origin):
           L  = vector from particle to sphere centre  = (-x, -y)
           tc = dot(L, dir)  → param of closest point along the ray
           d² = |L|² - tc²  → squared perpendicular distance to ray        */

      const spd0 = Math.sqrt(pvx[i]*pvx[i] + pvy[i]*pvy[i]) || 1e-5;
      const dvx0 = pvx[i] / spd0;
      const dvy0 = pvy[i] / spd0;

      const Lx = -x,  Ly = -y;               /* particle → sphere */
      const tc = Lx*dvx0 + Ly*dvy0;          /* closest-approach param */

      if (tc > 0) {                           /* sphere is AHEAD */
        const d2c   = Math.max(0, Lx*Lx + Ly*Ly - tc*tc);
        const AVODR = shieldR + 3.5;          /* begin steering this far out */

        if (d2c < AVODR * AVODR) {
          const closestD = Math.sqrt(d2c);
          /* strength: peaks at a dead-centre hit, fades at the avoidance edge */
          const strength = Math.pow((AVODR - closestD) / AVODR, 1.2);
          /* urgency: the sooner the collision, the harder we steer */
          const urgency  = Math.max(0, 1.0 - tc / 18.0);

          /* lateral direction perpendicular to current velocity */
          const perpX = -dvy0, perpY = dvx0;
          /* which side is the sphere on? steer the OTHER way */
          const Lperp    = Lx*perpX + Ly*perpY;
          const steerDir = Lperp >= 0 ? -1 : 1;

          const STEER_K = 0.026;
          pvx[i] += perpX * steerDir * strength * (1.0 + urgency * 0.9) * STEER_K;
          pvy[i] += perpY * steerDir * strength * (1.0 + urgency * 0.9) * STEER_K;
        }
      }

      /* ── last-resort hard boundary (only if look-ahead somehow missed) ── */
      if (dist < shieldR) {
        const nx = x/dist, ny = y/dist, nz = z/dist;
        const vDotN = pvx[i]*nx + pvy[i]*ny + pvz[i]*nz;
        if (vDotN < 0) {          /* cancel inward component only */
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

      /* ── smoothed orientation — lerp toward actual velocity direction ──
         This prevents the rectangle from snapping/flipping when the shield
         deflects the velocity.  Rate 0.12 = gradual turn, never a flip.   */
      const vx = pvx[i], vy = pvy[i];
      const spd = Math.sqrt(vx*vx + vy*vy) || 1e-5;
      const tvx = vx / spd, tvy = vy / spd;   // target (actual) direction

      /* lerp smoothed direction toward target */
      pdx[i] += (tvx - pdx[i]) * 0.12;
      pdy[i] += (tvy - pdy[i]) * 0.12;

      /* re-normalise smoothed dir */
      const dMag = Math.sqrt(pdx[i]*pdx[i] + pdy[i]*pdy[i]) || 1e-5;
      const dnx = pdx[i] / dMag,  dny = pdy[i] / dMag;
      const pnx = -dny,            pny =  dnx;   // perpendicular

      const L = pLen[i], W = pWid[i], cz = pz[i];
      const base = i * VPR * 3;
      writeQuad(base,
        px[i]-dnx*L+pnx*W, py[i]-dny*L+pny*W, cz,
        px[i]-dnx*L-pnx*W, py[i]-dny*L-pny*W, cz,
        px[i]+dnx*L-pnx*W, py[i]+dny*L-pny*W, cz,
        px[i]+dnx*L+pnx*W, py[i]+dny*L+pny*W, cz,
        rC, gC, bC, 0.022, dnx, dny
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
        particleCount:3000,
        minLen:0.30, maxLen:0.70, minWid:0.010, maxWid:0.025,
        upward:0.0048, damping:0.92, swirlK:0.009, noiseF:0.0065,
        noiseS:0.048, noiseT:0.09, alignK:0.012, cohereK:0.018,
        shieldK:0.52, slowZone:3.5,
        falloffPow:3.0, briBoost:1.0, colorWarm:0.0,
      };
    },
  };

  window.__threeScene = {
    setBackgroundColor(hex) { renderer.setClearColor(new THREE.Color(hex),1); },
    setNebulaTheme() {},
  };

})();
