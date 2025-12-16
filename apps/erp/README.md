# Tanjai ERP (Enterprise Resource Planning)

**Status**: Alpha  
**Version**: 0.1.0  
**Stack**: Next.js (App Router), TypeScript, Tailwind CSS, Prisma  

## 🏢 Overview
**Tanjai ERP** is the centralized back-office engine for the Tanjai Ecosystem. While the **POS (Point of Sale)** handles front-line transactions, the ERP manages the "Backend of Business Operations" for multi-branch enterprises.

It serves as the Single Source of Truth for:
- **Inventory Management**: Real-time stock tracking across warehouses and branches.
- **Procurement (Purchasing)**: Supplier management, Purchase Orders (PO), and Goods Receipt (GR).
- **Cost Control**: COGS analysis and recipe management.

## 📦 Module Architecture
This project is part of the `tanjai-pos` monorepo but operates as a distinct application.

| Module | Description | Key Features |
| :--- | :--- | :--- |
| **Inventory** | Stock Control | Stock Counts, Transfers, Wastage Reporting |
| **Purchasing** | Procurement | PO Generation, Supplier Database, Approval Workflows |
| **Suppliers** | Vendor Mgmt | CRM for Suppliers, Price Lists, Lead Times |
| **Reports** | Analytics | Cost Analysis, Stock Movement Logs |

## 🛠 Tech Stack & Integration
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: Shared `@tanjai/ui` (ensures brand consistency with POS)
- **Database**: Shared `@tanjai/database` (PostgreSQL via Prisma)
- **Authentication**: Shared Auth (planned)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker (for local DB)

### Installation
Run from the monorepo root:
```bash
# Install dependencies
npm install

# Start the development server (runs on Port 3002 usually)
npm run dev --filter=erp
```

## 📂 Directory Structure
```
apps/erp/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # ERP-specific components
│   ├── lib/           # Utilities & Hooks
│   └── services/      # Business Logic (InventoryService, etc.)
├── public/            # Static Assets
└── README.md          # You are here
```

## 🤝 Contributing
Please refer to the root `DEVELOPER_README.md` for monorepo guidelines.
**Branch Naming**: `feat/erp-inventory-xyz` or `fix/erp-po-calculation`.

---
*Property of Tanjai Solutions Co., Ltd.*
