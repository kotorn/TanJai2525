# 📂 Project Structure

## Overview
This project is configured as a **Monorepo** using [Turbo](https://turbo.build/).

## Core Directories

### `apps/web`
The main Next.js application (Customer PWA, Dashboard, Kitchen Display). 
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: Zustand + React Query

### `packages/*`
Shared internal packages used across applications.
- `packages/ui`: Shared UI components (if applicable).
- `packages/config`: Shared configuration (ESLint, TSConfig).

### `docs`
Project documentation, guides, and architectural decisions.

## Key Files
- `turbo.json`: Configuration for the Turbo build system.
- `apps/web/playwright.config.ts`: E2E testing configuration.
- `apps/web/next.config.mjs`: Next.js configuration.
