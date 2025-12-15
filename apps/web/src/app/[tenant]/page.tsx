import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

// NOTE: In a real app we'd use a shared supabase client helper
// But for scaffolding we recreate it to ensure it works without complex deps
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getMenuItems(tenantSlug: string) {
    const { db } = await import('@/lib/mock-db');
    
    // Resolve Tenant
    const tenant = db.tenants.find(t => t.slug === tenantSlug);
    // Return mock if missing
    const tenantData = tenant || { id: 'mock-id', name: 'Wait for Setup...' };

    const menu = db.getMenuItems(tenantData.id);
    
    return { tenant: tenantData, menu: menu || [] };
}

import AddToCartBtn from '@/features/ordering/components/add-to-cart-btn';

export default async function MenuPage({ params }: { params: { tenant: string } }) {
    const { tenant: tenantSlug } = await params;
    const { tenant, menu } = await getMenuItems(tenantSlug);

    if (!tenant) {
        return <div className="p-10 text-center">Restaurant not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">{tenant.name}</h1>
                <Link href={`/${tenantSlug}/cart`} className="p-2 relative">
                    <ShoppingBag className="w-6 h-6 text-orange-500" />
                    {/* We would make this a client component to show badge count */}
                </Link>
            </header>

            {/* Menu Grid */}
            <main className="p-4 max-w-md mx-auto space-y-4">
                {menu.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4 relative">
                        <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0" /> {/* Placeholder for image */}
                        <div className="flex-1 pb-4">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-gray-500 text-sm">Category: {item.category}</p>
                            <div className="mt-2 text-orange-600 font-bold">฿{item.price}</div>
                        </div>
                        {/* Client Component Button */}
                        <AddToCartBtn item={item} />
                    </div>
                ))}

                {menu.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        No menu items available.
                    </div>
                )}
            </main>
        </div>
    );
}
