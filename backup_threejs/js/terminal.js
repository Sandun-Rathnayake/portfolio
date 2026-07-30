/**
 * terminal.js — Embedded Retro-Futuristic Interactive Command Shell
 * Sandun Rathnayake Portfolio
 */

(function () {
  'use strict';

  // ── Terminal State & Config ───────────────────────────────
  const PROMPT_STR = 'guest@sandun.dev:~$ ';
  let terminalHistory = [];
  let historyIndex = -1;

  // Active dialogue steps for simulated message email sender
  let mailState = {
    active: false,
    step: 0,
    name: '',
    email: '',
    message: ''
  };

  function initTerminal() {
    const terminal = document.getElementById('contact-terminal');
    const logsWrap = document.getElementById('terminal-logs');
    const formInput = document.getElementById('terminal-input');
    const promptSpan = document.getElementById('terminal-prompt');

    if (!terminal || !logsWrap || !formInput) return;

    // Focus input on terminal click
    terminal.addEventListener('click', () => {
      formInput.focus();
    });

    // Handle submit / Enter key
    formInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const rawCmd = formInput.value;
        formInput.value = '';
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
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (terminalHistory.length > 0 && historyIndex > 0) {
          historyIndex--;
          formInput.value = terminalHistory[historyIndex];
        }
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (terminalHistory.length > 0 && historyIndex < terminalHistory.length - 1) {
          historyIndex++;
          formInput.value = terminalHistory[historyIndex];
        } else {
          historyIndex = terminalHistory.length;
          formInput.value = '';
        }
      }
    });

    // Initial prints
    printLine('SANDUN.DEV COMMAND SHELL // v1.1.26-production');
    printLine('Type "help" to list available telemetry logs & system actions.');
    printLine('');
  }

  // ── Print Line to Console ────────────────────────────────
  function printLine(text, className = '') {
    const logsWrap = document.getElementById('terminal-logs');
    if (!logsWrap) return;

    const line = document.createElement('div');
    line.className = `terminal__line ${className}`;
    line.textContent = text;
    logsWrap.appendChild(line);
  }

  // ── Command Router & Parser ──────────────────────────────
  function parseCommand(cmd) {
    const args = cmd.toLowerCase().split(' ');
    const primary = args[0];

    switch (primary) {
      case 'help':
        printLine('AVAILABLE COMMANDS:');
        printLine('  about       — Print a brief system background bio');
        printLine('  experience  — Show career history & employment timeline');
        printLine('  skills      — Show ASCII representation of tech pyramid');
        printLine('  projects    — List active core engineering projects');
        printLine('  contact     — Access email, socials, and location profiles');
        printLine('  email       — Triggers secure email packet dispatcher dialogue');
        printLine('  clear       — Clear current logs console buffer');
        break;

      case 'about':
        printLine('SANDUN RATHNAYAKE — STAFF FULL STACK ENGINEER');
        printLine('---------------------------------------------');
        printLine('System design architect specializing in robust scalable databases,');
        printLine('event-driven message pipelines, and high-performance WebGL interfaces.');
        printLine('Dedicated to clean, predictable systems and exactly-once processing.');
        break;

      case 'experience':
        printLine('CAREER TIMELINE:');
        printLine('----------------');
        printLine('► Senior Full Stack Engineer @ NexaTech Solutions (2024–Present)');
        printLine('  Leading microservices architecture with NestJS, Kafka, Redis');
        printLine('');
        printLine('► Full Stack Developer @ CloudBase (2022–2024)');
        printLine('  Built multi-tenant SaaS with Next.js, AWS, PostgreSQL');
        printLine('');
        printLine('► Software Engineer @ DevForge Labs (2020–2022)');
        printLine('  Developed RESTful APIs using Jakarta EE, Hibernate, MySQL');
        printLine('');
        printLine('► Junior Developer @ Startify (2019–2020)');
        printLine('  Created WordPress themes, React Native apps, CodeIgniter apps');
        printLine('');
        printLine('EDUCATION:');
        printLine('  BSc (Hons) Computer Science — University of Colombo (2016–2020)');
        break;

      case 'skills':
        printLine('CORE SYSTEM ENGINEERING COMPETENCE');
        printLine('----------------------------------');
        printLine('        [01 SYSTEM & PLATFORM ARCHITECTURE]');
        printLine('         [02 CORE: JAVA, PHP, JS, SQL]');
        printLine('       [03 REACT, REACT NATIVE, ANDROID]');
        printLine('        [04 APIS: REST, OPEN API, GRPC]');
        printLine('         [05 MYSQL, POSTGRESQL, NOSQL]');
        printLine('          [06 DEVSECOPS, CLOUD, GIT]');
        printLine('             [07 BLENDER & 3D]');
        printLine('               [08 APEX UI]');
        break;

      case 'projects':
        printLine('ACTIVE PROJECTS REGISTRY:');
        printLine('-------------------------');
        printLine('1. NexaCommerce     - E-Commerce Engine (NestJS, Kafka, Redis)');
        printLine('2. PulseAnalytics   - Live Stream Pipeline (Go, ClickHouse, Ws)');
        printLine('3. Archway CMS      - Multi-Tenant Web Engine (Next.js, AWS S3)');
        printLine('4. FlowSync API     - Event Router Gateway (gRPC, Redis Lua)');
        printLine('5. OrbUI Toolkit    - Accessible Elements (Shadow DOM, WCAG AAA)');
        printLine('6. VaultDB Engine   - P2P Encrypted Consensus (Raft, Java NIO)');
        printLine('');
        printLine('Click work cards on the grid above to expand visual dashboards.');
        break;

      case 'contact':
        printLine('TRANSMISSION ENDPOINTS:');
        printLine('-----------------------');
        printLine('  EMAIL:     sandun.rathnayake@example.dev');
        printLine('  GITHUB:    github.com/sandunrathnayake');
        printLine('  LINKEDIN:  linkedin.com/in/sandunrathnayake');
        printLine('  TWITTER:   twitter.com/sandundev');
        printLine('  LOCATION:  GMT+5:30 LK (Sri Lanka)');
        break;

      case 'email':
        mailState.active = true;
        mailState.step = 1;
        printLine('STARTING SECURE TRANSMISSION SEQUENCE...', 'terminal__line--accent');
        printLine('Please specify your name:');
        break;

      case 'clear':
        const logsWrap = document.getElementById('terminal-logs');
        if (logsWrap) logsWrap.innerHTML = '';
        break;

      default:
        printLine(`bash: command not found: ${cmd}. Type "help" to see valid commands.`);
    }
  }

  // ── Secure Mail Dispatcher Dialogue ────────────────────────
  function handleMailDialogue(input) {
    if (mailState.step === 1) {
      if (!input) {
        printLine('Name cannot be null. Please specify name:');
        return;
      }
      mailState.name = input;
      mailState.step = 2;
      printLine('Please specify your email address:');

    } else if (mailState.step === 2) {
      if (!input || !input.includes('@')) {
        printLine('Invalid email. Please specify valid email address:');
        return;
      }
      mailState.email = input;
      mailState.step = 3;
      printLine('Enter your transmission message content:');

    } else if (mailState.step === 3) {
      if (!input) {
        printLine('Message cannot be empty. Please enter message:');
        return;
      }
      mailState.message = input;

      printLine('COMPILE STATE: SECURE PACKET COMPILED.', 'terminal__line--accent');
      printLine(`  SENDER: ${mailState.name} <${mailState.email}>`);
      printLine(`  PAYLOAD: "${mailState.message}"`);
      printLine('DISPATCHING ENVELOPE REDIRECT INTERFACE...');

      // Open mailto link
      const subject = encodeURIComponent(`Portfolio Inquiry from ${mailState.name}`);
      const body = encodeURIComponent(
        `Hi Sandun,\n\n${mailState.message}\n\nBest regards,\n${mailState.name}\nEmail: ${mailState.email}`
      );
      setTimeout(() => {
        window.location.href = `mailto:sandun.rathnayake@example.dev?subject=${subject}&body=${body}`;
      }, 1000);

      // Reset state
      mailState.active = false;
      mailState.step = 0;
      printLine('TRANSMISSION COMPLETE. Terminal returned to idle state.', 'terminal__line--accent');
      printLine('');
    }
  }

  // ── Initialise ────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTerminal);
  } else {
    initTerminal();
  }
})();
