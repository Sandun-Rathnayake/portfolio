/**
 * terminal.js — Embedded Retro-Futuristic Interactive Command Shell
 * Sandun Rathnayake Portfolio
 */

(function () {
  "use strict";

  // ── Terminal State & Config ───────────────────────────────
  const PROMPT_STR = "guest@sandun.dev:~$ ";
  let terminalHistory = [];
  let historyIndex = -1;

  // Active dialogue steps for simulated message email sender
  let mailState = {
    active: false,
    step: 0,
    name: "",
    email: "",
    message: "",
  };

  function initTerminal() {
    const terminal = document.getElementById("contact-terminal");
    const logsWrap = document.getElementById("terminal-logs");
    const formInput = document.getElementById("terminal-input");
    const typedSpan = document.getElementById("terminal-typed");
    const promptSpan = document.getElementById("terminal-prompt");

    if (!terminal || !logsWrap || !formInput) return;

    function syncTyped() {
      if (typedSpan) typedSpan.textContent = formInput.value;
    }

    formInput.addEventListener("input", syncTyped);
    formInput.addEventListener("keyup", syncTyped);

    // Focus input on terminal click
    terminal.addEventListener("click", () => {
      formInput.focus();
    });

    // Handle submit / Enter key
    formInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const rawCmd = formInput.value;
        formInput.value = "";
        syncTyped();
        const cleanCmd = rawCmd.trim();

        if (cleanCmd.length > 0) {
          terminalHistory.push(cleanCmd);
          historyIndex = terminalHistory.length;
        }

        // Print input line
        printLine(`${PROMPT_STR}${rawCmd}`);

        // Parse command
        if (mailState.active) {
          handleMailDialogue(cleanCmd);
        } else {
          parseCommand(cleanCmd);
        }

        // Scroll to bottom
        terminal.scrollTop = terminal.scrollHeight;
      }

      // History navigation (Arrow Up / Arrow Down)
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (terminalHistory.length > 0 && historyIndex > 0) {
          historyIndex--;
          formInput.value = terminalHistory[historyIndex];
          syncTyped();
        }
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (
          terminalHistory.length > 0 &&
          historyIndex < terminalHistory.length - 1
        ) {
          historyIndex++;
          formInput.value = terminalHistory[historyIndex];
          syncTyped();
        } else {
          historyIndex = terminalHistory.length;
          formInput.value = "";
          syncTyped();
        }
      }
    });

    // Initial prints
    printLine("SANDUN.DEV COMMAND SHELL // v1.1.26-production");
    printLine('Type "help" to list available telemetry logs & system actions.');
    printLine("");
  }

  // ── Print Line to Console ────────────────────────────────
  function printLine(text, className = "") {
    const logsWrap = document.getElementById("terminal-logs");
    if (!logsWrap) return;

    const line = document.createElement("div");
    line.className = `terminal__line ${className}`;
    line.textContent = text;
    logsWrap.appendChild(line);
  }

  // ── Command Router & Parser ──────────────────────────────
  function parseCommand(cmd) {
    const args = cmd.toLowerCase().split(" ");
    const primary = args[0];

    switch (primary) {
      case "help":
        printLine("AVAILABLE COMMANDS:");
        printLine("  about       — Print a brief system background bio");
        printLine("  experience  — Show career history & employment timeline");
        printLine("  skills      — Show ASCII representation of tech pyramid");
        printLine("  projects    — List active core engineering projects");
        printLine(
          "  contact     — Access email, socials, and location profiles",
        );
        printLine(
          "  email       — Triggers secure email packet dispatcher dialogue",
        );
        printLine("  clear       — Clear current logs console buffer");
        break;

      case "about":
        printLine("SANDUN RATHNAYAKE — FULL-STACK SOFTWARE ENGINEER");
        printLine("------------------------------------------------");
        printLine(
          "Full-Stack Software Engineer with 2 years of experience designing,",
        );
        printLine(
          "developing, and deploying scalable web applications & mobile solutions.",
        );
        printLine(
          "Expertise in Java EE, React Native, RESTful APIs, AWS, and AI Integrations.",
        );
        break;

      case "experience":
        printLine("CAREER TIMELINE:");
        printLine("----------------");
        printLine(
          "► Full-Stack Software Engineer & Project Leader @ Lakmini International (Sep 2024–Present)",
        );
        printLine(
          "  Developing Android & iOS apps, RESTful APIs, and OpenAI AI integrations",
        );
        printLine(
          "► Full-Stack Software Engineer @ JsoftLK (Jan 2021–Jun 2022)",
        );
        printLine(
          "  Full-stack web & Android development with Java, PHP, JS, Bootstrap, MySQL & Firebase",
        );
        printLine("");
        printLine("EDUCATION:");
        printLine(
          "  BSc (Hons) Software Engineering — Birmingham City University, UK (2023–2024)",
        );
        printLine(
          "  Diploma in Professional Software Engineering — Java Institute Sri Lanka (2023–2024)",
        );
        break;

      case "skills":
        printLine("CORE SYSTEM ENGINEERING COMPETENCE");
        printLine("----------------------------------");
        printLine("        [01 LANGUAGES: JAVA, PYTHON, JS, TS, PHP, C/C++]");
        printLine("         [02 FRONTEND: HTML, CSS, REACT NATIVE, THREE.JS]");
        printLine(
          "       [03 FRAMEWORKS: JAVA EE, JAKARTA EE, HIBERNATE, EJB]",
        );
        printLine("        [04 DATABASES: MYSQL, POSTGRESQL, SQLITE, MONGODB]");
        printLine("         [05 CLOUD & DEVOPS: AWS, GIT, MAVEN, GRADLE]");
        printLine("          [06 SERVERS: APACHE TOMCAT, PAYARA, NGINX]");
        printLine("             [07 AI & APIS: OPENAI API, OCR, WEBSOCKET]");
        printLine("               [08 ARCHITECTURE: MVC, AGILE, UML]");
        break;

      case "projects":
        printLine("ACTIVE PROJECTS REGISTRY:");
        printLine("-------------------------");
        printLine(
          "1. WriteScan          - OCR & AI Document App [100K+ Downloads] (React Native, OpenAI API)",
        );
        printLine(
          "2. E-Commerce Platform- Full-Stack Web App (Java EE, MVC, MySQL)",
        );
        printLine(
          "3. Food Waste App     - M-Commerce Reduction App (Android, Java EE)",
        );
        printLine(
          "4. Real-Time Chat App - Mobile Messaging System (React Native, WebSocket)",
        );
        printLine(
          "5. Hospital System    - Enterprise Desktop App (Java Swing, RBAC)",
        );
        printLine(
          "6. Cargo Tracking     - Real-Time Logistics Platform (Java EE, EJB)",
        );
        printLine("");
        printLine(
          "Click work cards on the grid above to expand visual dashboards.",
        );
        break;

      case "contact":
        printLine("TRANSMISSION ENDPOINTS:");
        printLine("-----------------------");
        printLine("  EMAIL:     sandunbuddika09@gmail.com");
        printLine("  PHONE:     +94 78 117 8102");
        printLine("  GITHUB:    github.com/Sandun-Rathnayake");
        printLine("  LINKEDIN:  linkedin.com/in/sandun09");
        printLine("  LOCATION:  Piliyandala, Sri Lanka");
        break;

      case "email":
        mailState.active = true;
        mailState.step = 1;
        printLine(
          "STARTING SECURE TRANSMISSION SEQUENCE...",
          "terminal__line--accent",
        );
        printLine("Please specify your name:");
        break;

      case "bu": {
        const isPink =
          document.documentElement.getAttribute("data-theme") === "babypink";
        if (isPink) {
          document.documentElement.removeAttribute("data-theme");
          printLine(
            "► THEME RESET: RESTORED TO DEFAULT THEME.",
            "terminal__line--accent",
          );
          printLine(
            "Hey youuuu",
            "terminal__line--accent",
          );
          if (window.__threeScene && window.__threeScene.setThemeColor) {
            window.__threeScene.setThemeColor("default");
          }
          if (window.__threeScene && window.__threeScene.setLiquidColor) {
            window.__threeScene.setLiquidColor("#fafbff");
          }
          if (window.__fluidEffect && window.__fluidEffect.setLiquidColor) {
            window.__fluidEffect.setLiquidColor("#fafbff");
          }
        } else {
          document.documentElement.setAttribute("data-theme", "babypink");
          printLine(
            "🌸 [BU OVERRIDE ACTIVATED] 🌸",
            "terminal__line--accent",
          );
          printLine(
            "► PALETTE SHIFTED: CYBER BABY PINK & SAKURA THEME APPLIED.",
            "terminal__line--accent",
          );
          if (window.__threeScene && window.__threeScene.setThemeColor) {
            window.__threeScene.setThemeColor("babypink");
          }
          if (window.__threeScene && window.__threeScene.setLiquidColor) {
            window.__threeScene.setLiquidColor("#ffb6c1");
          }
          if (window.__fluidEffect && window.__fluidEffect.setLiquidColor) {
            window.__fluidEffect.setLiquidColor("#ffb6c1");
          }
        }
        break;
      }

      case "clear":
        const logsWrap = document.getElementById("terminal-logs");
        if (logsWrap) logsWrap.innerHTML = "";
        break;

      default:
        printLine(
          `bash: command not found: ${cmd}. Type "help" to see valid commands.`,
        );
    }
  }

  // ── Secure Mail Dispatcher Dialogue ────────────────────────
  function handleMailDialogue(input) {
    if (mailState.step === 1) {
      if (!input) {
        printLine("Name cannot be null. Please specify name:");
        return;
      }
      mailState.name = input;
      mailState.step = 2;
      printLine("Please specify your email address:");
    } else if (mailState.step === 2) {
      if (!input || !input.includes("@")) {
        printLine("Invalid email. Please specify valid email address:");
        return;
      }
      mailState.email = input;
      mailState.step = 3;
      printLine("Enter your transmission message content:");
    } else if (mailState.step === 3) {
      if (!input) {
        printLine("Message cannot be empty. Please enter message:");
        return;
      }
      mailState.message = input;

      printLine(
        "COMPILE STATE: SECURE PACKET COMPILED.",
        "terminal__line--accent",
      );
      printLine(`  SENDER: ${mailState.name} <${mailState.email}>`);
      printLine(`  PAYLOAD: "${mailState.message}"`);
      printLine("DISPATCHING ENVELOPE REDIRECT INTERFACE...");

      // Open mailto link
      const subject = encodeURIComponent(
        `Portfolio Inquiry from ${mailState.name}`,
      );
      const body = encodeURIComponent(
        `Hi Sandun,\n\n${mailState.message}\n\nBest regards,\n${mailState.name}\nEmail: ${mailState.email}`,
      );
      setTimeout(() => {
        window.location.href = `mailto:sandunbuddika09@gmail.com?subject=${subject}&body=${body}`;
      }, 1000);

      // Reset state
      mailState.active = false;
      mailState.step = 0;
      printLine(
        "TRANSMISSION COMPLETE. Terminal returned to idle state.",
        "terminal__line--accent",
      );
      printLine("");
    }
  }

  // ── Initialise ────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTerminal);
  } else {
    initTerminal();
  }
})();
