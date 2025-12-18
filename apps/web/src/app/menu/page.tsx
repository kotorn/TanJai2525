"use client";
import React from "react";
import { GroceryHeader } from "@/components/grocery/GroceryHeader";
import { GroceryCategories } from "@/components/grocery/GroceryCategories";
import { GroceryProductCard } from "@/components/grocery/GroceryProductCard";

const products = [
  { id: 1, name: "Strawberry Watermelon Cake", price: 280, image: "/cake1.jpg" },
  { id: 2, name: "Chocolate Oasis Cake", price: 240, image: "/cake2.jpg" },
  { id: 3, name: "Origami Lemon Cake", price: 200, image: "/cake3.jpg" },
  { id: 4, name: "Dragon Fruit Cheesecake", price: 220, image: "/cake4.jpg" },
  { id: 5, name: "Raspberry Lychee Cake", price: 180, image: "/cake5.jpg" },
  { id: 6, name: "Zen Cheese Tart", price: 120, image: "/cake6.jpg" },
];

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-white font-body text-black">
      <GroceryHeader />
      
      <main className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Sidebar (Desktop) / Top Scroll (Mobile) */}
        <GroceryCategories />

        {/* Right Content Grid */}
        <div className="flex-1 px-6 pt-6 pb-24 lg:p-12 bg-white">
            {/* Collection Header */}
            <div className="mb-12 text-center lg:text-left">
                <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">Limited Edition</h2>
                <p className="font-body text-gray-500 max-w-2xl leading-relaxed">
                    Our exclusive collection of seasonal treats, crafted with precision and passion. 
                    Available for a limited time only at select locations.
                </p>
            </div>
            
            {/* Minimalist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {products.map((p) => (
                    <GroceryProductCard key={p.id} {...p} />
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
