/**
 * projects.js — Dynamic Immersive Projects Drawers & Telemetry Graphs
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  // ── Projects Database ─────────────────────────────────────
  const PROJECTS_DATA = {
    1: {
      title: 'NexaCommerce',
      year: '2025–2026',
      role: 'Lead Full-Stack Engineer',
      type: 'Core E-Commerce Engine',
      summary: 'Distributed, highly-scalable transactional e-commerce core engine engineered to support massive flash sales with low-latency consistency guarantees.',
      challenge: 'Double-booking prevention during extreme concurrent traffic peaks (50k+ active checkouts), real-time inventory synchronization across multi-channel databases, and guaranteeing exactly-once transactional payment webhook settlements.',
      achievements: [
        'Implemented a low-latency Distributed Lock mechanism using Redis (Redlock pattern) to isolate SKU inventory adjustments, reducing database deadlocks and overselling occurrences to absolute zero.',
        'Engineered a transactional Outbox Pattern using PostgreSQL and Apache Kafka to handle Stripe payment webhook states, guaranteeing asynchronous processing with exactly-once settlement guarantees.',
        'Designed a multi-tier caching strategy (in-memory LRU + distributed Redis cluster) that reduced median checkout response times (p50) from 320ms to 18ms under 50k concurrent simulated users.',
        'Created optimized secondary database indexing in Elasticsearch, improving product query response times and enabling fuzzy-text auto-completions under 10ms.'
      ],
      tech: ['Node.js', 'NestJS', 'PostgreSQL', 'Redis Cluster', 'Apache Kafka', 'Elasticsearch', 'Stripe API'],
      liveUrl: 'https://github.com/sandunrathnayake/nexacommerce-engine',
      githubUrl: 'https://github.com/sandunrathnayake/nexacommerce-engine',
      chartType: 'nexacommerce'
    },
    2: {
      title: 'PulseAnalytics',
      year: '2025',
      role: 'Senior Backend Engineer',
      type: 'Real-Time Telemetry Pipeline',
      summary: 'Real-time clickstream event collection and clickpath analytics platform processing millions of metrics daily for high-performance product optimization dashboards.',
      challenge: 'Telemetry ingestion bottleneck under extreme traffic spikes and scaling analytical queries over terabytes of raw chronological clickstream event records.',
      achievements: [
        'Configured a highly performant ingestion pipeline using Node streams and Redis list buffers before bulk-inserting into ClickHouse, handling ingestion peaks of 90,000 events/sec without packet drop.',
        'Designed vectorized clickpath aggregation queries inside ClickHouse, speeding up user session duration reporting and multi-stage funnel queries by 45x compared to standard MySQL.',
        'Built real-time dashboard socket pipelines using Node.js and the WebSockets (ws) library, achieving visual state synchronizations under 100ms with minimal memory footprint.',
        'Authored robust telemetry partition algorithms, sharding clickstream logs by tenant space and reducing storage retrieval costs by 60%.'
      ],
      tech: ['Go', 'ClickHouse', 'Redis In-Memory', 'Node.js', 'WebSockets', 'Docker', 'Grafana'],
      liveUrl: 'https://github.com/sandunrathnayake/pulse-analytics-pipeline',
      githubUrl: 'https://github.com/sandunrathnayake/pulse-analytics-pipeline',
      chartType: 'pulse'
    },
    3: {
      title: 'Archway CMS',
      year: '2024',
      role: 'Lead Web Engineer',
      type: 'Headless Multi-Tenant Engine',
      summary: 'Lightweight modular headless content management system built to deploy thousands of independent marketing microsites from a unified visual schema canvas.',
      challenge: 'Instantly propagating multi-tenant CDN invalidations, maintaining visual editor responsiveness with large schemas, and keeping asset optimization automated and cheap.',
      achievements: [
        'Developed a dynamic page compiler leveraging Next.js Incremental Static Regeneration (ISR), cutting average web server rendering times by 70%.',
        'Engineered a visual drag-and-drop block schema visual editor that compiles blocks into highly optimized, nested JSON layouts, avoiding relational overhead.',
        'Built an automated serverless media asset pipeline using AWS S3, Lambda, and CloudFront to automatically compress, webp-convert, and edge-cache images on the fly.',
        'Integrated multi-tenant security policies with MongoDB, isolating client content spaces while maintaining shared database pooling.'
      ],
      tech: ['React.js', 'Next.js', 'Node.js', 'MongoDB', 'AWS CloudFront', 'AWS Lambda & S3', 'TailwindCSS'],
      liveUrl: 'https://github.com/sandunrathnayake/archway-headless-cms',
      githubUrl: 'https://github.com/sandunrathnayake/archway-headless-cms',
      chartType: 'archway'
    },
    4: {
      title: 'FlowSync API',
      year: '2024',
      role: 'Backend Engineer',
      type: 'Event-Driven Gateway',
      summary: 'Unified high-availability API gateway acting as the secure edge routing layer, rate-limiting gate, and authentication proxy for microservices.',
      challenge: 'Non-blocking JWT parsing at high scale, minimizing microservice-to-microservice hop overhead, and establishing reliable rate-limits under DDoS attacks.',
      achievements: [
        'Authored a custom high-performance Gateway rate-limiter implementing Token Bucket algorithms inside atomic Redis Lua scripts, executing in under 2ms.',
        'Engineered a zero-copy gRPC reverse proxy that translates external HTTP REST payloads to internal Protocol Buffer messages, saving 8ms of gateway hop overhead.',
        'Integrated unified JWT validation caching, eliminating redundant authentication database calls and boosting peak routing capacity by 200%.',
        'Configured Prometheus structured metrics and custom alerting, enabling gateway team members to detect traffic anomalies in under 2 seconds.'
      ],
      tech: ['Node.js', 'Express', 'Redis', 'gRPC', 'Protocol Buffers', 'Prometheus', 'Grafana', 'Docker'],
      liveUrl: 'https://github.com/sandunrathnayake/flowsync-api-gateway',
      githubUrl: 'https://github.com/sandunrathnayake/flowsync-api-gateway',
      chartType: 'flowsync'
    },
    5: {
      title: 'OrbUI Design System',
      year: '2023',
      role: 'UI Architect',
      type: 'Accessible Component Toolkit',
      summary: 'Highly accessible, standards-compliant, headless web component library designed for high performance and strict enterprise design consistency.',
      challenge: 'Achieving zero external dependencies with full accessibility standards, and keeping the entire bundled payload under 15KB gzipped.',
      achievements: [
        'Authored 45+ atomic, responsive UI components utilizing vanilla HTML Custom Elements (Web Components) and encapsulated Shadow DOM architectures.',
        'Passed strict WCAG 2.1 AAA automated and manual compliance audits, implementing full keyboard-trap management, focus rings, and dynamic ARIA attributes.',
        'Optimized build outputs using Rollup tree-shaking and postcss configurations, reducing compiled bundle footprints to a lightweight 12.4KB gzipped.',
        'Designed detailed design token schemas (JSON to Sass), allowing designers to theme elements instantly via CSS Custom Properties.'
      ],
      tech: ['Web Components', 'Shadow DOM', 'Sass Tokens', 'Rollup', 'Jest', 'Storybook', 'HTML5'],
      liveUrl: 'https://github.com/sandunrathnayake/orbui-design-system',
      githubUrl: 'https://github.com/sandunrathnayake/orbui-design-system',
      chartType: 'orbui'
    },
    6: {
      title: 'VaultDB',
      year: '2023',
      role: 'Distributed Systems Developer',
      type: 'Secure Peer-to-Peer DB',
      summary: 'Decentralized, zero-knowledge encrypted peer-to-peer key-value database utilizing Raft consensus protocols for high availability and partition tolerance.',
      challenge: 'Maintaining distributed transactional consensus under severe network partition scenarios, and guaranteeing secure client-side decryption with zero performance hit.',
      achievements: [
        'Coded the full Raft consensus algorithm from scratch in Java, supporting automated leader election, log replication, and atomic cluster membership changes.',
        'Integrated zero-knowledge envelope encryption utilizing AES-GCM-256 with key rotations, keeping database WAL logs and storage encrypted at rest and in transit.',
        'Engineered a highly optimized Write-Ahead Log (WAL) with Java mmap (Memory-Mapped Files), guaranteeing absolute data resilience with recovery times under 5ms.',
        'Wrote a performant custom socket layer using Java NIO Channels, handling 15,000 inter-node transactions per second on standard virtual servers.'
      ],
      tech: ['Java NIO', 'Raft Consensus Protocol', 'AES-GCM-256 Crypto', 'Memory Mapped Files', 'Maven', 'JUnit'],
      liveUrl: 'https://github.com/sandunrathnayake/vaultdb-consensus-engine',
      githubUrl: 'https://github.com/sandunrathnayake/vaultdb-consensus-engine',
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
