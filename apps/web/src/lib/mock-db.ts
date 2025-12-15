// Very simple in-memory DB for simulation
// Persists only while server is running

export const MockDB = {
    tenants: [] as any[],
    orders: [] as any[],
    menuItems: [] as any[],

    reset: () => {
        MockDB.tenants = [];
        MockDB.orders = [];
    },

    createTenant: (name: string, slug: string) => {
        const tenant = { id: 'tenant-' + Math.random(), name, slug };
        MockDB.tenants.push(tenant);
        return tenant;
    },

    createMenuItem: (item: any) => {
        const newItem = { ...item, id: 'item-' + Math.random() };
        MockDB.menuItems.push(newItem);
        return newItem;
    },

    getMenuItems: (tenantId: string) => {
        return MockDB.menuItems; // Filter by tenantId if we stored it, or return all for simulation
    },

    createOrder: (order: any) => {
        const newOrder = { 
            ...order, 
            id: 'ord-' + Math.random(), 
            status: 'placed',
            created_at: new Date().toISOString() 
        };
        MockDB.orders.push(newOrder);
        console.log('[MockDB] Order Created:', newOrder);
        return newOrder;
    },

    getOrders: (slug: string) => {
        // filter by slug if we had tenant linkage, for now return all
        return MockDB.orders;
    },

    updateOrder: (id: string, updates: any) => {
        const order = MockDB.orders.find(o => o.id === id);
        if (order) {
            Object.assign(order, updates);
            return order;
        }
        return null;
    }
};

// Global instance to survive HMR in dev?
// In Next.js dev, modules might be re-evaluated. 
// Attaching to globalThis is safer.
const globalForMock = globalThis as unknown as { mockDb: typeof MockDB };

export const db = globalForMock.mockDb || MockDB;

if (process.env.NODE_ENV !== 'production') globalForMock.mockDb = db;
