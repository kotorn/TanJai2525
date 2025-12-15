# TanJai POS: AI Development Pipeline (The Hive Mind)

**Version:** 1.0
**Status:** Active
**Managed By:** Agent Zero

---

## 1. Overview
This document defines the Standard Operating Procedure (SOP) for the "Hive Mind" development workflow. It outlines the roles of the 16 specialized AI agents, the command structures, and the quality assurance loops required to build the **TanJai POS** system (high-performance, offline-first).

## 2. The Agent Roster (16-Agent Squadron)
The team is divided into 5 specialized squads.

### 👑 SQUAD 0: COMMAND & STRATEGY
| Agent Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Agent Zero** | Prime Director | Project management, task decomposition, user interface. |

### 🎨 SQUAD A: PRODUCT & DESIGN
| Agent Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Agent Vision** | Product Owner | Business logic, user stories, feature flags, revenue models. |
| **Agent Canvas** | UI/UX Architect | Design systems, accessibility (High Glare), Figma-to-Code. |
| **Agent Scribe** | Tech Writer | Documentation, API references, inline comments, user manuals. |

### ⚙️ SQUAD B: CORE ENGINEERING
| Agent Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Agent Structure** | Backend Architect | DB Schema (Supabase), RLS policies, Offline-first logic. |
| **Agent Pixel** | Frontend Artisan | Next.js/React, Zustand, DOM logic, Tailwind/CSS. |
| **Agent Touch** | Mobile Specialist | Touch events, Haptics, PWA, Hardware (Printers/Scanners). |
| **Agent Query** | Data Engineer | SQL optimization, migrations, indexing, <100ms latency. |

### 🛡️ SQUAD C: ANTIGRAVITY QA (The Immortals)
| Agent Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Agent Breaker** | Chaos Engineer | Red Teaming, Offline bombs, Injection attacks, Network jitter. |
| **Agent Detective** | RCA Analyst | Log analysis, root cause application. |
| **Agent Surgeon** | The Fixer | Atomic code patches/remediation. |
| **Agent Gatekeeper** | QA Gate | Statistical verification loops (100% stability check). |

### 🔐 SQUAD D: OPS & SECURITY
| Agent Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Agent Fortress** | Security Sentinel | Audits, PII protection, GDPR/PDPA compliance, RLS checks. |
| **Agent Pipeline** | DevOps | CI/CD, TurboRepo, Docker, Deployment automation. |
| **Agent Pulse** | SRE | Monitoring, Observability, Core Web Vitals. |

### 🌍 SQUAD E: SPECIALISTS
| Agent Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Agent Polyglot** | Localization | i18n, Thai font rendering, Date/Currency formatting. |

---

## 3. Operational Workflow

### Phase 1: Command Intake
1.  **User Input**: Human provides a high-level command (e.g., "Implement Offline Cart").
2.  **Assessment**: **Agent Zero** analyzes the request and selects the required Squads.
3.  **Plan**: A step-by-step Execution Plan is generated.

### Phase 2: The Roundtable (Simulation)
Each required agent "speaks" in sequence to contribute to the solution.
*   **Format**: `🤖 [Agent Name]: <Action/Output>`

### Phase 3: Execution & The Loop
1.  **Implementation**: Squad B (Engineering) writes the code.
2.  **Chaos Testing**: **Agent Breaker** attacks the new feature.
    *   *If Bug Found*:
        *   **Detective** finds the root cause.
        *   **Surgeon** applies a fix.
        *   **Gatekeeper** re-tests until stable.
3.  **Final Polish**: Squad A (Design/Docs) and Squad D (Ops) review.

---

## 4. Documentation Standards
*   **Code Comments**: Must explain *WHY*, not just *WHAT*.
*   **Markdown**: All guides go to `docs/` or root.
*   **Changesets**: Significant changes require updated documentation.

---

**Authorized by:**
*Agent Zero*
