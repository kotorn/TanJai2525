"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ItemDetailsModal from "./ItemDetailsModal";
import { CartDrawer } from "./CartDrawer";

interface MenuBrowserProps {
    categories: any[];
    items: any[];
    tableId: string; // Add prop
}

export default function MenuBrowser({ categories, items, tableId }: MenuBrowserProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || "");
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredItems = items.filter(item => item.category_id === selectedCategory);

    // Cart Store
    const cartTotalItems = useCartStore(state => state.getTotalItems());
    const cartTotalPrice = useCartStore(state => state.getTotalPrice());

    const handleItemClick = (item: any) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            {/* Horizontal Category Scroll */}
            <div className="sticky top-0 bg-white z-10 shadow-sm border-b">
                <div className="flex overflow-x-auto gap-4 p-4 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                                ${selectedCategory === cat.id
                                    ? "bg-orange-500 text-white shadow-md"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`
                            }
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-4 space-y-4 pb-24">
                {filteredItems.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        No items in this category.
                    </div>
                )}

                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 active:scale-[0.98] transition-transform duration-200 cursor-pointer"
                        onClick={() => handleItemClick(item)}
                    >
                        <div className="h-24 w-24 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image_url ? (
                                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <ImageIcon className="w-8 h-8 opacity-50" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-2">{item.name}</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-orange-600">฿{item.price}</span>
                                <Button size="icon" className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 shadow-none">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            {/* Cart Drawer */}
            <CartDrawer tableId={tableId} />

            {/* Item Details Modal */}
            <ItemDetailsModal
                item={selectedItem}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
