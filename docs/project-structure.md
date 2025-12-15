# 📂 Project Structure (โครงสร้างโปรเจกต์)

## Overview (ภาพรวม)
This project is configured as a **Monorepo** using [Turbo](https://turbo.build/).
โปรเจกต์นี้ใช้โครงสร้างแบบ Monorepo จัดการด้วย Turbo

## Core Directories (ไดเรกทอรีหลัก)

### `apps/web`
The main Next.js application (Customer PWA, Dashboard, Kitchen Display).
เว็บแอปพลิเคชันหลัก รวมถึงระบบสั่งอาหารลูกค้า (PWA), แดชบอร์ดร้านอาหาร, และจอครัว

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: Zustand + React Query

### `packages/*`
Shared internal packages used across applications.
แพ็คเกจที่ใช้ร่วมกันภายในโปรเจกต์

- `packages/ui`: Shared UI components (คอมโพเนนต์ UI กลาง)
- `packages/config`: Shared configuration (การตั้งค่ากลาง เช่น ESLint, TSConfig)

### `docs`
Project documentation, guides, and architectural decisions.
เอกสารคู่มือการใช้งานและการออกแบบระบบ

## Key Files (ไฟล์สำคัญ)
- `turbo.json`: Configuration for the Turbo build system (ตั้งค่า Turbo)
- `apps/web/playwright.config.ts`: E2E testing configuration (ตั้งค่าการเทส E2E)
- `apps/web/next.config.mjs`: Next.js configuration (ตั้งค่า Next.js)
