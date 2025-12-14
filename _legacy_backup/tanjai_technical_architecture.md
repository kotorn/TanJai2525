# Tanjai POS - Technical Architecture Document
**Version:** 1.0  
**Last Updated:** December 14, 2025  
**Status:** Design Phase  
**Owner:** Engineering Team

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-overview)
3. [Frontend Architecture](#frontend)
4. [Backend Architecture](#backend)
5. [Database Design](#database)
6. [API Design](#api)
7. [Real-time Communication](#realtime)
8. [Security Architecture](#security)
9. [Performance & Scalability](#performance)
10. [Deployment Architecture](#deployment)
11. [Monitoring & Observability](#monitoring)
12. [Disaster Recovery](#disaster-recovery)

---

## 1️⃣ Executive Summary {#executive-summary}

### Architecture Goals

| Goal | Strategy | Key Metrics |
|------|----------|-------------|
| **High Availability** | Multi-region deployment, Auto-scaling | 99.9% uptime |
| **Low Latency** | Edge caching, PWA, Local-first | <100ms API response |
| **Scalability** | Horizontal scaling, Microservices-ready | 10K concurrent users |
| **Offline Support** | Service Workers, IndexedDB | Works without internet |
| **Security** | HTTPS, JWT, Row-level security | Zero data breaches |
| **Developer Velocity** | TypeScript, CI/CD, AI assistance | 2-week sprint cycles |

### Technology Stack Summary

```
Frontend:    Next.js 14 (App Router) + React 18 + TypeScript
Styling:     Tailwind CSS + shadcn/ui
State:       Zustand + React Query
Backend:     Node.js 20 + Express.js + TypeScript
Database:    PostgreSQL 15 (Supabase)
Cache:       Redis 7
Real-time:   Socket.io + Supabase Realtime
Storage:     Supabase Storage (S3-compatible)
Payment:     PromptPay QR + Slip Verification APIs
Deployment:  Vercel (Frontend) + Render/Railway (Backend)
Monitoring:  Sentry + Vercel Analytics + Grafana
```

---

## 2️⃣ System Architecture Overview {#system-overview}

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐           │
│  │  Customer   │  │   Admin     │  │   Kitchen    │           │
│  │  Ordering   │  │  Dashboard  │  │   Display    │           │
│  │   (PWA)     │  │   (Web)     │  │   (Tablet)   │           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘           │
│         │                 │                 │                    │
└─────────┼─────────────────┼─────────────────┼────────────────────┘
          │                 │                 │
          │    ┌────────────▼─────────────────▼───┐
          │    │       CDN (Vercel Edge)          │
          │    │    - Static assets caching        │
          │    │    - Edge functions               │
          │    └────────────┬─────────────────────┘
          │                 │
          └─────────────────▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │         Next.js API Routes (Middleware)           │          │
│  │  - Rate Limiting (10 req/sec per IP)             │          │
│  │  - Authentication (JWT validation)                │          │
│  │  - Request logging & correlation ID              │          │
│  │  - Input validation & sanitization               │          │
│  └────────────────────┬─────────────────────────────┘          │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────────┐
│                    BACKEND SERVICES LAYER                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐         │
│  │   Order     │  │   Payment    │  │   Analytics    │         │
│  │   Service   │  │   Service    │  │   Service      │         │
│  │  (Node.js)  │  │  (Node.js)   │  │  (Node.js)     │         │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘         │
│         │                 │                   │                   │
│  ┌──────▼──────┐  ┌──────▼───────┐  ┌───────▼────────┐         │
│  │   Menu      │  │   Restaurant │  │   User/Auth    │         │
│  │   Service   │  │   Service    │  │   Service      │         │
│  │  (Node.js)  │  │  (Node.js)   │  │  (Supabase)    │         │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘         │
│         │                 │                   │                   │
└─────────┼─────────────────┼───────────────────┼───────────────────┘
          │                 │                   │
┌─────────▼─────────────────▼───────────────────▼───────────────────┐
│                         DATA LAYER                                 │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────┐        ┌──────────────────────┐        │
│  │   PostgreSQL         │        │      Redis           │        │
│  │   (Supabase)         │        │   (Cache Layer)      │        │
│  │  - Primary data      │◄──────►│  - Session store     │        │
│  │  - Read replicas     │        │  - Rate limiting     │        │
│  │  - Point-in-time     │        │  - Real-time queue   │        │
│  │    recovery          │        └──────────────────────┘        │
│  └──────────────────────┘                                         │
│                                                                    │
│  ┌──────────────────────┐        ┌──────────────────────┐        │
│  │  Supabase Storage    │        │    Message Queue     │        │
│  │  - Menu images       │        │    (Optional)        │        │
│  │  - Receipt slips     │        │  - Bull/BullMQ       │        │
│  │  - Restaurant logos  │        │  - Background jobs   │        │
│  └──────────────────────┘        └──────────────────────┘        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
          │                          │
┌─────────▼──────────────────────────▼───────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐              │
│  │  EasySlip   │  │  SlipOK     │  │  GPT-4       │              │
│  │  API        │  │  API        │  │  Vision API  │              │
│  └─────────────┘  └─────────────┘  └──────────────┘              │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐              │
│  │  Twilio/    │  │  Line       │  │  Email       │              │
│  │  SMS API    │  │  Messaging  │  │  (SendGrid)  │              │
│  └─────────────┘  └─────────────┘  └──────────────┘              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow: Customer Orders Food

```
1. Customer Scans QR Code
   ↓
2. PWA loads from Cache (if available) or Vercel CDN
   ↓
3. Fetch Menu from API (/api/menu/:restaurantId)
   ↓ (Cache Hit: Redis → return immediately)
   ↓ (Cache Miss: PostgreSQL → store in Redis → return)
4. Customer adds items to cart (Local State - Zustand)
   ↓
5. Customer submits order → POST /api/orders
   ↓
6. API Gateway validates JWT, rate limit check
   ↓
7. Order Service:
   - Save to PostgreSQL (orders table)
   - Publish to Socket.io room (restaurant_:id)
   - Queue slip verification (if payment = transfer)
   ↓
8. Kitchen Display receives order (WebSocket)
   ↓
9. Kitchen marks order status: preparing → ready
   ↓ (Update PostgreSQL, emit Socket.io event)
10. Customer receives notification (WebSocket or Push)
```

---

## 3️⃣ Frontend Architecture {#frontend}

### Tech Stack Details

```typescript
// package.json (Frontend)
{
  "dependencies": {
    "next": "14.0.4",           // React framework with SSR
    "react": "18.2.0",          
    "react-dom": "18.2.0",
    "typescript": "5.3.3",
    "zustand": "4.4.7",         // State management
    "@tanstack/react-query": "5.17.0",  // Server state
    "socket.io-client": "4.6.1", // WebSocket client
    "tailwindcss": "3.4.0",     // CSS framework
    "lucide-react": "0.263.1",  // Icons
    "zod": "3.22.4",            // Schema validation
    "react-hook-form": "7.49.2", // Form handling
    "sonner": "1.3.1"           // Toast notifications
  }
}
```

### Folder Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (customer)/         # Customer-facing routes
│   │   │   ├── r/[restaurantId]/t/[tableId]/
│   │   │   │   ├── page.tsx    # Order page
│   │   │   │   └── layout.tsx  # Customer layout
│   │   │   └── order-status/[orderId]/
│   │   │       └── page.tsx    # Order tracking
│   │   ├── (dashboard)/        # Restaurant dashboard
│   │   │   ├── menu/
│   │   │   ├── orders/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── (kitchen)/          # Kitchen display
│   │   │   └── kitchen/[restaurantId]/
│   │   ├── api/                # API routes (Backend)
│   │   │   ├── auth/
│   │   │   ├── menu/
│   │   │   ├── orders/
│   │   │   └── payments/
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css
│   ├── components/             # Reusable components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── customer/           # Customer flow components
│   │   ├── dashboard/          # Dashboard components
│   │   └── kitchen/            # Kitchen display components
│   ├── lib/                    # Utilities
│   │   ├── supabase.ts         # Supabase client
│   │   ├── socket.ts           # Socket.io client
│   │   ├── api-client.ts       # API wrapper
│   │   └── utils.ts            # Helper functions
│   ├── hooks/                  # Custom React hooks
│   │   ├── useMenu.ts
│   │   ├── useOrders.ts
│   │   └── useWebSocket.ts
│   ├── stores/                 # Zustand stores
│   │   ├── cart-store.ts
│   │   ├── auth-store.ts
│   │   └── kitchen-store.ts
│   ├── types/                  # TypeScript types
│   │   ├── menu.ts
│   │   ├── order.ts
│   │   └── restaurant.ts
│   └── middleware.ts           # Next.js middleware
├── public/
│   ├── service-worker.js       # PWA service worker
│   ├── manifest.json           # PWA manifest
│   └── icons/
└── next.config.js
```

### PWA Configuration

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.tanjai\.app\/menu\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'menu-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|webp|svg)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    domains: ['supabase.co', 'storage.googleapis.com'],
    formats: ['image/webp'],
  },
});
```

### Offline-First Strategy

```typescript
// lib/offline-queue.ts
import { openDB, DBSchema } from 'idb';

interface OrderQueueDB extends DBSchema {
  orders: {
    key: string;
    value: {
      id: string;
      restaurantId: string;
      tableId: string;
      items: OrderItem[];
      totalAmount: number;
      status: 'pending' | 'synced' | 'failed';
      createdAt: number;
      retryCount: number;
    };
  };
}

class OfflineOrderQueue {
  private db: IDBPDatabase<OrderQueueDB> | null = null;

  async init() {
    this.db = await openDB<OrderQueueDB>('tanjai-orders', 1, {
      upgrade(db) {
        db.createObjectStore('orders', { keyPath: 'id' });
      },
    });
  }

  async addOrder(order: Order) {
    if (!this.db) await this.init();
    
    await this.db!.add('orders', {
      ...order,
      status: 'pending',
      createdAt: Date.now(),
      retryCount: 0,
    });

    // Try to sync immediately
    this.syncOrders();
  }

  async syncOrders() {
    if (!navigator.onLine) return;

    const pendingOrders = await this.getPendingOrders();
    
    for (const order of pendingOrders) {
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
        });

        // Mark as synced
        await this.db!.put('orders', { ...order, status: 'synced' });
        
      } catch (error) {
        // Increment retry count
        await this.db!.put('orders', { 
          ...order, 
          retryCount: order.retryCount + 1 
        });
      }
    }
  }

  private async getPendingOrders() {
    const allOrders = await this.db!.getAll('orders');
    return allOrders.filter(o => o.status === 'pending');
  }
}

export const offlineQueue = new OfflineOrderQueue();

// Auto-sync when connection restored
window.addEventListener('online', () => {
  offlineQueue.syncOrders();
});
```

### State Management (Zustand)

```typescript
// stores/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  selectedOptions: {
    groupId: string;
    optionId: string;
    name: string;
    priceModifier: number;
  }[];
  totalPrice: number;
  specialInstructions?: string;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  tableId: string | null;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      tableId: null,

      addItem: (item) => 
        set((state) => ({
          items: [...state.items, item],
        })),

      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        })),

      updateQuantity: (menuItemId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.totalPrice, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'tanjai-cart',
      partialize: (state) => ({ 
        items: state.items,
        restaurantId: state.restaurantId,
        tableId: state.tableId,
      }),
    }
  )
);
```

### WebSocket Hook

```typescript
// hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  restaurantId: string;
  onOrderReceived?: (order: Order) => void;
  onOrderStatusChanged?: (update: OrderStatusUpdate) => void;
}

export function useWebSocket({ 
  restaurantId, 
  onOrderReceived, 
  onOrderStatusChanged 
}: UseWebSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: {
        token: localStorage.getItem('token'),
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Join restaurant room
      newSocket.emit('join-restaurant', restaurantId);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('new-order', (order: Order) => {
      onOrderReceived?.(order);
      
      // Play notification sound
      new Audio('/sounds/new-order.mp3').play().catch(() => {});
    });

    newSocket.on('order-status-changed', (update: OrderStatusUpdate) => {
      onOrderStatusChanged?.(update);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [restaurantId]);

  return { socket, isConnected };
}
```

---

## 4️⃣ Backend Architecture {#backend}

### Tech Stack Details

```typescript
// package.json (Backend - if separate server)
{
  "dependencies": {
    "express": "4.18.2",
    "typescript": "5.3.3",
    "@types/express": "4.17.21",
    "socket.io": "4.6.1",
    "@supabase/supabase-js": "2.39.0",
    "ioredis": "5.3.2",
    "zod": "3.22.4",            // Validation
    "helmet": "7.1.0",          // Security headers
    "cors": "2.8.5",
    "rate-limit-redis": "4.2.0",
    "bull": "4.12.0",           // Job queue
    "pino": "8.17.2",           // Logging
    "dotenv": "16.3.1"
  }
}
```

### Server Setup

```typescript
// server/src/index.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import { logger } from './lib/logger';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';

// Routes
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Redis client
export const redis = new Redis(process.env.REDIS_URL!);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: redis,
    prefix: 'rl:',
  }),
});
app.use(limiter);

// Request logging
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.correlationId = correlationId as string;
  res.setHeader('X-Correlation-ID', correlationId);
  
  logger.info({
    correlationId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  }, 'Incoming request');
  
  next();
});

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// WebSocket setup
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  // Verify JWT
  try {
    const decoded = verifyToken(token);
    socket.data.userId = decoded.userId;
    socket.data.restaurantId = decoded.restaurantId;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  logger.info({ socketId: socket.id }, 'Client connected');

  socket.on('join-restaurant', (restaurantId: string) => {
    if (socket.data.restaurantId !== restaurantId) {
      return socket.emit('error', 'Unauthorized');
    }
    
    socket.join(`restaurant:${restaurantId}`);
    logger.info({ restaurantId }, 'Joined restaurant room');
  });

  socket.on('disconnect', () => {
    logger.info({ socketId: socket.id }, 'Client disconnected');
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export { io };
```

### Service Layer Architecture

```typescript
// server/src/services/order-service.ts
import { supabase } from '../lib/supabase';
import { redis } from '../index';
import { io } from '../index';
import { paymentQueue } from '../queues/payment-queue';
import { logger } from '../lib/logger';

export class OrderService {
  async createOrder(data: CreateOrderDTO): Promise<Order> {
    const { restaurantId, tableId, items, specialInstructions } = data;

    // Start transaction
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
        table_id: tableId,
        status: 'pending',
        total_amount: this.calculateTotal(items),
        special_instructions: specialInstructions,
      })
      .select()
      .single();

    if (error) {
      logger.error({ error }, 'Failed to create order');
      throw new Error('Failed to create order');
    }

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      unit_price: item.basePrice,
      selected_options: item.selectedOptions,
      station_id: item.stationId,
    }));

    await supabase.from('order_items').insert(orderItems);

    // Deduct inventory (if tracking enabled)
    await this.deductInventory(restaurantId, items);

    // Publish to WebSocket
    io.to(`restaurant:${restaurantId}`).emit('new-order', order);

    // Cache order for quick retrieval
    await redis.setex(
      `order:${order.id}`,
      3600, // 1 hour TTL
      JSON.stringify(order)
    );

    logger.info({ orderId: order.id }, 'Order created successfully');

    return order;
  }

  async updateOrderStatus(
    orderId: string, 
    status: OrderStatus
  ): Promise<void> {
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw new Error('Failed to update order status');

    // Invalidate cache
    await redis.del(`order:${orderId}`);

    // Notify client
    io.to(`restaurant:${order.restaurant_id}`).emit('order-status-changed', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
    });

    // If completed, commit inventory
    if (status === 'completed') {
      await this.commitInventory(orderId);
    }
  }

  async getOrdersByRestaurant(
    restaurantId: string,
    filters?: OrderFilters
  ): Promise<Order[]> {
    // Check cache first
    const cacheKey = `orders:${restaurantId}:${JSON.stringify(filters)}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Query database
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (name, image_url)
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    const { data: orders, error } = await query;

    if (error) throw new Error('Failed to fetch orders');

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(orders));

    return orders;
  }

  private calculateTotal(items: OrderItemInput[]): number {
    return items.reduce((sum, item) => {
      const optionsTotal = item.selectedOptions?.reduce(
        (s, opt) => s + opt.priceModifier,
        0
      ) || 0;
      
      return sum + (item.basePrice + optionsTotal) * item.quantity;
    }, 0);
  }

  private async deductInventory(
    restaurantId: string,
    items: OrderItemInput[]
  ): Promise<void> {
    // Get recipes for menu items
    const { data: recipes } = await supabase
      .from('recipes')
      .select('*, ingredients(*)')
      .in('menu_item_id', items.map(i => i.menuItemId));

    if (!recipes) return;

    // Calculate ingredient usage
    for (const item of items) {
      const recipe = recipes.find(r => r.menu_item_id === item.menuItemId);
      if (!recipe) continue;

      for (const ingredient of recipe.ingredients) {
        await supabase.rpc('reserve_inventory', {
          p_restaurant_id: restaurantId,
          p_ingredient_id: ingredient.id,
          p_quantity: ingredient.quantity * item.quantity,
        });
      }
    }
  }

  private async commitInventory(orderId: string): Promise<void> {
    await supabase.rpc('commit_inventory', {
      p_order_id: orderId,
    });
  }
}

export const orderService = new OrderService();
```

### Payment Service with Multi-provider

```typescript
// server/src/services/payment-service.ts
import { paymentQueue } from '../queues/payment-queue';
import { logger } from '../lib/logger';

interface SlipVerificationProvider {
  name: string;
  verify: (slipUrl: string, expectedAmount: number) => Promise<VerificationResult>;
  timeout: number;
}

export class PaymentService {
  private providers: SlipVerificationProvider[] = [
    {
      name: 'EasySlip',
      verify: this.verifyWithEasySlip.bind(this),
      timeout: 3000,
    },
    {
      name: 'SlipOK',
      verify: this.verifyWithSlipOK.bind(this),
      timeout: 3000,
    },
    {
      name: 'AI-OCR',
      verify: this.verifyWithAIOCR.bind(this),
      timeout: 5000,
    },
  ];

  async verifySlip(
    orderId: string,
    slipUrl: string,
    expectedAmount: number
  ): Promise<VerificationResult> {
    
    for (const provider of this.providers) {
      try {
        logger.info({ provider: provider.name }, 'Trying provider');

        const result = await Promise.race([
          provider.verify(slipUrl, expectedAmount),
          this.timeout(provider.timeout),
        ]);

        if (result.success) {
          // Log successful provider
          await this.logProviderSuccess(provider.name, orderId);
          
          // Update order payment status
          await supabase
            .from('orders')
            .update({ 
              payment_status: 'verified',
              payment_verified_at: new Date().toISOString(),
              payment_provider: provider.name,
            })
            .eq('id', orderId);

          return result;
        }

      } catch (error) {
        logger.warn({ 
          provider: provider.name, 
          error 
        }, 'Provider failed');
        
        // Try next provider
        continue;
      }
    }

    // All providers failed - queue for manual review
    await paymentQueue.add('manual-review', {
      orderId,
      slipUrl,
      expectedAmount,
      timestamp: Date.now(),
    });

    return {
      success: false,
      message: 'Automatic verification failed. Queued for manual review.',
    };
  }

  private async verifyWithEasySlip(
    slipUrl: string,
    expectedAmount: number
  ): Promise<VerificationResult> {
    const response = await fetch('https://api.easyslip.com/v1/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EASYSLIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slip_url: slipUrl }),
    });

    if (!response.ok) {
      throw new Error('EasySlip API error');
    }

    const data = await response.json();

    // Validate amount matches
    if (Math.abs(data.amount - expectedAmount) > 1) {
      return {
        success: false,
        message: 'Amount mismatch',
      };
    }

    return {
      success: true,
      amount: data.amount,
      transactionDate: data.transaction_date,
      receiverAccount: data.receiver.account,
    };
  }

  private async verifyWithSlipOK(
    slipUrl: string,
    expectedAmount: number
  ): Promise<VerificationResult> {
    // Similar implementation
    // ...
  }

  private async verifyWithAIOCR(
    slipUrl: string,
    expectedAmount: number
  ): Promise<VerificationResult> {
    // Use GPT-4 Vision to extract slip data
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract transaction data from this PromptPay slip. Return JSON: {amount, date, receiver_phone}',
              },
              {
                type: 'image_url',
                image_url: { url: slipUrl },
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const extracted = JSON.parse(data.choices[0].message.content);

    if (Math.abs(extracted.amount - expectedAmount) > 1) {
      return { success: false, message: 'Amount mismatch' };
    }

    return {
      success: true,
      amount: extracted.amount,
      transactionDate: extracted.date,
      receiverAccount: extracted.receiver_phone,
    };
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
  }

  private async logProviderSuccess(provider: string, orderId: string) {
    await supabase.from('payment_provider_logs').insert({
      provider,
      order_id: orderId,
      success: true,
      timestamp: new Date().toISOString(),
    });
  }
}

export const paymentService = new PaymentService();
```

---

## 5️⃣ Database Design {#database}

### Complete Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'owner', -- owner, manager, cashier, kitchen
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- RESTAURANTS
-- ============================================================================

CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  logo_url TEXT,
  banner_url TEXT,
  cuisine_type VARCHAR(100),
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Subscription info
  subscription_plan VARCHAR(50) DEFAULT 'starter', -- starter, pro, pro_plus
  subscription_status VARCHAR(50) DEFAULT 'trial', -- trial, active, expired
  subscription_expires_at TIMESTAMP,
  
  -- Credits
  slip_credits INTEGER DEFAULT 50,
  
  -- Business hours (JSON array)
  business_hours JSONB DEFAULT '[]'::jsonb,
  
  CONSTRAINT valid_subscription_plan 
    CHECK (subscription_plan IN ('starter', 'pro', 'pro_plus')),
  CONSTRAINT valid_subscription_status
    CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled'))
);

CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);

-- ============================================================================
-- RESTAURANT STAFF (Multi-user support)
-- ============================================================================

CREATE TABLE restaurant_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- manager, cashier, kitchen
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMP DEFAULT NOW(),
  joined_at TIMESTAMP,
  
  UNIQUE(restaurant_id, user_id)
);

-- ============================================================================
-- TABLES & QR CODES
-- ============================================================================

CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number VARCHAR(50) NOT NULL,
  table_name VARCHAR(100),
  qr_code_url TEXT,
  qr_code_data TEXT, -- JSON data embedded in QR
  capacity INTEGER,
  location VARCHAR(100), -- indoor, outdoor, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(restaurant_id, table_number)
);

CREATE INDEX idx_tables_restaurant ON tables(restaurant_id);

-- ============================================================================
-- MENU MANAGEMENT
-- ============================================================================

CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description TEXT,
  description_en TEXT,
  
  base_price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2), -- for profit analysis
  
  image_url TEXT,
  
  -- Kitchen routing
  station_id VARCHAR(50), -- bar, hot_kitchen, cold_kitchen
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  available_times JSONB, -- [{"start": "09:00", "end": "14:00"}]
  
  -- Inventory tracking
  track_inventory BOOLEAN DEFAULT false,
  
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_station 
    CHECK (station_id IN ('bar', 'hot_kitchen', 'cold_kitchen', 'dessert'))
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_availability ON menu_items(is_available);

-- ============================================================================
-- MENU OPTIONS (Thai-style customization)
-- ============================================================================

CREATE TABLE option_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "ระดับความเผ็ด"
  name_en VARCHAR(255),
  is_required BOOLEAN DEFAULT false,
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER DEFAULT 1, -- 1 = single choice, >1 = multiple
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_group_id UUID REFERENCES option_groups(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "เผ็ดน้อย"
  name_en VARCHAR(255),
  price_modifier DECIMAL(10, 2) DEFAULT 0.00,
  is_default BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_option_groups_item ON option_groups(menu_item_id);
CREATE INDEX idx_options_group ON options(option_group_id);

-- ============================================================================
-- ORDERS
-- ============================================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  table_number VARCHAR(50),
  
  -- Order details
  order_number VARCHAR(50) UNIQUE, -- e.g., "TJ-20231215-0001"
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Customer info (optional, for delivery)
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  service_charge DECIMAL(10, 2) DEFAULT 0.00,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  payment_method VARCHAR(50), -- cash, transfer
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_verified_at TIMESTAMP,
  payment_provider VARCHAR(50), -- which API verified slip
  slip_image_url TEXT,
  
  -- Special instructions
  special_instructions TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  started_preparing_at TIMESTAMP,
  completed_at TIMESTAMP,
  paid_at TIMESTAMP,
  
  CONSTRAINT valid_order_status 
    CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  CONSTRAINT valid_payment_method
    CHECK (payment_method IN ('cash', 'transfer', 'card')),
  CONSTRAINT valid_payment_status
    CHECK (payment_status IN ('pending', 'verified', 'failed'))
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today TEXT;
  seq INT;
BEGIN
  today := TO_CHAR(NOW(), 'YYYYMMDD');
  
  SELECT COUNT(*) + 1 INTO seq
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE
    AND restaurant_id = NEW.restaurant_id;
  
  NEW.order_number := 'TJ-' || today || '-' || LPAD(seq::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- ============================================================================
-- ORDER ITEMS
-- ============================================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  
  -- Item details (snapshot at order time)
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  
  -- Selected options (JSONB for flexibility)
  selected_options JSONB DEFAULT '[]'::jsonb,
  /* Example:
  [
    {
      "group_name": "ระดับความเผ็ด",
      "option_name": "เผ็ดมาก",
      "price_modifier": 0
    },
    {
      "group_name": "เส้น",
      "option_name": "เส้นเล็ก",
      "price_modifier": 0
    }
  ]
  */
  
  -- Kitchen routing
  station_id VARCHAR(50),
  item_status VARCHAR(50) DEFAULT 'pending',
  
  -- Special instructions for this item
  special_instructions TEXT,
  
  -- Total for this line item
  line_total DECIMAL(10, 2) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  started_preparing_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  CONSTRAINT valid_item_status
    CHECK (item_status IN ('pending', 'preparing', 'ready', 'cancelled'))
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_status ON order_items(item_status);
CREATE INDEX idx_order_items_station ON order_items(station_id);

-- ============================================================================
-- INVENTORY MANAGEMENT
-- ============================================================================

CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50), -- kg, liters, pieces, etc.
  current_stock DECIMAL(10, 2) DEFAULT 0,
  reserved_stock DECIMAL(10, 2) DEFAULT 0, -- Pending orders
  minimum_stock DECIMAL(10, 2) DEFAULT 0,
  cost_per_unit DECIMAL(10, 2),
  supplier VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_needed DECIMAL(10, 2) NOT NULL,
  
  UNIQUE(menu_item_id, ingredient_id)
);

-- Reserve inventory when order is placed
CREATE OR REPLACE FUNCTION reserve_inventory(
  p_restaurant_id UUID,
  p_ingredient_id UUID,
  p_quantity DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE ingredients
  SET reserved_stock = reserved_stock + p_quantity,
      updated_at = NOW()
  WHERE i