import { STRESS_TEST_DATA } from '../mock-data';

// In-memory store (Lazy Init)
let MOCK_DB: any = null;

function getMockDB() {
    if (!MOCK_DB) {
        MOCK_DB = {
            orders: [] as any[],
            menu_items: (STRESS_TEST_DATA?.MENU_ITEMS || []).map((i: any) => ({
                ...i, 
                restaurant_id: 'mock-rest-id',
                is_available: true,
                image_url: i.image || '/images/menu-placeholder.jpg',
                category_id: mapCategory(i.category), 
                sort_order: 0
            }))
        };
    }
    return MOCK_DB;
}

export const createMockClient = () => {
    console.warn("⚠️ USING MOCK SUPABASE CLIENT");

    const mockStorage = {
        from: () => ({
            upload: async () => ({ data: { path: 'mock-path' }, error: null }),
            getPublicUrl: (path: string) => ({ data: { publicUrl: 'https://placehold.co/400' } }),
        })
    };

    const mockAuth = {
        getUser: async () => ({ data: { user: { id: 'mock-user', email: 'owner@tanjai.com' } }, error: null }),
        getSession: async () => ({ data: { session: { access_token: 'mock-token' } }, error: null }),
        signInWithOAuth: async () => ({ error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    };

    return {
        from: (table: string) => {
            return {
                select: (columns?: string) => {
                    return {
                        order: () => mockQuery(table),
                        eq: (col: string, val: any) => {
                             // Simple filtering
                             const data = mockQuery(table).filter((row: any) => row[col] === val);
                             return { single: () => ({ data: data[0] || null, error: null }), data, error: null };
                        },
                        single: () => ({ data: mockSingle(table), error: null }),
                        limit: () => ({ data: mockQuery(table).slice(0, 1), error: null }),
                        in: () => ({ order: () => ({ data: mockQuery(table), error: null }) }), 
                        data: mockQuery(table),
                        error: null,
                    };
                },
                insert: (data: any) => {
                    if (table === 'orders') {
                        const newOrder = { ...data, id: `order-${Date.now()}-${Math.random()}` };
                        getMockDB().orders.push(newOrder);
                        console.log('[MockDB] Inserted order:', newOrder);
                        return { select: () => ({ single: () => ({ data: newOrder, error: null }) }), error: null };
                    }
                    return { select: () => ({ single: () => ({ data: data, error: null }) }), error: null };
                },
                update: (data: any) => ({ eq: () => ({ error: null }) }),
                delete: () => ({ eq: () => ({ error: null }) }),
            };
        },
        auth: mockAuth,
        storage: mockStorage,
    } as any;
};

function mockQuery(table: string) {
    console.log(`[MockDB] Select from ${table}`);
    if (table === 'menu_items') {
        return getMockDB().menu_items;
    }
    if (table === 'menu_categories') {
        return [
            { id: 'cat-main', name: 'Main Course', sort_order: 1 },
            { id: 'cat-app', name: 'Appetizer', sort_order: 2 },
            { id: 'cat-side', name: 'Side Dish', sort_order: 3 },
            { id: 'cat-bev', name: 'Beverage', sort_order: 4 },
            { id: 'cat-dessert', name: 'Dessert', sort_order: 5 },
        ];
    }
    if (table === 'restaurants') {
        return [{ id: 'mock-rest-id', name: 'Tanjai QA Mock', slug: 'tanjai' }];
    }
    if (table === 'orders') {
        return getMockDB().orders;
    }
    if (table === 'qr_codes') {
        return [
            {
                id: 'mock-qr-1',
                restaurant_id: 'mock-rest-id',
                type: 'dynamic',
                table_number: '55',
                token: 'valid-token',
                expires_at: new Date(Date.now() + 86400000).toISOString(), // +1 day
                created_at: new Date().toISOString()
            },
            {
                id: 'mock-qr-2',
                restaurant_id: 'mock-rest-id',
                type: 'dynamic',
                table_number: '55',
                token: 'expired-token',
                expires_at: new Date(Date.now() - 86400000).toISOString(), // -1 day
                created_at: new Date().toISOString()
            }
        ];
    }
    return [];
}

function mapCategory(name: string) {
    switch(name) {
        case 'Main Course': return 'cat-main';
        case 'Appetizer': return 'cat-app';
        case 'Side Dish': return 'cat-side';
        case 'Beverage': return 'cat-bev';
        case 'Dessert': return 'cat-dessert';
        default: return 'cat-main';
    }
}

function mockSingle(table: string) {
    const data = mockQuery(table);
    return data.length > 0 ? data[0] : null;
}
