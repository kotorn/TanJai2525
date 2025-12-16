# Tanjai Enterprise Platform

**Tanjai Solutions Co., Ltd.**  
*Empowering Food & Beverage Businesses with Intelligent Technology.*

## 🏢 Platform Overview
We provide an all-in-one ecosystem for F&B businesses, scaling from single-unit street food stalls to multi-national franchise chains. Our monorepo houses widely integrated modules that work seamlessly together.

### 📦 Product Tiers & Modules

| Module Service | Code Path | Description | Target Audience | License Tier |
| :--- | :--- | :--- | :--- | :--- |
| **Tanjai POS** | [`apps/web`](./apps/web) | Frontend Point-of-Sale. Fast, responsive, offline-capable. | Cashiers, Waitstaff | Basic / Pro |
| **Tanjai ERP** | [`apps/erp`](./apps/erp) | Back-office management. Inventory, Procurement, Suppliers. | Owners, Accountants | Enterprise |
| **Shared UI** | [`packages/ui`](./packages/ui) | Design System ensuring brand consistency. | Internal Devs | Core |
| **Database** | [`packages/database`](./packages/database) | Unified Data Layer (Prisma/SQL). | Internal Devs | Core |

---

## 🚀 Getting Started (Development)

This repository is managed with [Turbo](https://turbo.build/).

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL (Supabase)

### Installation
```bash
# Install dependencies for all workspaces
npm install
```

### Running Applications
```bash
# Run All Apps (Parallel)
npx turbo dev

# Run Specific App
npx turbo dev --filter=dist-web # Start POS (Port 3000)
npx turbo dev --filter=erp      # Start ERP (Port 3002)
```

## 📚 Documentation
- [**User Manual**](./docs/USER_MANUAL.md): For end-users and training.
- [**Developer Guide**](./docs/DEVELOPER_GUIDE.md): Technical deep-dive and contribution guidelines.
- [**ERP Architecture**](./apps/erp/README.md): Specifics of the ERP module.

## 🤝 Governance & Contribution
Please refer to the `.github/` folder for issue templates and standardized workflows.

- **Bug Reports**: Use the standard template.
- **Feature Requests**: Must align with the Roadmap.
- **Code Style**: Enforced via ESLint & Prettier.

---
© 2025 Tanjai Solutions. All Rights Reserved.
