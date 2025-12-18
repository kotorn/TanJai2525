"use client";
import React from "react";
import { GroceryHeader } from "@/components/grocery/GroceryHeader";
import { GroceryCategories } from "@/components/grocery/GroceryCategories";
import { GroceryProductCard } from "@/components/grocery/GroceryProductCard";
import { CustomerBottomNav } from "@/components/layout/CustomerBottomNav"; 
// Note: CustomerBottomNav might need style tweaks for light mode, but sticking to logic.

const products = [
  { id: 1, name: "Midnight Truffle Ramen", price: 280, image: "/ramen1.jpg" },
  { id: 2, name: "Spicy Miso Ramen", price: 240, image: "/ramen2.jpg" },
  { id: 3, name: "Shoyu Classic", price: 200, image: "/ramen3.jpg" },
  { id: 4, name: "Yuzu Shio Ramen", price: 220, image: "/ramen4.jpg" },
  { id: 5, name: "Pork Ball Congee", price: 80, image: "/congee1.jpg" },
  { id: 6, name: "Sea Bass Congee", price: 120, image: "/congee2.jpg" },
];

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-safe-area-bottom font-body text-gray-900">
      <GroceryHeader />
      
      <main className="container max-w-md mx-auto">
        <div className="px-0 relative mb-4">
             <GroceryCategories />
        </div>

        <div className="px-4 pb-24">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                All Products <span className="text-xs font-normal text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">6</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
                {products.map((p) => (
                    <GroceryProductCard key={p.id} {...p} />
                ))}
            </div>
        </div>
      </main>
      
      {/* Reusing BottomNav - Ideally should update this to be 'Floaty' style as per plan */}
      <CustomerBottomNav /> 
    </div>
  );
}
