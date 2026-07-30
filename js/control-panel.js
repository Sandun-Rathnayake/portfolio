/**
 * control-panel.js — Scene Control Panel
 * Beautiful floating glassmorphism UI to control every Three.js parameter.
 * Injects its own CSS and DOM — no external dependencies.
 */
(function () {
  'use strict';

  /* ── wait for three-scene to initialise ── */
  function init() {
    if (!window.__threeControls) { setTimeout(init, 100); return; }

    const CTRL = window.__threeControls;
    const CFG  = CTRL.cfg;

    /* ══════════════════════════════════════════════════════════
       STYLES
    ══════════════════════════════════════════════════════════ */
    const style = document.createElement('style');
    style.textContent = `
      /* ── panel shell ── */
      #cp-panel {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 300px;
        z-index: 99999;
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 12px;
        user-select: none;
      }

      /* ── toggle button ── */
      #cp-toggle {
        position: absolute;
        top: -1px;
        right: 0;
        display: flex;
        align-items: center;
        gap: 7px;
        background: rgba(10,14,30,0.96);
        border: 1px solid rgba(80,140,255,0.30);
        border-radius: 8px 8px 0 0;
        color: rgba(180,210,255,0.90);
        font-family: inherit;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 7px 14px;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
        outline: none;
      }
      #cp-toggle:hover { background: rgba(20,30,60,0.97); border-color: rgba(100,160,255,0.55); }
      #cp-toggle svg { opacity: 0.7; transition: transform 0.35s; }
      #cp-panel.cp-open #cp-toggle svg { transform: rotate(45deg); }

      /* ── body ── */
      #cp-body {
        background: rgba(7,9,20,0.97);
        border: 1px solid rgba(70,130,255,0.18);
        border-radius: 12px 0 12px 12px;
        backdrop-filter: blur(18px);
        box-shadow:
          0 0 0 1px rgba(255,255,255,0.04) inset,
          0 24px 60px rgba(0,0,0,0.7),
          0 0 30px rgba(40,100,255,0.08);
        overflow: hidden;
        max-height: 0;
        transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s;
        opacity: 0;
      }
      #cp-panel.cp-open #cp-body { max-height: 82vh; opacity: 1; }

      #cp-scroll {
        overflow-y: auto;
        max-height: 78vh;
        padding: 10px 0 14px;
        scrollbar-width: thin;
        scrollbar-color: rgba(60,120,255,0.3) transparent;
      }
      #cp-scroll::-webkit-scrollbar { width: 4px; }
      #cp-scroll::-webkit-scrollbar-track { background: transparent; }
      #cp-scroll::-webkit-scrollbar-thumb { background: rgba(60,120,255,0.3); border-radius: 4px; }

      /* ── section ── */
      .cp-section { border-bottom: 1px solid rgba(255,255,255,0.05); }
      .cp-section:last-of-type { border-bottom: none; }

      .cp-sec-hdr {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 16px;
        cursor: pointer;
        color: rgba(150,190,255,0.85);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.10em;
        text-transform: uppercase;
        transition: color 0.2s;
      }
      .cp-sec-hdr:hover { color: rgba(200,225,255,1); }
      .cp-sec-arrow {
        margin-left: auto;
        font-size: 9px;
        opacity: 0.5;
        transition: transform 0.25s;
      }
      .cp-section.cp-sec-open .cp-sec-arrow { transform: rotate(90deg); }
      .cp-sec-icon { font-size: 13px; }

      .cp-sec-body {
        overflow: hidden;
        max-height: 0;
        transition: max-height 0.3s ease;
        padding: 0 16px;
      }
      .cp-section.cp-sec-open .cp-sec-body { max-height: 600px; padding: 0 16px 10px; }

      /* ── row ── */
      .cp-row {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        column-gap: 10px;
        margin-bottom: 9px;
      }
      .cp-row:last-child { margin-bottom: 0; }

      .cp-label {
        color: rgba(160,195,255,0.70);
        font-size: 11px;
        letter-spacing: 0.02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cp-val {
        color: rgba(200,225,255,0.95);
        font-size: 10px;
        font-weight: 600;
        min-width: 40px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      /* ── full-width slider row ── */
      .cp-slider-wrap {
        grid-column: 1 / -1;
        margin-top: 3px;
      }

      /* custom range input */
      .cp-range {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 3px;
        border-radius: 3px;
        background: rgba(40,80,180,0.35);
        outline: none;
        cursor: pointer;
        transition: background 0.2s;
      }
      .cp-range:hover { background: rgba(60,120,220,0.45); }
      .cp-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 13px; height: 13px;
        border-radius: 50%;
        background: linear-gradient(135deg, #7eb8ff 0%, #3a7fff 100%);
        box-shadow: 0 0 6px rgba(80,150,255,0.6);
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .cp-range::-webkit-slider-thumb:hover {
        transform: scale(1.25);
        box-shadow: 0 0 12px rgba(80,150,255,0.9);
      }
      .cp-range::-moz-range-thumb {
        width: 13px; height: 13px;
        border: none; border-radius: 50%;
        background: linear-gradient(135deg, #7eb8ff 0%, #3a7fff 100%);
        cursor: pointer;
      }

      /* ── colour temperature row ── */
      .cp-range.cp-warm {
        background: linear-gradient(to right, rgba(40,80,180,0.4), rgba(180,120,40,0.4));
      }

      /* ── select ── */
      .cp-select {
        background: rgba(20,30,60,0.8);
        border: 1px solid rgba(60,100,220,0.3);
        color: rgba(180,210,255,0.9);
        font-family: inherit;
        font-size: 11px;
        border-radius: 5px;
        padding: 3px 6px;
        cursor: pointer;
        outline: none;
        width: 100%;
        margin-top: 3px;
      }

      /* ── footer buttons ── */
      .cp-footer {
        display: flex;
        gap: 8px;
        padding: 12px 16px 6px;
        border-top: 1px solid rgba(255,255,255,0.06);
        margin-top: 4px;
      }
      .cp-btn {
        flex: 1;
        padding: 7px 0;
        border-radius: 7px;
        border: 1px solid;
        font-family: inherit;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s;
        outline: none;
      }
      .cp-btn-reset {
        background: rgba(30,50,110,0.5);
        border-color: rgba(80,140,255,0.35);
        color: rgba(160,200,255,0.9);
      }
      .cp-btn-reset:hover {
        background: rgba(50,80,160,0.6);
        border-color: rgba(120,180,255,0.6);
        color: #fff;
        box-shadow: 0 0 12px rgba(80,150,255,0.25);
      }
      .cp-btn-rand {
        background: rgba(40,20,80,0.5);
        border-color: rgba(160,80,255,0.35);
        color: rgba(200,160,255,0.9);
      }
      .cp-btn-rand:hover {
        background: rgba(70,30,130,0.6);
        border-color: rgba(190,120,255,0.6);
        color: #fff;
        box-shadow: 0 0 12px rgba(150,80,255,0.25);
      }

      /* ── FPS badge ── */
      #cp-fps {
        position: fixed;
        top: 14px;
        right: 14px;
        background: rgba(7,9,20,0.88);
        border: 1px solid rgba(60,120,255,0.22);
        border-radius: 6px;
        color: rgba(100,200,255,0.8);
        font-family: 'Space Mono', monospace;
        font-size: 10px;
        padding: 4px 10px;
        z-index: 99999;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    /* ══════════════════════════════════════════════════════════
       DOM STRUCTURE
    ══════════════════════════════════════════════════════════ */
    const panel = document.createElement('div');
    panel.id = 'cp-panel';
    panel.innerHTML = `
      <button id="cp-toggle">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
        </svg>
        Controls
      </button>
      <div id="cp-body">
        <div id="cp-scroll">
          <!-- sections injected by JS -->
        </div>
        <div class="cp-footer">
          <button class="cp-btn cp-btn-reset" id="cp-reset">↺ Reset</button>
          <button class="cp-btn cp-btn-rand"  id="cp-rand">✦ Randomise</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    /* FPS counter */
    const fpsEl = document.createElement('div');
    fpsEl.id = 'cp-fps';
    fpsEl.textContent = '-- fps';
    document.body.appendChild(fpsEl);

    /* ══════════════════════════════════════════════════════════
       SCHEMA — what sliders to build
    ══════════════════════════════════════════════════════════ */
    const sections = [
      {
        id: 'rects', icon: '▬', label: 'Rectangles', open: true,
        controls: [
          { key:'particleCount', label:'Count',     min:200,   max:20000,  step:100,  dp:0, onchange: ()=>{ CTRL.rebuildCount(); } },
          { key:'minLen',        label:'Min Length', min:0.02,  max:0.60,  step:0.01, dp:2, onchange: ()=>{ CTRL.rebuildSizes(); } },
          { key:'maxLen',        label:'Max Length', min:0.05,  max:10.0,  step:0.01, dp:2, onchange: ()=>{ CTRL.rebuildSizes(); } },
          { key:'minWid',        label:'Min Width',  min:0.003, max:0.08,  step:0.001,dp:3, onchange: ()=>{ CTRL.rebuildSizes(); } },
          { key:'maxWid',        label:'Max Width',  min:0.005, max:0.12,  step:0.001,dp:3, onchange: ()=>{ CTRL.rebuildSizes(); } },
          { key:'stripFlex',     label:'Snake Bending',min:0.0,  max:2.5,   step:0.05, dp:2, tooltip:'Curvature flexibility along the strip (0=rigid, 1=curved, 2=snake)' },
        ],
      },
      {
        id: 'sphere', icon: '◉', label: 'Eclipse Sphere', open: true,
        controls: [
          { key:'sphereR',      label:'Sphere Radius',  min:0.5,  max:5.0,  step:0.1,   dp:1 },
          { key:'shieldR',      label:'Shield Radius',  min:3.0,  max:12.0, step:0.2,   dp:1 },
          { key:'lightR',       label:'Light Radius',   min:6.0,  max:28.0, step:0.5,   dp:1 },
          { key:'pulseSpeed',   label:'Pulse Speed',    min:0.10, max:3.0,  step:0.05,  dp:2 },
          { key:'pulseAmt',     label:'Pulse Intensity',min:0.00, max:0.30, step:0.005, dp:3 },
          { key:'coronaScale',  label:'Corona Scale',   min:0.40, max:3.0,  step:0.05,  dp:2 },
          { key:'coronaGlow',   label:'Corona Glow',    min:0.00, max:3.0,  step:0.05,  dp:2 },
          { key:'coronaRim',    label:'Eclipse Rim',    min:0.00, max:3.0,  step:0.05,  dp:2 },
        ],
      },
      {
        id: 'spread', icon: '⤢', label: '3D Spreading (X, Y, Z)', open: true,
        controls: [
          { key:'xSpread', label:'X Width Spread',     min:10.0, max:180.0, step:2.0, dp:1, onchange: ()=>{ CTRL.rebuildCount(); } },
          { key:'ySpread', label:'Y Height Spread',    min:10.0, max:120.0, step:2.0, dp:1, onchange: ()=>{ CTRL.rebuildCount(); } },
          { key:'zSpread', label:'Z Depth Spread',     min:0.0,  max:50.0,  step:1.0, dp:1, onchange: ()=>{ CTRL.rebuildCount(); }, tooltip:'Controls 3D thickness in front & behind the ball' },
          { key:'zBias',   label:'Depth Bias (Front/Back)', min:-0.90, max:0.90, step:0.05, dp:2, onchange: ()=>{ CTRL.rebuildCount(); }, tooltip:'Negative = more particles BEHIND ball, Positive = IN FRONT' },
        ],
      },
      {
        id: 'physics', icon: '⟳', label: 'Flow Physics', open: false,
        controls: [
          { key:'upward',    label:'Upward Force',  min:0.000, max:0.025, step:0.0005, dp:4 },
          { key:'damping',   label:'Damping',       min:0.80,  max:0.99,  step:0.005,  dp:3 },
          { key:'swirlK',    label:'Swirl',         min:0.000, max:0.040, step:0.001,  dp:3 },
          { key:'noiseF',    label:'Turbulence',    min:0.000, max:0.030, step:0.0005, dp:4 },
          { key:'alignK',    label:'Alignment',     min:0.000, max:0.060, step:0.001,  dp:3 },
          { key:'cohereK',   label:'Cohesion',      min:0.000, max:0.060, step:0.001,  dp:3 },
          { key:'shieldK',   label:'Repulsion',     min:0.10,  max:2.0,   step:0.05,   dp:2 },
          { key:'slowZone',  label:'Slow Zone',     min:0.5,   max:8.0,   step:0.5,    dp:1 },
        ],
      },
      {
        id: 'light', icon: '☀', label: 'Lighting', open: false,
        controls: [
          { key:'briBoost',   label:'Brightness',     min:0.2, max:4.0, step:0.1,  dp:1 },
          { key:'falloffPow', label:'Falloff Curve',  min:1.0, max:5.0, step:0.25, dp:2, tooltip:'1=linear  3=cubic  5=sharp' },
          { key:'colorWarm',  label:'Warm ← Cool →',  min:0.0, max:1.0, step:0.01, dp:2, cls:'cp-warm' },
        ],
      },
      {
        id: 'fog', icon: '🌫', label: 'Atmospheric Blue Fog', open: true,
        controls: [
          { key:'fogEnable',  label:'Enable Fog',       min:0,    max:1,    step:1,    dp:0, tooltip:'1=On, 0=Off' },
          { key:'fogDensity', label:'Fog Intensity',    min:0.00, max:3.00, step:0.05, dp:2, tooltip:'Blue space mist density' },
          { key:'fogNear',    label:'Fog Start Depth',  min:0.0,  max:20.0, step:0.5,  dp:1, tooltip:'Depth behind sphere where blue fog begins' },
          { key:'fogFar',     label:'Fog Limit Depth',  min:5.0,  max:60.0, step:1.0,  dp:1, tooltip:'Depth behind sphere for max blue fog' },
          { key:'fogHue',     label:'Blue Fog Hue',     min:0.50, max:0.75, step:0.01, dp:2, tooltip:'0.55=Cyan, 0.60=Cobalt, 0.70=Indigo' },
        ],
      },
    ];

    /* ══════════════════════════════════════════════════════════
       BUILD SLIDER ROWS
    ══════════════════════════════════════════════════════════ */
    const scroll = document.getElementById('cp-scroll');
    const valEls = {};   // key → <span> for live value display
    const rangeEls = {}; // key → <input>

    sections.forEach(sec => {
      const secEl = document.createElement('div');
      secEl.className = 'cp-section' + (sec.open ? ' cp-sec-open' : '');
      secEl.dataset.id = sec.id;

      const hdr = document.createElement('div');
      hdr.className = 'cp-sec-hdr';
      hdr.innerHTML = `
        <span class="cp-sec-icon">${sec.icon}</span>
        <span>${sec.label}</span>
        <span class="cp-sec-arrow">▶</span>
      `;
      hdr.addEventListener('click', () => secEl.classList.toggle('cp-sec-open'));

      const body = document.createElement('div');
      body.className = 'cp-sec-body';

      sec.controls.forEach(ctrl => {
        const row = document.createElement('div');
        row.className = 'cp-row';
        if (ctrl.tooltip) row.title = ctrl.tooltip;

        const label = document.createElement('span');
        label.className = 'cp-label';
        label.textContent = ctrl.label;

        const val = document.createElement('span');
        val.className = 'cp-val';
        const rawVal = CFG[ctrl.key];
        const initialVal = typeof rawVal === 'number' ? rawVal : 0;
        val.textContent = initialVal.toFixed(ctrl.dp);
        valEls[ctrl.key] = val;

        const wrap = document.createElement('div');
        wrap.className = 'cp-slider-wrap';

        const range = document.createElement('input');
        range.type  = 'range';
        range.className = 'cp-range' + (ctrl.cls ? ' ' + ctrl.cls : '');
        range.min   = ctrl.min;
        range.max   = ctrl.max;
        range.step  = ctrl.step;
        range.value = initialVal;
        rangeEls[ctrl.key] = range;

        range.addEventListener('input', () => {
          const v = parseFloat(range.value);
          CFG[ctrl.key] = v;
          val.textContent = v.toFixed(ctrl.dp);
          if (ctrl.onchange) ctrl.onchange(v);
        });

        wrap.appendChild(range);
        row.appendChild(label);
        row.appendChild(val);
        row.appendChild(wrap);
        body.appendChild(row);
      });

      secEl.appendChild(hdr);
      secEl.appendChild(body);
      scroll.appendChild(secEl);
    });

    /* ══════════════════════════════════════════════════════════
       TOGGLE PANEL
    ══════════════════════════════════════════════════════════ */
    document.getElementById('cp-toggle').addEventListener('click', () => {
      panel.classList.toggle('cp-open');
    });
    /* Open by default */
    panel.classList.add('cp-open');

    /* ══════════════════════════════════════════════════════════
       RESET / RANDOMISE
    ══════════════════════════════════════════════════════════ */
    function applyValues(vals) {
      Object.assign(CFG, vals);
      /* sync all sliders */
      Object.keys(vals).forEach(k => {
        if (rangeEls[k]) rangeEls[k].value = vals[k];
        if (valEls[k]) {
          const dp = sections.flatMap(s=>s.controls).find(c=>c.key===k)?.dp ?? 2;
          valEls[k].textContent = vals[k].toFixed(dp);
        }
      });
      CTRL.rebuildSizes();
    }

    document.getElementById('cp-reset').addEventListener('click', () => {
      applyValues(CTRL.getDefaults());
    });

    document.getElementById('cp-rand').addEventListener('click', () => {
      applyValues({
        particleCount: Math.round(500  + Math.random()*4500 / 100)*100,
        minLen:  +(0.02 + Math.random()*0.20).toFixed(2),
        maxLen:  +(0.15 + Math.random()*0.80).toFixed(2),
        minWid:  +(0.005+ Math.random()*0.03).toFixed(3),
        maxWid:  +(0.015+ Math.random()*0.07).toFixed(3),
        sphereR: +(1.0  + Math.random()*3.5).toFixed(1),
        shieldR: +(4.0  + Math.random()*7.0).toFixed(1),
        lightR:  +(10.0 + Math.random()*14.0).toFixed(1),
        pulseSpeed:+(0.2+ Math.random()*2.5).toFixed(2),
        pulseAmt:  +(0.02+Math.random()*0.25).toFixed(3),
        upward:    +(0.001+Math.random()*0.015).toFixed(4),
        damping:   +(0.85 +Math.random()*0.13).toFixed(3),
        swirlK:    +(Math.random()*0.030).toFixed(3),
        noiseF:    +(Math.random()*0.020).toFixed(4),
        alignK:    +(Math.random()*0.040).toFixed(3),
        cohereK:   +(Math.random()*0.040).toFixed(3),
        shieldK:   +(0.2 +Math.random()*1.5).toFixed(2),
        slowZone:  +(0.5 +Math.random()*7.0).toFixed(1),
        briBoost:  +(0.5 +Math.random()*3.0).toFixed(1),
        falloffPow:+(1.0 +Math.random()*4.0).toFixed(2),
        colorWarm: +(Math.random()).toFixed(2),
      });
      CTRL.rebuildCount();
    });

    /* ══════════════════════════════════════════════════════════
       FPS COUNTER
    ══════════════════════════════════════════════════════════ */
    let frames=0, lastTime=performance.now();
    function countFPS() {
      frames++;
      const now = performance.now();
      if (now-lastTime >= 800) {
        fpsEl.textContent = Math.round(frames*1000/(now-lastTime)) + ' fps';
        frames=0; lastTime=now;
      }
      requestAnimationFrame(countFPS);
    }
    countFPS();
  }

  /* Start after page load */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 120);
  }

})();
