# 🍜 Tanjai POS (ทันใจ POS)

**Tanjai POS** is a modern, web-based Point of Sale system specifically designed for Thai street food vendors and small restaurants. It focuses on speed, simplicity, and local payment behaviors (PromptPay/Cash).

> **Slogan:** สั่งง่าย ได้ไว ถูกใจร้าน (Easy Order, Fast Service, Merchant Friendly)

## 🚀 Key Features
- **Scan-to-Order:** Customer scans QR code at the table to order (No app download required).
- **Real-time Kitchen Display:** Orders sent directly to kitchen/bar stations via WebSocket.
- **Smart Stock:** Inventory deduction logic based on order placement.
- **Thai Payment:** Built-in PromptPay QR generator & Slip verification support.
- **Offline-First Design:** Handles unstable internet connections gracefully.

## 🛠 Tech Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** PostgreSQL (Supabase)
- **Deployment:** Vercel (Frontend), Render/DigitalOcean (Backend)

## 📂 Project Structure
```bash
tanjai-pos/
├── client/          # Next.js Frontend
│   ├── src/app      # App Router Pages
│   └── ...
├── server/          # Node.js Backend
│   ├── config/      # Database Config
│   ├── routes/      # API Endpoints
│   └── ...
└── README.md
