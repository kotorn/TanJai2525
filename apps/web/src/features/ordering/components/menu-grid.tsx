'use client';

import { useState } from 'react';
import AddToCartBtn from './add-to-cart-btn';
import { Search } from 'lucide-react';

export default function MenuGrid({ items }: { items: any[] }) {
    const [query, setQuery] = useState('');

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) || 
        item.category.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="search"
                    placeholder="Search menu..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    data-testid="search-input"
                />
            </div>

            {/* Grid */}
            <div className="space-y-4">
                {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0" />
                        <div className="flex-1 pb-4">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-gray-500 text-sm">Category: {item.category}</p>
                            <div className="mt-2 text-orange-600 font-bold">฿{item.price}</div>
                        </div>
                        <AddToCartBtn item={item} />
                    </div>
                ))}

                {filteredItems.length === 0 && (
                    <div className="text-center text-gray-400 mt-10 p-8">
                        No items found for "{query}".
                    </div>
                )}
            </div>
        </div>
    );
}
