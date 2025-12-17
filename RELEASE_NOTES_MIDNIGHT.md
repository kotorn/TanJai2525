# 🌙 Midnight Comfort & Smart QR Update (v2.1.0)

**Date:** 2025-12-18
**Status:** Ready for Launch

## 🌟 Highlights
- **New Theme "Midnight Comfort":** A sophisticated dark mode UI inspired by efficient warm service.
- **Smart QR System:** Dual-mode QR generation for Table management and fast Payments.

## 🚀 New Features

### 1. Customer Menu UI
- **Glassmorphism Design:** Sticky headers and cards with blur effects `.glass-panel`.
- **Active Category Scroll:** Snap-x scrolling with "Burnt Orange" (#ee6c2b) branding.
- **Micro-interactions:** Scale effects on tap and skeleton loading states.

### 2. Smart QR Dashboard (Owner)
- **Static QRs:** Generate printable QRs for specific tables (1-50).
- **Dynamic QRs:** Generate one-time payment QRs with 15-minute expiry.
- **One-Click Print:** Integrated thermal printer friendly layout logic.

### 3. Backend Architecture
- **Table `dynamic_qrs`:** Secure storage for transaction payloads.
- **RLS Policies:** Improved security ensuring only owners can manage their QR codes.
- **Routing:** Dedicated `/table/[id]` and `/pay/[id]` handlers.

## 🛠 Technical Notes
- **Theme Config:** Tailwind extended with `colors.primary.500` (#ee6c2b).
- **Testing:** Passed E2E Stress Test (50 QRs generated in <1s).
- **Assets:** Dynamic Open Graph image added for social sharing.

---
*Ready to serve warmth at midnight.* 🍜
