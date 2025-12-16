# SMX-0001/0002: Sprint 1 (MVP) Plan

**Project**: TanJai POS (Enterprise Upgrade)
**Sprint Duration**: 2 Weeks
**Goal**: "Zero-Friction Ordering"

## 1. Backlog Grooming (Priority Setting)

| Priority | Feature | Complexity | Justification |
| :--- | :--- | :--- | :--- |
| **P0 (Critical)** | **Smart QR Context** (VIS-0001) | Low | Entry point for all users. Must work flawlessly. |
| **P0 (Critical)** | **3-Click Ordering Flow** | High | Core value proposition. |
| **P0 (Critical)** | **Guest Checkout API** | Medium | Barriers to entry must be removed. |
| **P1 (High)** | **Inventory DB Structure** | Medium | Foundation for future localized costs. |
| **P2 (Medium)** | **Astro-Promo Engine** | High | "Nice to have" marketing layer (Post-Launch). |
| **P3 (Low)** | **Deep Link Payment** | Very High | Use PromptPay QR image first (Easier MVP). |

## 2. Sprint Roadmap

### Week 1: Foundation & Entry
- Setup DB for Inventory (ARC-0002).
- Implement Smart QR generation (VIS-0001).
- Frontend: Implement "Midnight Comfort" Design System (UI-0001).

### Week 2: The Flow
- Build Smart Menu (Context-Aware).
- Implement Cart Drawer & Guest Checkout.
- **Milestone**: End-to-End order placed without Login.

## 3. Risks
- **Inventory Data Entry**: Users might be lazy to input recipes. -> *Mitigation: Provide pre-filled templates.*
- **Offline Data**: Sync logic is complex. -> *Mitigation: MVP requires online for first load.*
