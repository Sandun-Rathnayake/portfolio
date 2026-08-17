/**
 * projects.js — Dynamic Immersive Projects Drawers & Telemetry Graphs
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  // ── Projects Database ─────────────────────────────────────
  const PROJECTS_DATA = {
    1: {
      title: 'WriteScan — OCR & AI Document App',
      year: '2024',
      role: 'Project Leader & Developer',
      type: 'Professional Mobile App · Lakmini International (Pvt) Ltd',
      summary: 'Cross-platform mobile application for iOS and Android featuring camera OCR scanning and AI-powered document intelligence using OpenAI API.',
      challenge: 'Integrating real-time camera-based text recognition, enabling conversational Q&A over complex document uploads, and designing a high-throughput Java EE backend API.',
      achievements: [
        'Built cross-platform mobile app (WriteScan) supporting camera text scanning, document upload, and intelligent document Q&A using OpenAI API.',
        'Engineered real-time AI conversation pipeline for interactive text extraction and deep document analysis.',
        'Developed robust backend REST API using Java EE and MySQL for secure user authentication, session control, and document storage.'
      ],
      tech: ['React Native', 'OpenAI API', 'OCR Integration', 'Java EE', 'RESTful APIs', 'MySQL', 'iOS', 'Android'],
      liveUrl: 'https://github.com/Sandun-Rathnayake',
      githubUrl: 'https://github.com/Sandun-Rathnayake',
      chartType: 'nexacommerce'
    },
    2: {
      title: 'E-Commerce Full-Stack Web Platform',
      year: '2024',
      role: 'Full-Stack Developer',
      type: 'Academic Project · Java Institute Sri Lanka',
      summary: 'Full-featured web-based e-commerce platform built on Model-View-Controller (MVC) architecture supporting multi-category product catalog, shopping cart, and transactional checkout.',
      challenge: 'Implementing strict MVC pattern separation, managing dynamic session shopping cart state, and ensuring secure payment processing flows.',
      achievements: [
        'Architected complete e-commerce web platform utilizing MVC pattern with Java EE, Hibernate ORM, and MySQL database backend.',
        'Created responsive and accessible web frontend using HTML5, CSS3, and JavaScript.',
        'Implemented secure user registration, session management, product filter catalog, and checkout payment processing workflows.'
      ],
      tech: ['Java EE', 'Jakarta EE', 'Hibernate', 'MySQL', 'MVC', 'HTML5', 'CSS3', 'JavaScript'],
      liveUrl: 'https://github.com/Sandun-Rathnayake',
      githubUrl: 'https://github.com/Sandun-Rathnayake',
      chartType: 'pulse'
    },
    3: {
      title: 'M-Commerce Food Waste Reduction App',
      year: '2024',
      role: 'Mobile Developer',
      type: 'Academic Project · Android',
      summary: 'Mobile commercial application aimed at mitigating retail food waste by enabling grocery stores and outlets to sell near-expiry food items at discounted prices.',
      challenge: 'Designing real-time price updates for dynamic inventory, location-based store item discovery, and optimized JSON payload transport over mobile networks.',
      achievements: [
        'Developed native Android application frontend in Java with custom user interface components.',
        'Implemented backend RESTful API infrastructure utilizing Java EE, Hibernate, and MySQL server.',
        'Integrated dynamic item discounting feeds and real-time inventory availability trackers to promote sustainability.'
      ],
      tech: ['Android SDK', 'Java', 'RESTful APIs', 'Java EE', 'Hibernate', 'MySQL'],
      liveUrl: 'https://github.com/Sandun-Rathnayake',
      githubUrl: 'https://github.com/Sandun-Rathnayake',
      chartType: 'archway'
    },
    4: {
      title: 'Real-Time Chat & Messaging App',
      year: '2024',
      role: 'Full-Stack Developer',
      type: 'Personal Project · React Native + TypeScript',
      summary: 'Cross-platform real-time mobile messaging application engineered with WebSockets for instant message delivery, push notifications, and chat history persistence.',
      challenge: 'Maintaining low-latency bi-directional WebSocket channels on mobile networks, ensuring message delivery receipt synchronization, and message persistence.',
      achievements: [
        'Built cross-platform real-time chat interface with React Native, TypeScript, and WebSocket protocol.',
        'Developed backend REST API infrastructure in Java EE with MySQL database persistence.',
        'Implemented push notification triggers, message status indicators (sent, delivered, read), and chat state synchronization.'
      ],
      tech: ['React Native', 'TypeScript', 'WebSocket', 'Java EE', 'RESTful APIs', 'MySQL'],
      liveUrl: 'https://github.com/Sandun-Rathnayake',
      githubUrl: 'https://github.com/Sandun-Rathnayake',
      chartType: 'flowsync'
    },
    5: {
      title: 'Hospital Management System',
      year: '2023',
      role: 'Desktop App Developer',
      type: 'Academic Project · Java Swing',
      summary: 'Enterprise desktop software for comprehensive hospital management including patient intake, staff scheduling, room & equipment allocation, paramedic assignment, and billing.',
      challenge: 'Handling complex multi-department hospital workflows, strict Role-Based Access Control (RBAC), and generating detailed financial and inventory reports.',
      achievements: [
        'Developed desktop management system in Java Swing handling paramedic/vehicle assignment, staff, patient records, and equipment allocations.',
        'Engineered Goods Received Note (GRN) inventory tracking and billing payment processing modules.',
        'Implemented fine-grained Role-Based Access Control (RBAC) and dynamic operational reporting dashboards.'
      ],
      tech: ['Java Swing', 'Java', 'MySQL', 'RBAC Security', 'Desktop GUI'],
      liveUrl: 'https://github.com/Sandun-Rathnayake',
      githubUrl: 'https://github.com/Sandun-Rathnayake',
      chartType: 'orbui'
    },
    6: {
      title: 'Real-Time Cargo Tracking System',
      year: '2023',
      role: 'Backend Systems Developer',
      type: 'Academic Project · Java EE + EJB',
      summary: 'Enterprise logistics tracking web application enabling customers and operators to track freight cargo shipments in real time using unique shipment identifiers.',
      challenge: 'Ensuring transaction consistency under concurrent status updates, managing EJB session state across logistics nodes, and real-time tracking lookups.',
      achievements: [
        'Engineered enterprise logistics backend utilizing Enterprise JavaBeans (EJB) for transactional isolation and business logic encapsulation.',
        'Built real-time shipment status lookup and tracking pipeline using unique shipment IDs.',
        'Configured session management and database state transaction control for high reliability.'
      ],
      tech: ['Java EE', 'EJB', 'Enterprise JavaBeans', 'MySQL', 'RESTful APIs'],
      liveUrl: 'https://github.com/Sandun-Rathnayake',
      githubUrl: 'https://github.com/Sandun-Rathnayake',
      chartType: 'vaultdb'
    }
  };

  // ── Global Animation Frame Tracker ────────────────────────
  let activeAnimationId = null;

  // ── Initialize Project Details Drawer ─────────────────────
  function initProjectDrawer() {
    const drawer = document.getElementById('project-drawer');
    const backdrop = document.getElementById('project-drawer-backdrop');
    const closeBtn = document.getElementById('project-drawer-close');
    const scrollContainer = document.getElementById('project-drawer-scroll');

    if (!drawer || !backdrop || !closeBtn || !scrollContainer) return;

    // Open Drawer
    function openProject(id) {
      const data = PROJECTS_DATA[id];
      if (!data) return;

      // Reset scroll
      scrollContainer.scrollTop = 0;

      // Stop any running chart loop
      if (activeAnimationId) {
        cancelAnimationFrame(activeAnimationId);
        activeAnimationId = null;
      }

      // Build HTML
      scrollContainer.innerHTML = `
        <div class="project-detail">
          <div class="project-detail__header">
            <span class="project-detail__year">${data.year}</span>
            <h1 class="project-detail__title">${data.title}</h1>
            <p class="project-detail__type">${data.type} — <strong>${data.role}</strong></p>
          </div>

          <div class="project-detail__grid">
            <div class="project-detail__info">
              <div class="project-detail__section">
                <h3 class="project-detail__sub">01 — System Overview</h3>
                <p class="project-detail__p">${data.summary}</p>
              </div>

              <div class="project-detail__section">
                <h3 class="project-detail__sub">02 — Engineering Challenges</h3>
                <p class="project-detail__p">${data.challenge}</p>
              </div>

              <div class="project-detail__section">
                <h3 class="project-detail__sub">03 — Key Achievements & Solutions</h3>
                <ul class="project-detail__list">
                  ${data.achievements.map((ach) => `<li>${ach}</li>`).join('')}
                </ul>
              </div>

              <div class="project-detail__section">
                <h3 class="project-detail__sub">04 — Technologies Deployed</h3>
                <div class="project-detail__tags">
                  ${data.tech.map((t) => `<span class="skills__badge">${t}</span>`).join('')}
                </div>
              </div>

              <div class="project-detail__actions">
                <a href="${data.liveUrl}" target="_blank" rel="noopener" class="project-detail__btn">
                  <span>DEPLOYED APP ↗</span>
                </a>
                <a href="${data.githubUrl}" target="_blank" rel="noopener" class="project-detail__btn project-detail__btn--alt">
                  <span>SOURCE CODE ↗</span>
                </a>
              </div>
            </div>

            <div class="project-detail__telemetry">
              <div class="telemetry-panel">
                <div class="telemetry-panel__header">
                  <div class="telemetry-panel__status-dot"></div>
                  <span class="telemetry-panel__title">Telemetry Graph: Live Node Status</span>
                </div>
                <div class="telemetry-panel__canvas-wrap" id="telemetry-canvas-wrap">
                  <!-- Injected SVG telemetries -->
                </div>
                <div class="telemetry-panel__footer">
                  <span class="telemetry-panel__metric" id="telemetry-metric-1">CPU: Inactive</span>
                  <span class="telemetry-panel__metric" id="telemetry-metric-2">Latency: --ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Show Drawer
      document.body.classList.add('cursor-hover'); // Trigger cursor reaction
      drawer.setAttribute('aria-hidden', 'false');
      drawer.classList.add('active');

      // Prevent parent scroll
      document.body.style.overflow = 'hidden';

      // Start Custom Telemetry Animation
      setTimeout(() => {
        startTelemetryAnimation(data.chartType);
      }, 350);
    }

    // Close Drawer
    function closeProject() {
      drawer.setAttribute('aria-hidden', 'true');
      drawer.classList.remove('active');
      document.body.style.overflow = '';

      if (activeAnimationId) {
        cancelAnimationFrame(activeAnimationId);
        activeAnimationId = null;
      }
    }

    // Intercept clicks on project cards
    document.querySelectorAll('.work__item').forEach((item) => {
      const link = item.querySelector('.work__link');
      if (!link) return;

      const id = item.dataset.index;
      if (!id) return;

      link.addEventListener('click', (e) => {
        e.preventDefault();
        openProject(id);
      });
    });

    // Close event listeners
    closeBtn.addEventListener('click', closeProject);
    backdrop.addEventListener('click', closeProject);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeProject();
    });
  }

  // ── Custom Telemetry Animations ──────────────────────────
  function startTelemetryAnimation(type) {
    const wrap = document.getElementById('telemetry-canvas-wrap');
    const m1 = document.getElementById('telemetry-metric-1');
    const m2 = document.getElementById('telemetry-metric-2');
    if (!wrap) return;

    // Dynamic Chart rendering
    if (type === 'nexacommerce') {
      wrap.innerHTML = `
        <svg viewBox="0 0 400 200" class="telemetry-svg">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <g class="grid" stroke="var(--border)" stroke-width="0.5">
            <line x1="50" y1="20" x2="50" y2="180" />
            <line x1="120" y1="20" x2="120" y2="180" />
            <line x1="190" y1="20" x2="190" y2="180" />
            <line x1="260" y1="20" x2="260" y2="180" />
            <line x1="330" y1="20" x2="330" y2="180" />
            <line x1="50" y1="50" x2="350" y2="50" />
            <line x1="50" y1="100" x2="350" y2="100" />
            <line x1="50" y1="150" x2="350" y2="150" />
          </g>
          <path id="chart-path-fill" fill="url(#grad)" d="M50,180 L50,180" />
          <path id="chart-path" fill="none" stroke="var(--accent)" stroke-width="2" d="M50,180" />
          <circle id="chart-dot" r="4" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" cx="50" cy="180" />
        </svg>
      `;

      const path = document.getElementById('chart-path');
      const fill = document.getElementById('chart-path-fill');
      const dot = document.getElementById('chart-dot');

      let points = [];
      const maxPoints = 20;
      let frame = 0;

      function animate() {
        frame++;
        if (frame % 8 === 0) {
          // Generate realistic latency fluctuating
          const targetY = 70 + Math.random() * 80;
          points.push({ x: 350, y: targetY });

          // Shift left
          for (let i = 0; i < points.length; i++) {
            points[i].x -= 15;
          }

          if (points.length > maxPoints) {
            points.shift();
          }

          if (points.length > 1) {
            let d = `M ${points[0].x} ${points[0].y}`;
            let dFill = `M ${points[0].x} 180 L ${points[0].x} ${points[0].y}`;

            for (let i = 1; i < points.length; i++) {
              d += ` L ${points[i].x} ${points[i].y}`;
              dFill += ` L ${points[i].x} ${points[i].y}`;
            }

            dFill += ` L ${points[points.length - 1].x} 180 Z`;

            path.setAttribute('d', d);
            fill.setAttribute('d', dFill);

            // Update dot
            const last = points[points.length - 1];
            dot.setAttribute('cx', last.x);
            dot.setAttribute('cy', last.y);

            // Update text metric
            const latency = Math.round(10 + Math.random() * 12);
            const cacheHit = (88 + Math.random() * 10).toFixed(1);
            if (m1) m1.textContent = `Cache Hit: ${cacheHit}%`;
            if (m2) m2.textContent = `Latency: ${latency}ms`;
          }
        }

        activeAnimationId = requestAnimationFrame(animate);
      }
      animate();

    } else if (type === 'pulse') {
      wrap.innerHTML = `
        <svg viewBox="0 0 400 200" class="telemetry-svg">
          <g stroke="var(--border)" stroke-width="0.5">
            <line x1="50" y1="100" x2="350" y2="100" />
          </g>
          <path id="wave-1" fill="none" stroke="var(--accent)" stroke-width="1.5" />
          <path id="wave-2" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.3" stroke-dasharray="4 4" />
        </svg>
      `;

      const w1 = document.getElementById('wave-1');
      const w2 = document.getElementById('wave-2');
      let offset = 0;

      function animate() {
        offset += 0.05;
        let d1 = 'M 50 100';
        let d2 = 'M 50 100';

        for (let x = 50; x <= 350; x += 5) {
          const y1 = 100 + Math.sin(x * 0.04 + offset) * 35 * Math.sin(offset * 0.5);
          const y2 = 100 + Math.cos(x * 0.03 - offset * 1.5) * 20;
          d1 += ` L ${x} ${y1}`;
          d2 += ` L ${x} ${y2}`;
        }

        w1.setAttribute('d', d1);
        w2.setAttribute('d', d2);

        const speed = Math.round(84120 + Math.random() * 1400).toLocaleString();
        if (m1) m1.textContent = `Ingestion: ${speed} r/s`;
        if (m2) m2.textContent = `ClickHouse writes: IN SYNC`;

        activeAnimationId = requestAnimationFrame(animate);
      }
      animate();

    } else if (type === 'archway') {
      wrap.innerHTML = `
        <svg viewBox="0 0 400 200" class="telemetry-svg">
          <line x1="120" y1="100" x2="280" y2="50" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="3 3" />
          <line x1="120" y1="100" x2="280" y2="100" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="3 3" />
          <line x1="120" y1="100" x2="280" y2="150" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="3 3" />

          <circle id="p-pulse-1" r="3.5" fill="var(--accent)" cx="120" cy="100" />
          <circle id="p-pulse-2" r="3.5" fill="var(--accent)" cx="120" cy="100" />
          <circle id="p-pulse-3" r="3.5" fill="var(--accent)" cx="120" cy="100" />

          <!-- Master Node -->
          <circle cx="120" cy="100" r="14" fill="var(--bg)" stroke="var(--accent)" stroke-width="2.5" />
          <circle cx="120" cy="100" r="6" fill="var(--accent)" />

          <!-- Edge Nodes -->
          <circle cx="280" cy="50" r="10" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />
          <circle cx="280" cy="100" r="10" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />
          <circle cx="280" cy="150" r="10" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />

          <text x="120" y="75" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="9" font-weight="700">DB-CORE</text>
          <text x="315" y="53" text-anchor="start" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="9">CDN-US</text>
          <text x="315" y="103" text-anchor="start" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="9">CDN-EU</text>
          <text x="315" y="153" text-anchor="start" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="9">CDN-AS</text>
        </svg>
      `;

      const p1 = document.getElementById('p-pulse-1');
      const p2 = document.getElementById('p-pulse-2');
      const p3 = document.getElementById('p-pulse-3');

      let t1 = 0, t2 = 0.33, t3 = 0.66;

      function animate() {
        t1 = (t1 + 0.007) % 1;
        t2 = (t2 + 0.007) % 1;
        t3 = (t3 + 0.007) % 1;

        // Linear interpolation
        p1.setAttribute('cx', 120 + t1 * 160);
        p1.setAttribute('cy', 100 + t1 * -50);

        p2.setAttribute('cx', 120 + t2 * 160);
        p2.setAttribute('cy', 100);

        p3.setAttribute('cx', 120 + t3 * 160);
        p3.setAttribute('cy', 100 + t3 * 50);

        if (m1) m1.textContent = `Replications: Active`;
        if (m2) m2.textContent = `CDN Propagation: 100%`;

        activeAnimationId = requestAnimationFrame(animate);
      }
      animate();

    } else if (type === 'flowsync') {
      wrap.innerHTML = `
        <svg viewBox="0 0 400 200" class="telemetry-svg">
          <line x1="50" y1="100" x2="350" y2="100" stroke="var(--border)" stroke-width="2" />
          <text x="200" y="90" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="9" letter-spacing="1">RATE-LIMITER GATE</text>
          <g id="particles"></g>
        </svg>
      `;

      const particlesGroup = document.getElementById('particles');
      let particles = [];

      function animate() {
        // Spawn particle
        if (Math.random() < 0.2) {
          particles.push({
            x: 100 + Math.random() * 200,
            y: 20,
            vy: 2.2 + Math.random() * 1.5,
            isPassed: false,
            color: 'var(--text-secondary)'
          });
        }

        particlesGroup.innerHTML = '';

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y += p.vy;

          // Hit Gate limit check
          if (!p.isPassed && p.y >= 100) {
            p.isPassed = true;
            if (Math.random() > 0.15) {
              p.color = '#c8ff00'; // OK (green)
            } else {
              p.color = '#ff4444'; // 429 Too Many Requests (red)
              p.vy = -1.5; // Bounce off
            }
          }

          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', p.x);
          circle.setAttribute('cy', p.y);
          circle.setAttribute('r', '3');
          circle.setAttribute('fill', p.color);
          particlesGroup.appendChild(circle);
        }

        // Clean out of bounds
        particles = particles.filter((p) => p.y < 190 && p.y > 0);

        if (m1) m1.textContent = `Status: Active Limit`;
        if (m2) m2.textContent = `Redis Bucket: Full`;

        activeAnimationId = requestAnimationFrame(animate);
      }
      animate();

    } else if (type === 'orbui') {
      wrap.innerHTML = `
        <div class="reflow-widget">
          <div class="reflow-widget__info">Drag slider to reflow Flex Grid in real time:</div>
          <div class="reflow-widget__grid" id="reflow-grid">
            <div class="reflow-widget__card"><span>Component</span></div>
            <div class="reflow-widget__card"><span>DOM Shield</span></div>
            <div class="reflow-widget__card"><span>A11y</span></div>
            <div class="reflow-widget__card"><span>Tokens</span></div>
          </div>
          <div class="reflow-widget__control">
            <input type="range" min="150" max="320" value="260" class="reflow-widget__slider" id="reflow-slider" />
            <span class="reflow-widget__width" id="reflow-width">260px</span>
          </div>
        </div>
      `;

      const grid = document.getElementById('reflow-grid');
      const slider = document.getElementById('reflow-slider');
      const widthLbl = document.getElementById('reflow-width');

      if (slider && grid && widthLbl) {
        slider.addEventListener('input', (e) => {
          const w = e.target.value;
          grid.style.width = `${w}px`;
          widthLbl.textContent = `${w}px`;
        });
      }

      if (m1) m1.textContent = `Core size: 12.4KB`;
      if (m2) m2.textContent = `A11y check: WCAG AAA`;

    } else if (type === 'vaultdb') {
      wrap.innerHTML = `
        <svg viewBox="0 0 400 200" class="telemetry-svg">
          <!-- Replication Ring Path -->
          <circle cx="200" cy="100" r="50" fill="none" stroke="var(--border)" stroke-width="2" />

          <circle id="heartbeat" r="4.5" fill="var(--accent)" cx="200" cy="100" />

          <!-- Nodes -->
          <g id="raft-n1" class="node-g">
            <circle cx="200" cy="50" r="10" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" />
            <text x="200" y="32" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="8">N1-LEADER</text>
          </g>
          <g id="raft-n2" class="node-g">
            <circle cx="250" cy="120" r="10" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />
            <text x="270" y="123" text-anchor="start" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="8">N2-FOLLOWER</text>
          </g>
          <g id="raft-n3" class="node-g">
            <circle cx="150" cy="120" r="10" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />
            <text x="130" y="123" text-anchor="end" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="8">N3-FOLLOWER</text>
          </g>
        </svg>
      `;

      const hb = document.getElementById('heartbeat');
      let angle = 0;

      function animate() {
        angle += 0.035;
        const r = 50;
        const cx = 200;
        const cy = 100;

        hb.setAttribute('cx', cx + r * Math.sin(angle));
        hb.setAttribute('cy', cy - r * Math.cos(angle));

        const lat = Math.round(14 + Math.random() * 3);
        if (m1) m1.textContent = `Consensus: Raft Valid`;
        if (m2) m2.textContent = `Replication hop: ${lat}ms`;

        activeAnimationId = requestAnimationFrame(animate);
      }
      animate();
    }
  }

  // ── Initialise ────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectDrawer);
  } else {
    initProjectDrawer();
  }
})();
