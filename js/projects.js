/**
 * projects.js — Dynamic Immersive Projects Drawers & Telemetry Graphs
 * Sandun Rathnayake Portfolio
 */

(function () {
  "use strict";

  // ── Projects Database ─────────────────────────────────────
  const PROJECTS_DATA = {
    1: {
      title: "WriteScan — OCR & AI Document App",
      year: "2024",
      role: "Project Leader & Developer",
      type: "Professional Mobile App · Lakmini International (Pvt) Ltd",
      summary:
        "Cross-platform mobile application for iOS and Android with 100K+ downloads, featuring camera OCR scanning and AI-powered document intelligence using OpenAI API.",
      challenge:
        "Integrating real-time camera-based text recognition, enabling conversational Q&A over complex document uploads, and designing a high-throughput Java EE backend API.",
      achievements: [
        "Achieved 100,000+ downloads across iOS and Android platforms.",
        "Built cross-platform mobile app (WriteScan) supporting camera text scanning, document upload, and intelligent document Q&A using OpenAI API.",
        "Engineered real-time AI conversation pipeline for interactive text extraction and deep document analysis.",
        "Developed robust backend REST API using Java EE and MySQL for secure user authentication, session control, and document storage.",
      ],
      tech: [
        "React Native",
        "OpenAI API",
        "OCR Integration",
        "Java EE",
        "RESTful APIs",
        "MySQL",
        "iOS",
        "Android",
      ],
      liveUrl: "https://github.com/Sandun-Rathnayake",
      githubUrl: "https://github.com/Sandun-Rathnayake",
      chartType: "writescan",
    },
    2: {
      title: "E-Commerce Full-Stack Web Platform",
      year: "2024",
      role: "Full-Stack Developer",
      type: "Professional Project · Java Institute Sri Lanka",
      summary:
        "Full-featured web-based e-commerce platform built on Model-View-Controller (MVC) architecture supporting multi-category product catalog, shopping cart, and transactional checkout.",
      challenge:
        "Implementing strict MVC pattern separation, managing dynamic session shopping cart state, and ensuring secure payment processing flows.",
      achievements: [
        "Architected complete e-commerce web platform utilizing MVC pattern with Java EE, Hibernate ORM, and MySQL database backend.",
        "Created responsive and accessible web frontend using HTML5, CSS3, and JavaScript.",
        "Implemented secure user registration, session management, product filter catalog, and checkout payment processing workflows.",
      ],
      tech: [
        "Java EE",
        "Jakarta EE",
        "Hibernate",
        "MySQL",
        "MVC",
        "HTML5",
        "CSS3",
        "JavaScript",
      ],
      liveUrl: "https://github.com/Sandun-Rathnayake",
      githubUrl: "https://github.com/Sandun-Rathnayake",
      chartType: "ecommerce",
    },
    3: {
      title: "M-Commerce Food Waste Reduction App",
      year: "2024",
      role: "Mobile Developer",
      type: "Professional Project · Android",
      summary:
        "Mobile commercial application aimed at mitigating retail food waste by enabling grocery stores and outlets to sell near-expiry food items at discounted prices.",
      challenge:
        "Designing real-time price updates for dynamic inventory, location-based store item discovery, and optimized JSON payload transport over mobile networks.",
      achievements: [
        "Developed native Android application frontend in Java with custom user interface components.",
        "Implemented backend RESTful API infrastructure utilizing Java EE, Hibernate, and MySQL server.",
        "Integrated dynamic item discounting feeds and real-time inventory availability trackers to promote sustainability.",
      ],
      tech: [
        "Android SDK",
        "Java",
        "RESTful APIs",
        "Java EE",
        "Hibernate",
        "MySQL",
      ],
      liveUrl: "https://github.com/Sandun-Rathnayake",
      githubUrl: "https://github.com/Sandun-Rathnayake",
      chartType: "foodwaste",
    },
    4: {
      title: "Real-Time Chat & Messaging App",
      year: "2024",
      role: "Full-Stack Developer",
      type: "Professional Project · React Native + TypeScript",
      summary:
        "Cross-platform real-time mobile messaging application engineered with WebSockets for instant message delivery, push notifications, and chat history persistence.",
      challenge:
        "Maintaining low-latency bi-directional WebSocket channels on mobile networks, ensuring message delivery receipt synchronization, and message persistence.",
      achievements: [
        "Built cross-platform real-time chat interface with React Native, TypeScript, and WebSocket protocol.",
        "Developed backend REST API infrastructure in Java EE with MySQL database persistence.",
        "Implemented push notification triggers, message status indicators (sent, delivered, read), and chat state synchronization.",
      ],
      tech: [
        "React Native",
        "TypeScript",
        "WebSocket",
        "Java EE",
        "RESTful APIs",
        "MySQL",
      ],
      liveUrl: "https://github.com/Sandun-Rathnayake",
      githubUrl: "https://github.com/Sandun-Rathnayake",
      chartType: "chat",
    },
    5: {
      title: "Hospital Management System",
      year: "2023",
      role: "Desktop App Developer",
      type: "Professional Project · Java Swing",
      summary:
        "Enterprise desktop software for comprehensive hospital management including patient intake, staff scheduling, room & equipment allocation, paramedic assignment, and billing.",
      challenge:
        "Handling complex multi-department hospital workflows, strict Role-Based Access Control (RBAC), and generating detailed financial and inventory reports.",
      achievements: [
        "Developed desktop management system in Java Swing handling paramedic/vehicle assignment, staff, patient records, and equipment allocations.",
        "Engineered Goods Received Note (GRN) inventory tracking and billing payment processing modules.",
        "Implemented fine-grained Role-Based Access Control (RBAC) and dynamic operational reporting dashboards.",
      ],
      tech: ["Java Swing", "Java", "MySQL", "RBAC Security", "Desktop GUI"],
      liveUrl: "https://github.com/Sandun-Rathnayake",
      githubUrl: "https://github.com/Sandun-Rathnayake",
      chartType: "hospital",
    },
    6: {
      title: "Real-Time Cargo Tracking System",
      year: "2023",
      role: "Backend Systems Developer",
      type: "Professional Project · Java EE + EJB",
      summary:
        "Enterprise logistics tracking web application enabling customers and operators to track freight cargo shipments in real time using unique shipment identifiers.",
      challenge:
        "Ensuring transaction consistency under concurrent status updates, managing EJB session state across logistics nodes, and real-time tracking lookups.",
      achievements: [
        "Engineered enterprise logistics backend utilizing Enterprise JavaBeans (EJB) for transactional isolation and business logic encapsulation.",
        "Built real-time shipment status lookup and tracking pipeline using unique shipment IDs.",
        "Configured session management and database state transaction control for high reliability.",
      ],
      tech: ["Java EE", "EJB", "Enterprise JavaBeans", "MySQL", "RESTful APIs"],
      liveUrl: "https://github.com/Sandun-Rathnayake",
      githubUrl: "https://github.com/Sandun-Rathnayake",
      chartType: "cargo",
    },
  };

  // ── Global Animation Frame Tracker ────────────────────────
  let activeAnimationId = null;

  // ── Initialize Project Details Drawer ─────────────────────
  function initProjectDrawer() {
    const drawer = document.getElementById("project-drawer");
    const backdrop = document.getElementById("project-drawer-backdrop");
    const closeBtn = document.getElementById("project-drawer-close");
    const scrollContainer = document.getElementById("project-drawer-scroll");

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
                  ${data.achievements.map((ach) => `<li>${ach}</li>`).join("")}
                </ul>
              </div>

              <div class="project-detail__section">
                <h3 class="project-detail__sub">04 — Technologies Deployed</h3>
                <div class="project-detail__tags">
                  ${data.tech.map((t) => `<span class="skills__badge">${t}</span>`).join("")}
                </div>
              </div>

            </div>

            <div class="project-detail__telemetry">
              <div class="telemetry-panel">
                <div class="telemetry-panel__header">
                  <div class="telemetry-panel__status-dot"></div>
                  <span class="telemetry-panel__title">Interactive Vector Architecture &amp; Telemetry</span>
                </div>
                <div class="telemetry-panel__canvas-wrap" id="telemetry-canvas-wrap">
                  <!-- Injected SVG telemetries -->
                </div>
                <div class="telemetry-panel__footer">
                  <span class="telemetry-panel__metric" id="telemetry-metric-1">Status: Initializing...</span>
                  <span class="telemetry-panel__metric" id="telemetry-metric-2">Metric: --</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Show Drawer
      document.body.classList.add("cursor-hover");
      drawer.setAttribute("aria-hidden", "false");
      drawer.classList.add("active");

      // Prevent parent scroll
      document.body.style.overflow = "hidden";

      // Start Custom Telemetry Animation
      setTimeout(() => {
        startTelemetryAnimation(data.chartType);
      }, 300);
    }

    // Close Drawer
    function closeProject() {
      drawer.setAttribute("aria-hidden", "true");
      drawer.classList.remove("active");
      document.body.style.overflow = "";

      if (activeAnimationId) {
        cancelAnimationFrame(activeAnimationId);
        activeAnimationId = null;
      }
    }

    // Intercept clicks on project cards
    document.querySelectorAll(".work__item").forEach((item) => {
      const link = item.querySelector(".work__link");
      if (!link) return;

      const id = item.dataset.index;
      if (!id) return;

      link.addEventListener("click", (e) => {
        e.preventDefault();
        openProject(id);
      });
    });

    // Close event listeners
    closeBtn.addEventListener("click", closeProject);
    backdrop.addEventListener("click", closeProject);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeProject();
    });
  }

  // ── Custom Vector Animations for Project Telemetry ──────────────
  function startTelemetryAnimation(type) {
    const wrap = document.getElementById("telemetry-canvas-wrap");
    const m1 = document.getElementById("telemetry-metric-1");
    const m2 = document.getElementById("telemetry-metric-2");
    if (!wrap) return;

    // ── 01: WriteScan — OCR Camera Scan & OpenAI AI Vector Flow ──
    if (type === "writescan") {
      wrap.innerHTML = `
        <svg viewBox="0 0 400 220" class="telemetry-svg">
          <!-- Document Frame -->
          <rect x="60" y="20" width="160" height="180" rx="6" fill="var(--bg)" stroke="var(--border)" stroke-width="1.5" />
          <line x1="80" y1="45" x2="180" y2="45" stroke="var(--text-secondary)" stroke-width="2" opacity="0.4" />
          <line x1="80" y1="65" x2="200" y2="65" stroke="var(--text-secondary)" stroke-width="2" opacity="0.4" />
          <line x1="80" y1="85" x2="160" y2="85" stroke="var(--text-secondary)" stroke-width="2" opacity="0.4" />
          <line x1="80" y1="105" x2="190" y2="105" stroke="var(--text-secondary)" stroke-width="2" opacity="0.4" />
          <line x1="80" y1="125" x2="170" y2="125" stroke="var(--text-secondary)" stroke-width="2" opacity="0.4" />
          <line x1="80" y1="145" x2="195" y2="145" stroke="var(--text-secondary)" stroke-width="2" opacity="0.4" />
          <line x1="80" y1="165" x2="150" y2="165" stroke="var(--text-secondary)" stroke-width="2" opacity="0.4" />

          <!-- Vertical Laser Beam Scanner -->
          <line id="laser-beam" x1="60" y1="20" x2="220" y2="20" stroke="var(--accent)" stroke-width="2.5" />
          <polygon id="laser-glow" points="60,20 220,20 220,30 60,30" fill="var(--accent)" opacity="0.15" />

          <!-- Connection Arrow to AI Engine -->
          <path d="M 220 110 L 290 110" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="4 4" />
          <circle id="ocr-pulse" cx="220" cy="110" r="4" fill="var(--accent)" />

          <!-- OpenAI AI Core Node -->
          <g id="ai-node">
            <circle cx="330" cy="110" r="28" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" />
            <circle id="ai-core" cx="330" cy="110" r="14" fill="var(--accent)" opacity="0.2" />
            <text x="330" y="113" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="9" font-weight="700">AI-LLM</text>
          </g>
          <text x="140" y="195" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="8">CAMERA OCR FRAME</text>
        </svg>
      `;

      const laser = document.getElementById("laser-beam");
      const glow = document.getElementById("laser-glow");
      const pulse = document.getElementById("ocr-pulse");
      const aiCore = document.getElementById("ai-core");

      let scanY = 20;
      let dir = 1.5;
      let pulseT = 0;

      function animate() {
        scanY += dir;
        if (scanY > 175 || scanY < 25) dir = -dir;

        if (laser) {
          laser.setAttribute("y1", scanY);
          laser.setAttribute("y2", scanY);
        }
        if (glow) {
          glow.setAttribute(
            "points",
            `60,${scanY} 220,${scanY} 220,${scanY + 12} 60,${scanY + 12}`,
          );
        }

        pulseT = (pulseT + 0.02) % 1;
        if (pulse) pulse.setAttribute("cx", 220 + pulseT * 70);

        if (aiCore) {
          const r = 12 + Math.sin(Date.now() * 0.005) * 4;
          aiCore.setAttribute("r", r);
        }

        const conf = (98.5 + Math.random() * 1.2).toFixed(1);
        const lat = Math.round(110 + Math.random() * 25);
        if (m1) m1.textContent = `OCR Confidence: ${conf}%`;
        if (m2) m2.textContent = `OpenAI API RTT: ${lat}ms`;

        activeAnimationId = requestAnimationFrame(animate);
      }
      animate();

      // ── 02: E-Commerce Platform — Full-Stack MVC Architecture Flow ──
    } else if (type === "ecommerce") {
      wrap.innerHTML = `
        <svg viewBox="0 0 400 220" class="telemetry-svg">
          <!-- Connector Lines -->
          <line x1="90" y1="110" x2="170" y2="110" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="3 3" />
          <line x1="230" y1="110" x2="310" y2="110" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="3 3" />

          <!-- Flow Pulses -->
          <circle id="mvc-p1" cx="90" cy="110" r="4" fill="var(--accent)" />
          <circle id="mvc-p2" cx="230" cy="110" r="4" fill="var(--accent)" />

          <!-- Client Node -->
          <rect x="20" y="80" width="70" height="60" rx="4" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />
          <text x="55" y="110" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="9" font-weight="700">CLIENT</text>
          <text x="55" y="125" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="7">HTML/CSS/JS</text>

          <!-- Controller Node -->
          <rect x="170" y="70" width="70" height="80" rx="4" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" />
          <text x="205" y="105" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="9" font-weight="700">MVC ENGINE</text>
          <text x="205" y="120" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="7">Java EE + EJB</text>

          <!-- Database Node -->
          <rect x="310" y="80" width="70" height="60" rx="4" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />
          <text x="345" y="110" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="9" font-weight="700">MYSQL DB</text>
          <text x="345" y="125" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="7">Hibernate ORM</text>

          <!-- Transaction Meter -->
          <rect x="60" y="180" width="280" height="6" rx="3" fill="var(--border)" />
          <rect id="t-meter" x="60" y="180" width="180" height="6" rx="3" fill="var(--accent)" />
          <text x="200" y="172" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="8">TRANSACTION THROUGHPUT</text>
        </svg>
      `;

      const p1 = document.getElementById("mvc-p1");
      const p2 = document.getElementById("mvc-p2");
      const meter = document.getElementById("t-meter");

      let t1 = 0,
        t2 = 0.5;

      function animate() {
        t1 = (t1 + 0.015) % 1;
        t2 = (t2 + 0.015) % 1;

        if (p1) p1.setAttribute("cx", 90 + t1 * 80);
        if (p2) p2.setAttribute("cx", 230 + t2 * 80);

        if (meter) {
          const w = 140 + Math.sin(Date.now() * 0.003) * 60;
          meter.setAttribute("width", w);
        }

        const tps = Math.round(320 + Math.random() * 45);
        const sess = Math.round(1400 + Math.random() * 80);
        if (m1) m1.textContent = `Checkout TPS: ${tps}/s`;
        if (m2) m2.textContent = `Active Sessions: ${sess}`;

        activeAnimationId = requestAnimationFrame(animate);
      }
      animate();

      // ── 03: Food Waste Reduction App — Store Radar & Discount Vector Scanner ──
    } else if (type === "foodwaste") {
      wrap.innerHTML = `
        <svg viewBox="0 0 400 220" class="telemetry-svg">
          <!-- Radar Grid Rings -->
          <circle cx="200" cy="110" r="90" fill="none" stroke="var(--border)" stroke-width="1" />
          <circle cx="200" cy="110" r="60" fill="none" stroke="var(--border)" stroke-width="1" stroke-dasharray="3 3" />
          <circle cx="200" cy="110" r="30" fill="none" stroke="var(--border)" stroke-width="1" stroke-dasharray="2 2" />
          <line x1="110" y1="110" x2="290" y2="110" stroke="var(--border)" stroke-width="1" />
          <line x1="200" y1="20" x2="200" y2="200" stroke="var(--border)" stroke-width="1" />

          <!-- Rotating Radar Sweep Line -->
          <line id="radar-sweep" x1="200" y1="110" x2="290" y2="110" stroke="var(--accent)" stroke-width="2" />

          <!-- Store Outlet Location Pins -->
          <g id="pin-1">
            <circle cx="240" cy="70" r="5" fill="var(--accent)" />
            <circle cx="240" cy="70" r="10" fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.6" />
            <text x="250" y="65" fill="var(--accent)" font-family="var(--font-mono)" font-size="7">STORE #1 (-65%)</text>
          </g>
          <g id="pin-2">
            <circle cx="160" cy="150" r="5" fill="var(--accent)" />
            <circle cx="160" cy="150" r="10" fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.6" />
            <text x="100" y="165" fill="var(--accent)" font-family="var(--font-mono)" font-size="7">STORE #2 (-50%)</text>
          </g>
          <g id="pin-3">
            <circle cx="250" cy="140" r="4" fill="var(--text-secondary)" />
            <text x="260" y="145" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="7">STORE #3 (-40%)</text>
          </g>

          <circle cx="200" cy="110" r="5" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" />
        </svg>
      `;

      const sweep = document.getElementById("radar-sweep");
      let angle = 0;

      function animate() {
        angle += 0.03;
        const x2 = 200 + Math.cos(angle) * 90;
        const y2 = 110 + Math.sin(angle) * 90;

        if (sweep) {
          sweep.setAttribute("x2", x2);
          sweep.setAttribute("y2", y2);
        }

        const saved = Math.round(140 + Math.random() * 15);
        if (m1) m1.textContent = `Food Waste Reduced: ${saved}kg/day`;
        if (m2) m2.textContent = `Discount Range: 40% - 70%`;

        activeAnimationId = requestAnimationFrame(animate);
      }
      animate();

      // ── 04: Real-Time Chat App — WebSocket Full-Duplex Vector Pipeline ──
    } else if (type === "chat") {
      wrap.innerHTML = `
        <svg viewBox="0 0 400 220" class="telemetry-svg">
          <!-- Channel Lines -->
          <line x1="80" y1="85" x2="320" y2="85" stroke="var(--border)" stroke-width="2" />
          <line x1="80" y1="135" x2="320" y2="135" stroke="var(--border)" stroke-width="2" />

          <text x="200" y="70" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="8">WEBSOCKET OUTGOING CHANNEL (TX)</text>
          <text x="200" y="155" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="8">WEBSOCKET INCOMING CHANNEL (RX)</text>

          <!-- Outgoing / Incoming Message Packets -->
          <circle id="ws-tx" cx="80" cy="85" r="5" fill="var(--accent)" />
          <circle id="ws-rx" cx="320" cy="135" r="5" fill="#00d4ff" />

          <!-- Mobile Client End -->
          <rect x="30" y="65" width="50" height="90" rx="6" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" />
          <text x="55" y="115" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="8" font-weight="700">MOBILE</text>

          <!-- Backend Server End -->
          <rect x="320" y="65" width="50" height="90" rx="6" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="2" />
          <text x="345" y="115" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="8" font-weight="700">SERVER</text>

          <!-- Status Indicators -->
          <text id="delivery-status" x="200" y="113" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="9">DELIVERED ✓✓</text>
        </svg>
      `;

      const tx = document.getElementById("ws-tx");
      const rx = document.getElementById("ws-rx");
      const status = document.getElementById("delivery-status");

      let txX = 80;
      let rxX = 320;

      function animate() {
        txX += 4;
        if (txX > 320) txX = 80;

        rxX -= 3.5;
        if (rxX < 80) rxX = 320;

        if (tx) tx.setAttribute("cx", txX);
        if (rx) rx.setAttribute("cx", rxX);

        const rtt = Math.round(14 + Math.random() * 8);
        if (m1) m1.textContent = `WebSocket RTT: ${rtt}ms`;
        if (m2) m2.textContent = `Delivery Status: ACK ✓✓`;

        activeAnimationId = requestAnimationFrame(animate);
      }
      animate();

      // ── 05: Hospital Management System — Enterprise Workflow & RBAC Node Graph ──
    } else if (type === "hospital") {
      wrap.innerHTML = `
        <svg viewBox="0 0 400 220" class="telemetry-svg">
          <!-- Flow Connections -->
          <path d="M 70,110 L 150,60 L 250,60 L 330,110 L 250,160 L 150,160 Z" fill="none" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="3 3" />

          <!-- Active Flow Particle -->
          <circle id="hosp-p" cx="70" cy="110" r="4.5" fill="var(--accent)" />

          <!-- Nodes -->
          <g id="hn-1">
            <circle cx="70" cy="110" r="14" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" />
            <text x="70" y="113" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="7">INTAKE</text>
          </g>
          <g id="hn-2">
            <circle cx="150" cy="60" r="14" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />
            <text x="150" y="63" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="7">PATIENT</text>
          </g>
          <g id="hn-3">
            <circle cx="250" cy="60" r="14" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />
            <text x="250" y="63" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="7">STAFF</text>
          </g>
          <g id="hn-4">
            <circle cx="330" cy="110" r="14" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" />
            <text x="330" y="113" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="7">PARAMEDIC</text>
          </g>
          <g id="hn-5">
            <circle cx="250" cy="160" r="14" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />
            <text x="250" y="163" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="7">ROOMS</text>
          </g>
          <g id="hn-6">
            <circle cx="150" cy="160" r="14" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" />
            <text x="150" y="163" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="7">GRN BILL</text>
          </g>

          <text x="200" y="113" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="9" font-weight="700">RBAC SECURITY LOCK: ENFORCED</text>
        </svg>
      `;

      const hp = document.getElementById("hosp-p");
      let nodeIdx = 0;
      const waypoints = [
        { x: 70, y: 110 },
        { x: 150, y: 60 },
        { x: 250, y: 60 },
        { x: 330, y: 110 },
        { x: 250, y: 160 },
        { x: 150, y: 160 },
      ];
      let t = 0;

      function animate() {
        t += 0.02;
        if (t >= 1) {
          t = 0;
          nodeIdx = (nodeIdx + 1) % waypoints.length;
        }

        const p1 = waypoints[nodeIdx];
        const p2 = waypoints[(nodeIdx + 1) % waypoints.length];

        const cx = p1.x + (p2.x - p1.x) * t;
        const cy = p1.y + (p2.y - p1.y) * t;

        if (hp) {
          hp.setAttribute("cx", cx);
          hp.setAttribute("cy", cy);
        }

        if (m1) m1.textContent = `RBAC Policy: ENFORCED`;
        if (m2) m2.textContent = `Active GRN Records: 1,240`;

        activeAnimationId = requestAnimationFrame(animate);
      }
      animate();

      // ── 06: Real-Time Cargo Tracking — Logistics Transit Tracker & EJB State Machine ──
    } else if (type === "cargo") {
      wrap.innerHTML = `
        <svg viewBox="0 0 400 220" class="telemetry-svg">
          <!-- Global Shipping Route Arc -->
          <path d="M 50,150 Q 200,20 350,150" fill="none" stroke="var(--border)" stroke-width="2" stroke-dasharray="4 4" />

          <!-- Shipment Tracker Node -->
          <circle id="cargo-shipment" cx="50" cy="150" r="7" fill="var(--accent)" />
          <circle id="cargo-pulse" cx="50" cy="150" r="14" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.5" />

          <!-- Transit Waypoints -->
          <circle cx="50" cy="150" r="4" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />
          <circle cx="200" cy="85" r="4" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />
          <circle cx="350" cy="150" r="4" fill="var(--bg)" stroke="var(--text-secondary)" stroke-width="1.5" />

          <text x="50" y="175" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="8">ORIGIN</text>
          <text x="200" y="65" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="8">CUSTOMS CLEARANCE</text>
          <text x="350" y="175" text-anchor="middle" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="8">DESTINATION</text>

          <!-- EJB Transaction Banner -->
          <rect x="110" y="185" width="180" height="22" rx="3" fill="var(--bg)" stroke="var(--accent)" stroke-width="1" />
          <text x="200" y="199" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="8" font-weight="700">EJB TRANSACTION: OK</text>
        </svg>
      `;

      const cargo = document.getElementById("cargo-shipment");
      const pulse = document.getElementById("cargo-pulse");
      let t = 0;

      function animate() {
        t = (t + 0.006) % 1;

        // Quadratic Bezier interpolation (P0=50,150; P1=200,20; P2=350,150)
        const cx = (1 - t) * (1 - t) * 50 + 2 * (1 - t) * t * 200 + t * t * 350;
        const cy = (1 - t) * (1 - t) * 150 + 2 * (1 - t) * t * 20 + t * t * 150;

        if (cargo) {
          cargo.setAttribute("cx", cx);
          cargo.setAttribute("cy", cy);
        }
        if (pulse) {
          pulse.setAttribute("cx", cx);
          pulse.setAttribute("cy", cy);
          const pr = 10 + Math.sin(Date.now() * 0.006) * 6;
          pulse.setAttribute("r", pr);
        }

        const trackerId = `LK-${Math.round(884000 + t * 1000)}`;
        if (m1) m1.textContent = `Shipment ID: ${trackerId}`;
        if (m2) m2.textContent = `EJB Status: REAL_TIME_SYNC`;

        activeAnimationId = requestAnimationFrame(animate);
      }
      animate();
    }
  }

  // ── Initialise ────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProjectDrawer);
  } else {
    initProjectDrawer();
  }
})();
