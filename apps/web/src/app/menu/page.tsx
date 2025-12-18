import React from "react";
import { CustomerHeader } from "@/components/layout/CustomerHeader";
import { CustomerBottomNav } from "@/components/layout/CustomerBottomNav";
import { MenuHero } from "@/components/menu/MenuHero";
import { CategoryScroll } from "@/components/menu/CategoryScroll";
import { MenuList } from "@/components/menu/MenuList";

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-background-dark pb-safe-area-bottom font-body selection:bg-primary/30">
      <CustomerHeader />
      <main className="container max-w-md mx-auto pt-2">
        <div className="px-4">
          <CategoryScroll />
        </div>
        <div className="px-4">
            <MenuHero />
        </div>
        <MenuList />
      </main>
      <CustomerBottomNav />
    </div>
  );
}
