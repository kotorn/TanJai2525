import { Suspense } from "react";
import { getMenuData } from "@/features/menu/actions";
import { MenuDashboard } from "@/features/menu/components/MenuDashboard";

export default async function MenuPage() {
  const { categories, items } = await getMenuData();

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading menu...</div>}>
      <MenuDashboard 
        initialCategories={categories}
        initialItems={items}
      />
    </Suspense>
  );
}
